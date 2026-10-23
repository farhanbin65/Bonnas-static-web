-- Run in Supabase SQL Editor, signed in as the project owner.
-- This migration creates the first phase: private invoices and summary-only reporting.
-- It does not automatically give newly registered users access.
begin;

create table if not exists public.business_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff', 'stakeholder')),
  created_at timestamptz not null default now()
);
create table if not exists public.business_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  version bigint not null default 1,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (document ->> 'invoiceNumber' = invoice_number),
  check (document ->> 'docType' in ('invoice', 'quotation')),
  check (jsonb_typeof(document -> 'items') = 'array')
);

alter table public.business_members enable row level security;
alter table public.business_invoices enable row level security;
revoke all on public.business_members, public.business_invoices from anon, authenticated;
grant select on public.business_members to authenticated;
grant select, insert, update, delete on public.business_invoices to authenticated;

create or replace function public.business_role()
returns text language sql stable security definer set search_path = ''
as $$ select role from public.business_members where user_id = (select auth.uid()) $$;
revoke all on function public.business_role() from public, anon;
grant execute on function public.business_role() to authenticated;

drop policy if exists member_reads_own_role on public.business_members;
create policy member_reads_own_role on public.business_members for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists invoice_read on public.business_invoices;
create policy invoice_read on public.business_invoices for select to authenticated
using ((select public.business_role()) in ('owner', 'staff'));
drop policy if exists invoice_insert on public.business_invoices;
create policy invoice_insert on public.business_invoices for insert to authenticated
with check ((select public.business_role()) in ('owner', 'staff') and created_by = (select auth.uid()));
drop policy if exists invoice_update on public.business_invoices;
create policy invoice_update on public.business_invoices for update to authenticated
using ((select public.business_role()) in ('owner', 'staff'))
with check ((select public.business_role()) in ('owner', 'staff'));
drop policy if exists invoice_delete on public.business_invoices;
create policy invoice_delete on public.business_invoices for delete to authenticated
using ((select public.business_role()) = 'owner');

create or replace function public.check_business_invoice()
returns trigger language plpgsql set search_path = '' as $$
declare item jsonb; field text; value text;
begin
  if new.document ->> 'invoiceNumber' is distinct from new.invoice_number
    or coalesce(new.document ->> 'docType', '') not in ('invoice', 'quotation')
    or jsonb_typeof(new.document -> 'items') is distinct from 'array' then
    raise exception 'Invalid invoice document';
  end if;
  if jsonb_array_length(new.document -> 'items') < 1 then raise exception 'Add at least one item'; end if;
  if coalesce(new.document ->> 'invoiceDate', '') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invoice date is required'; end if;
  -- Cast verifies the date is real, not just formatted like one.
  perform (new.document ->> 'invoiceDate')::date;
  foreach field in array array['discount', 'depositAmount', 'amountPaid'] loop
    value := coalesce(nullif(new.document ->> field, ''), '0');
    if value !~ '^(\d+(\.\d{0,2})?|\.\d{1,2})$' or value::numeric > 999999999 then
      raise exception 'Invalid % amount', field;
    end if;
  end loop;
  for item in select * from jsonb_array_elements(new.document -> 'items') loop
    if length(trim(coalesce(item ->> 'description', ''))) = 0 then raise exception 'Item description is required'; end if;
    foreach field in array array['qty', 'unitPrice'] loop
      value := coalesce(nullif(item ->> field, ''), '0');
      if value !~ '^(\d+(\.\d{0,2})?|\.\d{1,2})$' or value::numeric > 999999999 then
        raise exception 'Invalid item %', field;
      end if;
    end loop;
  end loop;
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.version := old.version + 1;
  else
    new.version := 1;
    new.created_at := now();
    new.created_by := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.check_business_invoice() from public;
drop trigger if exists validate_business_invoice on public.business_invoices;
create trigger validate_business_invoice before insert or update on public.business_invoices
for each row execute function public.check_business_invoice();

-- Only aggregates leave this function. Stakeholders cannot query raw invoices.
-- Calculate amounts from line items rather than trusting stored display totals.
create or replace function public.business_invoice_summary()
returns table (month text, invoice_count bigint, order_value numeric, payments_recorded numeric, outstanding numeric, customer_credit numeric)
language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(public.business_role(), '') not in ('owner', 'staff', 'stakeholder') then
    raise exception 'Business access required' using errcode = '42501';
  end if;
  return query
  with amounts as (
    select i.document,
      coalesce((select sum(round(coalesce(nullif(item ->> 'qty', ''), '0')::numeric * coalesce(nullif(item ->> 'unitPrice', ''), '0')::numeric, 2))
        from jsonb_array_elements(i.document -> 'items') item), 0) subtotal
    from public.business_invoices i where i.document ->> 'docType' = 'invoice'
  ), totals as (
    select substring(document ->> 'invoiceDate' from 1 for 7) period,
      greatest(0, subtotal - case when coalesce((document ->> 'useDiscount')::boolean, false)
        then coalesce(nullif(document ->> 'discount', ''), '0')::numeric else 0 end) total,
      case when coalesce((document ->> 'useAmountPaid')::boolean, coalesce(nullif(document ->> 'amountPaid', ''), '0')::numeric > 0)
        then coalesce(nullif(document ->> 'amountPaid', ''), '0')::numeric else 0 end paid
    from amounts
  )
  select period, count(*), sum(total), sum(paid), sum(greatest(0, total - paid)), sum(greatest(0, paid - total))
  from totals group by period order by period desc;
end $$;
revoke all on function public.business_invoice_summary() from public, anon;
grant execute on function public.business_invoice_summary() to authenticated;
commit;
