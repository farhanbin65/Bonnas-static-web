import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateInvoice, summaryRows } from '../src/components/invoice/calculations.js';
import { newInvoice, normalizeInvoice, duplicateInvoice, validateInvoice } from '../src/components/invoice/model.js';
import { loadInvoices, saveInvoice, deleteInvoice } from '../src/components/invoice/storage.js';
import { invoiceCsv, createInvoicePdf } from '../src/components/invoice/export.js';

const order = (changes = {}) => ({
  ...newInvoice(), items: [{ id: 'one', description: 'Biryani', qty: '1', unitPrice: '50' }], ...changes,
});

test('full and partial payments, discounts, credits and required deposits', () => {
  let invoice = order({ useAmountPaid: true, amountPaid: '50' });
  assert.equal(calculateInvoice(invoice).grandTotal, 0);
  assert.deepEqual(summaryRows(invoice, calculateInvoice(invoice)).at(-1), ['Total Due', 0]);
  invoice = order({ useAmountPaid: true, amountPaid: '20', useDeposit: true, depositAmount: '20' });
  assert.equal(calculateInvoice(invoice).outstandingBalance, 30);
  assert.equal(calculateInvoice(invoice).depositDue, 0);
  assert.equal(calculateInvoice(order({ useDeposit: true, depositAmount: '20' })).outstandingBalance, 50);
  invoice = order({ useDiscount: true, discount: '5', useAmountPaid: true, amountPaid: '50' });
  assert.equal(calculateInvoice(invoice).credit, 5);
  assert.equal(calculateInvoice(invoice).outstandingBalance, 0);
});

test('unchecked fields are excluded consistently in calculations and CSV', () => {
  const invoice = order({ useDeposit: false, depositAmount: '20', useDiscount: false, discount: '10', useAmountPaid: false, amountPaid: '50' });
  const totals = calculateInvoice(invoice);
  assert.equal(totals.finalAmountPaid, 0);
  assert.equal(totals.finalDepositAmount, 0);
  assert.equal(totals.discountAmount, 0);
  assert.equal(totals.grandTotal, 50);
  assert.match(invoiceCsv({ invoice }), /"50.00","0.00","50.00","0.00","0.00","50.00","0.00"/);
});

test('currency rounds per line and excessive discount is rejected', () => {
  const invoice = order({ items: [{ id: 1, description: 'Food', qty: '3', unitPrice: '0.10' }] });
  assert.equal(calculateInvoice(invoice).subtotal, 0.30);
  const discounted = order({ useDiscount: true, discount: '60' });
  assert.match(validateInvoice(discounted, calculateInvoice(discounted)), /discount cannot exceed/);
});

test('old invoices retain payments; loaded items receive unique IDs', () => {
  const old = order({ amountPaid: 50 });
  delete old.useAmountPaid;
  old.items = [...old.items, { ...old.items[0] }];
  const loaded = normalizeInvoice(old);
  assert.equal(loaded.useAmountPaid, true);
  assert.notEqual(loaded.items[0].id, loaded.items[1].id);
  assert.equal(calculateInvoice(old).outstandingBalance, 50);
  assert.equal(calculateInvoice(order({ amountPaid: 50, useAmountPaid: undefined })).outstandingBalance, 0);
});

test('CSV neutralizes formula cells and escapes quotes/newlines', () => {
  const csv = invoiceCsv({ inv: order({ customerName: '=1+1', notes: '"hello"\nnext line' }) });
  assert.ok(csv.includes('"\'=1+1"'));
  assert.ok(csv.includes('""hello""\nnext line'));
});

test('storage preserves legacy records, prevents collisions and surfaces write failures', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const invoice = order();
  saveInvoice(invoice);
  assert.equal(Object.keys(loadInvoices()).length, 1);
  assert.throws(() => saveInvoice(invoice), /already exists/);
  saveInvoice({ ...invoice, amountPaid: 20 }, invoice.invoiceNumber);
  assert.equal(loadInvoices()[invoice.invoiceNumber].amountPaid, 20);
  localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => saveInvoice(invoice, invoice.invoiceNumber), /Quota/);
  assert.throws(() => deleteInvoice(invoice.invoiceNumber), /Quota/);
  localStorage.getItem = () => '{broken';
  assert.throws(() => loadInvoices());
});

test('PDF fits 15 ordinary items on one page and paginates longer orders', () => {
  const bytes = readFileSync(new URL('../public/logo.PNG', import.meta.url));
  // jsPDF accepts a data URL with its dimensions supplied separately.
  const logo = { imageData: `data:image/png;base64,${bytes.toString('base64')}`, width: 100, height: 100 };
  const invoice = order({ customerName: 'Customer', customerPhone: '07123456789', customerEmail: 'customer@example.com', customerAddress: 'London', eventDate: '2026-12-01', guestCount: '20', useAmountPaid: true, amountPaid: '750', items: Array.from({ length: 15 }, (_, id) => ({ id, description: `Food item ${id + 1}`, qty: 1, unitPrice: 50 })) });
  const doc = createInvoicePdf(invoice, calculateInvoice(invoice), logo);
  assert.equal(doc.getNumberOfPages(), 1);
  assert.ok(doc.output().includes('Total Due'));
  assert.ok(doc.output().includes('0.00'));
  invoice.items = Array.from({ length: 70 }, (_, id) => ({ id, description: `Food item ${id + 1}`, qty: 1, unitPrice: 50 }));
  const long = createInvoicePdf(invoice, calculateInvoice(invoice), logo);
  assert.ok(long.getNumberOfPages() > 1);
  assert.ok(long.output().includes('Food item 70'));
  assert.ok(long.output().includes('continued'));
});

test('duplicating an invoice resets payments without modifying the original', () => {
  const invoice = order({ useAmountPaid: true, amountPaid: '50' });
  const copy = duplicateInvoice(invoice, { [invoice.invoiceNumber]: invoice });
  assert.notEqual(copy.invoiceNumber, invoice.invoiceNumber);
  assert.equal(copy.useAmountPaid, false);
  assert.equal(copy.amountPaid, '');
  assert.equal(calculateInvoice(copy).outstandingBalance, 50);
  assert.equal(invoice.amountPaid, '50');
});
