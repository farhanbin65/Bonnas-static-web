import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const NAV_ITEMS = [
  { label: "About",        href: "/#about",        route: false },
  { label: "Services",     href: "/#services",     route: false },
  { label: "Menu",         href: "/menu",           route: true  },
  { label: "Blog",         href: "/blog",           route: true  },
  { label: "Gallery",      href: "/#gallery",      route: false },
  { label: "Reservations", href: "/#reservations", route: false },
  { label: "Games",        href: "/#interactive",  route: false },
];

const GamePadIcon = () => (
  <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Controller body */}
    <rect x="1" y="6" width="22" height="12" rx="2" ry="2" />

    {/* Left D-pad */}
    <circle cx="7" cy="12" r="1.5" fill="currentColor" />
    <line x1="7" y1="10" x2="7" y2="14" strokeWidth="2" />
    <line x1="5" y1="12" x2="9" y2="12" strokeWidth="2" />

    {/* Right buttons */}
    <circle cx="17" cy="10" r="1.2" fill="currentColor" opacity="0.7" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" opacity="0.7" />
    <circle cx="17" cy="14" r="1.2" fill="currentColor" opacity="0.7" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5.01L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.19c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.59-2.84-1.23-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.09.99-2.37c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.67.79 1.95.93.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/>
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = "text-sand hover:text-pink-bonnas text-sm font-medium transition-colors flex items-center";
  const mobileLinkClass = "text-cream text-2xl font-medium hover:text-pink-bonnas transition-colors flex items-center";
  const whatsappHref = `https://wa.me/447912795556?text=Hello,%20I'd%20like%20to%20order%20from%20Bonna's`;

  return (
    <>
      <nav className="bg-night border-b border-gold-dust px-6 py-4 sticky top-0 z-[1001]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-bonnas/40">
              <img src="/logo.PNG" alt="Bonnas" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-cream tracking-wide">Bonna's</span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((l) => l.route
              ? <Link key={l.href} to={l.href} className={linkClass}>
                  {l.label === "Games" && <GamePadIcon />}
                  {l.label}
                </Link>
              : <a key={l.href} href={l.href} className={linkClass}>
                  {l.label === "Games" && <GamePadIcon />}
                  {l.label}
                </a>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/menu" className="inline-flex items-center bg-pink-bonnas text-night px-5 py-2 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors">
              Order Now
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-night px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#1ebe5a] transition-colors"
              aria-label="Order on WhatsApp"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>

          <button onClick={() => setOpen(true)} className="md:hidden text-cream text-xl p-1" aria-label="Open menu">
            <FaBars />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-night flex flex-col items-center justify-center gap-8">
          <button onClick={() => setOpen(false)} className="absolute top-5 right-6 text-cream text-2xl">
            <FaTimes />
          </button>

          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-bonnas/50 mb-2">
            <img src="/logo.PNG" alt="Bonnas" className="w-full h-full object-cover" />
          </div>

          {NAV_ITEMS.map((l) => l.route
            ? <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className={mobileLinkClass}>
                {l.label === "Games" && <GamePadIcon />}
                {l.label}
              </Link>
            : <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={mobileLinkClass}>
                {l.label === "Games" && <GamePadIcon />}
                {l.label}
              </a>
          )}

          <Link to="/menu" onClick={() => setOpen(false)} className="mt-4 bg-pink-bonnas text-night px-10 py-3 rounded-full text-lg font-semibold hover:bg-pink-dark transition-colors">
            Order Now
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 bg-[#25D366] text-night px-10 py-3 rounded-full text-lg font-semibold hover:bg-[#1ebe5a] transition-colors"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
      )}
    </>
  );
}