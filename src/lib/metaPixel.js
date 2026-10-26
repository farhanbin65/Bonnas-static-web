export const PIXEL_ID = '1641796190684961';
export const CONSENT_KEY = 'bonnas-marketing-consent-v1';
let initialized = false;
let lastPage = null;
let consent = readConsent();

export function readConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

export function isPublicPage(pathname) {
  return !/^\/(invoice|records)(\/|$)/i.test(pathname);
}

function initialize() {
  if (initialized) return;
  if (!window.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  // Keep tracking explicit: no automatic button/form event collection.
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  initialized = true;
}

export function setConsent(value) {
  consent = value === 'accepted' ? 'accepted' : 'rejected';
  try { window.localStorage.setItem(CONSENT_KEY, consent); } catch { /* Session-only choice. */ }
  lastPage = null;
  if (consent !== 'accepted') {
    window.fbq?.('consent', 'revoke');
    // Remove first-party Meta cookies on host and parent-domain scopes.
    const parts = window.location.hostname.split('.');
    for (const name of ['_fbp', '_fbc']) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      for (let i = 0; i < parts.length - 1; i++) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}`;
      }
    }
  }
}

export function trackPage(pathname) {
  if (consent !== 'accepted' || !isPublicPage(pathname)) {
    window.fbq?.('consent', 'revoke');
    lastPage = null;
    return;
  }
  initialize();
  window.fbq('consent', 'grant');
  if (lastPage === pathname) return;
  window.fbq('track', 'PageView');
  lastPage = pathname;
}

export function trackWhatsAppClick(event) {
  if (consent !== 'accepted' || !isPublicPage(window.location.pathname)) return;
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  let url;
  try { url = new URL(link.href); } catch { return; }
  if (!['https:', 'http:'].includes(url.protocol) ||
      !['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) return;
  initialize();
  // Never include the WhatsApp URL, prefilled message, or customer/order details.
  window.fbq('track', 'Contact', { content_name: 'WhatsApp', content_category: 'Enquiry' });
}
