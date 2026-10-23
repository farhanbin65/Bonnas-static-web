import styles from './styles.js';
import { formatCurrency } from './calculations.js';
import PaymentSummary from './PaymentSummary';

export default function InvoiceForm({ form, onChange, totals, isExporting, handleAddItem, handleRemoveItem, handleItemChange, handleSaveInvoice, handleNewInvoice, handleExport }) {
  const { docType, invoiceNumber, invoiceDate, customerName, customerPhone, customerEmail, customerAddress, eventAddress, eventDate, guestCount, notes, items, discount, useDiscount, depositAmount, useDeposit, amountPaid, useAmountPaid } = form;
  return (
  <div style={styles.formColumn}>
    <div style={styles.sectionTitle}>Document Type</div>
    <div style={styles.row}>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Type</label>
        <select value={docType} onChange={(e) => onChange('docType', e.target.value)} style={styles.input}>
          <option value="invoice">Invoice</option>
          <option value="quotation">Quotation</option>
        </select>
      </div>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Number</label>
        <input type="text" value={invoiceNumber} readOnly style={{ ...styles.input, ...styles.inputReadOnly }} />
      </div>
    </div>

    <div style={styles.sectionTitle}>Invoice Details</div>
    <div style={styles.row}>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Invoice Date</label>
        <input type="date" value={invoiceDate} onChange={(e) => onChange('invoiceDate', e.target.value)} style={styles.input} />
      </div>
    </div>

    <div style={styles.sectionTitle}>Customer Details</div>
    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label style={styles.label}>Customer Name</label>
        <input type="text" value={customerName} onChange={(e) => onChange('customerName', e.target.value)} placeholder="Full name" style={styles.input} />
      </div>
    </div>
    <div style={styles.row}>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Phone</label>
        <input type="tel" value={customerPhone} onChange={(e) => onChange('customerPhone', e.target.value)} placeholder="Phone number" style={styles.input} />
      </div>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Email</label>
        <input type="email" value={customerEmail} onChange={(e) => onChange('customerEmail', e.target.value)} placeholder="Email address" style={styles.input} />
      </div>
    </div>
    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label style={styles.label}>Customer Address</label>
        <input type="text" value={customerAddress} onChange={(e) => onChange('customerAddress', e.target.value)} placeholder="Full address" style={styles.input} />
      </div>
    </div>

    <div style={styles.sectionTitle}>Event Details</div>
    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label style={styles.label}>Event Address</label>
        <input type="text" value={eventAddress} onChange={(e) => onChange('eventAddress', e.target.value)} placeholder="Event venue address" style={styles.input} />
      </div>
    </div>
    <div style={styles.row}>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Event Date</label>
        <input type="date" value={eventDate} onChange={(e) => onChange('eventDate', e.target.value)} style={styles.input} />
      </div>
      <div style={styles.halfWidth}>
        <label style={styles.label}>Guest Count</label>
        <input
          type="text"
          inputMode="numeric"
          value={guestCount}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) onChange('guestCount', e.target.value);
          }}
          placeholder="Number of guests"
          style={styles.input}
        />
      </div>
    </div>

    <div style={styles.sectionTitle}>Line Items</div>
    <div style={{ overflowX: 'auto' }}><table style={styles.table}>
      <thead>
        <tr>
          <th style={{ ...styles.th, width: '30px' }}>#</th>
          <th style={styles.th}>Description</th>
          <th style={{ ...styles.th, width: '60px' }}>Qty</th>
          <th style={{ ...styles.th, width: '80px' }}>Unit Price</th>
          <th style={{ ...styles.th, width: '80px' }}>Total</th>
          <th style={{ ...styles.th, width: '50px' }}></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id}>
            <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#C5A059' }}>
              {index + 1}
            </td>
            <td style={styles.td}>
              <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Item description" style={styles.tdInput} />
            </td>
            <td style={styles.td}>
              <input type="text" inputMode="decimal" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} style={{ ...styles.tdInput, textAlign: 'center' }} />
            </td>
            <td style={styles.td}>
              <input
                type="text"
                inputMode="decimal"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                placeholder="0.00"
                style={{ ...styles.tdInput, textAlign: 'right' }}
              />
            </td>
            <td style={{ ...styles.tdReadOnly, textAlign: 'right' }}>{formatCurrency(totals.calculatedItems[index].total)}</td>
            <td style={styles.td}>
              <button
                onClick={() => handleRemoveItem(item.id)}
                style={styles.deleteBtn}
                disabled={items.length <= 1}
                title="Remove item"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 2 L10 10 M10 2 L2 10" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table></div>
    <button onClick={handleAddItem} style={styles.addBtn}>Add Item</button>

    <div style={styles.sectionTitle}>Pricing & Payment</div>
    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useDiscount} onChange={(e) => onChange('useDiscount', e.target.checked)} />
          Apply Discount
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={discount}
          disabled={!useDiscount}
          onChange={(e) => onChange('discount', e.target.value)}
          placeholder="Enter discount amount"
          style={{ ...styles.input, ...(useDiscount ? {} : { opacity: 0.5 }) }}
        />
      </div>
    </div>

    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useDeposit} onChange={(e) => onChange('useDeposit', e.target.checked)} />
          Deposit Required (not a payment)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={depositAmount}
          disabled={!useDeposit}
          onChange={(e) => onChange('depositAmount', e.target.value)}
          placeholder="Enter deposit amount"
          style={{ ...styles.input, ...(useDeposit ? {} : { opacity: 0.5 }) }}
        />
      </div>
    </div>

    <div style={styles.row}>
      <div style={styles.fullWidth}>
        <label
          style={{
            ...styles.label,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={useAmountPaid}
            onChange={(e) => onChange('useAmountPaid', e.target.checked)}
          />
          Amount Paid (including any deposit received)
        </label>

        <input
          type="text"
          inputMode="decimal"
          value={amountPaid}
          disabled={!useAmountPaid}
          onChange={(e) => onChange('amountPaid', e.target.value)}
          placeholder="Amount paid by customer"
          style={{
            ...styles.input,
            ...(useAmountPaid ? {} : { opacity: 0.5 }),
          }}
        />
      </div>
    </div>

    <div style={styles.sectionTitle}>Notes</div>
    <textarea
      value={notes}
      onChange={(e) => onChange('notes', e.target.value)}
      placeholder="Enter any additional notes or special instructions..."
      style={styles.notesArea}
    />

    <PaymentSummary totals={totals} invoice={form} />

    <div style={styles.actionBar}>
      <button onClick={handleSaveInvoice} style={styles.btnSecondary}>
        Save Invoice
      </button>
      <button onClick={handleNewInvoice} style={styles.btnPrimary}>
        New Invoice
      </button>
    </div>

    <div style={styles.actionBar}>
      <button onClick={() => handleExport('pdf')} disabled={isExporting} style={{ ...styles.btnPrimary, ...(isExporting ? styles.btnDisabled : {}) }}>
        {isExporting ? 'Exporting...' : 'Download PDF'}
      </button>
      <button onClick={() => handleExport('jpg')} disabled={isExporting} style={{ ...styles.btnSecondary, ...(isExporting ? styles.btnDisabled : {}) }}>
        {isExporting ? 'Exporting...' : 'Download JPG'}
      </button>
    </div>
  </div>
  );
}
