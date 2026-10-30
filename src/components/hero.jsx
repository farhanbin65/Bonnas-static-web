import { useState } from "react";
import { motion as Motion } from "framer-motion";
import MenuViewer, { MENU_PAGES } from "./menu-viewer/MenuViewer";
import { staggerContainer, staggerItem } from "../lib/motion";
import HeroImageWall from "./HeroImageWall";

export default function Hero() {
  const [selectedMenu, setSelectedMenu] = useState(null);

  return (
    <>
      <section className="w-full bg-night px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">
        {/* ======================================================
            MAIN HERO CONTAINER
        ======================================================= */}
        <div className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border border-gold-dust/40 bg-night shadow-2xl">
          <div className="flex flex-col lg:flex-row">

            {/* ======================================================
                MENU PANEL
            ======================================================= */}
            <Motion.aside
              className="w-full lg:w-[42%] flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-12 xl:px-14 py-10 sm:py-12 lg:py-14"
              variants={staggerContainer}
              initial={false}
              animate="visible"
            >
              {/* Label */}
              <Motion.span
                variants={staggerItem}
                className="inline-block self-start bg-pink-bonnas/20 border border-pink-bonnas/40 text-pink-bonnas text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
              >
                Our Menu
              </Motion.span>

              {/* Heading */}
              <Motion.h1
                variants={staggerItem}
                className="mt-5 text-3xl sm:text-4xl lg:text-[2.7rem] xl:text-5xl font-bold text-cream leading-[1.1]"
              >
                Authentic{" "}
                <span className="text-pink-bonnas">
                  Bangladeshi
                </span>{" "}
                Flavours
              </Motion.h1>

              {/* Description */}
              <Motion.p
                variants={staggerItem}
                className="mt-4 text-sand text-sm sm:text-base leading-relaxed max-w-lg"
              >
                Home-made catering prepared with love, from biryani to
                desserts, for every occasion.
              </Motion.p>

              {/* ======================================================
                  FOUR MENU PREVIEW IMAGES
              ======================================================= */}
              <Motion.div
                variants={staggerItem}
                className="mt-7 sm:mt-8 grid grid-cols-4 gap-2.5 sm:gap-3"
              >
                {MENU_PAGES.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedMenu(i)}
                    aria-label={`View Menu ${i + 1}`}
                    className="group relative border border-gold-dust/70 rounded-xl p-1 overflow-hidden bg-night cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-pink-bonnas"
                  >
                    <img
                      src={img}
                      width="1414" height="2000" decoding="async"
                      alt={`Menu ${i + 1}`}
                      className="w-full aspect-[1414/2000] object-contain rounded-lg transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-1 rounded-lg bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-night/90 text-cream text-xs sm:text-sm font-semibold px-3 py-2 rounded-full">
                        View Menu
                      </span>
                    </div>
                  </button>
                ))}
              </Motion.div>

              {/* Small helper text */}
              <Motion.p
                variants={staggerItem}
                className="mt-3 text-sand/70 text-xs"
              >
                Tap or click a menu to view it larger.
              </Motion.p>

              {/* ======================================================
                  ACTION BUTTONS
              ======================================================= */}
              <Motion.div
                variants={staggerItem}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
              <a
                href="https://wa.me/447912795556"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-pink-bonnas text-night px-6 py-3.5 rounded-full text-sm font-bold text-center hover:bg-pink-dark transition-colors duration-200"
              >
                Whatsapp
              </a>

                {/* PDF PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => setSelectedMenu(0)}
                  className="flex-1 border border-pink-bonnas text-pink-bonnas px-6 py-3.5 rounded-full text-sm font-medium text-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
                >
                   Menu
                </button>
              </Motion.div>
            </Motion.aside>

            {/* ======================================================
                THREE-ROW FOOD IMAGE WALL
            ======================================================= */}
            <div className="relative w-full lg:w-[58%] h-[55vh] min-h-[400px] lg:h-[650px] xl:h-[700px] overflow-hidden">

              <HeroImageWall />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-night to-transparent" />

              {/* Brand Content */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Welcome to{" "}
                  <span className="text-pink-bonnas">
                    Bonna's
                  </span>
                </h2>

                <p className="mt-4 text-sand text-base sm:text-lg max-w-md leading-relaxed">
                  Prepared with love and shared with family.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {selectedMenu !== null && <MenuViewer initialPage={selectedMenu} onClose={() => setSelectedMenu(null)} />}
    </>
  );
}
