// Dependency injection keeps cloud storage testable without credentials or network calls.
export function invoiceRepository(client) {
  const unwrap = ({ data, error }) => {
    if (error) throw new Error(error.code === '23505' ? 'That invoice number already exists. Refresh the invoice list before continuing.' : error.message);
    return data;
  };
  const record = (row) => ({ ...row.document, invoiceNumber: row.invoice_number, _cloudId: row.id, _version: row.version, savedAt: row.updated_at });
  return {
    async list() {
      const result = {};
      for (let from = 0; ; from += 500) {
        const rows = unwrap(await client.from('business_invoices').select('*').order('id').range(from, from + 499));
        rows.forEach((row) => { result[row.invoice_number] = record(row); });
        if (rows.length < 500) break;
      }
      return result;
    },
    async save(invoice, existing) {
      // Metadata belongs in table columns, never in the saved invoice payload.
      const { _cloudId: _id, _version: _version, ...document } = invoice;
      const values = { invoice_number: invoice.invoiceNumber, document };
      let query;
      if (existing?._cloudId) {
        query = client.from('business_invoices').update(values).eq('id', existing._cloudId).eq('version', existing._version);
      } else {
        query = client.from('business_invoices').insert(values);
      }
      const row = unwrap(await query.select('*').maybeSingle());
      if (!row) throw new Error('This invoice changed or your access was removed. Refresh and reopen it before saving.');
      return record(row);
    },
    async remove(invoice) {
      const rows = unwrap(await client.from('business_invoices').delete().eq('id', invoice._cloudId).eq('version', invoice._version).select('id'));
      if (!rows.length) throw new Error('This invoice changed or your access was removed. Refresh before deleting.');
    },
  };
}
