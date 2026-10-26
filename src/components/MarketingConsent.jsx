import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONSENT_KEY, isPublicPage, readConsent, setConsent, trackPage, trackWhatsAppClick } from '../lib/metaPixel';

export default function MarketingConsent() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(readConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState(null);
  const bannerRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const resetPosition = () => { dragRef.current = null; setPosition(null); };
    window.addEventListener('resize', resetPosition);
    return () => window.removeEventListener('resize', resetPosition);
  }, []);

  function moveBanner(left, top) {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      left: Math.max(8, Math.min(left, window.innerWidth - rect.width - 8)),
      top: Math.max(8, Math.min(top, window.innerHeight - rect.height - 8)),
    });
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const rect = bannerRef.current.getBoundingClientRect();
    dragRef.current = { id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event) {
    const current = dragRef.current;
    if (!current || current.id !== event.pointerId) return;
    moveBanner(event.clientX - current.x, event.clientY - current.y);
  }

  function stopDrag(event) {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function moveWithKeyboard(event) {
    const directions = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    if (!directions[event.key]) return;
    event.preventDefault();
    const rect = bannerRef.current.getBoundingClientRect();
    const [x, y] = directions[event.key];
    moveBanner(rect.left + x, rect.top + y);
  }

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
  const buttonStyle = 'h-full min-h-11 rounded-lg border border-pink-bonnas px-2 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-bonnas';
  return (
    <>
      <button type="button" onClick={() => setSettingsOpen(true)} className="block w-full bg-ember text-sand underline text-xs py-4">
        Marketing cookie settings
      </button>
      {((choice === null && !dismissed) || settingsOpen) && (
        <section
          ref={bannerRef}
          aria-label="Marketing cookie preferences"
          style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined}
          className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-md rounded-xl border border-pink-bonnas/40 bg-ember p-4 text-cream shadow-2xl max-h-[80dvh] overflow-y-auto"
        >
          <button
            type="button"
            aria-label="Move cookie banner. Drag or use arrow keys."
            onPointerDown={startDrag}
            onPointerMove={drag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onLostPointerCapture={() => { dragRef.current = null; }}
            onKeyDown={moveWithKeyboard}
            className="mb-3 flex min-h-9 w-[calc(100%-2rem)] touch-none select-none items-center gap-2 rounded-md text-xs text-sand cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-bonnas"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <circle cx="8" cy="5" r="1.5" /><circle cx="16" cy="5" r="1.5" />
              <circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
              <circle cx="8" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" />
            </svg>
            Drag to move
          </button>
          <button
            type="button"
            aria-label="Dismiss cookie banner without changing preferences"
            onClick={() => { setDismissed(true); setSettingsOpen(false); }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-sand hover:bg-white/10 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-bonnas"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="flex items-start gap-3 pr-6 sm:gap-4">
            <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" focusable="false" className="h-12 w-12 shrink-0 sm:h-20 sm:w-20">
              <circle cx="80" cy="80" r="76" fill="#E9B66D" fillOpacity="0.08" />
              <ellipse cx="78" cy="139" rx="44" ry="7" fill="#000" fillOpacity="0.18" />
              <path d="M91 23C82 38 91 53 107 53C102 67 112 80 131 78C136 105 118 131 91 138C59 146 27 127 20 96C12 64 32 32 63 24C73 21 82 21 91 23Z" fill="#C78A45" stroke="#704322" strokeWidth="3" strokeLinejoin="round" />
              <path d="M88 25C80 39 90 55 104 55C101 67 111 81 127 81C129 104 112 125 88 131C60 138 32 121 26 94C19 66 36 38 64 30C72 27 80 26 88 25Z" fill="#E9B66D" />
              <path d="M36 72C41 53 56 40 74 38" stroke="#F8DCA7" strokeWidth="5" strokeLinecap="round" />
              <g fill="#704322">
                <path d="m55 51 10 3 1 10-10 5-7-8Z" />
                <path d="m83 83 11-4 7 9-5 10-12-2Z" />
                <path d="m44 94 9-3 6 8-3 9-12-2Z" />
                <path d="m74 114 9-4 7 8-5 8-10-2Z" />
                <path d="m112 103 7 2-2 9-8-1Z" />
                <circle cx="68" cy="87" r="4" />
              </g>
              <g fill="#B57838">
                <circle cx="40" cy="81" r="2.5" />
                <circle cx="77" cy="61" r="3" />
                <circle cx="103" cy="115" r="2" />
                <circle cx="63" cy="116" r="2" />
              </g>
              <path d="m121 25 9 3-2 9-9-2Z" fill="#E9B66D" stroke="#C78A45" strokeWidth="2" strokeLinejoin="round" />
              <path d="m139 54 6 3-3 6-6-2Z" fill="#E9B66D" />
              <circle cx="109" cy="13" r="3" fill="#E9B66D" />
            </svg>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Your cookie choices</h2>
              <p className="mt-2 text-sm leading-relaxed text-sand">
                With your consent, we share page visits and WhatsApp clicks with Meta to measure and personalise ads. Meta uses cookies and device information. Reject keeps Meta tracking off. Change your choice anytime in Marketing cookie settings.
              </p>
              <a className="mt-2 inline-block text-xs underline" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Meta privacy policy</a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 items-stretch gap-2">
            <button type="button" className={buttonStyle} onClick={() => choose('accepted')}>Accept</button>
            <button type="button" className={buttonStyle} onClick={() => choose('rejected')}>Reject</button>
          </div>
        </section>
      )}
    </>
  );
}
