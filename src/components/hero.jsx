import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
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

  // Menu image preview
  const [selectedMenu, setSelectedMenu] = useState(null);

  // PDF preview
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Close modals with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedMenu(null);
        setShowPdfPreview(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Prevent page scrolling while a modal is open
  useEffect(() => {
    const isModalOpen = selectedMenu !== null || showPdfPreview;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMenu, showPdfPreview]);

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
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedMenu(i)}
                    aria-label={`View Menu ${i + 1}`}
                    className="group relative border border-gold-dust/70 rounded-xl p-1 overflow-hidden bg-night cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-pink-bonnas"
                  >
                    <img
                      src={img}
                      alt={`Menu ${i + 1}`}
                      className="w-full aspect-[3/4] object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-1 rounded-lg bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-night/90 text-cream text-xs sm:text-sm font-semibold px-3 py-2 rounded-full">
                        View Menu
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>

              {/* Small helper text */}
              <motion.p
                variants={staggerItem}
                className="mt-3 text-sand/70 text-xs"
              >
                Tap or click a menu to view it larger.
              </motion.p>

              {/* ======================================================
                  ACTION BUTTONS
              ======================================================= */}
              <motion.div
                variants={staggerItem}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <a
                  href="#menu"
                  className="flex-1 bg-pink-bonnas text-night px-6 py-3.5 rounded-full text-sm font-bold text-center hover:bg-pink-dark transition-colors duration-200"
                >
                  Order Now
                </a>

                {/* PDF PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowPdfPreview(true)}
                  className="flex-1 border border-pink-bonnas text-pink-bonnas px-6 py-3.5 rounded-full text-sm font-medium text-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
                >
                  View Menu PDF
                </button>
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

              {/* Brand Content */}
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

              {/* Carousel Indicators */}
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

      {/* ==========================================================
          MENU IMAGE MODAL
      =========================================================== */}
      <AnimatePresence>
        {selectedMenu !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedMenu(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[95vh] w-full flex items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMenu(null)}
                aria-label="Close menu preview"
                className="absolute top-2 right-2 sm:-top-4 sm:-right-4 z-20 w-10 h-10 rounded-full bg-night border border-gold-dust text-cream flex items-center justify-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
              >
                <X size={20} />
              </button>

              {/* Large Menu Image */}
              <img
                src={menuPreviews[selectedMenu]}
                alt={`Menu ${selectedMenu + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================================
          PDF PREVIEW MODAL
      =========================================================== */}
      <AnimatePresence>
        {showPdfPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setShowPdfPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl h-[92vh] bg-night rounded-2xl overflow-hidden border border-gold-dust/60 shadow-2xl flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              {/* PDF Header */}
              <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-gold-dust/40 bg-night shrink-0">
                <div>
                  <h3 className="text-cream font-bold text-base sm:text-lg">
                    BONNAS Menu
                  </h3>
                  <p className="text-sand text-xs sm:text-sm">
                    Preview our menu before downloading
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download Button */}
                  <a
                    href="/menu.pdf"
                    download
                    className="inline-flex items-center gap-2 bg-pink-bonnas text-night px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-pink-dark transition-colors duration-200"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </a>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setShowPdfPreview(false)}
                    aria-label="Close PDF preview"
                    className="w-9 h-9 rounded-full border border-gold-dust text-cream flex items-center justify-center hover:bg-pink-bonnas hover:text-night transition-colors duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-black/30 p-2 sm:p-4">
                <iframe
                  src="/menu.pdf"
                  title="Bonna's Menu PDF"
                  className="w-full h-full rounded-lg bg-white"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

