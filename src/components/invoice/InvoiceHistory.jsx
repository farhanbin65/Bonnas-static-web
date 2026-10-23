import styles from './styles.js';
import { calculateInvoice, formatCurrency, formatDate } from './calculations.js';
export default function InvoiceHistory({ invoices, onEdit, onDuplicate, onDelete, onNew, onExport }) {
  return <section style={styles.formColumn}>
    <h2 style={styles.sectionTitle}>Saved Invoices & Quotes</h2>
    <div style={styles.actionBar}><button style={styles.addBtn} onClick={onNew}>New Invoice</button><button style={styles.addBtn} onClick={onExport}>Export invoices to CSV</button></div>
    <div style={styles.invoiceList}>{Object.values(invoices).sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))).map((invoice) => <div key={invoice._cloudId} style={{ ...styles.invoiceListItem, flexWrap: 'wrap', gap: 12 }}>
      <div style={styles.invoiceListInfo}><div style={styles.invoiceListNumber}>{invoice.invoiceNumber}</div><div style={styles.invoiceListMeta}>{invoice.customerName} · {formatDate(invoice.invoiceDate)} · {invoice.docType}</div></div>
      <div>Due {formatCurrency(calculateInvoice(invoice).outstandingBalance)}</div>
      <div style={{ display: 'flex', gap: 8 }}><button style={styles.deleteBtn} onClick={() => onEdit(invoice)}>Edit</button><button style={styles.deleteBtn} onClick={() => onDuplicate(invoice)}>Duplicate</button>{onDelete && <button style={styles.deleteBtn} onClick={() => onDelete(invoice.invoiceNumber)}>Delete</button>}</div>
    </div>)}</div>{!Object.keys(invoices).length && <p>No saved invoices or quotes yet.</p>}
  </section>;
}
