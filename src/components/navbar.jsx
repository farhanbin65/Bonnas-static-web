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

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = "text-sand hover:text-pink-bonnas text-sm font-medium transition-colors flex items-center";
  const mobileLinkClass = "text-cream text-2xl font-medium hover:text-pink-bonnas transition-colors flex items-center";

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

          <Link to="/menu" className="hidden md:inline-flex items-center bg-pink-bonnas text-night px-5 py-2 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors">
            Order Now
          </Link>

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
        </div>
      )}
    </>
  );
}