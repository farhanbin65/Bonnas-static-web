export function sheetRepository(client) {
  const unwrap = ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  return {
    async load(role) {
      const [sheet, privateData] = await Promise.all([
        client.from('business_sheet').select('*').eq('id', 'main').maybeSingle().then(unwrap),
        role === 'owner' ? client.from('business_sheet_private').select('cells').eq('sheet_id', 'main').maybeSingle().then(unwrap) : null,
      ]);
      if (!sheet) throw new Error('The table is not set up yet. Run the business spreadsheet SQL migration.');
      return { sheet, draft: { columns: sheet.columns, rows: sheet.rows, privateCells: privateData?.cells || {} } };
    },
    async save(version, draft, role) {
      const rows = unwrap(await client.rpc('save_business_sheet', {
        expected_version: version, new_columns: draft.columns, new_rows: draft.rows,
        new_private_cells: role === 'owner' ? draft.privateCells : null,
      }));
      if (!rows?.[0]) throw new Error('No saved table was returned. Reload before retrying.');
      return rows[0];
    },
    async versions() { return unwrap(await client.from('business_sheet_history').select('version,saved_at').eq('sheet_id', 'main').order('version', { ascending: false }).limit(30)); },
    async snapshot(version) { return unwrap(await client.from('business_sheet_history').select('*').eq('sheet_id', 'main').eq('version', version).single()); },
  };
}
