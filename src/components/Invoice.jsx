import React, { useState, useRef } from 'react';

const loadScript = (src, getExport) => new Promise((resolve, reject) => {
  const existingScript = document.querySelector(`script[src="${src}"]`);

  if (existingScript) {
    if (getExport()) {
      resolve(getExport());
      return;
    }
    existingScript.addEventListener('load', () => resolve(getExport()), { once: true });
    existingScript.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = () => {
    const loadedExport = getExport();
    if (loadedExport) {
      resolve(loadedExport);
    } else {
      reject(new Error(`Loaded ${src}, but its export was not found`));
    }
  };
  script.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.head.appendChild(script);
});

// Helper: sanitize oklch colors before capture (fallback safety net)
const sanitizeColors = (root) => {
  if (!root) return;
  const elements = root.querySelectorAll('*');
  const colorProps = [
    'color', 'backgroundColor', 'borderColor',
    'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'caretColor', 'fill', 'stroke',
  ];
  const all = [root, ...elements];
  all.forEach((el) => {
    const style = window.getComputedStyle(el);
    colorProps.forEach((prop) => {
      const value = style[prop];
      if (value && value.includes('oklch')) {
        // Convert by resetting to a safe fallback
        el.style[prop] = '#000000';
      }
    });
  });
};

export default function Invoice() {
  // ... all your existing state ...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [docType, setDocType] = useState('invoice');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [lineItems, setLineItems] = useState([{ item: '', price: '' }]);

  const [depositPercentage, setDepositPercentage] = useState(50);
  const [includeTerms, setIncludeTerms] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const invoiceRef = useRef(null);
  const CORRECT_PASSWORD = 'bonnas24';

  const handleLogin = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const generateInvoiceNumber = () => {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${yy}${mm}${dd}-${random}`;
  };

  const invoiceNumber = generateInvoiceNumber();
  const today = new Date().toISOString().split('T')[0];

  const addLineItem = () => setLineItems([...lineItems, { item: '', price: '' }]);
  const removeLineItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i));
  const updateLineItem = (i, field, value) => {
    const updated = [...lineItems];
    updated[i][field] = value;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const deposit = (subtotal * depositPercentage) / 100;
  const balance = subtotal - deposit;

  const handleDownload = async (format) => {
    const element = invoiceRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      // ✅ Use html2canvas-pro which supports oklch/lab/lch
      const html2canvas = await loadScript(
        'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.11/dist/html2canvas-pro.min.js',
        () => window.html2canvas
      );

      // Safety net: replace any oklch computed colors with black
      sanitizeColors(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      if (format === 'pdf') {
        const jsPDF = await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
          () => window.jspdf?.jsPDF || window.jsPDF
        );

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${invoiceNumber}-${docType}.pdf`);
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `${invoiceNumber}-${docType}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ===== LOGIN SCREEN (unchanged, just logo swap) =====
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: '#fafaf9', padding: '50px 40px', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(236, 64, 122, 0.15)',
          width: '100%', maxWidth: '400px', textAlign: 'center'
        }}>
          <div style={{ marginBottom: '35px' }}>
            {/* ✅ Logo image */}
            <div style={{
              width: '60px', height: '60px',
              background: 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
              borderRadius: '12px', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#2c2c2c', fontWeight: '700' }}>Invoice Portal</h1>
            <p style={{ margin: '0', color: '#999', fontSize: '14px', fontWeight: '500' }}>Admin access only</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              style={{
                width: '100%', padding: '14px 16px',
                border: passwordError ? '2px solid #e91e63' : '2px solid #f3e5f5',
                borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box',
                fontFamily: 'inherit', background: 'white', transition: 'all 0.2s'
              }}
              onFocus={(e) => !passwordError && (e.target.style.borderColor = '#ec407a')}
              onBlur={(e) => !passwordError && (e.target.style.borderColor = '#f3e5f5')}
            />
            {passwordError && <p style={{ color: '#e91e63', fontSize: '13px', margin: '10px 0 0 0', fontWeight: '500' }}>{passwordError}</p>}
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)'
            }}
          >
            Access Portal
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN UI (unchanged except logo) =====
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            {/* ✅ Logo image in header */}
            <div style={{
              width: '50px', height: '50px',
              background: 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
              borderRadius: '12px', marginBottom: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ margin: '0', fontSize: '32px', color: '#2c2c2c', fontWeight: '700' }}>Invoice Generator</h1>
            <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>Bonnas Catering</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: '10px 20px', background: 'white',
              border: '2px solid #f3e5f5', borderRadius: '10px',
              cursor: 'pointer', fontSize: '13px', color: '#e91e63', fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr', gap: '30px', marginBottom: '40px' }}>
          
          {/* Form Section */}
          <div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(233, 30, 99, 0.08)' }}>
              
              {/* Doc Type Toggle */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#e91e63', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['invoice', 'quote'].map(type => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      style={{
                        padding: '12px',
                        border: docType === type ? '2px solid #e91e63' : '2px solid #f3e5f5',
                        background: docType === type ? '#fce4ec' : 'white',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: docType === type ? '700' : '500',
                        color: docType === type ? '#e91e63' : '#999',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details */}
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#e91e63', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
              </div>

              {/* Event Details */}
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#e91e63', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '5px', fontWeight: '500' }}>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
                <input
                  type="text"
                  placeholder="Event Address"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
                <input
                  type="number"
                  placeholder="Number of Guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                  onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                />
              </div>

              {/* Line Items */}
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#e91e63', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Line Items</h3>
              
              <div style={{ marginBottom: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                {lineItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 36px', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.item}
                      onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                      style={{ padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                      onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                    />
                    <div>
                      <span style={{ fontSize: '11px', color: '#999' }}>£</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                        step="0.01"
                        style={{ width: '100%', padding: '12px', border: '2px solid #f3e5f5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafaf9', transition: 'all 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#ec407a'}
                        onBlur={(e) => e.target.style.borderColor = '#f3e5f5'}
                      />
                    </div>
                    <button
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      style={{
                        padding: '12px',
                        background: lineItems.length === 1 ? '#f9f9f9' : '#ffebee',
                        color: lineItems.length === 1 ? '#ccc' : '#e91e63',
                        border: lineItems.length === 1 ? '2px solid #f3e5f5' : '2px solid #f8bbd0',
                        borderRadius: '10px',
                        cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (lineItems.length > 1) {
                          e.target.style.background = '#f8bbd0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (lineItems.length > 1) {
                          e.target.style.background = '#ffebee';
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addLineItem}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#fce4ec',
                  border: '2px solid #f3e5f5',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#e91e63',
                  marginBottom: '30px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#e91e63';
                  e.target.style.background = '#f8bbd0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#f3e5f5';
                  e.target.style.background = '#fce4ec';
                }}
              >
                + Add Item
              </button>

              {/* Payment Settings */}
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#e91e63', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Terms</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '10px', fontWeight: '500' }}>Deposit: {depositPercentage}% (£{deposit.toFixed(2)})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#e91e63' }}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '10px 0', lineHeight: '1.5', fontWeight: '500' }}>Balance due: <span style={{ color: '#e91e63', fontWeight: '700' }}>£{balance.toFixed(2)}</span></p>
              </div>

              {/* Export Options */}
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#e91e63', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Export Settings</h3>
              
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#666' }}>
                <input
                  type="checkbox"
                  checked={includeTerms}
                  onChange={(e) => setIncludeTerms(e.target.checked)}
                  style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#e91e63' }}
                />
                Include terms & policies in export
              </label>

              {/* Preview & Export Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    padding: '12px',
                    background: showPreview ? 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)' : '#f0f0f0',
                    color: showPreview ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !showPreview && (e.target.style.background = '#e8e8e8')}
                  onMouseLeave={(e) => !showPreview && (e.target.style.background = '#f0f0f0')}
                >
                  {showPreview ? '✓ Preview' : 'Preview'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                  style={{
                    padding: '12px',
                    background: isDownloading ? '#ccc' : 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    boxShadow: isDownloading ? 'none' : '0 4px 12px rgba(233, 30, 99, 0.3)'
                  }}
                  onMouseEnter={(e) => !isDownloading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isDownloading && (e.target.style.transform = 'translateY(0)')}
                >
                  {isDownloading ? '⌛ Downloading...' : '📥 PDF'}
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  disabled={isDownloading}
                  style={{
                    padding: '12px',
                    background: isDownloading ? '#ccc' : 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    boxShadow: isDownloading ? 'none' : '0 4px 12px rgba(233, 30, 99, 0.3)'
                  }}
                  onMouseEnter={(e) => !isDownloading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isDownloading && (e.target.style.transform = 'translateY(0)')}
                >
                  {isDownloading ? '⌛ Downloading...' : '📥 JPG'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div>
              <div style={{ position: 'sticky', top: '20px' }}>
                <div ref={invoiceRef} style={{
                  background: 'white',
                  padding: '50px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 12px rgba(233, 30, 99, 0.12)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#2c2c2c'
                }}>
                  
                  {/* Invoice Header */}
                  <div style={{ marginBottom: '30px', borderBottom: '3px solid #e91e63', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'linear-gradient(135deg, #ec407a 0%, #e91e63 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                      }}>
                        🧁
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: '0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px', color: '#e91e63', fontWeight: '700' }}>
                          {docType}
                        </h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999', fontWeight: '500' }}>{invoiceNumber}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '12px' }}>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: '700', color: '#e91e63' }}>Bill To:</p>
                        <p style={{ margin: '0', color: '#666', fontWeight: '500' }}>{customerName}</p>
                        <p style={{ margin: '0', color: '#999', fontSize: '11px' }}>{customerPhone}</p>
                        <p style={{ margin: '0', color: '#999', fontSize: '11px' }}>{customerEmail}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', color: '#666', fontWeight: '500' }}><span style={{ fontWeight: '700', color: '#e91e63' }}>Date:</span> {today}</p>
                        <p style={{ margin: '0', color: '#666', fontWeight: '500' }}><span style={{ fontWeight: '700', color: '#e91e63' }}>Event Date:</span> {eventDate}</p>
                        <p style={{ margin: '0', color: '#666', fontWeight: '500' }}><span style={{ fontWeight: '700', color: '#e91e63' }}>Guests:</span> {guestCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Address */}
                  {eventAddress && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#fce4ec', borderRadius: '10px', borderLeft: '4px solid #e91e63' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '700', color: '#e91e63', marginBottom: '5px', textTransform: 'uppercase' }}>Event Location</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{eventAddress}</p>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <table style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e91e63' }}>
                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '700', color: '#e91e63', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '700', color: '#e91e63', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3e5f5' }}>
                          <td style={{ padding: '12px 0', fontSize: '12px' }}>{item.item}</td>
                          <td style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600' }}>£{parseFloat(item.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div style={{ borderTop: '3px solid #e91e63', paddingTop: '20px', marginBottom: '30px', background: '#fafaf9', padding: '20px', borderRadius: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '13px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'right', fontWeight: '500' }}>Subtotal</div>
                      <div style={{ textAlign: 'right', fontWeight: '700', color: '#e91e63' }}>£{subtotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '13px', marginBottom: '12px', color: '#999' }}>
                      <div style={{ textAlign: 'right', fontWeight: '500' }}>Deposit ({depositPercentage}%)</div>
                      <div style={{ textAlign: 'right', fontWeight: '700', color: '#e91e63' }}>£{deposit.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '14px', paddingTop: '12px', borderTop: '2px solid #e91e63' }}>
                      <div style={{ textAlign: 'right', fontWeight: '700', color: '#e91e63' }}>Balance Due</div>
                      <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px', color: '#e91e63' }}>£{balance.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ paddingTop: '20px', borderTop: '1px solid #f3e5f5', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#e91e63', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Important Information</p>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      <li>Collection only — no delivery provided</li>
                      <li>Full payment in advance required</li>
                      <li>Please inform us of any allergies when placing order</li>
                      <li>Not VAT applicable</li>
                      <li>Invoice valid for 15 days</li>
                    </ul>
                  </div>

                  {/* Terms & Conditions */}
                  {includeTerms && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f3e5f5', fontSize: '11px', color: '#999', lineHeight: '1.8' }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#e91e63', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cancellation Policy</p>
                      <p style={{ margin: '0 0 10px 0' }}>Cancellations must be made 14 days before the event date for a full refund. Cancellations within 14 days are non-refundable.</p>
                    </div>
                  )}

                  <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                    <p style={{ margin: '0' }}>Thank you for choosing Bonnas Catering</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}