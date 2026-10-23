import { STORAGE_KEY } from './constants.js';

export function loadInvoices() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      Object.values(data).some((invoice) => !invoice || typeof invoice.invoiceNumber !== 'string' || !Array.isArray(invoice.items))) {
    throw new Error('Saved invoice data is invalid. Existing data has been left untouched.');
  }
  return data;
}
export function saveInvoice(invoice, editingNumber) {
  const invoices = loadInvoices();
  if (Object.hasOwn(invoices, invoice.invoiceNumber) && editingNumber !== invoice.invoiceNumber) {
    throw new Error('That invoice number already exists. Start a new invoice to generate another number.');
  }
  if (editingNumber && editingNumber !== invoice.invoiceNumber) delete invoices[editingNumber];
  invoices[invoice.invoiceNumber] = invoice;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  return invoices;
}
export function deleteInvoice(number) {
  const invoices = loadInvoices();
  delete invoices[number];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  return invoices;
}
