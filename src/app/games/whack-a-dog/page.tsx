"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Award, Zap, ArrowLeft, TimerReset, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Supabase client (same as Word Guess & Tower Stack) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Game tuning constants ---
const NUM_HOLES = 9;           // number of holes
const ROUND_TIME = 45;         // seconds
const DOG_VISIBLE_TIME = 1200; // ms logo stays visible
const SPAWN_INTERVAL = 900;    // ms between spawns
const XP_PER_HIT = 2;          // ✅ exactly 2 XP per tap
const XP_COMBO_BONUS = 0;      // ✅ no extra XP from combos

// Random helper
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function WhackADogPage(): JSX.Element {
  const router = useRouter();

  // Wallet/User
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  // Holes state
  const [holes, setHoles] = useState<boolean[]>(Array(NUM_HOLES).fill(false));
  const activeTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Sounds
  const sWhack = useRef<HTMLAudioElement | null>(null);
  const sMiss = useRef<HTMLAudioElement | null>(null);
  const sSpawn = useRef<HTMLAudioElement | null>(null);
  const sEnd = useRef<HTMLAudioElement | null>(null);

  // Init sounds
  useEffect(() => {
    sWhack.current = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    sMiss.current  = new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg");
    sSpawn.current = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    sEnd.current   = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

    [sWhack, sMiss, sSpawn, sEnd].forEach(ref => {
      if (ref.current) ref.current.volume = 1.0;
    });
  }, []);

  // Start round
  const initRound = useCallback(() => {
    setGameStarted(false);
    setRoundOver(false);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setXpEarned(0);
    setTimeLeft(ROUND_TIME);
    setHoles(Array(NUM_HOLES).fill(false));

    // clear pending timeouts
    activeTimeouts.current.forEach(t => clearTimeout(t));
    activeTimeouts.current = [];
  }, []);

  // Spawn logos
  const spawnDog = useCallback(() => {
    if (!gameStarted || roundOver) return;
    const holeIndex = randInt(0, NUM_HOLES - 1);

    setHoles(prev => {
      if (prev[holeIndex]) return prev; // already occupied
      const newHoles = [...prev];
      newHoles[holeIndex] = true;
      return newHoles;
    });

    sSpawn.current?.play();

    // Hide after DOG_VISIBLE_TIME
    const hideTimeout = setTimeout(() => {
      setHoles(prev => {
        const newHoles = [...prev];
        newHoles[holeIndex] = false;
        return newHoles;
      });
    }, DOG_VISIBLE_TIME);
    activeTimeouts.current.push(hideTimeout);
  }, [gameStarted, roundOver]);

  // Handle whack
  const onWhack = (idx: number) => {
    if (!gameStarted || roundOver) return;
    if (!holes[idx]) {
      sMiss.current?.play();
      setCombo(0);
      return;
    }

    // Hit!
    sWhack.current?.play();
    setScore(s => s + 1);
    setCombo(c => {
      const nc = c + 1;
      setBestCombo(b => Math.max(b, nc));
      return nc;
    });
    setXpEarned(x => x + XP_PER_HIT + (combo > 0 ? XP_COMBO_BONUS : 0));

    setHoles(prev => {
      const newHoles = [...prev];
      newHoles[idx] = false;
      return newHoles;
    });
  };

  // Timer
  useEffect(() => {
    if (!gameStarted || roundOver) return;
    if (timeLeft <= 0) {
      setRoundOver(true);
      setGameStarted(false);
      sEnd.current?.play();
      return;
    }
    const t = setTimeout(() => {
      setTimeLeft(v => v - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [gameStarted, roundOver, timeLeft]);

  // Logo spawn loop
  useEffect(() => {
    if (!gameStarted || roundOver) return;
    const interval = setInterval(spawnDog, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameStarted, roundOver, spawnDog]);

  // Save XP via Supabase when round ends
  useEffect(() => {
    if (!roundOver || !wallet || xpEarned <= 0) return;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("increment_xp", {
          wallet_input: wallet,
          inc: xpEarned,
        });
        if (error) {
          console.error("❌ XP save error:", error);
        } else {
          console.log("✅ XP saved, new XP:", data);
        }
      } catch (err) {
        console.error("🔥 Unexpected saveXp error:", err);
      }
    })();
  }, [roundOver, wallet, xpEarned]);

  // Start handler
  const onStart = useCallback(() => {
    if (!wallet) return;
    if (roundOver) initRound();
    setGameStarted(true);
  }, [wallet, roundOver, initRound]);

  // Time progress %
  const timePercent = Math.max(0, Math.min(100, (timeLeft / ROUND_TIME) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-yellow-800 text-yellow-100 pb-16">
      <Topbar />

      {/* Back */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900 shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Wallet connect */}
      <div className="absolute top-4 right-4">
        <ConnectWallet
          onProfileUpdate={(profile: any) => {
            setUserId(profile?.id || null);
            setWallet(profile?.wallet || null);
          }}
        />
      </div>

      <AudioPlayer />

      {/* Header */}
      <div className="pt-20 px-6 max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <img
            src="https://i.postimg.cc/wjCFMXdp/APTDOG.png"
            alt="APTDOG"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-yellow-300">Whack-a-Dog</h1>
        </div>
        <p className="text-yellow-200/90 font-medium">
          Tap the cute Dog when it pops out! React quickly to rack up combos and XP.
        </p>
        <p className="text-yellow-100/80 text-sm">
          Each hit earns <b>2 XP</b>. You have <b>{ROUND_TIME}s</b>.
        </p>
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-5">
        {!gameStarted && !roundOver && (
          <button
            onClick={onStart}
            disabled={!wallet}
            className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition
              ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
          >
            {wallet ? "Start Round" : "Connect Wallet to Start"}
          </button>
        )}
      </div>

      {/* HUD */}
      <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <TimerReset className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Combo: {combo} (Best {bestCombo})</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">XP: {xpEarned}</span>
        </div>
      </div>

      {/* Game Area Card (Yellow Box) */}
      <div className="mt-6 max-w-xl mx-auto rounded-3xl shadow-2xl bg-yellow-300 p-6 ring-1 ring-yellow-200">
        {/* Time bar */}
        <div className="w-full h-2 rounded-full bg-yellow-200 overflow-hidden mb-4">
          <div
            className="h-full bg-black"
            style={{ width: `${timePercent}%` }}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4">
          {holes.map((active, idx) => (
            <div
              key={idx}
              onClick={() => onWhack(idx)}
              className="aspect-square bg-black/40 rounded-2xl flex items-center justify-center cursor-pointer select-none shadow-inner"
            >
              <AnimatePresence>
                {active && (
                  <motion.img
                    src="https://i.postimg.cc/wjCFMXdp/APTDOG.png"
                    alt="APTDOG"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="w-16 h-16 object-contain"
                    draggable={false}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Round Over Modal (Yellow theme) */}
      {roundOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-yellow-300 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4 ring-1 ring-yellow-200">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src="https://i.postimg.cc/wjCFMXdp/APTDOG.png"
                alt="APTDOG"
                className="w-8 h-8 object-contain"
              />
              <h2 className="text-2xl font-extrabold text-black">
                Round Over
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 text-black font-semibold my-4">
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Score</div>
                <div className="text-xl">{score}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Best Combo</div>
                <div className="text-xl">{bestCombo}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">XP Earned</div>
                <div className="text-xl">{xpEarned}</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={initRound}
                className="px-4 py-2 rounded-xl bg-black text-yellow-300 font-semibold hover:bg-gray-900"
              >
                New Round
              </button>
              <button
                onClick={() => router.push("/games")}
                className="px-4 py-2 rounded-xl bg-black text-yellow-300 font-semibold hover:bg-gray-900"
              >
                Exit
              </button>
              <button
                onClick={onStart}
                disabled={!wallet}
                className={`px-4 py-2 rounded-xl font-semibold shadow
                  ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
              >
                {wallet ? "Start Again" : "Connect Wallet"}
              </button>
            </div>

            <p className="text-xs text-black/80 mt-3">
              XP adds up to your profile automatically when the round ends.
            </p>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-10" />
    </div>
  );
}
