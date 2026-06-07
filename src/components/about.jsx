export default function About() {
  return (
    <section id="about" className="py-20 px-6 md:px-20 bg-night">
      <div className="max-w-5xl mx-auto">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Image side */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-gold-dust">
              <img
                src="/photos/f1.jpeg"
                alt="Bonna's home cooking"
                className="w-full h-80 object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-pink-bonnas text-night rounded-2xl px-5 py-3 shadow-lg">
              <p className="text-xs font-medium">Home cooked</p>
              <p className="text-lg font-bold leading-tight">with love</p>
            </div>
          </div>

          {/* Text side */}
          <div>
            <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-6">
              About Bonna's
            </h2>
            <p className="text-sand text-base leading-relaxed mb-4">
              Bonna's is a home-based catering service delivering authentic, delicious meals made with love.
              From traditional biryani to desserts, we specialise in high-quality home-cooked Bangladeshi food
              for parties and special occasions.
            </p>
            <p className="text-sand text-base leading-relaxed mb-8">
              Every dish is prepared with care using family recipes passed down through generations —
              ensuring a warm, memorable dining experience every single time.
            </p>

            {/* Values row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Halal", sub: "Certified" },
                { label: "Fresh", sub: "Daily prep" },
                { label: "Family", sub: "Recipes" },
              ].map((v) => (
                <div key={v.label} className="bg-ember border border-gold-dust rounded-xl p-3 text-center">
                  <p className="text-cream font-bold text-sm">{v.label}</p>
                  <p className="text-sand text-xs mt-0.5">{v.sub}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}