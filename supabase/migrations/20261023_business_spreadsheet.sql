-- Spreadsheet replacement. Run after business_invoices.sql; business_records.sql is NOT required.
begin;

-- If the earlier structured-record upgrade was installed, decouple it without deleting its data.
drop trigger if exists a_apply_business_ledger on public.business_invoices;
drop trigger if exists seed_business_opening on public.business_invoices;
do $$ begin
 if to_regclass('public.business_payments') is not null then
   execute 'drop trigger if exists sync_business_payment on public.business_payments';
 end if;
end $$;

create table if not exists public.business_sheet (
 id text primary key check(id='main'),
 columns jsonb not null check(jsonb_typeof(columns)='array'),
 rows jsonb not null default '[]'::jsonb check(jsonb_typeof(rows)='array'),
 version bigint not null default 1, updated_at timestamptz not null default now()
);
create table if not exists public.business_sheet_private (
 sheet_id text primary key references public.business_sheet(id) on delete cascade,
 cells jsonb not null default '{}'::jsonb check(jsonb_typeof(cells)='object')
);
create table if not exists public.business_sheet_history (
 sheet_id text not null references public.business_sheet(id) on delete cascade,
 version bigint not null, columns jsonb not null, rows jsonb not null, private_cells jsonb not null,
 saved_at timestamptz not null default now(), primary key(sheet_id,version)
);
insert into public.business_sheet(id,columns) values('main','[
 {"id":"invoice","label":"Invoice / Quote","type":"invoice","private":false,"archived":false},
 {"id":"customer","label":"Customer","type":"text","private":false,"archived":false},
 {"id":"items","label":"Order items","type":"text","private":false,"archived":false},
 {"id":"payments","label":"Payments","type":"text","private":false,"archived":false},
 {"id":"expense","label":"Expense","type":"text","private":false,"archived":false},
 {"id":"discount","label":"Discount","type":"text","private":false,"archived":false},
 {"id":"source","label":"Order from","type":"text","private":false,"archived":false},
 {"id":"notes","label":"Note","type":"text","private":false,"archived":false},
 {"id":"ethnicity","label":"Customer ethnicity","type":"text","private":true,"archived":false}
]'::jsonb) on conflict do nothing;
insert into public.business_sheet_private(sheet_id) values('main') on conflict do nothing;

alter table public.business_sheet enable row level security;
alter table public.business_sheet_private enable row level security;
alter table public.business_sheet_history enable row level security;
revoke all on public.business_sheet,public.business_sheet_private,public.business_sheet_history from public,anon,authenticated;
grant select on public.business_sheet,public.business_sheet_private,public.business_sheet_history to authenticated;
drop policy if exists sheet_read on public.business_sheet;
create policy sheet_read on public.business_sheet for select to authenticated
using((select public.business_role()) in ('owner','staff','stakeholder'));
drop policy if exists sheet_private_read on public.business_sheet_private;
create policy sheet_private_read on public.business_sheet_private for select to authenticated using((select public.business_role())='owner');
drop policy if exists sheet_history_read on public.business_sheet_history;
create policy sheet_history_read on public.business_sheet_history for select to authenticated using((select public.business_role())='owner');

create or replace function public.save_business_sheet(expected_version bigint, new_columns jsonb, new_rows jsonb, new_private_cells jsonb default null)
returns setof public.business_sheet language plpgsql security definer set search_path='' as $$
declare current_sheet public.business_sheet; user_role text; col jsonb; old_col jsonb; row_data jsonb;
 col_ids text[]:='{}'; row_ids text[]:='{}'; key text; value jsonb; row_key text; private_data jsonb;
 invoice_doc jsonb; linked_id uuid; cleaned_rows jsonb:='[]';
begin
 user_role:=public.business_role();
 if coalesce(user_role,'') not in ('owner','staff') then raise exception 'Editing access required' using errcode='42501'; end if;
 select * into current_sheet from public.business_sheet where id='main' for update;
 if current_sheet.version is distinct from expected_version then
   raise exception 'Another person saved changes. Your edits have not been saved. Export a copy or reload before continuing.' using errcode='40001';
 end if;
 if jsonb_typeof(new_columns) is distinct from 'array' or jsonb_array_length(new_columns) not between 1 and 64 then raise exception 'Use between 1 and 64 columns'; end if;
 if jsonb_typeof(new_rows) is distinct from 'array' or jsonb_array_length(new_rows)>2000 then raise exception 'Maximum 2000 rows'; end if;
 if octet_length(new_columns::text)+octet_length(new_rows::text)+octet_length(coalesce(new_private_cells,'{}')::text)>5000000 then raise exception 'Table is too large'; end if;
 if user_role<>'owner' and new_columns is distinct from current_sheet.columns then raise exception 'Only the owner can change columns'; end if;
 if user_role<>'owner' and new_private_cells is not null then raise exception 'Private columns are owner-only' using errcode='42501'; end if;
 for col in select * from jsonb_array_elements(new_columns) loop
   if jsonb_typeof(col->'id') is distinct from 'string' or (col->>'id') !~ '^[a-zA-Z0-9_-]{1,64}$'
     or col->>'id'=any(col_ids) or jsonb_typeof(col->'label') is distinct from 'string'
     or length(trim(col->>'label')) not between 1 and 100
     or coalesce(col->>'type','') not in ('text','invoice')
     or jsonb_typeof(col->'private') is distinct from 'boolean' or jsonb_typeof(col->'archived') is distinct from 'boolean' then raise exception 'Invalid column'; end if;
   if (col->>'type'='invoice') <> (col->>'id'='invoice') then raise exception 'Keep one invoice dropdown'; end if;
   if col->>'id'='invoice' and ((col->>'private')::boolean or (col->>'archived')::boolean) then raise exception 'The invoice dropdown cannot be hidden'; end if;
   select c into old_col from jsonb_array_elements(current_sheet.columns) c where c->>'id'=col->>'id';
   if old_col is not null and (old_col->>'private' is distinct from col->>'private' or old_col->>'type' is distinct from col->>'type') then raise exception 'Existing column privacy and type cannot be changed'; end if;
   col_ids:=array_append(col_ids,col->>'id');
 end loop;
 if not 'invoice'=any(col_ids) then raise exception 'Keep the invoice dropdown'; end if;
 -- Archive columns rather than deleting their data. They can be restored later.
 if exists(select 1 from jsonb_array_elements(current_sheet.columns) c where not c->>'id'=any(col_ids)) then raise exception 'Archive columns instead of deleting them'; end if;
 for row_data in select * from jsonb_array_elements(new_rows) loop
   if jsonb_typeof(row_data->'id') is distinct from 'string' or (row_data->>'id') !~ '^[a-zA-Z0-9_-]{1,64}$'
     or row_data->>'id'=any(row_ids) or jsonb_typeof(row_data->'cells') is distinct from 'object' then raise exception 'Invalid row'; end if;
   row_ids:=array_append(row_ids,row_data->>'id');
   for key,value in select * from jsonb_each(row_data->'cells') loop
     select c into col from jsonb_array_elements(new_columns) c where c->>'id'=key;
     if col is null or col->>'type'<>'text' or (col->>'private')::boolean or jsonb_typeof(value)<>'string' or length(value #>> '{}')>10000 then raise exception 'Invalid or private cell in the shared table'; end if;
   end loop;
   linked_id:=nullif(row_data->>'invoice_id','')::uuid;
   invoice_doc:=null;
   if linked_id is not null then
     select document into invoice_doc from public.business_invoices where id=linked_id;
     if invoice_doc is null then raise exception 'Selected invoice no longer exists'; end if;
   end if;
   cleaned_rows:=cleaned_rows || jsonb_build_array(jsonb_build_object('id',row_data->>'id','invoice_id',linked_id,
     'invoice_label',case when invoice_doc is null then '' else (invoice_doc->>'invoiceNumber') || case when invoice_doc->>'docType'='quotation' then ' (Quote)' else ' (Invoice)' end end,
     'cells',row_data->'cells'));
 end loop;
 select cells into private_data from public.business_sheet_private where sheet_id='main';
 insert into public.business_sheet_history(sheet_id,version,columns,rows,private_cells)
 values('main',current_sheet.version,current_sheet.columns,current_sheet.rows,coalesce(private_data,'{}'));
 if user_role='owner' then
   private_data:=coalesce(new_private_cells,'{}');
   if jsonb_typeof(private_data) is distinct from 'object' then raise exception 'Invalid private cells'; end if;
   for row_key,row_data in select * from jsonb_each(private_data) loop
     if not row_key=any(row_ids) or jsonb_typeof(row_data)<>'object' then raise exception 'Invalid private row'; end if;
     for key,value in select * from jsonb_each(row_data) loop
       select c into col from jsonb_array_elements(new_columns) c where c->>'id'=key;
       if col is null or not (col->>'private')::boolean or jsonb_typeof(value)<>'string' or length(value #>> '{}')>10000 then raise exception 'Invalid private cell'; end if;
     end loop;
   end loop;
 else
   -- Staff can remove rows without gaining access to private values.
   select coalesce(jsonb_object_agg(k,v),'{}') into private_data from jsonb_each(coalesce(private_data,'{}')) as e(k,v) where k=any(row_ids);
 end if;
 update public.business_sheet_private set cells=private_data where sheet_id='main';
 update public.business_sheet set columns=new_columns,rows=cleaned_rows,version=version+1,updated_at=now() where id='main';
 return query select * from public.business_sheet where id='main';
end $$;
revoke all on function public.save_business_sheet(bigint,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.save_business_sheet(bigint,jsonb,jsonb,jsonb) to authenticated;
commit;
