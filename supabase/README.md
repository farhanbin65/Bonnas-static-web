# BONNAS business table and separate invoice generator

The business table at `/records` is a manually edited spreadsheet-style table. Each row
is an order/customer record. One dropdown links a saved invoice or quotation; every
other cell is a free-text box. Table entries never change invoice values, record actual
payments, or calculate financial totals. The invoice generator remains at `/invoice`.

## Upgrade the current project

1. In Supabase SQL Editor, run the entire
   `migrations/20261023_business_spreadsheet.sql`, from `begin;` through `commit;`.
   The original `business_invoices.sql` migration must already be installed.
   **The earlier `business_records.sql` migration is not needed.**
2. Restart `npm run dev` and open `/records`. Existing owner/staff/stakeholder accounts
   continue to work. Stakeholders now have view-only access to shared table cells.
3. Keep using `/invoice` separately to create invoices and quotations. Return to the
   table and reload if a newly saved document is not yet in the dropdown.

If you already ran the earlier structured-record migration, the spreadsheet upgrade
removes its automatic invoice/payment coupling. It does not delete payments, expenses,
customer background, invoices or any other earlier records. Those older tables are not
used by the new manual spreadsheet. They are not automatically copied into it.
Do not rerun the superseded structured-record migration after this upgrade.

## Using the table

- The compact workspace starts with 12 rows and keeps three blank entry rows available.
  These starter rows stay local until you edit and save; opening the table does not write to the database.
- **Add row** for a new customer or order.
- Choose an **Invoice / Quote** from the saved documents, or leave it unlinked.
- Type customer name, order items, payments, expenses, discount, source and notes.
  These are ordinary text cells; amounts are not constrained to a number format.
- The owner can use **Manage columns** to add/rename/reorder columns. Hide a column
  to remove it from the table without losing its data; Restore brings it back.
- **Undo / Redo** applies to unsaved changes. Tab moves between cells, Enter moves
  down and Shift+Enter adds a line break. Multi-cell clipboard pasting is supported.
  Clear search before pasting a range. Pasting a document number in the invoice column
  links it only if a matching saved invoice/quote exists; invalid pastes leave the table unchanged.
- Click **Save changes**, or press Command/Ctrl+S, to save and share the table.
  There is no background autosave. Before refresh, navigation or sign-out, save your work.
- **Reload saved table** fetches other people's edits. If someone saved since your
  last load, your save is rejected rather than overwriting their work. Your draft remains
  available. Copy the cells you want to preserve before reloading.
- The owner can use **Saved versions** to recover a previous saved table. Restoring
  changes the draft first; review it and click Save changes. Newer columns are preserved
  as hidden columns. The most recent 30 versions are listed in the UI; older snapshots
  remain in the database until separately maintained by the project owner.
- CSV exports include shared, visible columns only, never private columns. This is a
  reporting export, not a complete database backup.

## Customer ethnicity and other private columns

Customer ethnicity is an optional owner-only text column. Record only voluntarily
supplied information that the customer agreed you could record for a clear purpose.
Do not infer it from names, language or purchases. Leave blank if not supplied.

Private values are stored in a separate owner-only table and excluded from stakeholder
queries and CSV exports, not merely hidden by the browser. Staff may edit shared cells
but cannot access private cells. The privacy of an existing column cannot be changed;
create a new private column instead if required.

## Easier login

Each device remembers the email after a successful sign-in. Subsequent visits show a
password-only prompt, with **Use a different account** available when needed. Passwords
are never stored by this convenience feature. Existing Supabase sessions also remain
signed in normally. Accounts are still checked against `business_members`.

Optionally set `VITE_BUSINESS_LOGIN_EMAIL` locally and on Vercel if you want the first
sign-in on a new device to default to one specific account. This is an email, not a secret.
Never put a password, database connection string or secret/service-role key in Vite variables.

## Fresh Supabase project

1. Run `migrations/20261023_business_invoices.sql`.
2. Create your login in Authentication > Users > Add user > Create new user, setting
   a password yourself and enabling Auto Confirm User for the manually created account.
3. Replace the email placeholder in `add-owner.sql` with your login email and run it.
4. Run `migrations/20261023_business_spreadsheet.sql`.
5. Disable public sign-ups in Authentication settings. Even if enabled, an account
   without a business membership has no access to the table or invoices.
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env` locally
   and the Vercel project's Environment Variables. Redeploy to apply production settings.

To add staff/viewers, create each login in Authentication > Users, then run:

```sql
insert into public.business_members(user_id,role)
select id, 'stakeholder' from auth.users
where lower(email)=lower('person@example.com')
on conflict(user_id) do update set role=excluded.role;
```

Use `staff` for shared-cell editing, `stakeholder` for shared-cell viewing. Owners can
also edit columns, view private cells and recover saved versions. Browser users cannot
change business membership; only the project owner's SQL Editor can do so.

## Verification

Run `node --test tests/*.test.js` and `npm run build`. Permission tests run the actual SQL
in a local PostgreSQL-compatible PGlite database. They verify staff/viewer restrictions,
private-cell isolation, invoice independence, migration reruns and concurrent-save rejection.
Keep independent database backups; saved versions are recovery history within the same
Supabase database, not an independent backup.
