import { X } from 'lucide-react';
import { MAX_COLUMNS } from './sheetModel.js';
export default function ColumnEditor({ columns, onChange, onClose }) {
  const update = (id, changes) => onChange(columns.map((column) => column.id === id ? { ...column, ...changes } : column));
  const move = (index, direction) => {
    const next = [...columns]; const other = index + direction;
    [next[index], next[other]] = [next[other], next[index]]; onChange(next);
  };
  return <section className="sheet-columns">
    <div className="sheet-panel-heading"><h2>Manage columns</h2><button onClick={onClose} aria-label="Close column settings"><X size={15} /></button></div><p>Rename columns, change their order, or hide and restore them. Hidden columns keep their saved data. Only the invoice column is a dropdown.</p>
    {columns.map((column, index) => <div key={column.id} className="sheet-column-option">
      <input aria-label={`Name for ${column.label}`} maxLength={100} className="sheet-col-name" value={column.label} onChange={(event) => update(column.id, { label: event.target.value })} />
      <span>{column.private ? 'Private · owner only' : column.type === 'invoice' ? 'Invoice / Quote dropdown' : 'Text box'}</span>
      <button disabled={!index} onClick={() => move(index, -1)}>Move left</button>
      <button disabled={index === columns.length - 1} onClick={() => move(index, 1)}>Move right</button>
      <button disabled={column.type === 'invoice'} onClick={() => update(column.id, { archived: !column.archived })}>{column.archived ? 'Restore' : 'Hide'}</button>
    </div>)}
    <div className="sheet-toolbar">
      <button disabled={columns.length >= MAX_COLUMNS} onClick={() => onChange([...columns, { id: crypto.randomUUID(), label: 'New column', type: 'text', private: false, archived: false }])}>Add text column</button>
      <button disabled={columns.length >= MAX_COLUMNS} onClick={() => onChange([...columns, { id: crypto.randomUUID(), label: 'Private column', type: 'text', private: true, archived: false }])}>Add private text column</button>
    </div>
  </section>;
}
