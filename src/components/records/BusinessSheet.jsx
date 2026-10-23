import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Plus, Save, Undo2, Redo2, Columns3, History, RotateCw, Download, Search, LockKeyhole, LogOut, FileText, Info, X, Table2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import InvoiceAccess from '../invoice/InvoiceAccess';
import { invoiceRepository } from '../invoice/cloudStorage.js';
import { sheetRepository } from './sheetRepository.js';
import { blankRow, visibleColumns, cellValue, changeCell, removeRow, pasteCells, sheetCsv, restoreSnapshot, withStarterRows, columnWidth, MAX_ROWS } from './sheetModel.js';
import ColumnEditor from './ColumnEditor';
import './records.css';

const repository = supabase ? sheetRepository(supabase) : null;
const empty = { columns: [], rows: [], privateCells: {} };
function reducer(state, action) {
  if (action.type === 'load') return { past: [], present: action.draft, future: [] };
  if (action.type === 'undo') return state.past.length ? { past: state.past.slice(0, -1), present: state.past.at(-1), future: [state.present, ...state.future] } : state;
  if (action.type === 'redo') return state.future.length ? { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) } : state;
  const next = typeof action.draft === 'function' ? action.draft(state.present) : action.draft;
  return { past: [...state.past.slice(-39), state.present], present: next, future: [] };
}
export default function BusinessSheet() {
  return <InvoiceAccess>{({ user, role, signOut }) => <Sheet key={user.id} user={user} role={role} signOut={signOut} />}</InvoiceAccess>;
}
export function Sheet({ user, role, signOut }) {
  const [state, dispatch] = useReducer(reducer, { past: [], present: empty, future: [] });
  const draft = state.present;
  const [baseline, setBaseline] = useState(JSON.stringify(empty));
  const [version, setVersion] = useState(null);
  const [updatedAt, setUpdatedAt] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [manage, setManage] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const gridRef = useRef(null);
  const canEdit = role === 'owner' || role === 'staff';
  const dirty = JSON.stringify(draft) !== baseline;
  const columns = useMemo(() => visibleColumns(draft.columns, role), [draft.columns, role]);
  const filtered = draft.rows.map((row, index) => ({ row, index })).filter(({ row }) =>
    !search || [row.invoice_label, invoices.find((invoice) => invoice.id === row.invoice_id)?.label,
      ...columns.filter((column) => column.type === 'text').map((column) => cellValue(draft, row, column))]
      .join(' ').toLowerCase().includes(search.toLowerCase()));

  const applyLoaded = useCallback((data, options) => {
    const prepared = withStarterRows(data.draft);
    dispatch({ type: 'load', draft: prepared }); setBaseline(JSON.stringify(prepared));
    setVersion(data.sheet.version); setUpdatedAt(data.sheet.updated_at); setInvoices(options);
  }, []);
  const read = async () => {
    const [data, saved] = await Promise.all([
      repository.load(role), canEdit ? invoiceRepository(supabase).list() : Promise.resolve({}),
    ]);
    const options = Object.values(saved).map((invoice) => ({ id: invoice._cloudId, invoiceNumber: invoice.invoiceNumber,
      label: `${invoice.invoiceNumber} (${invoice.docType === 'quotation' ? 'Quote' : 'Invoice'})` }));
    return { data, options };
  };
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [data, saved] = await Promise.all([repository.load(role), canEdit ? invoiceRepository(supabase).list() : Promise.resolve({})]);
        if (!active) return;
        const options = Object.values(saved).map((invoice) => ({ id: invoice._cloudId, invoiceNumber: invoice.invoiceNumber,
          label: `${invoice.invoiceNumber} (${invoice.docType === 'quotation' ? 'Quote' : 'Invoice'})` }));
        applyLoaded(data, options);
      } catch (failure) { if (active) setError(failure.message); }
      finally { if (active) setBusy(false); }
    };
    load();
    return () => { active = false; };
  }, [role, canEdit, applyLoaded]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const edit = (next) => dispatch({ type: 'edit', draft: next });
  const save = async () => {
    if (!dirty || busy || !canEdit || version === null) return;
    if (draft.columns.some((column) => !column.label.trim())) return setError('Give every column a name before saving.');
    setBusy(true); setError('');
    try {
      const sheet = await repository.save(version, draft, role);
      const saved = withStarterRows({ columns: sheet.columns, rows: sheet.rows, privateCells: draft.privateCells });
      dispatch({ type: 'load', draft: saved }); setBaseline(JSON.stringify(saved));
      setVersion(sheet.version); setUpdatedAt(sheet.updated_at);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const refresh = async () => {
    if (dirty && !window.confirm('Reload the saved table and discard your unsaved changes?')) return;
    setBusy(true); setError('');
    try { const { data, options } = await read(); applyLoaded(data, options); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const addRow = () => {
    if (draft.rows.length >= MAX_ROWS) return setError(`Maximum ${MAX_ROWS} rows.`);
    setSearch(''); edit((previous) => ({ ...previous, rows: [...previous.rows, blankRow()] }));
  };
  const exportCsv = () => {
    const blob = new Blob([sheetCsv(draft, invoices)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'bonnas-business-table.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const openVersions = async () => {
    setBusy(true); setError('');
    try { setVersions(await repository.versions()); setShowVersions((previous) => !previous); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const recover = async (selected) => {
    if (!selected || (dirty && !window.confirm('Replace the unsaved table with this saved version?'))) return;
    setBusy(true); setError('');
    try { edit(restoreSnapshot(await repository.snapshot(Number(selected)), draft)); setSearch(''); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const onPaste = (event, rowIndex, columnIndex) => {
    const text = event.clipboardData.getData('text/plain');
    if (!canEdit || !/[\t\r\n]/.test(text)) return;
    event.preventDefault();
    if (search) return setError('Clear the search before pasting a range of cells.');
    try { edit(pasteCells(draft, rowIndex, columnIndex, text, role, invoices)); setError(''); }
    catch (failure) { setError(failure.message); }
  };
  const moveFocus = (event, rowIndex, columnIndex) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      gridRef.current?.querySelector(`[data-sheet-row="${rowIndex + 1}"][data-sheet-col="${columnIndex}"]`)?.focus();
    }
  };
  const keyboard = (event) => {
    if (event.key === 'Escape') { setManage(false); setShowVersions(false); }
    if (!(event.ctrlKey || event.metaKey) || !canEdit) return;
    if (event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    if (!busy && event.key.toLowerCase() === 'z') { event.preventDefault(); dispatch({ type: event.shiftKey ? 'redo' : 'undo' }); }
  };
  const signOutNow = async () => {
    if (dirty && !window.confirm('Sign out and discard unsaved table changes?')) return;
    try { await signOut(); } catch (failure) { setError(failure.message); }
  };
  const tableWidth = 32 + columns.reduce((total, column) => total + columnWidth(column), 0) + (canEdit ? 32 : 0);
  const recordCount = draft.rows.filter((row) => row.invoice_id || columns.some((column) => column.type === 'text' && cellValue(draft, row, column).trim())).length;
  return <main className="records-page" onKeyDown={keyboard}>
    <header className="records-heading">
      <div className="records-brand"><span className="records-mark"><Table2 size={19} /></span><div><div className="records-eyebrow">BONNAS / WORKSPACE</div><h1>Business table</h1></div></div>
      <div className="records-account"><span className="sheet-access">{canEdit ? 'Can edit' : 'View only'}</span><span className="records-email" title={user.email}>{user.email}</span>
        <a className="sheet-link" href="/invoice"><FileText size={14} />Invoices</a><button disabled={busy} onClick={signOutNow} title="Sign out" aria-label="Sign out"><LogOut size={14} /></button>
      </div>
    </header>
    {error && <div role="alert" className="sheet-error">{error}</div>}
    <section className="sheet-card" aria-label="Business records workspace">
    <div className="sheet-toolbar">
      <div className="sheet-tools">
      {canEdit && <><button className="sheet-primary" disabled={busy || !dirty || version === null} onClick={save}><Save size={13} />{busy ? 'Please wait…' : 'Save changes'}</button>
        <button disabled={busy || version === null} onClick={addRow}><Plus size={14} />Add row</button>
        <span className="sheet-tool-divider" />
        <button disabled={busy || !state.past.length} onClick={() => dispatch({ type: 'undo' })} aria-label="Undo" title="Undo (⌘/Ctrl+Z)"><Undo2 size={14} /></button>
        <button disabled={busy || !state.future.length} onClick={() => dispatch({ type: 'redo' })} aria-label="Redo" title="Redo (⌘/Ctrl+Shift+Z)"><Redo2 size={14} /></button></>}
      {role === 'owner' && <><button disabled={busy || version === null} onClick={() => { setManage((previous) => !previous); setShowVersions(false); }} aria-expanded={manage} aria-label="Manage columns" title="Manage columns"><Columns3 size={14} />Columns</button><button disabled={busy || version === null} onClick={() => { setManage(false); openVersions(); }} aria-expanded={showVersions} aria-label="Saved versions" title="Saved versions"><History size={14} />History</button></>}
      <button disabled={busy} onClick={refresh} title="Reload saved table" aria-label="Reload saved table"><RotateCw size={14} /></button>
      <button disabled={version === null} onClick={exportCsv} title="Export CSV, excluding private columns"><Download size={14} />CSV</button>
      </div>
      <div className="sheet-tools sheet-tools-end">
      <label className="sheet-search"><Search size={13} /><input aria-label="Search table" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" /></label>
      <details className="sheet-help"><summary title="Table help" aria-label="Table help"><Info size={15} /></summary><div>
        <strong>Your shared business table</strong><p>Choose an invoice or quote; type freely in all other cells. This table does not change invoices or calculate payments.</p>
        <p>Tab moves between cells. Enter moves down; Shift+Enter adds a line break. Paste ranges from Excel or Google Sheets.</p>
        <p>Stakeholders see shared cells. Private columns are owner-only. Record ethnicity only if voluntarily supplied with the customer's agreement.</p>
        <p>Save changes or press ⌘/Ctrl+S to share edits.</p>
      </div></details>
      </div>
    </div>
    <fieldset disabled={busy || version === null} className="sheet-content">
      {manage && role === 'owner' && <ColumnEditor columns={draft.columns} onClose={() => setManage(false)} onChange={(next) => edit((previous) => ({ ...previous, columns: next }))} />}
      {showVersions && role === 'owner' && <section className="sheet-columns"><div className="sheet-panel-heading"><h2>Saved versions</h2><button onClick={() => setShowVersions(false)} aria-label="Close saved versions"><X size={15} /></button></div><label>Restore a saved version <select defaultValue="" onChange={(event) => { recover(event.target.value); event.target.value = ''; }}>
        <option value="">Choose a previous version</option>{versions.map((item) => <option key={item.version} value={item.version}>Version {item.version} · {new Date(item.saved_at).toLocaleString('en-GB')}</option>)}
      </select></label><p>Review the restored draft, then Save changes. You can undo before saving.</p></section>}
      <div className="sheet-grid" ref={gridRef}>
        <table aria-label="BONNAS editable business records" style={{ minWidth: tableWidth }}>
          <colgroup><col style={{ width: `${32 / tableWidth * 100}%` }} />{columns.map((column) => <col key={column.id} style={{ width: `${columnWidth(column) / tableWidth * 100}%` }} />)}{canEdit && <col style={{ width: `${32 / tableWidth * 100}%` }} />}</colgroup>
          <thead><tr><th className="sheet-row-heading" scope="col">#</th>{columns.map((column) => <th key={column.id} scope="col" title={`${column.label}${column.private ? ' (owner only)' : ''}`}><span className="sheet-column-label">{column.private && <LockKeyhole size={10} />}<span>{column.label}</span></span></th>)}{canEdit && <th scope="col" aria-label="Row actions" />}</tr></thead>
          <tbody>{filtered.map(({ row, index }, displayIndex) => <tr key={row.id}>
            <td className="sheet-row-number">{index + 1}</td>
            {columns.map((column, columnIndex) => <td key={column.id}>
              {column.type === 'invoice' ? canEdit ? <select aria-label={`${column.label}, row ${index + 1}`} value={row.invoice_id || ''} data-sheet-row={displayIndex} data-sheet-col={columnIndex}
                onChange={(event) => edit((previous) => changeCell(previous, row.id, column, event.target.value))} onPaste={(event) => onPaste(event, index, columnIndex)}>
                <option value="">Select document</option>
                {row.invoice_id && !invoices.some((invoice) => invoice.id === row.invoice_id) && <option value={row.invoice_id}>{row.invoice_label || 'Unavailable invoice'}</option>}
                {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.label}</option>)}
              </select> : <span className="sheet-document-label" title={row.invoice_label}>{row.invoice_label || '—'}</span>
                : <textarea aria-label={`${column.label}, row ${index + 1}`} readOnly={!canEdit} maxLength={10000} rows={1}
                  value={cellValue(draft, row, column)} data-sheet-row={displayIndex} data-sheet-col={columnIndex}
                  onChange={(event) => edit((previous) => changeCell(previous, row.id, column, event.target.value))}
                  onPaste={(event) => onPaste(event, index, columnIndex)} onKeyDown={(event) => moveFocus(event, displayIndex, columnIndex)} />}
            </td>)}
            {canEdit && <td><button className="sheet-remove" title={`Remove row ${index + 1}`} aria-label={`Remove row ${index + 1}`} onClick={() => {
              if (window.confirm(`Remove row ${index + 1}? You can undo this before saving.`)) edit((previous) => removeRow(previous, row.id));
            }}><X size={12} /></button></td>}
          </tr>)}</tbody>
        </table>
        {!filtered.length && <p className="sheet-empty">{draft.rows.length ? 'No matching rows.' : canEdit ? 'Start with Add row. Add more fields using Manage columns.' : 'No shared records yet.'}</p>}
      </div>
    </fieldset>
    <footer className="sheet-footer"><span>{recordCount} record{recordCount !== 1 ? 's' : ''}<span className="sheet-footer-dot">·</span>{draft.rows.length} rows<span className="sheet-footer-dot">·</span>{columns.length} columns</span>
      <span role="status" className={`sheet-save-status ${dirty ? 'is-unsaved' : ''}`}>{busy ? 'Loading…' : dirty ? 'Unsaved changes' : version ? <><Check size={12} />Saved {new Date(updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</> : 'Not loaded'}</span>
      <span className="sheet-keyboard-hint">Tab to move · Enter for next row · ⌘/Ctrl+S to save</span>
    </footer>
    </section>
  </main>;
}
