import { useEffect, useState } from "react";
import { client, urlFor } from "../lib/sanityClient";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Packages", value: "packages" },
  { label: "Biriyani", value: "biriyani" },
  { label: "Starters", value: "starters" },
  { label: "Desi's", value: "desis" },
  { label: "Add Ons", value: "addons" },
  { label: "Dessert", value: "dessert" },
];

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_CHAT_ID_2 = import.meta.env.VITE_TELEGRAM_CHAT_ID_2;

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [variantPicker, setVariantPicker] = useState(null);

  useEffect(() => {
    client
      .fetch(`*[_type == "menuItem" && available == true] | order(category asc) {
        _id, name, category, price, variants, description, image
      }`)
      .then((data) => { setMenuItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) return prev.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c._id !== id));

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((c) => c._id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const sendTelegram = async () => {
    if (cart.length === 0) return;
    const lines = cart.map((c) => "• " + c.name + " x" + c.qty + " — £" + (c.price * c.qty).toFixed(2));
    const message =
      "🛒 New Order from Bonna's Website!\n\n" +
      "👤 Name: " + customerName + "\n" +
      "📞 Phone: " + customerPhone + "\n\n" +
      lines.join("\n") +
      "\n\n💰 Total: £" + cartTotal.toFixed(2);

    try {
      const [res1, res2] = await Promise.all([
        fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
        }),
        fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID_2, text: message }),
        }),
      ]);

      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      if (data1.ok || data2.ok) {
        alert("Order sent! We will contact you shortly.");
        setCart([]);
        setCartOpen(false);
        setCustomerName("");
        setCustomerPhone("");
      } else {
        console.error("Telegram errors:", data1, data2);
        alert("Failed to send order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending order. Please try again.");
    }
  };

  return (
    <section id="menu" className="py-20 px-8 md:px-20 bg-[#fafaf8]">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-black">Our Menu</h2>
          <p className="text-gray-500 text-sm mt-1">Fresh, homemade Bangladeshi food</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition"
        >
          🛒 <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.value
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── MENU GRID ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No items in this category yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* image */}
              {item.image ? (
                <img
                  src={urlFor(item.image).width(400).height(220).url()}
                  alt={item.name}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gray-50 flex items-center justify-center text-5xl">
                  🍽️
                </div>
              )}

              {/* body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-black text-sm leading-snug mb-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                  <span className="text-green-700 font-bold text-sm">
                    {item.variants && item.variants.length > 0
                      ? "£" + item.variants[0].price.toFixed(2) + " – £" + item.variants[item.variants.length - 1].price.toFixed(2)
                      : item.price
                      ? "£" + item.price.toFixed(2)
                      : "See options"}
                  </span>
                  <button
                    onClick={() => {
                      if (item.variants && item.variants.length > 0) {
                        setVariantPicker(item);
                      } else {
                        addToCart(item);
                      }
                    }}
                    className="bg-black text-white text-xs px-3 py-1.5 rounded-full hover:bg-gray-800 transition"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DOWNLOAD + OLD MENU PREVIEWS ── */}
      <div className="mt-16 border-t pt-12">
        <h3 className="text-xl font-semibold text-center text-black mb-2">
          Full Menu
        </h3>
        <p className="text-center text-gray-400 text-sm mb-8">
          Download our complete menu PDF
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
          {["/photos/menu1.jpg", "/photos/menu2.jpg"].map((img, i) => (
            <div key={i} className="border rounded-xl p-2 max-w-xs w-full shadow-sm">
              <img src={img} alt={"Menu " + (i + 1)} className="w-full object-cover rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <a
            href="/menu.pdf"
            download
            className="px-8 py-3 border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
          >
            Download Menu PDF
          </a>
        </div>
      </div>

      {/* ── VARIANT PICKER MODAL ── */}
      {variantPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setVariantPicker(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-black text-lg">{variantPicker.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Choose your portion size</p>
              </div>
              <button
                onClick={() => setVariantPicker(null)}
                className="text-gray-400 hover:text-black text-xl ml-4"
              >✕</button>
            </div>

            {variantPicker.image && (
              <img
                src={urlFor(variantPicker.image).width(400).height(200).url()}
                alt={variantPicker.name}
                className="w-full h-36 object-cover rounded-xl mb-4"
              />
            )}

            <div className="flex flex-col gap-3">
              {variantPicker.variants.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => {
                    addToCart({
                      ...variantPicker,
                      name: variantPicker.name + " (" + variant.label + ")",
                      price: variant.price,
                      variants: null,
                    });
                    setVariantPicker(null);
                  }}
                  className="flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-3 hover:border-black hover:bg-gray-50 transition"
                >
                  <span className="text-sm font-medium text-black">{variant.label}</span>
                  <span className="text-sm font-bold text-green-700">£{variant.price?.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex md:justify-end items-end md:items-stretch">
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setCartOpen(false)} />
          <div className="w-full md:max-w-sm bg-white flex flex-col shadow-2xl md:h-full rounded-t-2xl md:rounded-none"
            style={{ maxHeight: '85vh' }}
          >

            {/* drawer header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-bold text-black">Your Order</h3>
                <p className="text-xs text-gray-400">Minimum order £20</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-black text-xl">✕</button>
            </div>

            {/* drawer items */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-5xl">🛒</span>
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                </div>
              ) : (
                cart.map((c) => (
                  <div key={c._id} className="flex items-center gap-3 pb-4 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">£{c.price?.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(c._id, -1)} className="w-6 h-6 rounded-full border border-gray-200 text-sm flex items-center justify-center hover:border-black transition">−</button>
                      <span className="w-5 text-center text-sm font-medium">{c.qty}</span>
                      <button onClick={() => updateQty(c._id, 1)} className="w-6 h-6 rounded-full border border-gray-200 text-sm flex items-center justify-center hover:border-black transition">+</button>
                    </div>
                    <span className="text-sm font-bold text-black w-14 text-right">
                      £{(c.price * c.qty).toFixed(2)}
                    </span>
                    <button onClick={() => removeFromCart(c._id)} className="text-gray-300 hover:text-red-400 transition text-xs ml-1">✕</button>
                  </div>
                ))
              )}
            </div>

            {/* drawer footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-black">Total</span>
                  <span className="font-bold text-black">£{cartTotal.toFixed(2)}</span>
                </div>

                {/* customer details */}
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-2 outline-none focus:border-black"
                />
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-black"
                />

                {cartTotal < 20 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
                    <p className="text-xs text-amber-700">
                      Add <span className="font-bold">£{(20 - cartTotal).toFixed(2)}</span> more to meet minimum order
                    </p>
                  </div>
                )}
                <button
                  onClick={sendTelegram}
                  disabled={cartTotal < 20 || !customerName || !customerPhone}
                  className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  📲 Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}