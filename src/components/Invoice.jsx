import React, { useState, useRef, useEffect, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ============================================================
// CONSTANTS
// ============================================================
const LOGO_URL = "https://ibb.co/MvWNBdg"; 
const CURRENCY = "£";
const BRAND_NAME = "BONNAS";
const BRAND_SUBTITLE = "Original Bengali Cuisine";
const BRAND_WEBSITE = "bonnas.co.uk";
const BRAND_FACEBOOK = "facebook.com/bonnas.cooking1";

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (amount) => {
  return `${CURRENCY}${Number(amount || 0).toFixed(2)}`;
};

const generateDocNumber = (type) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  const prefix = type === 'invoice' ? 'INV' : 'QTN';
  return `${prefix}-${year}${month}${day}-${random}`;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================================
// STYLES (INLINE ONLY)
// ============================================================
const styles = {
  appContainer: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    backgroundColor: '#FDFBF7',
    color: '#2C2C2C',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: '15px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '24px',
    borderBottom: '3px solid #C5A059',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLogo: {
    height: '50px',
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3E2723',
    letterSpacing: '1px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#8D6E63',
    fontStyle: 'italic',
  },
  headerContact: {
    textAlign: 'right',
    fontSize: '12px',
    color: '#8D6E63',
  },
  layoutGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  formColumn: {
    flex: '1 1 450px',
    minWidth: '320px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  previewColumn: {
    flex: '1 1 500px',
    minWidth: '320px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflowX: 'auto',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3E2723',
    borderBottom: '2px solid #C5A059',
    paddingBottom: '8px',
    marginBottom: '16px',
    marginTop: '24px',
    letterSpacing: '0.5px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: '6px',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #D7CCC8',
    borderRadius: '4px',
    backgroundColor: '#FDFBF7',
    color: '#2C2C2C',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputReadOnly: {
    backgroundColor: '#EFEBE9',
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  halfWidth: {
    flex: '1 1 calc(50% - 6px)',
    minWidth: '140px',
  },
  fullWidth: {
    flex: '1 1 100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    marginTop: '8px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 6px',
    backgroundColor: '#3E2723',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  td: {
    padding: '6px',
    borderBottom: '1px solid #EFEBE9',
    verticalAlign: 'middle',
  },
  tdInput: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '13px',
    border: '1px solid #D7CCC8',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#2C2C2C',
    outline: 'none',
    boxSizing: 'border-box',
  },
  tdReadOnly: {
    padding: '6px 8px',
    fontSize: '13px',
    color: '#5D4037',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#FBE9E7',
    color: '#BF360C',
    border: '1px solid #FFCCBC',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  addBtn: {
    backgroundColor: '#3E2723',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '12px',
    transition: 'background-color 0.2s',
    letterSpacing: '0.5px',
  },
  summaryBox: {
    backgroundColor: '#FDFBF7',
    border: '1px solid #EFEBE9',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    color: '#4E342E',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3E2723',
    borderTop: '2px solid #C5A059',
    marginTop: '8px',
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    flex: '1 1 180px',
    padding: '12px 24px',
    backgroundColor: '#3E2723',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    letterSpacing: '0.5px',
  },
  btnSecondary: {
    flex: '1 1 180px',
    padding: '12px 24px',
    backgroundColor: '#C5A059',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    letterSpacing: '0.5px',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  notesArea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #D7CCC8',
    borderRadius: '4px',
    backgroundColor: '#FDFBF7',
    color: '#2C2C2C',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  // ============================================================
  // INVOICE PREVIEW STYLES
  // ============================================================
  invoicePreview: {
    backgroundColor: '#FFFFFF',
    padding: '30px',
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#2C2C2C',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
  },
  invHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #C5A059',
    paddingBottom: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  invLogoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  invLogo: {
    height: '60px',
    objectFit: 'contain',
  },
  invBrandName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3E2723',
    letterSpacing: '1px',
    margin: 0,
  },
  invBrandSub: {
    fontSize: '13px',
    color: '#8D6E63',
    fontStyle: 'italic',
    margin: 0,
  },
  invBrandContact: {
    fontSize: '11px',
    color: '#8D6E63',
    margin: '2px 0 0 0',
  },
  invDocInfo: {
    textAlign: 'right',
  },
  invDocType: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#C5A059',
    letterSpacing: '2px',
    margin: 0,
  },
  invDocNumber: {
    fontSize: '14px',
    color: '#4E342E',
    margin: '4px 0 0 0',
    fontWeight: '600',
  },
  invDocDate: {
    fontSize: '13px',
    color: '#6D4C41',
    margin: '2px 0 0 0',
  },
  invCustomerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  invCustomerBox: {
    flex: '1 1 45%',
    minWidth: '200px',
  },
  invCustomerLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#C5A059',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
    borderBottom: '1px solid #EFEBE9',
    paddingBottom: '2px',
  },
  invCustomerText: {
    fontSize: '13px',
    color: '#3E2723',
    margin: '2px 0',
    lineHeight: '1.5',
  },
  invTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginBottom: '16px',
  },
  invTh: {
    textAlign: 'left',
    padding: '6px 8px',
    backgroundColor: '#3E2723',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '11px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  invTd: {
    padding: '5px 8px',
    borderBottom: '1px solid #EFEBE9',
    fontSize: '12px',
    color: '#2C2C2C',
  },
  invTdRight: {
    padding: '5px 8px',
    borderBottom: '1px solid #EFEBE9',
    fontSize: '12px',
    textAlign: 'right',
    color: '#2C2C2C',
  },
  invTdCenter: {
    padding: '5px 8px',
    borderBottom: '1px solid #EFEBE9',
    fontSize: '12px',
    textAlign: 'center',
    color: '#2C2C2C',
  },
  invSummaryContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  invSummaryBox: {
    width: '280px',
    fontSize: '13px',
  },
  invSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    color: '#4E342E',
  },
  invSummaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#3E2723',
    borderTop: '2px solid #C5A059',
    marginTop: '4px',
  },
  invNotesSection: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#FDFBF7',
    borderRadius: '4px',
    border: '1px solid #EFEBE9',
  },
  invNotesTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#C5A059',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  invNotesText: {
    fontSize: '12px',
    color: '#4E342E',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  invPolicySection: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#FDFBF7',
    borderRadius: '4px',
    border: '1px solid #EFEBE9',
  },
  invPolicyTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#C5A059',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  invPolicyList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '11px',
    color: '#6D4C41',
    lineHeight: '1.7',
  },
  invFooter: {
    marginTop: '24px',
    paddingTop: '12px',
    borderTop: '1px solid #C5A059',
    textAlign: 'center',
    fontSize: '11px',
    color: '#8D6E63',
  },
  invFooterBrand: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#3E2723',
    margin: '0 0 2px 0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: '8px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #EFEBE9',
    borderTop: '4px solid #C5A059',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const InvoiceGenerator = () => {
  // --- State ---
  const [docType, setDocType] = useState('invoice');
  const [invoiceNumber, setInvoiceNumber] = useState(generateDocNumber('invoice'));
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [depositPercent, setDepositPercent] = useState(0);
  const [items, setItems] = useState([
    { id: 1, description: '', qty: 1, unitPrice: 0 },
  ]);
  const [nextId, setNextId] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef(null);

  // --- Derived Calculations ---
  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const qty = Math.max(0, Number(item.qty) || 0);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const total = qty * unitPrice;
      return { ...item, qty, unitPrice, total };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return calculatedItems.reduce((sum, item) => sum + item.total, 0);
  }, [calculatedItems]);

  const depositAmount = useMemo(() => {
    const percent = Math.min(100, Math.max(0, Number(depositPercent) || 0));
    return (subtotal * percent) / 100;
  }, [subtotal, depositPercent]);

  const remainingBalance = useMemo(() => {
    return subtotal - depositAmount;
  }, [subtotal, depositAmount]);

  const grandTotal = subtotal;

  // --- Effects ---
  useEffect(() => {
    setInvoiceNumber(generateDocNumber(docType));
  }, [docType]);

  // --- Handlers ---
  const handleAddItem = () => {
    setItems([...items, { id: nextId, description: '', qty: 1, unitPrice: 0 }]);
    setNextId(nextId + 1);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          if (field === 'qty' || field === 'unitPrice') {
            const numVal = parseFloat(value);
            if (isNaN(numVal) || numVal < 0) return item;
            return { ...item, [field]: numVal };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleExport = async (format) => {
    if (subtotal <= 0) {
      alert('Cannot export an empty invoice. Please add items with a total greater than zero.');
      return;
    }

    setIsExporting(true);

    try {
      const element = previewRef.current;
      if (!element) return;

      // Temporarily remove border-radius and box-shadow for cleaner capture
      const originalBorderRadius = element.style.borderRadius;
      const originalBoxShadow = element.style.boxShadow;
      element.style.borderRadius = '0';
      element.style.boxShadow = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      // Restore styles
      element.style.borderRadius = originalBorderRadius;
      element.style.boxShadow = originalBoxShadow;

      const imgData = canvas.toDataURL('image/png');

      if (format === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        if (imgHeight * ratio > pdfHeight - 20) {
          // Multi-page logic
          const pageHeightInPx = (pdfHeight - 20) / ratio;
          let heightLeft = imgHeight;
          let position = 0;
          let page = 1;

          while (heightLeft > 0) {
            const sourceY = position;
            const sourceHeight = Math.min(pageHeightInPx, heightLeft);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgWidth;
            tempCanvas.height = sourceHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              sourceHeight,
              0,
              0,
              imgWidth,
              sourceHeight
            );
            const pageImgData = tempCanvas.toDataURL('image/png');

            if (page > 1) pdf.addPage();
            pdf.addImage(
              pageImgData,
              'PNG',
              imgX,
              imgY,
              imgWidth * ratio,
              sourceHeight * ratio
            );

            heightLeft -= sourceHeight;
            position += sourceHeight;
            page++;
          }
        } else {
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        }

        pdf.save(`${invoiceNumber}.pdf`);
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = `${invoiceNumber}.jpg`;
        link.href = imgData;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={styles.appContainer}>
      {/* ==================== HEADER BAR ==================== */}
      <div style={styles.headerBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={LOGO_URL}
            alt="BONNAS Logo"
            style={styles.headerLogo}
            crossOrigin="anonymous"
          />
          <div>
            <div style={styles.headerTitle}>{BRAND_NAME}</div>
            <div style={styles.headerSubtitle}>{BRAND_SUBTITLE}</div>
          </div>
        </div>
        <div style={styles.headerContact}>
          <div>{BRAND_WEBSITE}</div>
          <div>{BRAND_FACEBOOK}</div>
        </div>
      </div>

      {/* ==================== MAIN LAYOUT ==================== */}
      <div style={styles.layoutGrid}>
        {/* ==================== LEFT COLUMN: FORM ==================== */}
        <div style={styles.formColumn}>
          {/* --- Document Type --- */}
          <div style={styles.sectionTitle}>Document Type</div>
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={styles.input}
              >
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
              </select>
            </div>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Number</label>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                style={{ ...styles.input, ...styles.inputReadOnly }}
              />
            </div>
          </div>

          {/* --- Invoice Details --- */}
          <div style={styles.sectionTitle}>Invoice Details</div>
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Deposit %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 100) setDepositPercent(val);
                  else if (e.target.value === '') setDepositPercent(0);
                }}
                style={styles.input}
              />
            </div>
          </div>

          {/* --- Customer Details --- */}
          <div style={styles.sectionTitle}>Customer Details</div>
          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number"
                style={styles.input}
              />
            </div>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email address"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>Customer Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Full address"
                style={styles.input}
              />
            </div>
          </div>

          {/* --- Event Details --- */}
          <div style={styles.sectionTitle}>Event Details</div>
          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>Event Address</label>
              <input
                type="text"
                value={eventAddress}
                onChange={(e) => setEventAddress(e.target.value)}
                placeholder="Event venue address"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.halfWidth}>
              <label style={styles.label}>Guest Count</label>
              <input
                type="number"
                min="0"
                value={guestCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) setGuestCount(val);
                  else if (e.target.value === '') setGuestCount('');
                }}
                placeholder="Number of guests"
                style={styles.input}
              />
            </div>
          </div>

          {/* --- Line Items --- */}
          <div style={styles.sectionTitle}>Line Items</div>
          <table style={styles.table}>
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
              {calculatedItems.map((item, index) => (
                <tr key={item.id}>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#C5A059',
                    }}
                  >
                    {index + 1}
                  </td>
                  <td style={styles.td}>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, 'description', e.target.value)
                      }
                      placeholder="Item description"
                      style={styles.tdInput}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      style={{ ...styles.tdInput, textAlign: 'center' }}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, 'unitPrice', e.target.value)
                      }
                      style={{ ...styles.tdInput, textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ ...styles.tdReadOnly, textAlign: 'right' }}>
                    {formatCurrency(item.total)}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={styles.deleteBtn}
                      disabled={items.length <= 1}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddItem} style={styles.addBtn}>
            + Add Item
          </button>

          {/* --- Notes --- */}
          <div style={styles.sectionTitle}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes or special instructions..."
            style={styles.notesArea}
          />

          {/* --- Summary (Form Side) --- */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Deposit ({depositPercent}%)</span>
              <span>{formatCurrency(depositAmount)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Remaining Balance</span>
              <span>{formatCurrency(remainingBalance)}</span>
            </div>
            <div style={styles.summaryTotal}>
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div style={styles.actionBar}>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              style={{
                ...styles.btnPrimary,
                ...(isExporting ? styles.btnDisabled : {}),
              }}
            >
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </button>
            <button
              onClick={() => handleExport('jpg')}
              disabled={isExporting}
              style={{
                ...styles.btnSecondary,
                ...(isExporting ? styles.btnDisabled : {}),
              }}
            >
              {isExporting ? 'Exporting...' : 'Download JPG'}
            </button>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: LIVE PREVIEW ==================== */}
        <div style={styles.previewColumn}>
          <div style={{ position: 'relative' }}>
            {isExporting && (
              <div style={styles.loadingOverlay}>
                <div style={styles.spinner} />
              </div>
            )}
            <div
              ref={previewRef}
              style={styles.invoicePreview}
              id="invoice-preview"
            >
              {/* --- Invoice Header --- */}
              <div style={styles.invHeader}>
                <div style={styles.invLogoSection}>
                  <img
                    src={LOGO_URL}
                    alt="BONNAS Logo"
                    style={styles.invLogo}
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h1 style={styles.invBrandName}>{BRAND_NAME}</h1>
                    <p style={styles.invBrandSub}>{BRAND_SUBTITLE}</p>
                    <p style={styles.invBrandContact}>{BRAND_WEBSITE}</p>
                    <p style={styles.invBrandContact}>{BRAND_FACEBOOK}</p>
                  </div>
                </div>
                <div style={styles.invDocInfo}>
                  <h2 style={styles.invDocType}>
                    {docType === 'invoice' ? 'INVOICE' : 'QUOTATION'}
                  </h2>
                  <p style={styles.invDocNumber}>{invoiceNumber}</p>
                  <p style={styles.invDocDate}>
                    Date:{' '}
                    {invoiceDate
                      ? new Date(invoiceDate).toLocaleDateString('en-GB')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* --- Customer & Event Info --- */}
              <div style={styles.invCustomerSection}>
                <div style={styles.invCustomerBox}>
                  <div style={styles.invCustomerLabel}>Bill To</div>
                  <p style={styles.invCustomerText}>
                    <strong>{customerName || 'Customer Name'}</strong>
                  </p>
                  {customerPhone && (
                    <p style={styles.invCustomerText}>Phone: {customerPhone}</p>
                  )}
                  {customerEmail && (
                    <p style={styles.invCustomerText}>Email: {customerEmail}</p>
                  )}
                  {customerAddress && (
                    <p style={styles.invCustomerText}>{customerAddress}</p>
                  )}
                </div>
                <div style={styles.invCustomerBox}>
                  <div style={styles.invCustomerLabel}>Event Details</div>
                  {eventAddress && (
                    <p style={styles.invCustomerText}>Venue: {eventAddress}</p>
                  )}
                  {eventDate && (
                    <p style={styles.invCustomerText}>
                      Date: {new Date(eventDate).toLocaleDateString('en-GB')}
                    </p>
                  )}
                  {guestCount && (
                    <p style={styles.invCustomerText}>Guests: {guestCount}</p>
                  )}
                </div>
              </div>

              {/* --- Line Items Table --- */}
              <table style={styles.invTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.invTh, width: '30px' }}>#</th>
                    <th style={styles.invTh}>Description</th>
                    <th
                      style={{
                        ...styles.invTh,
                        width: '50px',
                        textAlign: 'center',
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        ...styles.invTh,
                        width: '80px',
                        textAlign: 'right',
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        ...styles.invTh,
                        width: '80px',
                        textAlign: 'right',
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, index) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          ...styles.invTdCenter,
                          fontWeight: 'bold',
                          color: '#C5A059',
                        }}
                      >
                        {index + 1}
                      </td>
                      <td style={styles.invTd}>
                        {item.description || 'Item description'}
                      </td>
                      <td style={styles.invTdCenter}>{item.qty}</td>
                      <td style={styles.invTdRight}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td style={styles.invTdRight}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* --- Summary --- */}
              <div style={styles.invSummaryContainer}>
                <div style={styles.invSummaryBox}>
                  <div style={styles.invSummaryRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={styles.invSummaryRow}>
                    <span>Deposit ({depositPercent}%)</span>
                    <span>{formatCurrency(depositAmount)}</span>
                  </div>
                  <div style={styles.invSummaryRow}>
                    <span>Remaining Balance</span>
                    <span>{formatCurrency(remainingBalance)}</span>
                  </div>
                  <div style={styles.invSummaryTotal}>
                    <span>Grand Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* --- Notes --- */}
              {notes && (
                <div style={styles.invNotesSection}>
                  <div style={styles.invNotesTitle}>Notes</div>
                  <div style={styles.invNotesText}>{notes}</div>
                </div>
              )}

              {/* --- Policies (Always Included) --- */}
              <div style={styles.invPolicySection}>
                <div style={styles.invPolicyTitle}>Terms & Policies</div>
                <ul style={styles.invPolicyList}>
                  <li>• Collection only</li>
                  <li>• Full payment required before event</li>
                  <li>• Allergies must be informed in advance</li>
                  <li>• Not VAT Registered</li>
                  <li>• Invoice valid for 15 days</li>
                </ul>
              </div>

              {/* --- Footer --- */}
              <div style={styles.invFooter}>
                <p style={styles.invFooterBrand}>
                  Thank you for choosing {BRAND_NAME}
                </p>
                <p>{BRAND_SUBTITLE}</p>
                <p>{BRAND_WEBSITE}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;