"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Clock, Award } from "lucide-react";
import { useRouter } from "next/navigation";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Card set (16 cards = 8 pairs)
const CARD_EMOJIS = ["🐶", "🐱", "🦊", "🐸", "🐵", "🐼", "🦁", "🐯"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryFlipPage(): JSX.Element {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();

  // 🎵 Sound effects
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const victorySound = useRef<HTMLAudioElement | null>(null);
  const gameOverSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    wrongSound.current = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    correctSound.current = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");
    victorySound.current = new Audio("https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg");
    gameOverSound.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

    [wrongSound, correctSound, victorySound, gameOverSound].forEach(ref => {
      if (ref.current) ref.current.volume = 1.0;
    });
  }, []);

  // Shuffle + init game
  const initGame = useCallback(() => {
    const deck = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(deck);
    setFlippedCards([]);
    setMatchedCount(0);
    setXpEarned(0);
    setGameOver(false);
    setVictory(false);
    setTimeLeft(120);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      gameOverSound.current?.play();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, victory, gameStarted]);

  // Flip
  const flipCard = (card: Card) => {
    if (!gameStarted) return;
    if (flippedCards.length === 2 || card.flipped || card.matched) return;

    const updated = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(updated);
    setFlippedCards([...flippedCards, { ...card, flipped: true }]);
  };

  // Check match
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [a, b] = flippedCards;
      if (a.emoji === b.emoji) {
        correctSound.current?.play();
        const updated = cards.map((c) =>
          c.emoji === a.emoji ? { ...c, matched: true } : c
        );
        setCards(updated);
        setMatchedCount((m) => m + 1);
        setXpEarned((xp) => xp + 4);
        setFlippedCards([]);
      } else {
        wrongSound.current?.play();
        setTimeout(() => {
          const updated = cards.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
          );
          setCards(updated);
          setFlippedCards([]);
        }, 800);
      }
    }
  }, [flippedCards, cards]);

  // Save XP at victory
  const saveXp = async (earned: number) => {
    if (!wallet) {
      console.warn("⚠️ No wallet connected, skipping XP save.");
      return;
    }
    try {
      const { data, error } = await supabase.rpc("increment_xp", {
        wallet_input: wallet,
        inc: earned,
      });
      if (error) {
        console.error("❌ XP save error:", error);
      } else {
        console.log("✅ XP saved, new XP:", data);
      }
    } catch (err) {
      console.error("🔥 Unexpected saveXp error:", err);
    }
  };

  // Victory
  useEffect(() => {
    if (matchedCount === CARD_EMOJIS.length) {
      setVictory(true);
      victorySound.current?.play();
      saveXp(xpEarned);
    }
  }, [matchedCount, xpEarned]);

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-yellow-900 text-yellow-100">
      <Topbar />
      <AudioPlayer />

      {/* Wallet */}
      <div className="absolute top-4 right-4">
        <ConnectWallet
          onProfileUpdate={(profile: any) => {
            setUserId(profile?.id || null);
            setWallet(profile?.wallet || null);
          }}
        />
      </div>

      

      {/* Description */}
      <div className="text-center px-6 pt-20 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-3 text-yellow-400">
          🧠 Memory Flip Game
        </h1>
        <p className="text-yellow-200/80 leading-relaxed font-medium text-lg">
          Match all the cards before the <b>2-minute timer</b> runs out!  
          Each correct match earns you <b>+4 XP</b>.  
          You must match <b>all 16 cards (8 pairs)</b> to finish and earn up to{" "}
          <span className="text-yellow-400 font-bold">32 XP</span>.
        </p>
      </div>

      {/* Timer */}
      {gameStarted && (
        <div className="flex justify-center mt-6 mb-4">
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-xl border border-yellow-400/30">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-semibold">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {/* Start button */}
{!gameStarted && !victory && !gameOver && (
  <div className="flex justify-center mt-8">
    <button
      onClick={() => setGameStarted(true)}
      disabled={!wallet}
      className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition 
        ${wallet
          ? "bg-yellow-500 text-black hover:bg-yellow-400"
          : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }`}
    >
      {wallet ? "Start Game" : "Connect Wallet to Start"}
    </button>
  </div>
)}


      {/* Game board */}
      {gameStarted && (
        <div className="flex justify-center mt-6">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  className={`w-20 h-28 md:w-24 md:h-32 rounded-xl cursor-pointer flex items-center justify-center text-4xl font-bold ${
                    card.flipped || card.matched
                      ? "bg-black text-yellow-300"
                      : "bg-yellow-200 text-yellow-200"
                  }`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => flipCard(card)}
                >
                  {card.flipped || card.matched ? card.emoji : "❓"}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* XP */}
      {gameStarted && (
        <div className="mt-6 text-center">
          <div className="flex justify-center items-center gap-2 text-yellow-300 font-bold">
            <Award className="w-5 h-5" />
            XP Earned: {xpEarned}
          </div>
        </div>
      )}

      {/* Victory / Game Over popup */}
      {(victory || gameOver) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-3xl text-center shadow-2xl max-w-sm">
            <h2 className="text-2xl font-extrabold text-black mb-4">
              {victory ? "🎉 Congratulations!" : "⏰ Time’s Up!"}
            </h2>
            <p className="text-black mb-6 font-medium">
              {victory
                ? `You matched all cards and earned ${xpEarned} XP!`
                : "Game Over! Try again to beat the timer."}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={initGame}
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
              >
                Restart
              </button>
              <button
                onClick={() => router.push("/games")}
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

