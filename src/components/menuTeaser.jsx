import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const FEATURED = [
  { _id: "bir1", name: "Chicken Biryani", category: "Biryani",  price: 12.00, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=220&fit=crop&auto=format" },
  { _id: "sta2", name: "Chicken Tikka",   category: "Starter",  price: 7.00,  image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=220&fit=crop&auto=format" },
  { _id: "dss1", name: "Mishti Doi",      category: "Dessert",  price: 3.50,  image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=220&fit=crop&auto=format" },
  { _id: "bir2", name: "Lamb Biryani",    category: "Biryani",  price: 14.00, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=220&fit=crop&auto=format" },
  { _id: "sta1", name: "Samosa (4 pcs)",  category: "Starter",  price: 4.50,  image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=220&fit=crop&auto=format" },
  { _id: "des1", name: "Chicken Curry",   category: "Desi's",   price: 10.00, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=220&fit=crop&auto=format" },
];
// Note: Party/Family packages removed from this list since they require
// the variant picker — better suited to the full /menu page only.

export default function MenuTeaser() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleOrderClick = (item) => {
    addToCart(item);
    navigate("/menu");
  };

  return (
    <section id="menu" className="py-20 px-6 md:px-20 bg-ember">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Our Menu</p>
            <h2 className="text-3xl md:text-4xl font-bold text-cream">Favourites</h2>
            <p className="text-sand text-sm mt-1">A taste of what we offer — visit the full menu to order</p>
          </div>
          <Link to="/menu" className="hidden sm:inline-flex items-center gap-1 text-pink-bonnas text-sm font-semibold hover:text-pink-dark transition-colors whitespace-nowrap">
            View Full Menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 items-start">
          {FEATURED.map((item) => (
            <div key={item._id} className="bg-night rounded-2xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 transition-colors">

              <div className="h-40 w-full overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-4 h-28 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs text-pink-bonnas/70 font-medium">{item.category}</span>
                  <h3 className="font-semibold text-cream text-sm leading-snug mt-0.5 line-clamp-1">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gold-dust">
                  <span className="text-pink-bonnas font-bold text-sm">£{item.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleOrderClick(item)}
                    className="bg-pink-bonnas text-night text-xs px-3 py-1.5 rounded-full hover:bg-pink-dark transition-colors font-semibold"
                  >
                    Order
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/menu" className="inline-flex items-center gap-2 border border-pink-bonnas text-pink-bonnas px-8 py-3 rounded-full text-sm font-medium hover:bg-pink-bonnas hover:text-night transition-colors">
            View Full Menu & Order Online →
          </Link>
        </div>

      </div>
    </section>
  );
}