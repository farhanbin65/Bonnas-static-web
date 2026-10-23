-- Phase 2. Run AFTER 20261023_business_invoices.sql. Safe to rerun.
begin;
do $$ begin
 if exists(select 1 from public.business_invoices where document->>'docType'='quotation'
   and coalesce((document->>'useAmountPaid')::boolean,false)
   and coalesce(nullif(document->>'amountPaid',''),'0')::numeric>0) then
   raise exception 'A quotation has recorded payments. Convert paid quotations to invoices before running this upgrade.';
 end if;
end $$;
create table if not exists public.business_payments (
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null references public.business_invoices(id) on delete restrict,
 kind text not null check (kind in ('payment','refund','opening')),
 amount numeric(12,2) not null check (amount > 0),
 paid_on date,
 method text not null default 'bank_transfer' check (method in ('bank_transfer','cash','card','other','legacy')),
 reference text not null default '', notes text not null default '',
 created_by uuid default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
 voided_at timestamptz, void_reason text,
 check ((kind = 'opening' and paid_on is null) or (kind <> 'opening' and paid_on is not null)),
 check ((voided_at is null and void_reason is null) or (voided_at is not null and length(trim(void_reason)) > 0))
);
create unique index if not exists business_one_opening on public.business_payments(invoice_id) where kind='opening';
create index if not exists business_payments_invoice on public.business_payments(invoice_id);
create table if not exists public.business_expenses (
 id uuid primary key default gen_random_uuid(), spent_on date not null,
 category text not null check (category in ('ingredients','packaging','utilities','equipment','transport','advertising','software','other')),
 supplier text not null default '', description text not null check (length(trim(description)) > 0),
 amount numeric(12,2) not null check (amount > 0),
 invoice_id uuid references public.business_invoices(id) on delete restrict,
 receipt_url text not null default '' check (receipt_url='' or receipt_url ~ '^https?://'),
 notes text not null default '', created_by uuid default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(), voided_at timestamptz, void_reason text,
 check ((voided_at is null and void_reason is null) or (voided_at is not null and length(trim(void_reason)) > 0))
);
-- Optional self-reported information is owner-only and never in invoice PDFs or reports.
create table if not exists public.business_customer_background (
 invoice_id uuid primary key references public.business_invoices(id) on delete cascade,
 ethnicity text not null check (length(trim(ethnicity)) > 0),
 self_reported_at timestamptz not null default now()
);
alter table public.business_payments enable row level security;
alter table public.business_expenses enable row level security;
alter table public.business_customer_background enable row level security;
revoke all on public.business_payments, public.business_expenses, public.business_customer_background from anon, authenticated;
grant select, insert on public.business_payments, public.business_expenses to authenticated;
grant select, insert, update, delete on public.business_customer_background to authenticated;
drop policy if exists payment_read on public.business_payments;
create policy payment_read on public.business_payments for select to authenticated using ((select public.business_role()) in ('owner','staff'));
drop policy if exists payment_add on public.business_payments;
create policy payment_add on public.business_payments for insert to authenticated with check (
 (select public.business_role()) in ('owner','staff') and kind in ('payment','refund') and created_by = (select auth.uid()) and voided_at is null and void_reason is null);
drop policy if exists expense_read on public.business_expenses;
create policy expense_read on public.business_expenses for select to authenticated using ((select public.business_role()) in ('owner','staff'));
drop policy if exists expense_add on public.business_expenses;
create policy expense_add on public.business_expenses for insert to authenticated with check (
 (select public.business_role()) in ('owner','staff') and created_by = (select auth.uid()) and voided_at is null and void_reason is null);
drop policy if exists background_owner on public.business_customer_background;
create policy background_owner on public.business_customer_background for all to authenticated
using ((select public.business_role())='owner') with check ((select public.business_role())='owner');

create or replace function public.apply_business_ledger()
returns trigger language plpgsql security definer set search_path='' as $$
declare paid numeric;
begin
 if tg_op='UPDATE' then
   select coalesce(sum(case when kind='refund' then -amount else amount end),0) into paid
   from public.business_payments where invoice_id=old.id and voided_at is null;
 else
   -- Preserve imported legacy balances as an undated opening balance.
   paid := case when coalesce((new.document->>'useAmountPaid')::boolean, false)
     then coalesce(nullif(new.document->>'amountPaid',''),'0')::numeric else 0 end;
 end if;
 if paid < 0 then raise exception 'Payments cannot become negative'; end if;
 if new.document->>'docType'='quotation' and exists(select 1 from public.business_payments where invoice_id=new.id) then
   raise exception 'An order with payment records cannot become a quotation';
 end if;
 if coalesce(new.document->>'orderStatus','confirmed') not in ('enquiry','confirmed','completed','cancelled') then raise exception 'Invalid order status'; end if;
 if coalesce(new.document->>'foundThrough','unknown') not in ('google','facebook','instagram','referral','repeat_customer','other','unknown') then raise exception 'Invalid discovery source'; end if;
 if coalesce(new.document->>'orderedThrough','unknown') not in ('website','whatsapp','phone','email','social_message','other','unknown') then raise exception 'Invalid order channel'; end if;
 if coalesce(new.document->>'collectionDate','')<>'' then perform (new.document->>'collectionDate')::date; end if;
 new.document := new.document || jsonb_build_object('amountPaid',paid,'useAmountPaid',true,'paymentLedgerManaged',true);
 return new;
end $$;
revoke all on function public.apply_business_ledger() from public;
drop trigger if exists a_apply_business_ledger on public.business_invoices;
create trigger a_apply_business_ledger before insert or update on public.business_invoices for each row execute function public.apply_business_ledger();

create or replace function public.validate_business_payment()
returns trigger language plpgsql security definer set search_path='' as $$
declare inv public.business_invoices; balance numeric;
begin
 select * into inv from public.business_invoices where id=new.invoice_id for update;
 if not found then raise exception 'Order does not exist'; end if;
 if inv.document->>'docType'<>'invoice' then raise exception 'Convert the quotation to an invoice before recording payments'; end if;
 select coalesce(sum(case when kind='refund' then -amount else amount end),0) into balance
 from public.business_payments where invoice_id=new.invoice_id and voided_at is null and id<>new.id;
 if new.voided_at is null then balance:=balance + case when new.kind='refund' then -new.amount else new.amount end; end if;
 if balance<0 then raise exception 'Refund or correction exceeds the payments received'; end if;
 if tg_op='INSERT' then new.created_at:=now(); new.created_by:=auth.uid(); end if;
 return new;
end $$;
revoke all on function public.validate_business_payment() from public;
drop trigger if exists validate_business_payment on public.business_payments;
create trigger validate_business_payment before insert or update on public.business_payments for each row execute function public.validate_business_payment();

create or replace function public.sync_business_payment()
returns trigger language plpgsql security definer set search_path='' as $$
declare paid numeric;
begin
 select coalesce(sum(case when kind='refund' then -amount else amount end),0) into paid
 from public.business_payments where invoice_id=new.invoice_id and voided_at is null;
 update public.business_invoices set document=document || jsonb_build_object('amountPaid',paid,'useAmountPaid',true,'paymentLedgerManaged',true)
 where id=new.invoice_id and (coalesce(nullif(document->>'amountPaid',''),'0')::numeric is distinct from paid or document->>'paymentLedgerManaged' is distinct from 'true');
 return new;
end $$;
revoke all on function public.sync_business_payment() from public;
drop trigger if exists sync_business_payment on public.business_payments;
create trigger sync_business_payment after insert or update on public.business_payments for each row execute function public.sync_business_payment();

create or replace function public.seed_business_opening()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.document->>'docType'='invoice' and coalesce(nullif(new.document->>'amountPaid',''),'0')::numeric>0 then
 insert into public.business_payments(invoice_id,kind,amount,method,notes)
 values(new.id,'opening',(new.document->>'amountPaid')::numeric,'legacy','Imported invoice balance; payment date unknown')
 on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function public.seed_business_opening() from public;
drop trigger if exists seed_business_opening on public.business_invoices;
create trigger seed_business_opening after insert on public.business_invoices for each row execute function public.seed_business_opening();

-- Existing paid amounts are retained, not counted as newly received cash.
insert into public.business_payments(invoice_id,kind,amount,method,notes)
select id,'opening',(document->>'amountPaid')::numeric,'legacy','Imported invoice balance; payment date unknown'
from public.business_invoices where document->>'docType'='invoice'
and coalesce((document->>'useAmountPaid')::boolean,coalesce(nullif(document->>'amountPaid',''),'0')::numeric>0)
and coalesce(nullif(document->>'amountPaid',''),'0')::numeric>0
and not exists(select 1 from public.business_payments p where p.invoice_id=business_invoices.id)
on conflict do nothing;
-- Only initialise invoices that have not yet been upgraded.
update public.business_invoices set document=document where document->>'paymentLedgerManaged' is distinct from 'true';

create or replace function public.void_business_record(record_type text, record_id uuid, reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if coalesce(public.business_role(),'')<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if length(trim(coalesce(reason,'')))=0 then raise exception 'A correction reason is required'; end if;
 if record_type='payment' then
   -- Use the same order-first lock order as payment creation, preventing concurrent corrections.
   perform 1 from public.business_invoices where id=(select invoice_id from public.business_payments where id=record_id) for update;
   update public.business_payments set voided_at=now(),void_reason=trim(reason) where id=record_id and voided_at is null;
 elsif record_type='expense' then
   update public.business_expenses set voided_at=now(),void_reason=trim(reason) where id=record_id and voided_at is null;
 else raise exception 'Unknown record type'; end if;
 if not found then raise exception 'Record not found or already voided'; end if;
end $$;
revoke all on function public.void_business_record(text,uuid,text) from public,anon;
grant execute on function public.void_business_record(text,uuid,text) to authenticated;

-- Separate queryable order-item rows, always evaluated with the caller's permissions.
create or replace view public.business_order_items with (security_invoker=true) as
select i.id as order_id, i.invoice_number, item.ordinality as line_number,
 item.value->>'description' as description,
 coalesce(nullif(item.value->>'qty',''),'0')::numeric as quantity,
 coalesce(nullif(item.value->>'unitPrice',''),'0')::numeric as unit_price
from public.business_invoices i cross join lateral jsonb_array_elements(i.document->'items') with ordinality item(value,ordinality);
revoke all on public.business_order_items from public,anon;
grant select on public.business_order_items to authenticated;

create or replace function public.business_dashboard()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if coalesce(public.business_role(),'') not in ('owner','staff','stakeholder') then raise exception 'Business access required' using errcode='42501'; end if;
 with base as (
 select i.*, coalesce((select sum(round(coalesce(nullif(item->>'qty',''),'0')::numeric*coalesce(nullif(item->>'unitPrice',''),'0')::numeric,2)) from jsonb_array_elements(i.document->'items') item),0) subtotal
 from public.business_invoices i where document->>'docType'='invoice' and coalesce(document->>'orderStatus','confirmed') in ('confirmed','completed')
 ), orders as (
 select *, least(subtotal,case when coalesce((document->>'useDiscount')::boolean,false) then coalesce(nullif(document->>'discount',''),'0')::numeric else 0 end) discount,
 coalesce(nullif(document->>'amountPaid',''),'0')::numeric paid from base
 ), sales as (
 select substring(document->>'invoiceDate' from 1 for 7) as month,count(*) orders,sum(subtotal-discount) sales,sum(discount) discounts,
 sum(greatest(0,subtotal-discount-paid)) outstanding,sum(greatest(0,paid-subtotal+discount)) credit
 from orders group by 1
 ), cash as (
 select to_char(paid_on,'YYYY-MM') as month,
 sum(case when kind='payment' then amount else 0 end) received,
 sum(case when kind='refund' then amount else 0 end) refunded
 from public.business_payments where voided_at is null and kind<>'opening' group by 1
 ), costs as (select to_char(spent_on,'YYYY-MM') as month,sum(amount) expenses from public.business_expenses where voided_at is null group by 1),
 months as (select month from sales union select month from cash union select month from costs),
 monthly as (select m.month,coalesce(s.orders,0) orders,coalesce(s.sales,0) sales,coalesce(s.discounts,0) discounts,
 coalesce(s.outstanding,0) outstanding,coalesce(s.credit,0) credit,coalesce(c.received,0) received,coalesce(c.refunded,0) refunded,
 coalesce(e.expenses,0) expenses,coalesce(c.received,0)-coalesce(c.refunded,0)-coalesce(e.expenses,0) cash_after_expenses
 from months m left join sales s using(month) left join cash c using(month) left join costs e using(month)),
 sources as (select coalesce(document->>'foundThrough','unknown') source,count(*) orders,sum(subtotal-discount) sales from orders group by 1),
 channels as (select coalesce(document->>'orderedThrough','unknown') channel,count(*) orders from orders group by 1),
 dishes as (select item->>'description' dish,sum(coalesce(nullif(item->>'qty',''),'0')::numeric) quantity
 from orders cross join lateral jsonb_array_elements(document->'items') item group by 1)
 select jsonb_build_object(
 'monthly',coalesce((select jsonb_agg(to_jsonb(m) order by month desc) from monthly m),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(to_jsonb(s) order by orders desc) from sources s),'[]'::jsonb),
 'channels',coalesce((select jsonb_agg(to_jsonb(c) order by orders desc) from channels c),'[]'::jsonb),
 'dishes',coalesce((select jsonb_agg(to_jsonb(d) order by quantity desc) from dishes d),'[]'::jsonb),
 'opening_balance',coalesce((select sum(amount) from public.business_payments where kind='opening' and voided_at is null),0)
 ) into result;
 return result;
end $$;
revoke all on function public.business_dashboard() from public,anon;
grant execute on function public.business_dashboard() to authenticated;
commit;
