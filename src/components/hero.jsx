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
    <section className="relative w-full md:h-[92vh] flex flex-col md:flex-row overflow-hidden bg-night">

      {/* Menu panel - left 40% */}
      <motion.aside
        className="w-full md:w-[40%] flex flex-col justify-center px-6 md:px-10 py-12 md:py-0 border-b md:border-b-0 md:border-r border-gold-dust overflow-y-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={staggerItem}
          className="inline-block self-start bg-pink-bonnas/20 border border-pink-bonnas/40 text-pink-bonnas text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
        >
          Our Menu
        </motion.span>

        <motion.h2
          variants={staggerItem}
          className="text-3xl md:text-4xl font-bold text-cream leading-tight"
        >
          Authentic <span className="text-pink-bonnas">Bangladeshi</span> Flavours
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className="mt-4 text-sand text-sm md:text-base leading-relaxed"
        >
          Home-made catering prepared with love, from biryani to desserts,
          for every occasion.
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {menuPreviews.map((img, i) => (
            <div
              key={i}
              className="border border-gold-dust rounded-lg p-1 overflow-hidden"
            >
              <img
                src={img}
                alt={"Menu " + (i + 1)}
                className="w-full h-24 md:h-28 object-cover rounded-md"
              />
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#menu"
            className="bg-pink-bonnas text-night px-8 py-3 rounded-full text-sm font-bold text-center hover:bg-pink-dark transition-colors duration-200"
          >
            Order Now
          </a>
          <a
            href="/menu.pdf"
            download
            className="border border-pink-bonnas text-pink-bonnas px-8 py-3 rounded-full text-sm font-medium text-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
          >
            Download Menu PDF
          </a>
        </motion.div>
      </motion.aside>

      {/* Carousel - right 60% */}
      <div className="relative w-full md:w-[60%] h-[60vh] md:h-full overflow-hidden">

        {/* Carousel images */}
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

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-night to-transparent" />

        {/* Brand title over carousel */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
            Welcome to <span className="text-pink-bonnas">Bonna's</span>
          </h1>
          <p className="mt-4 text-sand text-base md:text-lg max-w-md leading-relaxed">
            Prepared with love and shared with family.
          </p>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={"Show image " + (i + 1)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-pink-bonnas w-6 h-2"
                  : "bg-white/30 w-2 h-2 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}