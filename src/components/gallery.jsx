export default function Gallery() {
  // your 8 photos
  const photos = [
    "/photos/f1.jpeg",
    "/photos/f2.jpeg",
    "/photos/f3.jpeg",
    "/photos/f4.jpeg",
    "/photos/f5.jpeg",
    "/photos/f6.jpeg",
    "/photos/s5.jpeg",
    "/photos/f8.jpeg",
  ];

  return (
    <section id="gallery" className="py-20 px-8 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-black">
        Gallery
      </h2>

      <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <div key={index} className="border rounded overflow-hidden">
            <img
              src={photo}
              alt={`Gallery ${index + 1}`}
              className="w-full h-48 object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
