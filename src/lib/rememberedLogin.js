const KEY = 'bonnas_business_login_email';
export function rememberedEmail(storage, configuredEmail = '') {
  if (configuredEmail) return configuredEmail;
  try { return storage?.getItem(KEY) || ''; } catch { return ''; }
}
export function rememberEmail(storage, email) {
  try { storage?.setItem(KEY, email); } catch { /* Sign-in works even if storage is unavailable. */ }
}
