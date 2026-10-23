import styles from './styles.js';
import { calculateInvoice, formatCurrency, formatDate } from './calculations.js';

export default function InvoiceHistory({ invoices, onEdit, onDuplicate, onDelete, onExport }) {
  return (
    <div style={styles.formColumn}>
      <h2 style={styles.sectionTitle}>Saved Invoices</h2>
      <p>Saved in this browser. Export a CSV regularly for your records.</p>
      <button onClick={onExport} style={{ ...styles.btnPrimary, margin: '16px 0' }}>Export All to CSV</button>
      {!Object.keys(invoices).length && <p>No saved invoices yet.</p>}
      <div style={styles.invoiceList}>
        {Object.values(invoices).sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))).map((invoice) => (
          <div key={invoice.invoiceNumber} style={{ ...styles.invoiceListItem, flexWrap: 'wrap', gap: 12 }}>
            <div style={styles.invoiceListInfo}>
              <div style={styles.invoiceListNumber}>{invoice.invoiceNumber}</div>
              <div style={styles.invoiceListMeta}>{invoice.customerName} · {formatDate(invoice.invoiceDate)} · {invoice.items.length} items</div>
            </div>
            <div style={styles.invoiceListAmount}>Due {formatCurrency(calculateInvoice(invoice).outstandingBalance)}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button style={styles.addBtn} onClick={() => onEdit(invoice)}>Edit</button>
              <button style={styles.addBtn} onClick={() => onDuplicate(invoice)}>Duplicate</button>
              <button style={styles.deleteBtn} onClick={() => onDelete(invoice.invoiceNumber)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
