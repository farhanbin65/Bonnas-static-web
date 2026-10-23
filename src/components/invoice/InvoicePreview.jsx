import styles from './styles.js';
import { LOGO_URL, BRAND_NAME, BRAND_SUBTITLE, BRAND_WEBSITE, BRAND_FACEBOOK } from './constants.js';
import { formatCurrency, formatDate } from './calculations.js';
import PaymentSummary from './PaymentSummary';

export default function InvoicePreview({ invoice, totals, previewRef }) {
  const { docType, invoiceNumber, invoiceDate, customerName, customerPhone, customerEmail, customerAddress, eventAddress, eventDate, guestCount, notes } = invoice;
  const { calculatedItems } = totals;
  return (
  <div ref={previewRef} style={styles.invoicePreview} id="invoice-preview">
    <div style={styles.invHeader}>
      <div style={styles.invLogoSection}>
        <img src={LOGO_URL} alt="BONNAS Logo" style={styles.invLogo} />
        <div>
          <h1 style={styles.invBrandName}>{BRAND_NAME}</h1>
          <p style={styles.invBrandSub}>{BRAND_SUBTITLE}</p>
          <p style={styles.invBrandContact}>{BRAND_WEBSITE}</p>
          <p style={styles.invBrandContact}>{BRAND_FACEBOOK}</p>
        </div>
      </div>
      <div style={styles.invDocInfo}>
        <h2 style={styles.invDocType}>{docType === 'invoice' ? 'INVOICE' : 'QUOTATION'}</h2>
        <p style={styles.invDocNumber}>{invoiceNumber}</p>
        <p style={styles.invDocDate}>
          Date: {invoiceDate ? formatDate(invoiceDate) : 'N/A'}
        </p>
      </div>
    </div>

    <div style={styles.invCustomerSection}>
      <div style={styles.invCustomerBox}>
        <div style={styles.invCustomerLabel}>Bill To</div>
        <p style={styles.invCustomerText}><strong>{customerName || 'Customer Name'}</strong></p>
        {customerPhone && <p style={styles.invCustomerText}>Phone: {customerPhone}</p>}
        {customerEmail && <p style={styles.invCustomerText}>Email: {customerEmail}</p>}
        {customerAddress && <p style={styles.invCustomerText}>{customerAddress}</p>}
      </div>
      <div style={styles.invCustomerBox}>
        <div style={styles.invCustomerLabel}>Event Details</div>
        {eventAddress && <p style={styles.invCustomerText}>Venue: {eventAddress}</p>}
        {eventDate && <p style={styles.invCustomerText}>Date: {formatDate(eventDate)}</p>}
        {guestCount && <p style={styles.invCustomerText}>Guests: {guestCount}</p>}
      </div>
    </div>

    <table style={styles.invTable}>
      <thead>
        <tr>
          <th style={{ ...styles.invTh, width: '30px' }}>#</th>
          <th style={styles.invTh}>Description</th>
          <th style={{ ...styles.invTh, width: '50px', textAlign: 'center' }}>Qty</th>
          <th style={{ ...styles.invTh, width: '80px', textAlign: 'right' }}>Unit Price</th>
          <th style={{ ...styles.invTh, width: '80px', textAlign: 'right' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {calculatedItems.map((item, index) => (
          <tr key={item.id}>
            <td style={{ ...styles.invTdCenter, fontWeight: 'bold', color: '#C5A059' }}>{index + 1}</td>
            <td style={styles.invTd}>{item.description || 'Item description'}</td>
            <td style={styles.invTdCenter}>{item.qty}</td>
            <td style={styles.invTdRight}>{formatCurrency(item.unitPrice)}</td>
            <td style={styles.invTdRight}>{formatCurrency(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <PaymentSummary totals={totals} invoice={invoice} preview />

    {notes && (
      <div style={styles.invNotesSection}>
        <div style={styles.invNotesTitle}>Notes</div>
        <div style={styles.invNotesText}>{notes}</div>
      </div>
    )}

    <div style={styles.invPolicySection}>
      <div style={styles.invPolicyTitle}>Terms & Policies</div>
      <ul style={styles.invPolicyList}>
        <li>• Collection only</li>
        <li>• Full payment required before event</li>
        <li>• Allergies must be informed in advance</li>
        <li>• Not VAT Registered</li>
        <li>• {docType === 'quotation' ? 'Quotation' : 'Invoice'} valid for 15 days</li>
      </ul>
    </div>

    <div style={styles.invFooter}>
      <p style={styles.invFooterBrand}>Thank you for choosing {BRAND_NAME}</p>
      <p>{BRAND_SUBTITLE}</p>
      <p>{BRAND_WEBSITE}</p>
    </div>
  </div>
  );
}
