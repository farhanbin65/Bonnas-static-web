import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LOGO_URL, BRAND_NAME, BRAND_SUBTITLE } from './constants.js';
import { calculateInvoice } from './calculations.js';
import { newInvoice, normalizeInvoice, documentNumber, duplicateInvoice, validateInvoice } from './model.js';
import { loadInvoices } from './storage.js';
import { invoiceRepository } from './cloudStorage.js';
import { supabase } from '../../lib/supabaseClient';
import InvoiceAccess from './InvoiceAccess';
import { exportCsv, exportPdf, exportJpg } from './export.js';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import InvoiceHistory from './InvoiceHistory';
import styles from './styles.js';

const repository = supabase ? invoiceRepository(supabase) : null;

export default function Invoice() {
  return <InvoiceAccess>{({ user, role, signOut }) => role === 'stakeholder'
    ? <Navigate to="/records" replace />
    : <InvoiceWorkspace key={user.id} user={user} role={role} signOut={signOut} />}</InvoiceAccess>;
}

function InvoiceWorkspace({ user, role, signOut }) {
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(() => newInvoice(history));
  const [baseline, setBaseline] = useState(() => JSON.stringify(form));
  const [editingNumber, setEditingNumber] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);
  const totals = useMemo(() => calculateInvoice(form), [form]);
  const dirty = JSON.stringify(form) !== baseline;

  useEffect(() => {
    let active = true;
    repository.list().then((invoices) => {
      if (active) { setHistory(invoices); setConnected(true); }
    }).catch((failure) => { if (active) setError(`Could not load online invoices: ${failure.message}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = async () => {
    setLoading(true); setError('');
    try { setHistory(await repository.list()); setConnected(true); }
    catch (failure) { setError(`Could not refresh online invoices: ${failure.message}`); setConnected(false); }
    finally { setLoading(false); }
  };
  const importLocal = async () => {
    if (!window.confirm('Import invoices saved in this browser into the shared BONNAS account? Matching invoice numbers will be skipped. Browser copies will remain untouched.')) return;
    setPending(true);
    let imported = 0;
    try {
      const local = loadInvoices();
      const online = await repository.list();
      let skipped = 0;
      for (const invoice of Object.values(local)) {
        if (Object.hasOwn(online, invoice.invoiceNumber)) { skipped++; continue; }
        const migrated = normalizeInvoice(invoice);
        const message = validateInvoice(migrated, calculateInvoice(migrated));
        if (message) throw new Error(`${invoice.invoiceNumber}: ${message}`);
        online[invoice.invoiceNumber] = await repository.save(migrated);
        imported++;
      }
      setHistory(online);
      alert(`Imported ${imported} invoices; skipped ${skipped} existing numbers. Browser copies are unchanged.`);
    } catch (failure) {
      setError(`Import stopped after ${imported} invoices: ${failure.message}. Browser copies are unchanged. Refresh before retrying.`);
      try { setHistory(await repository.list()); } catch { setConnected(false); }
    } finally { setPending(false); }
  };
  const onSignOut = async () => {
    if (dirty && !window.confirm('Sign out and discard unsaved changes?')) return;
    try { await signOut(); }
    catch (failure) { setError(failure.message); }
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved invoice changes?');
  const replaceForm = (next, editing = null) => {
    setEditingRecord(editing ? history[editing] : null);
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
  const onSave = async () => {
    if (pending || !connected) return;
    const message = validateInvoice(form, totals);
    if (message) return alert(message);
    setPending(true);
    try {
      const saved = {
        ...form, schemaVersion: 2, subtotal: totals.subtotal, discountAmount: totals.discountAmount,
        orderTotal: totals.orderTotal, grandTotal: totals.outstandingBalance,
        outstandingBalance: totals.outstandingBalance, savedAt: new Date().toISOString(),
      };
      const online = await repository.save(saved, editingRecord);
      setHistory((previous) => {
        const updated = { ...previous };
        if (editingNumber) delete updated[editingNumber];
        updated[online.invoiceNumber] = online;
        return updated;
      });
      setEditingRecord(online);
      setEditingNumber(form.invoiceNumber);
      const syncedForm = { ...form, amountPaid: online.amountPaid, useAmountPaid: online.useAmountPaid };
      setForm(syncedForm);
      setBaseline(JSON.stringify(syncedForm));
      alert(`${form.invoiceNumber} saved successfully.`);
    } catch (failure) {
      alert(`Invoice was not saved. ${failure.message}`);
    } finally { setPending(false); }
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
  const onDelete = async (number) => {
    if (pending || role !== 'owner') return;
    if (editingNumber === number && !confirmDiscard()) return;
    if (!window.confirm(`Delete ${number}?`)) return;
    setPending(true);
    try {
      await repository.remove(history[number]);
      const updated = { ...history };
      delete updated[number];
      setHistory(updated);
      if (editingNumber === number) replaceForm(newInvoice(updated));
    } catch (failure) { alert(`Invoice was not deleted. ${failure.message}`); }
    finally { setPending(false); }
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

  return (
    <div style={styles.appContainer}>
      <div style={styles.headerBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={LOGO_URL} alt="BONNAS Logo" style={styles.headerLogo} />
          <div><h1 style={styles.headerTitle}>{BRAND_NAME}</h1><p style={styles.headerSubtitle}>{BRAND_SUBTITLE}</p></div>
        </div>
        <div><p>{user.email} · {role}</p><span>{dirty ? 'Unsaved changes' : editingNumber ? 'Saved online' : 'New invoice'}</span><br /><button style={styles.addBtn} disabled={pending || isExporting} onClick={onSignOut}>Sign out</button></div>
      </div>
      {error && <p role="alert" style={styles.passwordError}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <button style={styles.addBtn} disabled={loading || pending || isExporting} onClick={refresh}>{loading ? 'Loading…' : 'Refresh online records'}</button>
        <button style={styles.addBtn} disabled={!connected || loading || pending || isExporting} onClick={importLocal}>Import browser invoices</button>
      </div>
      <p>Invoices and quotes are separate from your business table. <a href="/records" style={{ textDecoration: 'underline' }}>Open business table</a></p>
      <fieldset disabled={loading || pending || isExporting || !connected} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'create' ? styles.tabActive : {}) }} onClick={() => setActiveTab('create')}>Create / Edit Invoice</button>
        <button style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }} onClick={() => setActiveTab('history')}>Saved Invoices & Quotes ({Object.keys(history).length})</button>
      </div>
      {activeTab === 'create' && (
        <div style={styles.layoutGrid}>
          <InvoiceForm form={form} onChange={update} totals={totals} isExporting={isExporting}
            handleAddItem={() => setForm((previous) => ({ ...previous, items: [...previous.items, { id: crypto.randomUUID(), description: '', qty: '1', unitPrice: '0' }] }))}
            handleRemoveItem={(id) => setForm((previous) => ({ ...previous, items: previous.items.length > 1 ? previous.items.filter((item) => item.id !== id) : previous.items }))}
            handleItemChange={updateItem} handleSaveInvoice={onSave} handleNewInvoice={onNew} handleExport={onExport} />
          <div style={styles.previewColumn}>
            <InvoicePreview invoice={form} totals={totals} previewRef={previewRef} />
          </div>
        </div>
      )}
      {activeTab === 'history' && <InvoiceHistory invoices={history} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={role === 'owner' ? onDelete : null} onNew={onNew} onExport={() => {
        if (!Object.keys(history).length) return alert('No invoices to export.');
        exportCsv(history);
      }} />}
      </fieldset>
    </div>
  );
}
