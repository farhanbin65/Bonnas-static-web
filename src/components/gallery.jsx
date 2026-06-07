import { useState } from "react";

const PHOTOS = [
  "/photos/f1.jpeg",
  "/photos/f2.jpeg",
  "/photos/f3.jpeg",
  "/photos/f4.jpeg",
  "/photos/f5.jpeg",
  "/photos/f6.jpeg",
  "/photos/s5.jpeg",
  "/photos/f8.jpeg",
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="gallery" className="py-20 px-6 md:px-20 bg-night">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Our Food</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Gallery</h2>
          <p className="text-sand text-sm mt-2">Every dish made fresh — here's a look inside our kitchen</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightbox(photo)}
              className="relative h-48 rounded-xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 transition-colors cursor-pointer group"
            >
              <img
                src={photo}
                alt={"Gallery " + (i + 1)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-6 text-white text-3xl hover:text-pink-bonnas transition-colors"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Gallery"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}