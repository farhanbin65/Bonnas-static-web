import { useState, useEffect } from "react";

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg text-sm font-medium transition-all ${
      type === "success"
        ? "bg-pink-bonnas text-night"
        : "bg-red-500 text-white"
    }`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 text-xs">✕</button>
    </div>
  );
}

export default function Reservations() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleNotify = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);

    const message =
      "🔔 Reservation Notification Request\n\n" +
      "📧 Email: " + email + "\n" +
      "📅 Date: " + new Date().toLocaleString("en-GB");

    try {
      const res = await fetch(
        "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        showToast("You're on the list! We'll notify you when we go live.", "success");
        setEmail("");
      } else {
        showToast("Failed to send. Please try again.", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="reservations" className="py-20 px-6 md:px-20 bg-night">
      <div className="max-w-2xl mx-auto text-center">

        {/* Tag */}
        <span className="inline-block bg-pink-bonnas/10 border border-pink-bonnas/30 text-pink-bonnas text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          Reservations
        </span>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-cream mb-4">
          Coming Soon
        </h2>
        <p className="text-sand text-base leading-relaxed mb-10 max-w-md mx-auto">
          We're putting the finishing touches on our reservations system.
          In the meantime, reach out directly to book your table or place a catering order.
        </p>

        {/* Animated pot */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-pink-bonnas/10 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-pink-bonnas/10" />
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🍲
            </div>
          </div>
        </div>

        {/* Contact options */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <a href="mailto:orders@bonnas.co.uk"
            className="flex items-center gap-4 bg-ember border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-5 text-left transition-colors group">
            <div className="w-11 h-11 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 flex items-center justify-center text-xl shrink-0">
              ✉️
            </div>
            <div>
              <p className="text-cream font-semibold text-sm">Email Us</p>
              <p className="text-sand text-xs mt-0.5">orders@bonnas.co.uk</p>
              <p className="text-pink-bonnas text-xs mt-1 group-hover:underline">Send a message →</p>
            </div>
          </a>

          <a href="#menu"
            className="flex items-center gap-4 bg-ember border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-5 text-left transition-colors group">
            <div className="w-11 h-11 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 flex items-center justify-center text-xl shrink-0">
              🛒
            </div>
            <div>
              <p className="text-cream font-semibold text-sm">Order Online</p>
              <p className="text-sand text-xs mt-0.5">Browse our full menu</p>
              <p className="text-pink-bonnas text-xs mt-1 group-hover:underline">Go to menu →</p>
            </div>
          </a>
        </div>

        {/* Notify me */}
        <div className="bg-ember border border-gold-dust rounded-2xl p-6">
          <p className="text-cream font-semibold text-sm mb-1">Get notified when reservations go live</p>
          <p className="text-sand text-xs mb-4">Leave your email and we'll let you know first</p>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleNotify()}
              className={`flex-1 bg-night border text-cream placeholder-sand rounded-full px-4 py-2.5 text-sm outline-none transition-colors ${
                error ? "border-red-400 focus:border-red-400" : "border-gold-dust focus:border-pink-bonnas"
              }`}
            />
            <button
              onClick={handleNotify}
              disabled={sending}
              className="bg-pink-bonnas text-night px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {sending ? "Sending…" : "Notify me"}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs mt-2 text-left pl-4">{error}</p>
          )}
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </section>
  );
}