import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../lib/motion";

const images = [
  "/photos/cover1.jpeg",
  "/photos/cover2.jpeg",
  "/photos/cover3.jpeg",
  "/photos/cover4.jpeg",
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
    <section className="relative w-full h-[92vh] overflow-hidden">

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
      <div className="absolute inset-0 bg-black/60" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-night to-transparent" />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* Tag */}
        <motion.span
          variants={staggerItem}
          className="inline-block bg-pink-bonnas/20 border border-pink-bonnas/40 text-pink-bonnas text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
        >
          Authentic Bangladeshi Home Cooking
        </motion.span>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight max-w-3xl"
        >
          Welcome to{" "}
          <span className="text-pink-bonnas">Bonna's</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={staggerItem}
          className="mt-4 text-sand text-base sm:text-lg md:text-xl max-w-xl leading-relaxed"
        >
          Home-made catering prepared with love — from biryani to desserts,
          for every occasion.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={staggerItem}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#menu"
            className="bg-pink-bonnas text-night px-8 py-3 rounded-full text-sm font-bold hover:bg-pink-dark transition-colors duration-200"
          >
            Order Now
          </a>
          <a
            href="/menu.pdf"
            download
            className="border border-cream/40 text-cream px-8 py-3 rounded-full text-sm font-medium hover:border-pink-bonnas hover:text-pink-bonnas transition-colors duration-200"
          >
            Download Menu
          </a>
        </motion.div>
      </motion.div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "bg-pink-bonnas w-6 h-2"
                : "bg-white/30 w-2 h-2 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

    </section>
  );
}