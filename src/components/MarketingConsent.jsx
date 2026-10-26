import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONSENT_KEY, isPublicPage, readConsent, setConsent, trackPage, trackWhatsAppClick } from '../lib/metaPixel';

export default function MarketingConsent() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(readConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { trackPage(pathname); }, [pathname, choice]);
  useEffect(() => {
    document.addEventListener('click', trackWhatsAppClick);
    const syncChoice = (event) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        const next = readConsent();
        setConsent(next);
        setChoice(next);
      }
    };
    window.addEventListener('storage', syncChoice);
    return () => {
      document.removeEventListener('click', trackWhatsAppClick);
      window.removeEventListener('storage', syncChoice);
    };
  }, []);

  function choose(value) {
    setConsent(value);
    setChoice(value);
    setSettingsOpen(false);
    trackPage(pathname);
  }

  if (!isPublicPage(pathname)) return null;
  const buttonStyle = 'rounded-lg border border-pink-bonnas px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-bonnas';
  return (
    <>
      <button type="button" onClick={() => setSettingsOpen(true)} className="block w-full bg-ember text-sand underline text-xs py-4">
        Marketing cookie settings
      </button>
      {(choice === null || settingsOpen) && (
        <section aria-label="Marketing cookie preferences" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-xl border border-pink-bonnas/40 bg-ember p-5 text-cream shadow-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold">Your cookie choices</h2>
          <p className="mt-2 text-sm leading-relaxed text-sand">
            With your permission, Bonna’s uses Meta Pixel to share page visits and WhatsApp button clicks with Meta to measure our Facebook and Instagram ads and personalise advertising. Meta may use cookies and device information to associate visits with your account. WhatsApp clicks are enquiries, not confirmed purchases. You can reject marketing cookies and still use the website, or change your choice below at any time.
          </p>
          <a className="mt-2 inline-block text-sm underline" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Meta privacy policy</a>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={buttonStyle} onClick={() => choose('accepted')}>Accept marketing cookies</button>
            <button type="button" className={buttonStyle} onClick={() => choose('rejected')}>Reject marketing cookies</button>
            {choice !== null && <button type="button" className="px-3 py-2 text-sm underline" onClick={() => setSettingsOpen(false)}>Close</button>}
          </div>
        </section>
      )}
    </>
  );
}
