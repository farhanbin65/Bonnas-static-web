import { useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_PASSWORD, LOGO_URL, BRAND_NAME, BRAND_SUBTITLE } from './constants.js';
import { calculateInvoice } from './calculations.js';
import { newInvoice, normalizeInvoice, documentNumber, duplicateInvoice, validateInvoice } from './model.js';
import { loadInvoices, saveInvoice, deleteInvoice } from './storage.js';
import { exportCsv, exportPdf, exportJpg } from './export.js';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import InvoiceHistory from './InvoiceHistory';
import styles from './styles.js';

export default function Invoice() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [history, setHistory] = useState(() => {
    try { return loadInvoices(); } catch { return {}; }
  });
  const [form, setForm] = useState(() => newInvoice(history));
  const [baseline, setBaseline] = useState(() => JSON.stringify(form));
  const [editingNumber, setEditingNumber] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);
  const totals = useMemo(() => calculateInvoice(form), [form]);
  const dirty = JSON.stringify(form) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved invoice changes?');
  const replaceForm = (next, editing = null) => {
    setForm(next);
    setBaseline(JSON.stringify(next));
    setEditingNumber(editing);
    setActiveTab('create');
  };
  const update = (field, value) => {
    const decimalFields = ['discount', 'depositAmount', 'amountPaid'];
    if (decimalFields.includes(field) && !/^\d*(?:\.\d{0,2})?$/.test(value)) return;
    setForm((previous) => {
      const next = { ...previous, [field]: value };
      if (field === 'docType' && value !== previous.docType) next.invoiceNumber = documentNumber(value, history);
      return next;
    });
  };
  const updateItem = (id, field, value) => {
    if (['qty', 'unitPrice'].includes(field) && !/^\d*(?:\.\d{0,2})?$/.test(value)) return;
    setForm((previous) => ({ ...previous, items: previous.items.map((item) => item.id === id ? { ...item, [field]: value } : item) }));
  };
  const onSave = () => {
    const message = validateInvoice(form, totals);
    if (message) return alert(message);
    try {
      const saved = {
        ...form, schemaVersion: 2, subtotal: totals.subtotal, discountAmount: totals.discountAmount,
        orderTotal: totals.orderTotal, grandTotal: totals.outstandingBalance,
        outstandingBalance: totals.outstandingBalance, savedAt: new Date().toISOString(),
      };
      setHistory(saveInvoice(saved, editingNumber));
      setEditingNumber(form.invoiceNumber);
      setBaseline(JSON.stringify(form));
      alert(`${form.invoiceNumber} saved successfully.`);
    } catch (failure) {
      alert(`Invoice was not saved. ${failure.message}`);
    }
  };
  const onNew = () => {
    if (confirmDiscard()) replaceForm(newInvoice(history));
  };
  const onEdit = (invoice) => {
    if (confirmDiscard()) replaceForm(normalizeInvoice(invoice), invoice.invoiceNumber);
  };
  const onDuplicate = (invoice) => {
    if (!confirmDiscard()) return;
    const next = duplicateInvoice(invoice, history);
    replaceForm(next);
    // A duplicate is a new unsaved document even before further editing.
    setBaseline('');
  };
  const onDelete = (number) => {
    if (editingNumber === number && !confirmDiscard()) return;
    if (!window.confirm(`Delete ${number}?`)) return;
    try {
      const updated = deleteInvoice(number);
      setHistory(updated);
      if (editingNumber === number) replaceForm(newInvoice(updated));
    } catch (failure) { alert(`Invoice was not deleted. ${failure.message}`); }
  };
  const onExport = async (format) => {
    const message = validateInvoice(form, totals);
    if (message) return alert(message);
    setIsExporting(true);
    try {
      if (format === 'pdf') await exportPdf(form, totals, previewRef.current);
      else await exportJpg(previewRef.current, form.invoiceNumber);
    } catch (failure) { alert(`Export failed. ${failure.message}`); }
    finally { setIsExporting(false); }
  };
  const unlock = (event) => {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) { setError('Incorrect password. Please try again.'); return; }
    setAuthenticated(true);
    setPassword('');
    setError('');
    try { setHistory(loadInvoices()); }
    catch (failure) { setError(`Could not load saved invoices: ${failure.message}`); }
  };

  if (!authenticated) return (
    <div style={styles.passwordScreen}>
      <form style={styles.passwordCard} onSubmit={unlock}>
        <img src={LOGO_URL} alt="BONNAS Logo" style={styles.passwordLogo} />
        <h1 style={styles.passwordTitle}>{BRAND_NAME}</h1>
        <p style={styles.passwordSubtitle}>{BRAND_SUBTITLE}</p>
        <label htmlFor="invoice-password" style={styles.label}>Admin password</label>
        <input id="invoice-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={styles.passwordInput} autoFocus />
        {error && <p role="alert" style={styles.passwordError}>{error}</p>}
        <button style={styles.passwordBtn} type="submit">Unlock</button>
      </form>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      <div style={styles.headerBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={LOGO_URL} alt="BONNAS Logo" style={styles.headerLogo} />
          <div><h1 style={styles.headerTitle}>{BRAND_NAME}</h1><p style={styles.headerSubtitle}>{BRAND_SUBTITLE}</p></div>
        </div>
        <span>{dirty ? 'Unsaved changes' : editingNumber ? 'Saved' : 'New invoice'}</span>
      </div>
      {error && <p role="alert" style={styles.passwordError}>{error}</p>}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'create' ? styles.tabActive : {}) }} onClick={() => setActiveTab('create')}>Create / Edit</button>
        <button style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }} onClick={() => setActiveTab('history')}>Saved Invoices ({Object.keys(history).length})</button>
      </div>
      {activeTab === 'create' ? (
        <div style={styles.layoutGrid}>
          <InvoiceForm form={form} onChange={update} totals={totals} isExporting={isExporting}
            handleAddItem={() => setForm((previous) => ({ ...previous, items: [...previous.items, { id: crypto.randomUUID(), description: '', qty: '1', unitPrice: '0' }] }))}
            handleRemoveItem={(id) => setForm((previous) => ({ ...previous, items: previous.items.length > 1 ? previous.items.filter((item) => item.id !== id) : previous.items }))}
            handleItemChange={updateItem} handleSaveInvoice={onSave} handleNewInvoice={onNew} handleExport={onExport} />
          <div style={styles.previewColumn}>
            <InvoicePreview invoice={form} totals={totals} previewRef={previewRef} />
          </div>
        </div>
      ) : <InvoiceHistory invoices={history} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onExport={() => {
        if (!Object.keys(history).length) return alert('No invoices to export.');
        exportCsv(history);
      }} />}
    </div>
  );
}
