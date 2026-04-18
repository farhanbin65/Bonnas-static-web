import { useEffect, useState } from "react";

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
    <section className="relative flex flex-col items-center py-10">

      {/* Carousel Container */}
      <div className="relative w-4/5 aspect-[16/7] overflow-hidden rounded-2xl">

        {/* Images */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Bonna's food"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
              ${index === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text Content - Desktop Only */}
        <div className="hidden md:flex absolute inset-0 items-center px-6 sm:px-10 md:px-20">
          <div className="max-w-xl text-white backdrop-blur-md bg-white/10 p-6 sm:p-8 rounded-2xl shadow-lg text-left">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Welcome to Bonna's
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl">
              Authentic home-made catering, prepared with love and passion.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="btn btn-outline btn-white"
              >
                Order Now
              </a>

              <a
                href="/menu.pdf"
                download
                className="btn btn-outline btn-white"
              >
                Download Menu
              </a>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all
                ${current === index ? "bg-white scale-125" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Text Content - Mobile & Tablet */}
      <div className="mt-6 w-4/5 md:hidden">
        <div className="bg-black/60 text-white backdrop-blur-md p-6 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome to Bonna's
          </h1>
          <p className="mt-4 text-base sm:text-lg">
            Authentic home-made catering, prepared with love and passion.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="btn btn-outline btn-white"
            >
              Order Now
            </a>

            <a
              href="/menu.pdf"
              download
              className="btn btn-outline btn-white"
            >
              Download Menu
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}
