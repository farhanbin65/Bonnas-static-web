import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { calculateInvoice, formatCurrency, formatDate, summaryRows } from './calculations.js';
import { LOGO_URL, BRAND_NAME, BRAND_SUBTITLE, BRAND_WEBSITE, BRAND_FACEBOOK } from './constants.js';

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function invoiceCsv(invoices) {
  const headers = ['Invoice #', 'Type', 'Date', 'Customer', 'Phone', 'Email', 'Items Count', 'Subtotal', 'Discount', 'Order Total', 'Deposit Required', 'Amount Paid', 'Total Due', 'Customer Credit', 'Notes'];
  const rows = Object.values(invoices).map((invoice) => {
    const totals = calculateInvoice(invoice);
    return [invoice.invoiceNumber, invoice.docType, invoice.invoiceDate, invoice.customerName,
      invoice.customerPhone, invoice.customerEmail, invoice.items.length,
      ...[totals.subtotal, totals.discountAmount, totals.orderTotal, totals.finalDepositAmount,
        totals.finalAmountPaid, totals.outstandingBalance, totals.credit].map((value) => value.toFixed(2)), invoice.notes];
  });
  // Quoting alone does not prevent spreadsheet formula execution.
  const escape = (value) => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
}
export function exportCsv(invoices) {
  download(new Blob([invoiceCsv(invoices)], { type: 'text/csv;charset=utf-8' }), 'bonnas-invoices.csv');
}
async function logoImage() {
  const image = new Image();
  image.src = LOGO_URL;
  await image.decode();
  return image;
}
export function createInvoicePdf(invoice, totals, logo) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 12;
  const right = 198;
  let y = 15;
  const pageBottom = 282;
  const ensureSpace = (height) => {
    if (y + height > pageBottom) {
      pdf.addPage();
      y = 16;
      pdf.setFontSize(9);
      pdf.text(`${BRAND_NAME} | ${invoice.invoiceNumber} (continued)`, left, y);
      y += 9;
      return true;
    }
    return false;
  };
  const line = (text, size = 9, width = right - left) => {
    pdf.setFontSize(size);
    for (const wrapped of pdf.splitTextToSize(String(text), width)) {
      ensureSpace(5);
      pdf.text(wrapped, left, y);
      y += 5;
    }
  };
  const logoWidth = Math.min(26, 16 * ((logo.naturalWidth || logo.width) / (logo.naturalHeight || logo.height)));
  pdf.addImage(logo.imageData ?? logo, 'PNG', left, y - 5, logoWidth, 16);
  pdf.setFontSize(17);
  pdf.text(BRAND_NAME, 44, y);
  pdf.setFontSize(9);
  pdf.text(BRAND_SUBTITLE, 44, y + 5);
  pdf.text(BRAND_WEBSITE, 44, y + 10);
  y += 21;
  line(BRAND_FACEBOOK, 8);
  line(`${invoice.docType === 'quotation' ? 'QUOTATION' : 'INVOICE'}  ${invoice.invoiceNumber}`, 12);
  line(`Date: ${formatDate(invoice.invoiceDate)}`);
  y += 2;
  for (const value of [invoice.customerName, invoice.customerPhone && `Phone: ${invoice.customerPhone}`,
    invoice.customerEmail && `Email: ${invoice.customerEmail}`, invoice.customerAddress,
    invoice.eventAddress && `Event venue: ${invoice.eventAddress}`,
    invoice.eventDate && `Event date: ${formatDate(invoice.eventDate)}`,
    invoice.guestCount && `Guests: ${invoice.guestCount}`]) {
    if (value) line(value);
  }
  y += 4;
  const tableHeader = () => {
    pdf.setFillColor(62, 39, 35);
    pdf.rect(left, y - 4, right - left, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text('#', 14, y);
    pdf.text('Description', 23, y);
    pdf.text('Qty', 140, y, { align: 'right' });
    pdf.text('Unit Price', 167, y, { align: 'right' });
    pdf.text('Total', 196, y, { align: 'right' });
    pdf.setTextColor(44, 44, 44);
    y += 8;
  };
  ensureSpace(18);
  tableHeader();
  totals.calculatedItems.forEach((item, index) => {
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(item.description, 103);
    // Long descriptions can continue across pages without cutting text in half.
    for (let offset = 0; offset < lines.length;) {
      if (ensureSpace(6)) tableHeader();
      const count = Math.max(1, Math.min(lines.length - offset, Math.floor((pageBottom - y - 3) / 4.5)));
      if (offset === 0) {
        pdf.text(String(index + 1), 14, y);
        pdf.text(String(item.qty), 140, y, { align: 'right' });
        pdf.text(formatCurrency(item.unitPrice), 167, y, { align: 'right' });
        pdf.text(formatCurrency(item.total), 196, y, { align: 'right' });
      }
      pdf.text(lines.slice(offset, offset + count), 23, y);
      y += count * 4.5 + 2;
      offset += count;
    }
    pdf.setDrawColor(239, 235, 233);
    pdf.line(left, y - 2, right, y - 2);
  });
  y += 5;
  const rows = summaryRows(invoice, totals);
  ensureSpace(rows.length * 6 + 4);
  rows.forEach(([label, amount], index) => {
    pdf.setFont('helvetica', index === rows.length - 1 ? 'bold' : 'normal');
    pdf.text(label, 120, y);
    pdf.text(`${amount < 0 ? '-' : ''}${formatCurrency(Math.abs(amount))}`, right, y, { align: 'right' });
    y += 6;
  });
  pdf.setFont('helvetica', 'normal');
  if (invoice.notes) {
    y += 4;
    line('Notes', 10);
    line(invoice.notes);
  }
  y += 4;
  line('Terms & Policies', 10);
  for (const policy of ['Collection only', 'Full payment required before event', 'Allergies must be informed in advance', 'Not VAT Registered', `${invoice.docType === 'quotation' ? 'Quotation' : 'Invoice'} valid for 15 days`]) line(policy, 8);
  line(`Thank you for choosing ${BRAND_NAME}`, 9);
  return pdf;
}
export async function exportPdf(invoice, totals, element) {
  // Built-in PDF fonts cannot shape Bengali and other non-Latin scripts.
  // Preserve those glyphs through the browser-rendered preview.
  const text = [invoice.customerName, invoice.customerAddress, invoice.eventAddress,
    invoice.notes, ...invoice.items.map((item) => item.description)].join('');
  if (/[\u0100-\u{10FFFF}]/u.test(text)) {
    const canvas = await capturePreview(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const ratio = 186 / canvas.width;
    const pagePixels = Math.floor(273 / ratio);
    const root = element.getBoundingClientRect();
    const scale = canvas.width / root.width;
    const blocks = [...element.querySelectorAll('tr, p, li, h1, h2, [data-payment-row]')]
      .map((node) => { const rect = node.getBoundingClientRect(); return { top: Math.floor((rect.top - root.top) * scale), bottom: Math.ceil((rect.bottom - root.top) * scale) }; });
    for (let top = 0, page = 0; top < canvas.height; page++) {
      let bottom = Math.min(canvas.height, top + pagePixels);
      // Prefer a boundary before a row or paragraph rather than slicing it.
      const cuts = blocks.filter((block) => block.top < bottom && block.bottom > bottom && block.top > top);
      if (cuts.length) bottom = Math.min(...cuts.map((block) => block.top));
      const height = Math.max(1, bottom - top);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = height;
      slice.getContext('2d').drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);
      if (page) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', 12, 12, 186, height * ratio);
      top += height;
    }
    pdf.save(`${invoice.invoiceNumber}.pdf`);
    return;
  }
  const pdf = createInvoicePdf(invoice, totals, await logoImage());
  pdf.save(`${invoice.invoiceNumber}.pdf`);
}
async function capturePreview(element) {
  await document.fonts.ready;
  await Promise.all([...element.querySelectorAll('img')].map((image) => image.decode()));
  const canvas = await html2canvas(element, {
    scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false, windowWidth: 1200,
    onclone: (doc) => {
      // html2canvas does not support modern CSS color functions from global themes.
      const unsupported = /(?:oklch|oklab|lab|lch|color)\s*\(/i;
      for (const node of doc.querySelectorAll('*')) {
        const computed = doc.defaultView.getComputedStyle(node);
        for (const property of ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke']) {
          if (unsupported.test(computed[property])) node.style[property] = property === 'backgroundColor' ? 'transparent' : '#2C2C2C';
        }
      }
    },
  });
  return canvas;
}
export async function exportJpg(element, number) {
  const canvas = await capturePreview(element);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
  if (!blob) throw new Error('The image could not be generated.');
  download(blob, `${number}.jpg`);
}
