import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });

    // Show toast feedback
    setToast(item.name);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart((prev) => {
      return prev
        .map((c) => c._id === id ? { ...c, qty: c.qty + delta } : c)
        // FIX: items reaching 0 or below are filtered out entirely,
        // instead of being floored at 1
        .filter((c) => c.qty > 0);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const clearToast = useCallback(() => setToast(null), []);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        toast,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}