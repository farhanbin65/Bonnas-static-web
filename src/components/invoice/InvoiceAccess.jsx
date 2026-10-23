import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LOGO_URL, BRAND_NAME } from './constants.js';
import styles from './styles.js';
import { rememberedEmail, rememberEmail } from '../../lib/rememberedLogin.js';

function savedEmail() {
  let storage;
  try { storage = globalThis.localStorage; } catch { /* First-use email form remains available. */ }
  return rememberedEmail(storage, import.meta.env.VITE_BUSINESS_LOGIN_EMAIL || '');
}
function storeEmail(email) {
  try { rememberEmail(globalThis.localStorage, email); } catch { /* Email can be entered again next time. */ }
}

export default function InvoiceAccess({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState(null);
  const [email, setEmail] = useState(savedEmail);
  const [showEmail, setShowEmail] = useState(() => !savedEmail());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let currentUserId;
    const applySession = (next) => {
      if (!active) return;
      setSession(next);
      if (next?.user.email) { setEmail(next.user.email); storeEmail(next.user.email); setShowEmail(false); }
      if (currentUserId !== next?.user.id) setAccess(null);
      currentUserId = next?.user.id;
      setReady(true);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => applySession(next));
    supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active) return;
      if (failure) setError(failure.message);
      applySession(data.session);
    }).catch((failure) => { if (active) { setError(failure.message); setReady(true); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user.id || !supabase) return;
    let active = true;
    supabase.from('business_members').select('role').eq('user_id', session.user.id).maybeSingle()
      .then(({ data, error: failure }) => {
        if (!active) return;
        if (failure) { setError(`Business access is not ready: ${failure.message}`); setAccess('denied'); }
        else if (!data) { setError('Your account has not been given access to BONNAS. Ask the owner to add it.'); setAccess('denied'); }
        else { setError(''); setAccess(data.role); }
      }).catch((failure) => { if (active) { setError(failure.message); setAccess('denied'); } });
    return () => { active = false; };
  }, [session?.user.id, attempt]);

  const signIn = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (failure) throw failure;
      storeEmail(email.trim());
      setShowEmail(false);
      setPassword('');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    const { error: failure } = await supabase.auth.signOut();
    if (failure) throw failure;
  };
  if (session && access && access !== 'denied') return children({ user: session.user, role: access, signOut });

  return (
    <div style={styles.passwordScreen}>
      <form style={styles.passwordCard} onSubmit={signIn}>
        <img src={LOGO_URL} alt="BONNAS Logo" style={styles.passwordLogo} />
        <h1 style={styles.passwordTitle}>{BRAND_NAME}</h1>
        <p style={styles.passwordSubtitle}>Business access</p>
        {!supabase ? <p role="alert">Add the Supabase project URL and publishable key, then restart the website.</p>
          : !ready ? <p>Checking your session…</p>
          : session ? <>
            <p>{email || session.user.email}</p>
            {!access && <p>Checking business access…</p>}
            {error && <p role="alert" style={styles.passwordError}>{error}</p>}
            {access === 'denied' && <button type="button" style={styles.passwordBtn} onClick={() => { setAccess(null); setAttempt((previous) => previous + 1); }}>Check access again</button>}
            <button type="button" style={{ ...styles.passwordBtn, marginTop: 12 }} onClick={() => signOut().catch((failure) => setError(failure.message))}>Sign out</button>
          </> : <>
            {showEmail ? <>
              <label htmlFor="business-email" style={styles.label}>Email (remembered on this device)</label>
              <input id="business-email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} style={styles.passwordInput} />
            </> : <>
              <input type="hidden" name="username" autoComplete="username" value={email} />
              <p style={{ fontSize: 12 }}>Enter the password for your saved account.</p>
              <button type="button" onClick={() => { setShowEmail(true); setPassword(''); }} style={{ border: 0, background: 'transparent', textDecoration: 'underline', marginBottom: 12 }}>Use a different account</button>
            </>}
            <label htmlFor="business-password" style={styles.label}>Password</label>
            <input id="business-password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} style={styles.passwordInput} />
            {error && <p role="alert" style={styles.passwordError}>{error}</p>}
            <button disabled={busy} style={styles.passwordBtn}>{busy ? 'Unlocking…' : 'Unlock'}</button>
            <p style={{ fontSize: 12, marginTop: 16 }}>Your email is remembered after the first sign-in. You only need the password next time on this device.</p>
          </>}
      </form>
    </div>
  );
}
