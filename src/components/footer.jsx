import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const SOCIALS = [
  { icon: <FaFacebookF />, href: "https://www.facebook.com/bonnas.cooking1", label: "Facebook" },
  { icon: <FaInstagram />, href: "https://instagram.com/bonnas_cuisine",      label: "Instagram" },
  { icon: <FaTiktok />,    href: "https://www.tiktok.com/@bonnas.cuisine",     label: "TikTok" },
  { icon: <FaYoutube />,   href: "https://www.youtube.com/@bonnas.cooking",   label: "YouTube" },
];

const LINKS = [
  { label: "About",        href: "/#about" },
  { label: "Services",     href: "/#services" },
  { label: "Gallery",      href: "/#gallery" },
  { label: "Reservations", href: "/#reservations" },
  { label: "Contact",      href: "/#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-ember border-t border-gold-dust pt-14 pb-8 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-bonnas/40">
                <img src="/logo.PNG" alt="Bonna's" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-cream tracking-wide">Bonna's</span>
            </div>
            <p className="text-sand text-xs leading-relaxed max-w-xs">
              Authentic home-made Bangladeshi catering prepared with love —
              for every occasion, big or small.
            </p>
            {/* Halal badge */}
            <span className="inline-flex items-center gap-1.5 bg-pink-bonnas/10 border border-pink-bonnas/30 text-pink-bonnas text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
              ✓ Halal Certified
            </span>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-cream font-semibold text-sm mb-4 tracking-wide">Quick Links</p>
            <div className="flex flex-col gap-2.5">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-sand text-xs hover:text-pink-bonnas transition-colors">
                  {l.label}
                </a>
              ))}
              <Link to="/menu" className="text-sand text-xs hover:text-pink-bonnas transition-colors">
                Menu
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-cream font-semibold text-sm mb-4 tracking-wide">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@bonnas.co.uk" className="flex items-center gap-2 text-sand text-xs hover:text-pink-bonnas transition-colors">
                <span className="text-pink-bonnas">✉</span> info@bonnas.co.uk
              </a>
              <p className="flex items-center gap-2 text-sand text-xs">
                <span className="text-pink-bonnas">📍</span> London, E2, UK
              </p>
              <p className="flex items-center gap-2 text-sand text-xs">
                <span className="text-pink-bonnas">🕐</span> Mon–Fri 12:00–21:00
              </p>

              {/* Socials */}
              <div className="flex gap-2.5 mt-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 hover:bg-pink-bonnas hover:text-night text-pink-bonnas flex items-center justify-center transition-colors text-xs"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gold-dust pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sand text-xs">
            © {new Date().getFullYear()} Bonna's. All rights reserved.
          </p>
          <p className="text-sand text-xs">
            Made with <span className="text-pink-bonnas">♥</span> in London
          </p>
        </div>

      </div>
    </footer>
  );
}