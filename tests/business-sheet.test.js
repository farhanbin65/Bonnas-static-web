import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { blankRow, changeCell, removeRow, parseClipboard, pasteCells, visibleColumns, sheetCsv, restoreSnapshot, withStarterRows, columnWidth, MAX_ROWS } from '../src/components/records/sheetModel.js';
import { rememberedEmail, rememberEmail } from '../src/lib/rememberedLogin.js';

const columns = [
 {id:'invoice',label:'Invoice',type:'invoice',private:false,archived:false},
 {id:'customer',label:'Customer',type:'text',private:false,archived:false},
 {id:'ethnicity',label:'Ethnicity',type:'text',private:true,archived:false},
];
const migration = (name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');

test('spreadsheet cells are free text and invoice selection never overwrites them', () => {
 const row = blankRow(); let draft = {columns,rows:[row],privateCells:{}};
 draft = changeCell(draft,row.id,columns[1],'£50 deposit paid on Friday');
 draft = changeCell(draft,row.id,columns[2],'Voluntarily supplied');
 draft = changeCell(draft,row.id,columns[0],'linked-invoice-id');
 assert.equal(draft.rows[0].cells.customer,'£50 deposit paid on Friday');
 assert.equal(draft.rows[0].cells.ethnicity,undefined);
 assert.equal(draft.privateCells[row.id].ethnicity,'Voluntarily supplied');
 assert.equal(draft.rows[0].invoice_id,'linked-invoice-id');
 assert.equal(visibleColumns(columns,'stakeholder').length,2);
 const removed = removeRow(draft,row.id); assert.equal(removed.rows.length,0); assert.equal(removed.privateCells[row.id],undefined);
});

test('pasting supports quoted multiline text and adds rows without partial failure', () => {
 assert.deepEqual(parseClipboard('one\t"two\nlines"\nthree\t"a ""quote"""\n'),[['one','two\nlines'],['three','a "quote"']]);
 const draft={columns:columns.slice(0,2),rows:[blankRow()],privateCells:{}};
 const next=pasteCells(draft,0,0,'INV-1\tAlice\n\tBob','staff',[{id:'invoice-id',invoiceNumber:'INV-1'}]);
 assert.equal(next.rows.length,2); assert.equal(next.rows[0].invoice_id,'invoice-id'); assert.equal(next.rows[1].cells.customer,'Bob');
 assert.equal(draft.rows.length,1); assert.equal(draft.rows[0].cells.customer,undefined);
 assert.throws(()=>pasteCells(draft,0,0,'NO-MATCH\tAlice','staff',[]),/No saved invoice/);
 assert.throws(()=>pasteCells(draft,0,1,'one\ttwo','staff',[]),/Add more columns/);
});

test('CSV excludes private values and escapes spreadsheet formulas; restoring retains newer columns as hidden', () => {
 const row=blankRow(); const draft={columns,rows:[{...row,cells:{customer:'=1+1'}}],privateCells:{[row.id]:{ethnicity:'PRIVATE_VALUE'}}};
 const csv=sheetCsv(draft,[]);assert.ok(csv.includes("'=1+1"));assert.ok(!csv.includes('PRIVATE_VALUE'));assert.ok(!csv.includes('Ethnicity'));
 const restored=restoreSnapshot({columns,rows:[],private_cells:{}},{...draft,columns:[...columns,{id:'new',type:'text',private:false}]});
 assert.equal(restored.columns.at(-1).archived,true);
});

test('password-only convenience remembers only the email and survives unavailable storage', () => {
 const values=new Map();const storage={getItem:(key)=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 assert.equal(rememberedEmail(storage),'');rememberEmail(storage,'owner@example.com');assert.equal(rememberedEmail(storage),'owner@example.com');
 assert.equal(rememberedEmail(storage,'fixed@example.com'),'fixed@example.com');
 assert.equal(rememberedEmail({getItem:()=>{throw Error('blocked');}}),'');
 assert.doesNotThrow(()=>rememberEmail({setItem:()=>{throw Error('blocked');}},'owner@example.com'));
 assert.equal([...values.values()].length,1);
});

test('database sheet edits, privacy, conflict detection, history and invoice independence', async () => {
 const db=new PGlite();
 const ids={owner:'00000000-0000-0000-0000-000000000001',staff:'00000000-0000-0000-0000-000000000002',stakeholder:'00000000-0000-0000-0000-000000000003',outsider:'00000000-0000-0000-0000-000000000004'};
 try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
  await db.exec(migration('20261023_business_invoices.sql'));
  for(const [role,id] of Object.entries(ids)) {
   await db.query('insert into auth.users values($1,$2)',[id,role+'@example.com']);
   if(role!=='outsider')await db.query('insert into public.business_members(user_id,role) values($1,$2)',[id,role]);
  }
  const asUser=async(role)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[role]]);await db.exec('set role authenticated');};
  await asUser('owner');
  const invoice={invoiceNumber:'QTN-1',docType:'quotation',invoiceDate:'2026-10-23',useAmountPaid:false,amountPaid:0,items:[{description:'Food',qty:1,unitPrice:50}]};
  const invoiceId=(await db.query('insert into public.business_invoices(invoice_number,document) values($1,$2) returning id',['QTN-1',invoice])).rows[0].id;
  await db.exec('reset role');await db.exec(migration('20261023_business_spreadsheet.sql'));await db.exec(migration('20261023_business_spreadsheet.sql'));
  await asUser('owner');
  let sheet=(await db.query("select * from public.business_sheet where id='main'")).rows[0];
  assert.equal(sheet.columns.length,9);
  assert.equal(sheet.columns.filter((column)=>column.type==='invoice').length,1);
  const row={id:'row-1',invoice_id:invoiceId,invoice_label:'FAKE',cells:{customer:'Alice',payments:'Paid £30 by bank',expense:'Rice £15',notes:'Call on arrival'}};
  const save=async(version,cols,rows,privateCells)=> (await db.query('select * from public.save_business_sheet($1,$2,$3,$4)',[version,cols,rows,privateCells])).rows[0];
  sheet=await save(sheet.version,sheet.columns,[row],{'row-1':{ethnicity:'Private self-reported value'}});
  assert.equal(sheet.rows[0].invoice_label,'QTN-1 (Quote)');
  assert.equal(sheet.rows[0].cells.payments,'Paid £30 by bank');
  assert.equal((await db.query('select document from public.business_invoices where id=$1',[invoiceId])).rows[0].document.amountPaid,0);
  await assert.rejects(save(1,sheet.columns,[row],{}),/Another person saved/);
  await assert.rejects(save(sheet.version,sheet.columns,[{...row,cells:{ethnicity:'LEAK'}}],{}),/private cell/);
  const unsafe=sheet.columns.map((column)=>column.id==='ethnicity'?{...column,private:false}:column);
  await assert.rejects(save(sheet.version,unsafe,[row],{}),/privacy/);
  await asUser('staff');
  assert.equal((await db.query('select * from public.business_sheet_private')).rows.length,0);
  await assert.rejects(save(sheet.version,[...sheet.columns,{id:'new',label:'New',type:'text',private:false,archived:false}],[row],null),/Only the owner/);
  await assert.rejects(save(sheet.version,sheet.columns,[row],{}),/owner-only/);
  sheet=await save(sheet.version,sheet.columns,[{...row,cells:{customer:'Bob'}}],null);
  await assert.rejects(db.exec("update public.business_sheet set rows='[]'"),/permission denied/);
  await asUser('owner');
  assert.equal((await db.query('select cells from public.business_sheet_private')).rows[0].cells['row-1'].ethnicity,'Private self-reported value');
  assert.equal((await db.query('select * from public.business_sheet_history')).rows.length,2);
  await asUser('stakeholder');
  assert.equal((await db.query('select * from public.business_sheet')).rows[0].rows[0].cells.customer,'Bob');
  assert.equal((await db.query('select * from public.business_sheet_private')).rows.length,0);
  assert.equal((await db.query('select * from public.business_sheet_history')).rows.length,0);
  assert.equal((await db.query('select * from public.business_invoices')).rows.length,0);
  await assert.rejects(save(sheet.version,sheet.columns,[],null),/Editing access/);
  await asUser('outsider');assert.equal((await db.query('select * from public.business_sheet')).rows.length,0);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from public.business_sheet'),/permission denied/);
  // Also support projects that already installed the superseded ledger upgrade.
  await db.exec('reset role'); await db.exec(migration('20261023_business_records.sql')); await asUser('owner');
  const oldInvoice={...invoice,invoiceNumber:'INV-OLD',docType:'invoice',useAmountPaid:true,amountPaid:20};
  const oldId=(await db.query('insert into public.business_invoices(invoice_number,document) values($1,$2) returning id',['INV-OLD',oldInvoice])).rows[0].id;
  await db.exec('reset role'); await db.exec(migration('20261023_business_spreadsheet.sql')); await asUser('owner');
  await db.query("update public.business_invoices set document=document || '{\"amountPaid\":5}' where id=$1",[oldId]);
  assert.equal((await db.query('select document from public.business_invoices where id=$1',[oldId])).rows[0].document.amountPaid,5);
  assert.equal((await db.query('select * from public.business_payments where invoice_id=$1',[oldId])).rows.length,1);
  assert.equal((await db.query('select * from public.business_sheet')).rows[0].version,sheet.version);

 }finally{await db.close();}
});

test('table controls match editing roles and invoice generator keeps manual payment entry', async () => {
 const {createServer}=await import('vite');const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({publicDir:false,server:{middlewareMode:true,watch:null},appType:'custom'});
 try {
  const {Sheet}=await server.ssrLoadModule('/src/components/records/BusinessSheet.jsx');
  const owner=renderToStaticMarkup(createElement(Sheet,{user:{email:'owner@example.com'},role:'owner',signOut:()=>{}}));
  const viewer=renderToStaticMarkup(createElement(Sheet,{user:{email:'viewer@example.com'},role:'stakeholder',signOut:()=>{}}));
  assert.ok(owner.includes('Add row'));assert.ok(owner.includes('Manage columns'));assert.ok(owner.includes('Saved versions'));
  assert.ok(viewer.includes('View only'));assert.ok(!viewer.includes('>Add row<'));assert.ok(!viewer.includes('>Manage columns<'));
  const {default:Form}=await server.ssrLoadModule('/src/components/invoice/InvoiceForm.jsx');
  const {newInvoice}=await import('../src/components/invoice/model.js');const {calculateInvoice}=await import('../src/components/invoice/calculations.js');
  const form=newInvoice();const html=renderToStaticMarkup(createElement(Form,{form,totals:calculateInvoice(form),onChange:()=>{}}));
  assert.ok(html.includes('Amount paid by customer'));assert.ok(!html.includes('Order Tracking'));assert.ok(!html.includes('use the Payments tab'));
 }finally{await server.close();}
});

test('starter rows preserve records and private cells without duplicate padding', () => {
 const row = { ...blankRow(), cells: { customer: 'Existing customer' } };
 const original = { columns, rows: [row], privateCells: { [row.id]: { ethnicity: 'Private' } } };
 const prepared = withStarterRows(original);
 assert.equal(prepared.rows.length, 12);
 assert.equal(original.rows.length, 1);
 assert.equal(prepared.rows[0], row);
 assert.equal(prepared.privateCells[row.id].ethnicity, 'Private');
 assert.equal(new Set(prepared.rows.map((item) => item.id)).size, 12);
 assert.equal(withStarterRows(prepared), prepared);
 const full = { ...original, rows: Array.from({ length: 14 }, () => ({ ...blankRow(), cells: { customer: 'Name' } })) };
 assert.equal(withStarterRows(full).rows.length, 17);
 const maximum = { ...original, rows: Array.from({ length: MAX_ROWS }, blankRow) };
 assert.equal(withStarterRows(maximum).rows.length, MAX_ROWS);
 assert.ok(columnWidth(columns[0]) < 220);
});
