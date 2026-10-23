export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function documentNumber(type, existing = {}) {
  const prefix = type === 'quotation' ? 'QTN' : 'INV';
  let number;
  do {
    number = `${prefix}-${today().replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  } while (Object.hasOwn(existing, number));
  return number;
}
export function newInvoice(existing = {}) {
  return {
    docType: 'invoice', invoiceNumber: documentNumber('invoice', existing), invoiceDate: today(),
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    eventAddress: '', eventDate: '', guestCount: '', notes: '',
    orderStatus: 'confirmed', foundThrough: 'unknown', orderedThrough: 'unknown',
    collectionDate: '', collectionTime: '', internalNotes: '', paymentLedgerManaged: false,
    items: [{ id: crypto.randomUUID(), description: '', qty: '1', unitPrice: '0' }],
    discount: '', useDiscount: false, depositAmount: '', useDeposit: false,
    amountPaid: '', useAmountPaid: false,
  };
}
export function normalizeInvoice(saved) {
  const defaults = newInvoice();
  const form = Object.fromEntries(Object.keys(defaults).map((key) => [key, saved[key] ?? defaults[key]]));
  form.items = (saved.items?.length ? saved.items : defaults.items).map((item) => ({
    id: crypto.randomUUID(), description: String(item.description ?? ''),
    qty: String(item.qty ?? 0), unitPrice: String(item.unitPrice ?? 0),
  }));
  form.useAmountPaid = saved.useAmountPaid ?? Number(saved.amountPaid || 0) > 0;
  return form;
}
export function validateInvoice(form, totals) {
  if (!totals.subtotal) return 'Add at least one item with a total greater than zero.';
  if (!form.invoiceDate) return 'Please enter the invoice date.';
  if (form.items.some((item) => !item.description.trim())) return 'Please add a description to every item.';
  if (totals.discountExceeded) return 'The discount cannot exceed the subtotal.';
  if (form.useDeposit && Number(form.depositAmount) > totals.orderTotal) return 'The required deposit cannot exceed the order total.';
  return '';
}

export function duplicateInvoice(saved, existing = {}) {
  return {
    ...normalizeInvoice(saved), invoiceNumber: documentNumber(saved.docType, existing),
    invoiceDate: today(), amountPaid: '', useAmountPaid: false, paymentLedgerManaged: false,
    orderStatus: 'confirmed', collectionDate: '', collectionTime: '', internalNotes: '',
  };
}
