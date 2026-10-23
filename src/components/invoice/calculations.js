export const nonNegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};
const pennies = (value) => Math.round((nonNegative(value) + Number.EPSILON) * 100);
export const formatCurrency = (value) => `£${nonNegative(value).toFixed(2)}`;
export const formatDate = (value) => {
  if (!value) return 'N/A';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};
export function calculateInvoice(invoice) {
  const calculatedItems = invoice.items.map((item) => {
    const qty = nonNegative(item.qty);
    const unitPrice = nonNegative(item.unitPrice);
    return { ...item, qty, unitPrice, total: pennies(qty * unitPrice) / 100 };
  });
  const subtotal = calculatedItems.reduce((sum, item) => sum + pennies(item.total), 0);
  const requestedDiscount = invoice.useDiscount ? pennies(invoice.discount) : 0;
  const discount = Math.min(subtotal, requestedDiscount);
  const orderTotal = subtotal - discount;
  const useAmountPaid = invoice.useAmountPaid ?? nonNegative(invoice.amountPaid) > 0;
  const amountPaid = useAmountPaid ? pennies(invoice.amountPaid) : 0;
  const deposit = invoice.useDeposit ? Math.min(orderTotal, pennies(invoice.depositAmount)) : 0;
  return {
    calculatedItems,
    subtotal: subtotal / 100,
    discountAmount: discount / 100,
    orderTotal: orderTotal / 100,
    finalDepositAmount: deposit / 100,
    finalAmountPaid: amountPaid / 100,
    depositDue: Math.max(0, deposit - amountPaid) / 100,
    outstandingBalance: Math.max(0, orderTotal - amountPaid) / 100,
    grandTotal: Math.max(0, orderTotal - amountPaid) / 100,
    credit: Math.max(0, amountPaid - orderTotal) / 100,
    discountExceeded: requestedDiscount > subtotal,
  };
}
export function summaryRows(invoice, totals) {
  const rows = [['Subtotal', totals.subtotal]];
  if (invoice.useDiscount) rows.push(['Discount', -totals.discountAmount], ['Order Total', totals.orderTotal]);
  if (invoice.useDeposit) rows.push(['Deposit Required', totals.finalDepositAmount], ['Deposit Still Due', totals.depositDue]);
  if (invoice.useAmountPaid ?? nonNegative(invoice.amountPaid) > 0) rows.push(['Amount Paid', totals.finalAmountPaid]);
  if (totals.credit > 0) rows.push(['Customer Credit', totals.credit]);
  rows.push(['Total Due', totals.outstandingBalance]);
  return rows;
}
