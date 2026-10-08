import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../lib/motion";

const images = [
  "/photos/cover1.jpeg",
  "/photos/cover2.jpeg",
  "/photos/cover3.jpeg",
  "/photos/cover4.jpeg",
];

const menuPreviews = [
  "/photos/menu1.jpg",
  "/photos/menu2.jpg",
  "/photos/menu3.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-night px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">
      {/* Main Hero Container */}
      <div className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border border-gold-dust/40 bg-night shadow-2xl">

        <div className="flex flex-col lg:flex-row">

          {/* ======================================================
              MENU PANEL
          ======================================================= */}
          <motion.aside
            className="w-full lg:w-[42%] flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-12 xl:px-14 py-10 sm:py-12 lg:py-14"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Label */}
            <motion.span
              variants={staggerItem}
              className="inline-block self-start bg-pink-bonnas/20 border border-pink-bonnas/40 text-pink-bonnas text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
            >
              Our Menu
            </motion.span>

            {/* Heading */}
            <motion.h2
              variants={staggerItem}
              className="mt-5 text-3xl sm:text-4xl lg:text-[2.7rem] xl:text-5xl font-bold text-cream leading-[1.1]"
            >
              Authentic{" "}
              <span className="text-pink-bonnas">
                Bangladeshi
              </span>{" "}
              Flavours
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="mt-4 text-sand text-sm sm:text-base leading-relaxed max-w-lg"
            >
              Home-made catering prepared with love, from biryani to
              desserts, for every occasion.
            </motion.p>

            {/* ======================================================
                THREE MENU PREVIEW IMAGES
            ======================================================= */}
            <motion.div
              variants={staggerItem}
              className="mt-7 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-3"
            >
              {menuPreviews.map((img, i) => (
                <div
                  key={i}
                  className="group border border-gold-dust/70 rounded-xl p-1 overflow-hidden bg-night"
                >
                  <img
                    src={img}
                    alt={`Menu ${i + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </motion.div>

            {/* ======================================================
                ACTION BUTTONS
            ======================================================= */}
            <motion.div
              variants={staggerItem}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <a
                href="#menu"
                className="flex-1 bg-pink-bonnas text-night px-6 py-3.5 rounded-full text-sm font-bold text-center hover:bg-pink-dark transition-colors duration-200"
              >
                Order Now
              </a>

              <a
                href="/menu.pdf"
                download
                className="flex-1 border border-pink-bonnas text-pink-bonnas px-6 py-3.5 rounded-full text-sm font-medium text-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
              >
                Download Menu PDF
              </a>
            </motion.div>
          </motion.aside>

          {/* ======================================================
              FOOD CAROUSEL
          ======================================================= */}
          <div className="relative w-full lg:w-[58%] h-[55vh] min-h-[400px] lg:h-[650px] xl:h-[700px] overflow-hidden">

            {/* Carousel Images */}
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Bonna's food"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-night to-transparent" />

            {/* ======================================================
                BRAND CONTENT
            ======================================================= */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Welcome to{" "}
                <span className="text-pink-bonnas">
                  Bonna's
                </span>
              </h1>

              <p className="mt-4 text-sand text-base sm:text-lg max-w-md leading-relaxed">
                Prepared with love and shared with family.
              </p>
            </div>

            {/* ======================================================
                CAROUSEL INDICATORS
            ======================================================= */}
            <div className="absolute bottom-7 sm:bottom-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-pink-bonnas w-6 h-2"
                      : "bg-white/30 w-2 h-2 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
