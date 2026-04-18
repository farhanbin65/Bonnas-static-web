export default function Services() {
  // Services with images
  const services = [
    { title: "Home Catering", img: "/photos/f4.jpeg" },
    { title: "Party Orders", img: "/photos/s1.jpeg" },
    { title: "Weekly Meal Service", img: "/photos/s3.jpeg" },
    { title: "Special Occasion Catering", img: "/photos/s4.jpeg" },
  ];

  return (
    <section id="services" className="py-20 px-8 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-black">
        Our Services
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="border rounded overflow-hidden text-center hover:shadow transition"
          >
            <h3 className="text-xl font-semibold mb-2 mt-4">{service.title}</h3>
            <img
              src={service.img}
              alt={service.title}
              className="w-full h-48 object-cover mb-4"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
