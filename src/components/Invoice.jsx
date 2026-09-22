import React, { useState, useRef } from 'react';

export default function Invoice() {
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
  
  const invoiceRef = useRef(null);
  const CORRECT_PASSWORD = 'bonnas2024';

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

  const addLineItem = () => {
    setLineItems([...lineItems, { item: '', price: '' }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const deposit = (subtotal * depositPercentage) / 100;
  const balance = subtotal - deposit;

  const handleDownload = async (format) => {
    const element = invoiceRef.current;
    if (!element) return;

    // Dynamic import for html2canvas and jsPDF
    const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')).default;
    const jsPDF = (await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')).jsPDF;

    if (format === 'pdf') {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${invoiceNumber}-${docType}.pdf`);
    } else if (format === 'jpg') {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `${invoiceNumber}-${docType}.jpg`;
      link.click();
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <img src="/logo.png" alt="Bonnas" style={{ height: '50px', marginBottom: '20px' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#2c2c2c' }}>Invoice Portal</h1>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Admin access only</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px',
                border: passwordError ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            {passwordError && <p style={{ color: '#dc3545', fontSize: '13px', margin: '8px 0 0 0' }}>{passwordError}</p>}
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2c2c2c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.target.style.background = '#2c2c2c'}
          >
            Access Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <img src="/logo.png" alt="Bonnas" style={{ height: '40px', marginBottom: '10px' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <h1 style={{ margin: '0', fontSize: '32px', color: '#2c2c2c' }}>Invoice Generator</h1>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: '8px 16px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#666'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr', gap: '30px', marginBottom: '40px' }}>
          
          {/* Form Section */}
          <div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              
              {/* Doc Type Toggle */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '10px' }}>Document Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['invoice', 'quote'].map(type => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      style={{
                        padding: '10px',
                        border: docType === type ? '2px solid #2c2c2c' : '1px solid #ddd',
                        background: docType === type ? '#f0f0f0' : 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: docType === type ? '600' : '400',
                        color: '#2c2c2c',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Details */}
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#666', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' }}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Event Details */}
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#666', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event Details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '5px' }}>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  placeholder="Event Address"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' }}
                />
                <input
                  type="number"
                  placeholder="Number of Guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Line Items */}
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#666', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Line Items</h3>
              
              <div style={{ marginBottom: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                {lineItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 30px', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.item}
                      onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                    <div>
                      <span style={{ fontSize: '11px', color: '#999' }}>£</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                        step="0.01"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>
                    <button
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      style={{
                        padding: '10px',
                        background: lineItems.length === 1 ? '#f0f0f0' : '#fee',
                        color: lineItems.length === 1 ? '#ccc' : '#d32f2f',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
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
                  padding: '10px',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#2c2c2c',
                  marginBottom: '30px'
                }}
              >
                + Add Item
              </button>

              {/* Payment Settings */}
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#666', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Terms</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '10px' }}>Deposit: {depositPercentage}% (£{deposit.toFixed(2)})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '10px 0', lineHeight: '1.5' }}>Balance due: £{balance.toFixed(2)}</p>
              </div>

              {/* Export Options */}
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#666', margin: '30px 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Export Settings</h3>
              
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={includeTerms}
                  onChange={(e) => setIncludeTerms(e.target.checked)}
                  style={{ marginRight: '10px', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                Include terms & policies in export
              </label>

              {/* Preview & Export Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    padding: '12px',
                    background: '#2c2c2c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  {showPreview ? 'Hide' : 'Preview'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  style={{
                    padding: '12px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  PDF
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  style={{
                    padding: '12px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  JPG
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
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#2c2c2c'
                }}>
                  
                  {/* Invoice Header */}
                  <div style={{ marginBottom: '30px', borderBottom: '2px solid #2c2c2c', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <img src="/logo.png" alt="Bonnas" style={{ height: '35px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: '0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {docType}
                        </h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>{invoiceNumber}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '12px' }}>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>Bill To:</p>
                        <p style={{ margin: '0', color: '#666' }}>{customerName}</p>
                        <p style={{ margin: '0', color: '#666' }}>{customerPhone}</p>
                        <p style={{ margin: '0', color: '#666' }}>{customerEmail}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', color: '#999' }}><span style={{ fontWeight: '600' }}>Date:</span> {today}</p>
                        <p style={{ margin: '0', color: '#999' }}><span style={{ fontWeight: '600' }}>Event Date:</span> {eventDate}</p>
                        <p style={{ margin: '0', color: '#999' }}><span style={{ fontWeight: '600' }}>Guests:</span> {guestCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Address */}
                  {eventAddress && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '6px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', marginBottom: '5px' }}>Event Location</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{eventAddress}</p>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <table style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 0', fontSize: '12px' }}>{item.item}</td>
                          <td style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600' }}>£{parseFloat(item.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div style={{ borderTop: '2px solid #2c2c2c', paddingTop: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '13px', marginBottom: '10px' }}>
                      <div style={{ textAlign: 'right' }}>Subtotal</div>
                      <div style={{ textAlign: 'right', fontWeight: '600' }}>£{subtotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '13px', marginBottom: '10px', color: '#666' }}>
                      <div style={{ textAlign: 'right' }}>Deposit ({depositPercentage}%)</div>
                      <div style={{ textAlign: 'right', fontWeight: '600' }}>£{deposit.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '20px', fontSize: '13px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                      <div style={{ textAlign: 'right', fontWeight: '600' }}>Balance Due</div>
                      <div style={{ textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>£{balance.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#2c2c2c' }}>Important Information</p>
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
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '11px', color: '#999', lineHeight: '1.8' }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#2c2c2c' }}>Cancellation Policy</p>
                      <p style={{ margin: '0 0 10px 0' }}>Cancellations must be made 14 days before the event date for a full refund. Cancellations within 14 days are non-refundable.</p>
                    </div>
                  )}

                  <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#999' }}>
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