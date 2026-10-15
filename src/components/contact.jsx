import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";

// All dishes for random recommendations
const ALL_DISHES = [
  { id: 1, name: "Fried Rice with Tandoori Chicken & Salad", image: "/photos/a1.jpeg" },
  { id: 2, name: "Meat Samosa", image: "/photos/a2.jpeg" },
  { id: 3, name: "Fruit Faluda", image: "/photos/a3.jpeg" },
  { id: 4, name: "Gulaab Jamun", image: "/photos/a4.jpeg" },
  { id: 5, name: "Potato Singara", image: "/photos/a5.jpeg" },
  { id: 6, name: "Shikh Kabab", image: "/photos/a6.jpeg" },
  { id: 7, name: "Fish Curry", image: "/photos/a7.jpeg" },
  { id: 8, name: "Dum Biriyani", image: "/photos/a8.jpeg" },
  { id: 9, name: "Chicken Mom's", image: "/photos/a9.jpeg" },
  { id: 10, name: "Chicken Wings", image: "/photos/a10.jpeg" },
];

// Memory game cards (6 pairs)
const MEMORY_CARDS = [
  { id: 1, name: "Fried Rice with Tandoori Chicken & Salad", image: "/photos/a1.jpeg", pairId: 1 },
  { id: 2, name: "Meat Samosa", image: "/photos/a2.jpeg", pairId: 2 },
  { id: 3, name: "Fruit Faluda", image: "/photos/a3.jpeg", pairId: 3 },
  { id: 4, name: "Gulaab Jamun", image: "/photos/a4.jpeg", pairId: 4 },
  { id: 5, name: "Potato Singara", image: "/photos/a5.jpeg", pairId: 5 },
  { id: 6, name: "Shikh Kabab", image: "/photos/a6.jpeg", pairId: 6 },
  // Duplicates for pairs
  { id: 7, name: "Fried Rice with Tandoori Chicken & Salad", image: "/photos/a1.jpeg", pairId: 1 },
  { id: 8, name: "Meat Samosa", image: "/photos/a2.jpeg", pairId: 2 },
  { id: 9, name: "Fruit Faluda", image: "/photos/a3.jpeg", pairId: 3 },
  { id: 10, name: "Gulaab Jamun", image: "/photos/a4.jpeg", pairId: 4 },
  { id: 11, name: "Potato Singara", image: "/photos/a5.jpeg", pairId: 5 },
  { id: 12, name: "Shikh Kabab", image: "/photos/a6.jpeg", pairId: 6 },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your vibe today?",
    options: [
      { text: "Fancy & Aromatic", value: "fancy" },
      { text: "Simple & Satisfying", value: "simple" },
      { text: "Fresh & Seafood", value: "seafood" },
      { text: "Sweet & Indulgent", value: "sweet" },
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
];

function FlavorQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);

  const getRandomDish = () => {
    return ALL_DISHES[Math.floor(Math.random() * ALL_DISHES.length)];
  };

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const dish = getRandomDish();
      setRecommendation({ dish, message: "Your perfect match awaits! ✨" });
    }
  };

  if (recommendation) {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 rounded-2xl overflow-hidden border border-gold-dust h-48">
          <img src={recommendation.dish.image} alt={recommendation.dish.name} className="w-full h-full object-cover" />
        </div>

        <h3 className="text-xl font-bold text-cream mb-2">{recommendation.dish.name}</h3>
        <p className="text-pink-bonnas text-lg font-medium mb-4">{recommendation.message}</p>

        <a
          href={`https://wa.me/447912795556?text=Hi%20Bonna's!%20I'd%20like%20to%20order%20${recommendation.dish.name.replace(/\s/g, "%20")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-pink-bonnas text-night px-6 py-2 rounded-full font-semibold hover:bg-pink-dark transition-colors text-sm"
        >
          Order on WhatsApp
        </a>

        <button
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setRecommendation(null);
          }}
          className="block mx-auto text-pink-bonnas text-xs hover:underline mt-3"
        >
          Try another quiz
        </button>
      </motion.div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQ];

  return (
    <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <div className="flex gap-1 mb-3">
          {QUIZ_QUESTIONS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentQ ? "bg-pink-bonnas" : "bg-gold-dust"}`}
            />
          ))}
        </div>
        <h3 className="text-lg md:text-xl font-bold text-cream">{question.question}</h3>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="text-left p-3 rounded-lg border border-gold-dust bg-night hover:border-pink-bonnas hover:bg-night transition-colors text-cream font-medium text-sm"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState(new Set());
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const timerRef = useRef(null);

  // Initialize game
  useEffect(() => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped(new Set());
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setGameWon(false);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameWon && cards.length > 0) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameWon, cards.length]);

  const handleCardClick = (index) => {
    if (flipped.has(index) || matched.has(index) || gameWon) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(index);
    setFlipped(newFlipped);

    if (newFlipped.size === 2) {
      const [first, second] = Array.from(newFlipped);
      setMoves(moves + 1);

      if (cards[first].pairId === cards[second].pairId) {
        const newMatched = new Set(matched);
        newMatched.add(first);
        newMatched.add(second);
        setMatched(newMatched);
        setFlipped(new Set());

        if (newMatched.size === MEMORY_CARDS.length) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => setFlipped(new Set()), 600);
      }
    }
  };

  const resetGame = () => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped(new Set());
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setGameWon(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameWon) {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <h3 className="text-3xl font-bold text-pink-bonnas mb-4">🎉 You Won!</h3>
        <div className="bg-night border border-gold-dust rounded-xl p-4 mb-6">
          <p className="text-cream text-sm mb-2">⏱️ Time: <span className="font-bold text-pink-bonnas">{formatTime(time)}</span></p>
          <p className="text-cream text-sm">🎮 Moves: <span className="font-bold text-pink-bonnas">{moves}</span></p>
        </div>

        <button
          onClick={resetGame}
          className="bg-pink-bonnas text-night px-6 py-2 rounded-full font-semibold hover:bg-pink-dark transition-colors text-sm mb-3"
        >
          Play Again
        </button>
        <p className="text-sand text-xs">Ready for a new challenge?</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="text-cream">
          ⏱️ <span className="font-bold text-pink-bonnas">{formatTime(time)}</span>
        </div>
        <h3 className="font-bold text-cream">Memory Game</h3>
        <div className="text-cream">
          🎮 <span className="font-bold text-pink-bonnas">{moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {cards.map((card, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleCardClick(idx)}
            className="relative h-24 rounded-lg overflow-hidden border-2 border-gold-dust bg-night hover:border-pink-bonnas transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {flipped.has(idx) || matched.has(idx) ? (
              <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-center p-1">
                  <p className="text-cream text-xs text-center font-bold line-clamp-2">{card.name}</p>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-bonnas to-pink-dark flex items-center justify-center">
                <span className="text-2xl">🍲</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="w-full bg-pink-bonnas text-night py-2 rounded-lg font-semibold hover:bg-pink-dark transition-colors text-sm"
      >
        Reset Game
      </button>
    </motion.div>
  );
}

export default function InteractiveHub() {
  return (
    <section id="interactive" className="py-20 px-6 md:px-20 bg-ember">
      <div className="max-w-6xl mx-auto">
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
          <p className="text-sand text-sm mt-2">Play our games and discover your next favourite dish!</p>
        </motion.div>

        {/* Two Games Side by Side */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          {/* Quiz */}
          <div className="bg-night border border-gold-dust rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-cream mb-6 text-center">✨ Flavour Quiz</h3>
            <FlavorQuiz />
          </div>

          {/* Memory Game */}
          <div className="bg-night border border-gold-dust rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-cream mb-6 text-center">🎮 Memory Game</h3>
            <MemoryGame />
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          className="text-center mt-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-sand text-sm mb-4">Or message us directly on WhatsApp</p>
          <a
            href="https://wa.me/447912795556"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
          >
            💬 Open WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}