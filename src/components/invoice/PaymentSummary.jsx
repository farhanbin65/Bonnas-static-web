import styles from './styles.js';
import { summaryRows, formatCurrency } from './calculations.js';

export default function PaymentSummary({ invoice, totals, preview = false }) {
  return (
    <div style={preview ? styles.invSummaryContainer : styles.summaryBox}>
      <div style={preview ? styles.invSummaryBox : { width: '100%' }}>
        {summaryRows(invoice, totals).map(([label, amount], index, rows) => (
          <div key={label} data-payment-row style={index === rows.length - 1
            ? (preview ? styles.invSummaryTotal : styles.summaryTotal)
            : (preview ? styles.invSummaryRow : styles.summaryRow)}>
            <span>{label}</span><span>{amount < 0 ? '-' : ''}{formatCurrency(Math.abs(amount))}</span>
          </div>
        ))}
        {totals.discountExceeded && <p style={{ color: '#BF360C', fontSize: 12 }}>Discount exceeds subtotal. Please correct it before saving.</p>}
      </div>
    </div>
  );
}
