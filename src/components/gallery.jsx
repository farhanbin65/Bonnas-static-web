import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";
import { fadeUp, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";
import TiltCard from "./TiltCard";

const PHOTOS = [
  "/photos/a1.jpeg",
  "/photos/a2.jpeg",
  "/photos/a3.jpeg",
  "/photos/a4.jpeg",
  "/photos/a5.jpeg",
  "/photos/a6.jpeg",
  "/photos/a7.jpeg",
  "/photos/a8.jpeg",
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="gallery" className="py-20 px-6 md:px-20 bg-night">
      <div className="max-w-7xl mx-auto">

        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Our Food</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Gallery</h2>
          <p className="text-sand text-sm mt-2">Every dish made fresh — here's a look inside our kitchen</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          {PHOTOS.map((photo, i) => (
            <motion.div key={i} variants={staggerItem}>
              <TiltCard
                className="relative h-48 rounded-xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 transition-colors cursor-pointer group"
              >
                <div onClick={() => setLightbox(photo)} className="w-full h-full">
                  <img
                    src={photo}
                    alt={"Gallery " + (i + 1)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-5 right-6 text-white hover:text-pink-bonnas transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
            <motion.img
              src={lightbox}
              alt="Gallery"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}