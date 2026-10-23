import { test } from 'node:test';
import assert from 'node:assert/strict';
import { invoiceRepository } from '../src/components/invoice/cloudStorage.js';

function mockClient(responses) {
  const calls = [];
  const query = new Proxy({}, { get: (_target, method) => (...args) => {
    calls.push([method, ...args]);
    if (method === 'range' || method === 'maybeSingle' || (method === 'select' && args[0] === 'id')) return Promise.resolve(responses.shift());
    return query;
  } });
  return { client: { from: (table) => { calls.push(['from', table]); return query; } }, calls };
}
test('cloud saves filter by the loaded version, not a refreshed version', async () => {
  const invoice = { invoiceNumber: 'INV-1', items: [], _cloudId: 'old', _version: 3 };
  const { client, calls } = mockClient([{ data: { id: 'old', invoice_number: 'INV-1', version: 4, document: invoice }, error: null }]);
  const result = await invoiceRepository(client).save(invoice, invoice);
  assert.equal(result._version, 4);
  assert.ok(calls.some(([method, field, value]) => method === 'eq' && field === 'version' && value === 3));
  const values = calls.find(([method]) => method === 'update')[1];
  assert.equal(values.document._version, undefined);
  assert.equal(values.document._cloudId, undefined);
});
test('cloud save and delete conflicts are reported instead of claiming success', async () => {
  const invoice = { invoiceNumber: 'INV-1', _cloudId: 'one', _version: 1 };
  let mock = mockClient([{ data: null, error: null }]);
  await assert.rejects(invoiceRepository(mock.client).save(invoice, invoice), /changed or your access was removed/);
  mock = mockClient([{ data: [], error: null }]);
  await assert.rejects(invoiceRepository(mock.client).remove(invoice), /changed or your access was removed/);
});
test('cloud invoices paginate and preserve database metadata', async () => {
  const rows = Array.from({ length: 500 }, (_, id) => ({ id: String(id), invoice_number: `INV-${id}`, document: { items: [] }, version: 2 }));
  const { client, calls } = mockClient([{ data: rows, error: null }, { data: [{ id: 'last', invoice_number: 'INV-last', document: {}, version: 1 }], error: null }]);
  const data = await invoiceRepository(client).list();
  assert.equal(Object.keys(data).length, 501);
  assert.equal(data['INV-1']._version, 2);
  assert.ok(calls.some(([method, from, to]) => method === 'range' && from === 500 && to === 999));
});
test('new cloud invoices use insert so matching records cannot be overwritten', async () => {
  const { client, calls } = mockClient([{ data: null, error: { code: '23505', message: 'duplicate' } }]);
  await assert.rejects(invoiceRepository(client).save({ invoiceNumber: 'INV-1' }), /already exists/);
  assert.ok(calls.some(([method]) => method === 'insert'));
  assert.ok(!calls.some(([method]) => method === 'upsert'));
});
