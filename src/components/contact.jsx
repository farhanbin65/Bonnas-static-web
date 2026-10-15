import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";

const DISHES = [
  { id: 1, name: "Roast Polao (Bonna's Special)", category: "Biriyani", price: "£10", image: "a1.jpeg" },
  { id: 2, name: "Lamb Biriyani", category: "Biriyani", price: "£10", image: "a2.jpeg" },
  { id: 3, name: "Beef Biriyani", category: "Biriyani", price: "£9", image: "a3.jpeg" },
  { id: 4, name: "Beef Tehari", category: "Biriyani", price: "£8", image: "a4.jpeg" },
  { id: 5, name: "Chicken Biriyani", category: "Biriyani", price: "£8", image: "a5.jpeg" },
  { id: 6, name: "Biya Bari Platter - 1", category: "Platters", price: "£12", image: "a6.jpeg" },
  { id: 7, name: "Ilish Fish (2pcs)", category: "Curry's", price: "£10", image: "a7.jpeg" },
  { id: 8, name: "Rupchada Fish", category: "Curry's", price: "£7", image: "a8.jpeg" },
  { id: 9, name: "Milk Egg Pudding (5pcs)", category: "Desserts", price: "£8", image: "a9.jpeg" },
  { id: 10, name: "Nawabi Shemai (5pcs)", category: "Desserts", price: "£6", image: "a10.jpeg" },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your vibe today?",
    options: [
      { text: "Fancy & Aromatic", value: "biriyani" },
      { text: "Simple & Satisfying", value: "platter" },
      { text: "Fresh & Seafood", value: "curry" },
      { text: "Sweet & Indulgent", value: "dessert" },
    ],
  },
  {
    id: 2,
    question: "How adventurous are you?",
    options: [
      { text: "Classic Favourites", value: "classic" },
      { text: "Premium & Special", value: "premium" },
      { text: "Try Anything", value: "anything" },
    ],
  },
  {
    id: 3,
    question: "Eating solo or sharing?",
    options: [
      { text: "Just for me", value: "single" },
      { text: "With my squad", value: "shared" },
    ],
  },
];

const RECOMMENDATIONS = {
  biriyani: {
    classic: { dish: DISHES[1], message: "Timeless. Every grain counts. ✨" },
    premium: { dish: DISHES[0], message: "Our signature. Bonna's take on perfection." },
    anything: { dish: DISHES[4], message: "Golden, aromatic, pure comfort." },
  },
  platter: {
    classic: { dish: DISHES[5], message: "Everything on one plate. The OG." },
    premium: { dish: DISHES[5], message: "Mix of textures. Mix of love." },
    anything: { dish: DISHES[5], message: "Feast mode unlocked." },
  },
  curry: {
    classic: { dish: DISHES[8], message: "Fresh catch, slow cooked, pure heaven." },
    premium: { dish: DISHES[7], message: "Rupchada — Bonna's fish legend." },
    anything: { dish: DISHES[6], message: "Ilish. Bengali gold on your plate." },
  },
  dessert: {
    classic: { dish: DISHES[8], message: "Creamy. Dreamy. Bonna's way." },
    premium: { dish: DISHES[9], message: "Nawabi Shemai — fit for royalty." },
    anything: { dish: DISHES[8], message: "Sweet ending, lasting memory." },
  },
};

function FlavorQuiz({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Generate recommendation
      const vibe = newAnswers[0];
      const level = newAnswers[1] || "classic";
      const rec = RECOMMENDATIONS[vibe][level];
      setRecommendation(rec);
    }
  };

  if (recommendation) {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 rounded-2xl overflow-hidden border border-gold-dust h-64">
          <img src={recommendation.dish.image} alt={recommendation.dish.name} className="w-full h-full object-cover" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-cream mb-2">{recommendation.dish.name}</h3>
        <p className="text-pink-bonnas text-lg font-medium mb-4">{recommendation.message}</p>
        <p className="text-sand text-sm mb-6">{recommendation.dish.category} • {recommendation.dish.price}</p>

        <a
          href="https://wa.me/447912795556?text=Hi%20Bonna's!%20I'd%20like%20to%20order%20the%20{recommendation.dish.name}"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-pink-bonnas text-night px-8 py-3 rounded-full font-semibold hover:bg-pink-dark transition-colors mb-4"
        >
          Order on WhatsApp
        </a>

        <button
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setRecommendation(null);
            onComplete();
          }}
          className="block mx-auto text-pink-bonnas text-sm hover:underline"
        >
          Try another quiz
        </button>
      </motion.div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQ];

  return (
    <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <div className="flex gap-1 mb-4">
          {QUIZ_QUESTIONS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentQ ? "bg-pink-bonnas" : "bg-gold-dust"}`}
            />
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-cream">{question.question}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="text-left p-4 rounded-xl border border-gold-dust bg-night hover:border-pink-bonnas hover:bg-night transition-colors text-cream font-medium text-sm"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function SpiceRoulette({ onComplete }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    const randomDish = DISHES[Math.floor(Math.random() * DISHES.length)];
    const randomRotation = Math.random() * 360 + 720;

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${randomRotation}deg)`;
      wheelRef.current.style.transition = "transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }

    setTimeout(() => {
      setWinner(randomDish);
      setIsSpinning(false);
    }, 3000);
  };

  if (winner) {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 rounded-2xl overflow-hidden border border-gold-dust h-64">
          <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-cream mb-2">🎉 You got lucky!</h3>
        <p className="text-pink-bonnas text-xl font-bold mb-2">{winner.name}</p>
        <p className="text-sand text-sm mb-6">{winner.category} • {winner.price}</p>

        <a
          href={`https://wa.me/447912795556?text=Hi%20Bonna's!%20The%20wheel%20picked%20${winner.name.replace(/\s/g, "%20")}%20for%20me!`}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-pink-bonnas text-night px-8 py-3 rounded-full font-semibold hover:bg-pink-dark transition-colors mb-4"
        >
          Order on WhatsApp
        </a>

        <button
          onClick={() => {
            setWinner(null);
            onComplete();
          }}
          className="block mx-auto text-pink-bonnas text-sm hover:underline"
        >
          Spin again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-8 relative w-64 h-64">
        <svg className="absolute inset-0" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          {/* Pointer */}
          <polygon points="200,20 180,60 220,60" fill="#F2A8B5" />

          {/* Wheel background */}
          <circle cx="200" cy="200" r="180" fill="#1E160D" stroke="#F2A8B5" strokeWidth="3" />
        </svg>

        <div
          ref={wheelRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `conic-gradient(
              #F2A8B5 0deg 36deg,
              #E89AAA 36deg 72deg,
              #DC8699 72deg 108deg,
              #D0728E 108deg 144deg,
              #C45E83 144deg 180deg,
              #B84A78 180deg 216deg,
              #AC366D 216deg 252deg,
              #A02262 252deg 288deg,
              #940E57 288deg 324deg,
              #881A5C 324deg 360deg
            )`,
            borderRadius: "50%",
            width: "320px",
            height: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#0D0A07",
          }}
        >
          {DISHES.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                transform: `rotate(${(idx * 36 + 18)}deg) translateY(-140px) rotate(${-(idx * 36 + 18)}deg)`,
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="bg-pink-bonnas text-night px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-dark transition-colors disabled:opacity-50"
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>

      <p className="text-sand text-sm mt-4">What will the wheel pick for you?</p>
    </motion.div>
  );
}

export default function InteractiveHub() {
  const [activeTab, setActiveTab] = useState("quiz");
  const [showGame, setShowGame] = useState(true);

  return (
    <section id="interactive" className="py-20 px-6 md:px-20 bg-ember">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Find Your Perfect Dish</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">What's Your Flavour Today?</h2>
          <p className="text-sand text-sm mt-2">Pick a vibe, get a recommendation, order on WhatsApp</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-3 mb-10 justify-center"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <button
            onClick={() => {
              setActiveTab("quiz");
              setShowGame(true);
            }}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
              activeTab === "quiz"
                ? "bg-pink-bonnas text-night"
                : "bg-night border border-gold-dust text-cream hover:border-pink-bonnas"
            }`}
          >
            Flavour Quiz
          </button>
          <button
            onClick={() => {
              setActiveTab("roulette");
              setShowGame(true);
            }}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
              activeTab === "roulette"
                ? "bg-pink-bonnas text-night"
                : "bg-night border border-gold-dust text-cream hover:border-pink-bonnas"
            }`}
          >
            Spice Roulette
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-night border border-gold-dust rounded-2xl p-8 md:p-10"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          {showGame && activeTab === "quiz" && (
            <FlavorQuiz onComplete={() => setShowGame(false)} />
          )}
          {showGame && activeTab === "roulette" && (
            <SpiceRoulette onComplete={() => setShowGame(false)} />
          )}
          {!showGame && (
            <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sand mb-4">Ready for another round?</p>
              <button
                onClick={() => setShowGame(true)}
                className="bg-pink-bonnas text-night px-8 py-3 rounded-full font-semibold hover:bg-pink-dark transition-colors"
              >
                Yes, let's go again
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          className="text-center mt-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-sand text-sm">Or message us directly</p>
          <a
            href="https://wa.me/447912795556"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
          >
            Open WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}