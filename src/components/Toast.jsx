import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Toast() {
  const { toast, clearToast } = useCart();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => clearToast(), 2200);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="bg-ember border border-pink-bonnas/40 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-pink-bonnas flex-shrink-0" />
            <p className="text-sm text-cream">
              <span className="font-semibold">{toast}</span> added to cart
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}