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
  { label: "Contact",      href: "/#contact",      route: false },
];
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = "text-sand hover:text-pink-bonnas text-sm font-medium transition-colors";
  const mobileLinkClass = "text-cream text-2xl font-medium hover:text-pink-bonnas transition-colors";

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
              ? <Link key={l.href} to={l.href} className={linkClass}>{l.label}</Link>
              : <a key={l.href} href={l.href} className={linkClass}>{l.label}</a>
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
            ? <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className={mobileLinkClass}>{l.label}</Link>
            : <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={mobileLinkClass}>{l.label}</a>
          )}

          <Link to="/menu" onClick={() => setOpen(false)} className="mt-4 bg-pink-bonnas text-night px-10 py-3 rounded-full text-lg font-semibold hover:bg-pink-dark transition-colors">
            Order Now
          </Link>
        </div>
      )}
    </>
  );
}