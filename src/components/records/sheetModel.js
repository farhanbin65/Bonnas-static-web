export const MAX_ROWS = 2000;
export const MAX_COLUMNS = 64;
export function blankRow() { return { id: crypto.randomUUID(), invoice_id: null, invoice_label: '', cells: {} }; }
export function visibleColumns(columns, role) { return columns.filter((column) => !column.archived && (!column.private || role === 'owner')); }
export function cellValue(draft, row, column) {
  return column.private ? draft.privateCells[row.id]?.[column.id] || '' : row.cells[column.id] || '';
}
export function changeCell(draft, rowId, column, value) {
  if (column.type === 'invoice') return { ...draft, rows: draft.rows.map((row) => row.id === rowId ? { ...row, invoice_id: value || null, invoice_label: '' } : row) };
  if (column.private) return { ...draft, privateCells: { ...draft.privateCells, [rowId]: { ...draft.privateCells[rowId], [column.id]: value } } };
  return { ...draft, rows: draft.rows.map((row) => row.id === rowId ? { ...row, cells: { ...row.cells, [column.id]: value } } : row) };
}
export function removeRow(draft, id) {
  const privateCells = { ...draft.privateCells }; delete privateCells[id];
  return { ...draft, rows: draft.rows.filter((row) => row.id !== id), privateCells };
}
export function restoreSnapshot(snapshot, current) {
  const ids = new Set(snapshot.columns.map((column) => column.id));
  return { columns: [...snapshot.columns, ...current.columns.filter((column) => !ids.has(column.id)).map((column) => ({ ...column, archived: true }))],
    rows: snapshot.rows, privateCells: snapshot.private_cells || {} };
}
export function parseClipboard(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  const input = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '"' && (quoted || cell === '')) {
      if (quoted && input[index + 1] === '"') { cell += '"'; index++; } else quoted = !quoted;
    } else if (!quoted && (char === '\t' || char === '\n')) {
      row.push(cell); cell = '';
      if (char === '\n') { rows.push(row); row = []; }
    } else cell += char;
  }
  if (cell || row.length || !input.endsWith('\n')) { row.push(cell); rows.push(row); }
  return rows;
}
export function pasteCells(draft, startRow, startColumn, text, role, invoices) {
  const columns = visibleColumns(draft.columns, role);
  const matrix = parseClipboard(text);
  if (startRow + matrix.length > MAX_ROWS) throw new Error(`Maximum ${MAX_ROWS} rows.`);
  if (matrix.some((row) => startColumn + row.length > columns.length)) throw new Error('Add more columns before pasting this range.');
  let next = { ...draft, rows: [...draft.rows] };
  while (next.rows.length < startRow + matrix.length) next.rows.push(blankRow());
  matrix.forEach((cells, rowIndex) => cells.forEach((value, columnIndex) => {
    const column = columns[startColumn + columnIndex];
    if (value.length > 10000) throw new Error('A cell cannot exceed 10,000 characters.');
    if (column.type === 'invoice') {
      const invoice = invoices.find((item) => item.invoiceNumber === value || item.label === value || item.id === value);
      if (value && !invoice) throw new Error(`No saved invoice or quote matches “${value}”.`);
      value = invoice?.id || '';
    }
    next = changeCell(next, next.rows[startRow + rowIndex].id, column, value);
  }));
  return next;
}
export function sheetCsv(draft, invoices) {
  // Private columns are deliberately excluded, even from the owner's export.
  const columns = draft.columns.filter((column) => !column.archived && !column.private);
  const escape = (value) => {
    let text = String(value ?? '');
    if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [columns.map((column) => column.label), ...draft.rows.map((row) => columns.map((column) =>
    column.type === 'invoice' ? invoices.find((invoice) => invoice.id === row.invoice_id)?.label || row.invoice_label : row.cells[column.id] || ''))]
    .map((row) => row.map(escape).join(',')).join('\r\n');
}

export const STARTER_ROWS = 12;
export function withStarterRows(draft) {
  let trailingBlank = 0;
  for (let index = draft.rows.length - 1; index >= 0; index--) {
    const row = draft.rows[index];
    if (row.invoice_id || Object.values(row.cells).some((value) => value.trim()) ||
        Object.values(draft.privateCells[row.id] || {}).some((value) => value.trim())) break;
    trailingBlank++;
  }
  const count = Math.min(MAX_ROWS - draft.rows.length,
    Math.max(0, STARTER_ROWS - draft.rows.length, 3 - trailingBlank));
  return count > 0 ? { ...draft, rows: [...draft.rows, ...Array.from({ length: count }, blankRow)] } : draft;
}
export function columnWidth(column) {
  if (column.type === 'invoice') return 128;
  if (column.private) return 112;
  return ({ customer: 96, items: 108, payments: 76, expense: 76, discount: 76, source: 96, notes: 116 })[column.id] || 92;
}
