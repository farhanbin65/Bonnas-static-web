import { motion } from "framer-motion";
import { Home, PartyPopper, CalendarDays, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";
import TiltCard from "./TiltCard";

const SERVICES = [
  {
    title: "Home Catering",
    description: "Freshly prepared meals delivered straight to your door for any occasion.",
    img: "/photos/a6.jpeg",
    Icon: Home,
  },
  {
    title: "Party Orders",
    description: "Feeding a crowd? Our party packages cover starters, mains, biryani and desserts.",
    img: "/photos/a7.jpeg",
    Icon: PartyPopper,
  },
  {
    title: "Weekly Meal Service",
    description: "Regular weekly meals prepared fresh — perfect for busy families.",
    img: "/photos/a8.jpeg",
    Icon: CalendarDays,
  },
  {
    title: "Special Occasions",
    description: "Weddings, Eid gatherings, birthdays — we cater for your most important moments.",
    img: "/photos/a9.jpeg",
    Icon: Sparkles,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 px-6 md:px-20 bg-ember">
      <div className="max-w-7xl mx-auto">

        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">What We Offer</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Our Services</h2>
          <p className="text-sand text-sm mt-2 max-w-md mx-auto">
            From intimate family dinners to large celebrations — we've got you covered
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          {SERVICES.map((s) => (
            <motion.div key={s.title} variants={staggerItem}>
              <TiltCard className="bg-night rounded-2xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 transition-colors group h-full">

                <div className="h-44 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5">
                  <s.Icon className="w-6 h-6 text-pink-bonnas mb-3" strokeWidth={1.75} />
                  <h3 className="text-cream font-semibold text-base mb-2">{s.title}</h3>
                  <p className="text-sand text-xs leading-relaxed">{s.description}</p>
                </div>

              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}