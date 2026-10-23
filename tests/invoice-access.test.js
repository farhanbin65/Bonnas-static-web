import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const ids = { owner: '00000000-0000-0000-0000-000000000001', staff: '00000000-0000-0000-0000-000000000002', stakeholder: '00000000-0000-0000-0000-000000000003', outsider: '00000000-0000-0000-0000-000000000004' };
const migration = readFileSync(new URL('../supabase/migrations/20261023_business_invoices.sql', import.meta.url), 'utf8');

test('database rules enforce access, versioning and summary-only reporting', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;`);
    await db.exec(migration);
    // Re-running the migration must not remove records or break policy setup.
    await db.exec(migration);
    for (const [role, id] of Object.entries(ids)) {
      await db.query('insert into auth.users values ($1, $2)', [id, `${role}@example.com`]);
      if (role !== 'outsider') await db.query('insert into public.business_members(user_id, role) values ($1, $2)', [id, role]);
    }
    const asUser = async (role) => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [ids[role]]);
      await db.exec('set role authenticated');
    };
    const invoice = { invoiceNumber: 'INV-1', docType: 'invoice', invoiceDate: '2026-10-23', customerName: 'Private Customer', notes: 'Private notes', useAmountPaid: true, amountPaid: 20, items: [{ description: 'Food', qty: 1, unitPrice: 50 }] };
    await asUser('owner');
    await db.query('insert into public.business_invoices(invoice_number, document) values ($1, $2)', ['INV-1', invoice]);
    await asUser('staff');
    assert.equal((await db.query('select * from public.business_invoices')).rows.length, 1);
    const changed = await db.query("update public.business_invoices set document = document || '{\"notes\":\"Updated\"}' where version=1 returning version");
    assert.equal(changed.rows[0].version, 2);
    assert.equal((await db.query('update public.business_invoices set document=document where version=1 returning id')).rows.length, 0);
    assert.equal((await db.query('delete from public.business_invoices returning id')).rows.length, 0);
    await asUser('stakeholder');
    assert.equal((await db.query('select * from public.business_invoices')).rows.length, 0);
    const report = (await db.query('select * from public.business_invoice_summary()')).rows[0];
    assert.equal(Number(report.order_value), 50);
    assert.equal(Number(report.payments_recorded), 20);
    assert.equal(Number(report.outstanding), 30);
    assert.equal(report.customerName, undefined);
    assert.equal(report.document, undefined);
    await assert.rejects(db.query('insert into public.business_invoices(invoice_number, document) values ($1, $2)', ['INV-2', { ...invoice, invoiceNumber: 'INV-2' }]), /row-level security/);
    await assert.rejects(db.exec("update public.business_members set role='owner'"), /permission denied/);
    await asUser('outsider');
    assert.equal((await db.query('select * from public.business_invoices')).rows.length, 0);
    await assert.rejects(db.query('select * from public.business_invoice_summary()'), /Business access required/);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.query('select * from public.business_invoices'), /permission denied/);
    await assert.rejects(db.query('select * from public.business_invoice_summary()'), /permission denied/);
    await asUser('owner');
    await assert.rejects(db.query('insert into public.business_invoices(invoice_number, document) values ($1, $2)', ['BROKEN', { ...invoice, invoiceNumber: 'BROKEN', items: [{ description: 'Food', qty: -1, unitPrice: 50 }] }]), /Invalid item/);
    assert.equal((await db.query('delete from public.business_invoices returning id')).rows.length, 1);
  } finally { await db.close(); }
});
