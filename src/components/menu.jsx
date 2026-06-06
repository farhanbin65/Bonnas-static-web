import { useState } from "react";

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_CHAT_ID_2 = import.meta.env.VITE_TELEGRAM_CHAT_ID_2;

const CATEGORIES = [
  { label: "All",      value: "all" },
  { label: "Packages", value: "packages" },
  { label: "Biryani",  value: "biriyani" },
  { label: "Starters", value: "starters" },
  { label: "Desi's",   value: "desis" },
  { label: "Add Ons",  value: "addons" },
  { label: "Dessert",  value: "dessert" },
];

const MENU_ITEMS = [
  // PACKAGES
  { _id: "pkg1", name: "Party Package", category: "packages", description: "Feeds 10–12 guests. Includes 2 mains, biryani, starter & dessert.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=220&fit=crop&auto=format", variants: [{ label: "Chicken", price: 85.00 }, { label: "Lamb", price: 95.00 }, { label: "Mixed", price: 99.00 }] },
  { _id: "pkg2", name: "Family Package", category: "packages", description: "Feeds 4–5 people. Includes 1 main, biryani & dessert.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=220&fit=crop&auto=format", variants: [{ label: "Chicken", price: 35.00 }, { label: "Lamb", price: 42.00 }] },
  // BIRYANI
  { _id: "bir1", name: "Chicken Biryani", category: "biriyani", price: 12.00, description: "Fragrant basmati layered with tender chicken, saffron & whole spices.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=220&fit=crop&auto=format" },
  { _id: "bir2", name: "Lamb Biryani",    category: "biriyani", price: 14.00, description: "Slow-cooked Sylheti lamb on aged basmati, sealed and finished in deg.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=220&fit=crop&auto=format" },
  { _id: "bir3", name: "Beef Biryani",    category: "biriyani", price: 13.50, description: "Tender beef marinated overnight with aromatic spices on fluffy basmati.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=220&fit=crop&auto=format" },
  { _id: "bir4", name: "Veg Biryani",     category: "biriyani", price: 10.00, description: "Seasonal vegetables with saffron basmati and whole spices.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=220&fit=crop&auto=format" },
  // STARTERS
  { _id: "sta1", name: "Samosa (4 pcs)",      category: "starters", price: 4.50, description: "Crispy pastry filled with spiced potato and peas. Served with chutney.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=220&fit=crop&auto=format" },
  { _id: "sta2", name: "Chicken Tikka",       category: "starters", price: 7.00, description: "Tender chicken marinated in yoghurt and spices, grilled to perfection.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=220&fit=crop&auto=format" },
  { _id: "sta3", name: "Shami Kebab (4 pcs)", category: "starters", price: 6.00, description: "Pan-fried minced beef patties with herbs and fresh chillies.", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=220&fit=crop&auto=format" },
  // DESI'S
  { _id: "des1", name: "Chicken Curry", category: "desis", price: 10.00, description: "Classic home-style chicken curry with a rich warming sauce.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=220&fit=crop&auto=format" },
  { _id: "des2", name: "Beef Rezala",   category: "desis", price: 12.00, description: "Tender beef in a creamy mildly spiced white gravy. A Bengali classic.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=220&fit=crop&auto=format" },
  { _id: "des3", name: "Dal Tadka",     category: "desis", price: 7.00,  description: "Yellow lentils tempered with cumin, garlic and dried chilli.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=220&fit=crop&auto=format" },
  { _id: "des4", name: "Chicken Korma", category: "desis", price: 11.00, description: "Succulent chicken in a rich coconut and almond sauce.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=220&fit=crop&auto=format" },
  // ADD ONS
  { _id: "add1", name: "Plain Rice",  category: "addons", price: 2.50, description: "Fluffy basmati rice, simply steamed.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=220&fit=crop&auto=format" },
  { _id: "add2", name: "Naan Bread",  category: "addons", price: 1.50, description: "Soft pillowy naan bread baked fresh.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=220&fit=crop&auto=format" },
  { _id: "add3", name: "Raita",       category: "addons", price: 1.50, description: "Cooling yoghurt with cucumber and mint.", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=220&fit=crop&auto=format" },
  { _id: "add4", name: "Mixed Salad", category: "addons", price: 2.00, description: "Fresh seasonal salad with a light dressing.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=220&fit=crop&auto=format" },
  // DESSERT
  { _id: "dss1", name: "Mishti Doi",   category: "dessert", price: 3.50, description: "Traditional sweet yoghurt set in a clay pot. A Bengali favourite.", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=220&fit=crop&auto=format" },
  { _id: "dss2", name: "Gulab Jamun",  category: "dessert", price: 3.00, description: "Soft milk dumplings soaked in rose-flavoured sugar syrup.", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=220&fit=crop&auto=format" },
  { _id: "dss3", name: "Firni",        category: "dessert", price: 3.50, description: "Creamy ground rice pudding with cardamom and pistachios.", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=220&fit=crop&auto=format" },
];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [variantPicker, setVariantPicker] = useState(null);

  const filtered = activeCategory === "all"
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.category === activeCategory);

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
    setCart((prev) => prev.map((c) => c._id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
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
        fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }) }),
        fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID_2, text: message }) }),
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      if (data1.ok || data2.ok) {
        alert("Order sent! We will contact you shortly.");
        setCart([]); setCartOpen(false); setCustomerName(""); setCustomerPhone("");
      } else {
        alert("Failed to send order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending order. Please try again.");
    }
  };

  return (
    <section id="menu" className="py-20 px-6 md:px-20 bg-night">

      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Our Menu</h2>
          <p className="text-sand text-sm mt-1">Fresh, homemade Bangladeshi food · minimum order £20</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-pink-bonnas text-night px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors">
          🛒 <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.value
                ? "bg-pink-bonnas text-night border-pink-bonnas"
                : "bg-transparent text-sand border-gold-dust hover:border-pink-bonnas hover:text-pink-bonnas"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {filtered.map((item) => (
          <div key={item._id} className="bg-ember rounded-2xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 transition-colors flex flex-col">
            <img src={item.image} alt={item.name} className="w-full h-44 object-cover" />
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-cream text-sm leading-snug mb-1">{item.name}</h3>
              {item.description && <p className="text-xs text-sand line-clamp-2 mb-3 flex-1">{item.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gold-dust">
                <span className="text-pink-bonnas font-bold text-sm">
                  {item.variants?.length > 0
                    ? "£" + item.variants[0].price.toFixed(2) + " – £" + item.variants[item.variants.length - 1].price.toFixed(2)
                    : item.price ? "£" + item.price.toFixed(2) : "See options"}
                </span>
                <button onClick={() => item.variants?.length > 0 ? setVariantPicker(item) : addToCart(item)}
                  className="bg-pink-bonnas text-night text-xs px-3 py-1.5 rounded-full hover:bg-pink-dark transition-colors font-semibold">
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF section */}
      <div className="mt-16 border-t border-gold-dust pt-12 max-w-7xl mx-auto">
        <h3 className="text-xl font-semibold text-center text-cream mb-2">Full Menu PDF</h3>
        <p className="text-center text-sand text-sm mb-8">Download our complete menu</p>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
          {["/photos/menu1.jpg", "/photos/menu2.jpg"].map((img, i) => (
            <div key={i} className="border border-gold-dust rounded-xl p-2 max-w-xs w-full">
              <img src={img} alt={"Menu " + (i + 1)} className="w-full object-cover rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <a href="/menu.pdf" download className="px-8 py-3 border border-pink-bonnas text-pink-bonnas rounded-full text-sm font-medium hover:bg-pink-bonnas hover:text-night transition-colors">
            Download Menu PDF
          </a>
        </div>
      </div>

      {/* Variant picker */}
      {variantPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setVariantPicker(null)} />
          <div className="relative bg-ember border border-gold-dust rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-cream text-lg">{variantPicker.name}</h3>
                <p className="text-xs text-sand mt-0.5">Choose your size</p>
              </div>
              <button onClick={() => setVariantPicker(null)} className="text-sand hover:text-cream text-xl ml-4">✕</button>
            </div>
            <img src={variantPicker.image} alt={variantPicker.name} className="w-full h-36 object-cover rounded-xl mb-4" />
            <div className="flex flex-col gap-3">
              {variantPicker.variants.map((variant, i) => (
                <button key={i}
                  onClick={() => { addToCart({ ...variantPicker, name: variantPicker.name + " (" + variant.label + ")", price: variant.price, variants: null }); setVariantPicker(null); }}
                  className="flex items-center justify-between w-full border border-gold-dust rounded-xl px-4 py-3 hover:border-pink-bonnas transition-colors">
                  <span className="text-sm font-medium text-cream">{variant.label}</span>
                  <span className="text-sm font-bold text-pink-bonnas">£{variant.price?.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex md:justify-end items-end md:items-stretch">
          <div className="flex-1 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="w-full md:max-w-sm bg-ember border-l border-gold-dust flex flex-col shadow-2xl md:h-full rounded-t-2xl md:rounded-none" style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-gold-dust">
              <div>
                <h3 className="text-lg font-bold text-cream">Your Order</h3>
                <p className="text-xs text-sand">Minimum order £20</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-sand hover:text-cream text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-5xl">🛒</span>
                  <p className="text-sand text-sm">Your cart is empty</p>
                </div>
              ) : (
                cart.map((c) => (
                  <div key={c._id} className="flex items-center gap-3 pb-4 border-b border-gold-dust last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cream truncate">{c.name}</p>
                      <p className="text-xs text-sand">£{c.price?.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(c._id, -1)} className="w-6 h-6 rounded-full border border-gold-dust text-cream text-sm flex items-center justify-center hover:border-pink-bonnas transition">−</button>
                      <span className="w-5 text-center text-sm font-medium text-cream">{c.qty}</span>
                      <button onClick={() => updateQty(c._id, 1)} className="w-6 h-6 rounded-full border border-gold-dust text-cream text-sm flex items-center justify-center hover:border-pink-bonnas transition">+</button>
                    </div>
                    <span className="text-sm font-bold text-cream w-14 text-right">£{(c.price * c.qty).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(c._id)} className="text-sand hover:text-red-400 transition text-xs ml-1">✕</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-gold-dust bg-night">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-cream">Total</span>
                  <span className="font-bold text-pink-bonnas">£{cartTotal.toFixed(2)}</span>
                </div>
                <input type="text" placeholder="Your name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-ember border border-gold-dust text-cream placeholder-sand rounded-xl px-4 py-2.5 text-sm mb-2 outline-none focus:border-pink-bonnas" />
                <input type="tel" placeholder="Your phone number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-ember border border-gold-dust text-cream placeholder-sand rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-pink-bonnas" />
                {cartTotal < 20 && (
                  <div className="bg-pink-bonnas/10 border border-pink-bonnas/30 rounded-xl p-3 mb-4 text-center">
                    <p className="text-xs text-pink-bonnas">Add <span className="font-bold">£{(20 - cartTotal).toFixed(2)}</span> more to meet minimum order</p>
                  </div>
                )}
                <button onClick={sendTelegram} disabled={cartTotal < 20 || !customerName || !customerPhone}
                  className="w-full bg-pink-bonnas text-night py-3 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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