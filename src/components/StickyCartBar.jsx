import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function StickyCartBar({ onOpenCart }) {
  const { cartCount, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
        >
          <button
            onClick={onOpenCart}
            className="w-full bg-pink-bonnas text-night rounded-full px-5 py-3.5 shadow-2xl flex items-center justify-between font-semibold text-sm hover:bg-pink-dark transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </span>
            <span>£{cartTotal.toFixed(2)} · View Cart</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}