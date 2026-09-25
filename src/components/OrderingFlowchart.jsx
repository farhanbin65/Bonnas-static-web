import { motion } from "framer-motion";
import { scrollRevealViewport } from "../lib/motion";
import { MessageCircle, Mail } from "lucide-react";

export default function OrderingFlowchart() {
  const steps = [
    { number: 1, title: "Choose Your Order", desc: "Browse our menu & select items", icon: "🍽️" },
    { number: 2, title: "Contact Us", desc: "WhatsApp/Email your order", phone: "07912795556", email: "orders@bonnas.co.uk", icon: "📞" },
    { number: 3, title: "Payment", desc: "100% upfront to confirm", icon: "💳" },
    { number: 4, title: "Collect", desc: "Pick up from E2 0RB", icon: "📍" },
    { number: 5, title: "Enjoy!", desc: "Savor authentic Bangladeshi food", icon: "😋" },
  ];

  return (
    <section className="py-16 px-6 md:px-20 bg-night">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={scrollRevealViewport}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-2">How to Order</h2>
          <p className="text-sand text-sm">Simple steps to enjoy delicious Bonna's food</p>
        </motion.div>

        {/* Flowchart */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-2">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              className="flex-1 flex flex-col items-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={scrollRevealViewport}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {/* Step box */}
              <div className="w-full bg-ember border-2 border-pink-bonnas rounded-2xl p-6 text-center shadow-lg hover:shadow-xl hover:border-gold-dust transition-all duration-300 flex flex-col items-center h-full group">
                {/* Icon circle */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-bonnas to-red-500 flex items-center justify-center text-2xl mb-4 shadow-md">
                  {step.icon}
                </div>

                {/* Step number */}
                <div className="text-xs font-bold text-pink-bonnas uppercase tracking-wider mb-2">Step {step.number}</div>

                {/* Title */}
                <h3 className="text-lg font-bold text-cream mb-2">{step.title}</h3>

                {/* Description */}
                <p className="text-xs text-sand mb-3">{step.desc}</p>

                {/* Contact info (step 2 only) - Hidden by default, shown on hover */}
                {step.phone && (
                  <div className="w-full border-t border-gold-dust pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* WhatsApp Link */}
                    <a
                      href={`https://wa.me/447912795556?text=Hello,%20I'd%20like%20to%20order%20from%20Bonna's`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-xs text-cream bg-green-600 hover:bg-green-700 rounded-lg px-3 py-2 mb-2 transition-colors font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>

                    {/* Email Link */}
                    <a
                      href={`mailto:orders@bonnas.co.uk`}
                      className="flex items-center justify-center gap-2 text-xs text-cream bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors font-semibold"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                )}
              </div>

              {/* Arrow (except for last step) */}
              {idx < steps.length - 1 && (
                <svg
                  className="w-8 h-12 text-gold-dust hidden md:block absolute -right-16 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 48"
                >
                  <path
                    d="M12 0 L12 40 M6 34 L12 40 L18 34"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Mobile arrow (vertical) */}
              {idx < steps.length - 1 && (
                <svg
                  className="w-8 h-8 text-gold-dust md:hidden mt-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 0 L12 16 M6 10 L12 16 L18 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={scrollRevealViewport}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sand text-sm mb-4">
            Ready to order? Minimum order <span className="text-pink-bonnas font-bold">£20</span>
          </p>
          <a
            href={`https://wa.me/447912795556?text=Hello,%20I'd%20like%20to%20order%20from%20Bonna's`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-bonnas to-red-500 text-night rounded-full text-sm font-semibold hover:shadow-lg transition-shadow"
          >
            Message on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}