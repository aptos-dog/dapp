"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/app/game-hub/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Award, Zap, ArrowLeft, Crown, TimerReset } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Supabase client (same setup as other games) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Game tuning constants ---
const ROUND_TIME = 30; // seconds per game
const XP_PER_TAP = 2; // +2 per tap

// Combo (visual only) – resets if no tap within this window (ms)
const COMBO_RESET_MS = 700;

// Popup lifespan (ms)
const POPUP_LIFE = 700;

// Particle count per tap
const PARTICLES = 10;

// Minimal-latency SFX pool size for overlapping taps
const TAP_SFX_POOL = 12;

// Very short/focused tap sound to keep up with fast tapping
const TAP_SFX_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
const END_SFX_URL = "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";

type Popup = { id: number; x: number; y: number; text: string };
type Particle = { id: number; angle: number; dist: number };

export default function QuickTapPage(): JSX.Element {
  const router = useRouter();

  // Wallet/User
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Game state
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  // FX / UI state
  const [flashToggle, setFlashToggle] = useState(false); // quick color flash
  const [popups, setPopups] = useState<Popup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs
  const popupId = useRef(0);
  const particleId = useRef(0);
  const coinRef = useRef<HTMLDivElement | null>(null);

  // Sounds: create a small pool for zero-lag rapid taps
  const tapPool = useRef<HTMLAudioElement[]>([]);
  const tapIndex = useRef(0);
  const sEnd = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tapPool.current = Array.from({ length: TAP_SFX_POOL }, () => {
      const a = new Audio(TAP_SFX_URL);
      a.volume = 0.9;
      return a;
    });
    sEnd.current = new Audio(END_SFX_URL);
    if (sEnd.current) sEnd.current.volume = 1.0;
  }, []);

  // Init/reset
  const initGame = useCallback(() => {
    setGameStarted(false);
    setRoundOver(false);
    setScore(0);
    setXpEarned(0);
    setTimeLeft(ROUND_TIME);
    setCombo(0);
    setPopups([]);
    setParticles([]);
    if (comboTimer.current) {
      clearTimeout(comboTimer.current);
      comboTimer.current = null;
    }
  }, []);

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
      setTimeLeft((v) => v - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [gameStarted, roundOver, timeLeft]);

  // Tap handler (Notcoin-inspired)
  const onTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!gameStarted || roundOver) return;

    // sound (pool)
    const pool = tapPool.current;
    if (pool.length) {
      pool[tapIndex.current]?.currentTime && (pool[tapIndex.current].currentTime = 0);
      pool[tapIndex.current]?.play();
      tapIndex.current = (tapIndex.current + 1) % pool.length;
    }

    // score/xp
    setScore((s) => s + 1);
    setXpEarned((x) => x + XP_PER_TAP);

    // combo
    setCombo((c) => c + 1);
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), COMBO_RESET_MS);

    // flash
    setFlashToggle((t) => !t);

    // floating "+2 XP" popup near coin center
    const coin = coinRef.current;
    if (coin) {
      // place popups around center with small random offset
      const rect = coin.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const jitterX = (Math.random() - 0.5) * rect.width * 0.2;
      const jitterY = (Math.random() - 0.5) * rect.height * 0.2;

      popupId.current += 1;
      const id = popupId.current;
      setPopups((prev) => [
        ...prev,
        { id, x: centerX + jitterX, y: centerY + jitterY, text: `+${XP_PER_TAP} XP` },
      ]);
      setTimeout(
        () => setPopups((prev) => prev.filter((p) => p.id !== id)),
        POPUP_LIFE
      );
    }

    // tiny particles burst
    const burst: Particle[] = Array.from({ length: PARTICLES }, () => {
      particleId.current += 1;
      return {
        id: particleId.current,
        angle: Math.random() * Math.PI * 2,
        dist: 40 + Math.random() * 60,
      };
    });
    setParticles((prev) => [...prev, ...burst]);
    setTimeout(
      () =>
        setParticles((prev) =>
          prev.filter((p) => !burst.find((b) => b.id === p.id))
        ),
      400
    );
  };

  // Save XP to Supabase when game ends (accumulative update)
useEffect(() => {
  if (!roundOver || !wallet || xpEarned <= 0) return;
  (async () => {
    try {
      // fetch current XP
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("xp")
        .eq("wallet", wallet)
        .single();

      if (fetchError) {
        console.error("❌ Failed to fetch XP:", fetchError);
        return;
      }

      const currentXp = profile?.xp || 0;
      const newXp = currentXp + xpEarned;

      // update XP
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ xp: newXp })
        .eq("wallet", wallet);

      if (updateError) {
        console.error("❌ Failed to update XP:", updateError);
      } else {
        console.log(`✅ XP updated: ${currentXp} + ${xpEarned} = ${newXp}`);
      }
    } catch (err) {
      console.error("🔥 Save XP error:", err);
    }
  })();
}, [roundOver, wallet, xpEarned]);


  const onStart = useCallback(() => {
    if (!wallet) return;
    if (roundOver) initGame();
    setGameStarted(true);
  }, [wallet, roundOver, initGame]);

  const timePercent = Math.max(0, Math.min(100, (timeLeft / ROUND_TIME) * 100));

  // Combo label by tiers
  const comboLabel = useMemo(() => {
    if (combo >= 30) return "INSANE!";
    if (combo >= 20) return "AMAZING!";
    if (combo >= 10) return "GREAT!";
    if (combo >= 5) return "GOOD!";
    return "";
  }, [combo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f0f0f] to-yellow-800 text-yellow-100 pb-16 overflow-hidden">
      <Topbar />

      {/* Back */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900 shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Wallet connect */}
      <div className="absolute top-4 right-4 z-30">
        <ConnectWallet
          onProfileUpdate={(profile: any) => {
            setUserId(profile?.id || null);
            setWallet(profile?.wallet || null);
          }}
        />
      </div>

      <AudioPlayer />

      {/* Header */}
      <div className="pt-20 px-6 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.5)]"
        >
          Quick Tap 
        </motion.h1>
        <p className="mt-2 text-yellow-200/90 font-medium">
          Tap the giant coin as fast as you can before the timer runs out!
        </p>
        <p className="text-yellow-100/80 text-sm">
          Each tap earns <b>{XP_PER_TAP} XP</b>. You have <b>{ROUND_TIME}s</b>.
        </p>
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-6">
        {!gameStarted && !roundOver && (
          <button
            onClick={onStart}
            disabled={!wallet}
            className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition
              ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
          >
            {wallet ? "Start Game" : "Connect Wallet to Start"}
          </button>
        )}
      </div>

      {/* HUD */}
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-yellow-400/20">
          <TimerReset className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-yellow-400/20">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Taps: {score}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-yellow-400/20">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">XP: {xpEarned}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-yellow-400/20">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Combo: {combo}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative mt-6 max-w-3xl h-[560px] md:h-[620px] mx-auto rounded-3xl shadow-2xl bg-gradient-to-b from-yellow-200 to-yellow-300 ring-1 ring-yellow-200 overflow-hidden flex items-center justify-center">
        {/* Time bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-100/70">
          <div className="h-full bg-black" style={{ width: `${Math.max(0, Math.min(100, (timeLeft / ROUND_TIME) * 100))}%` }} />
        </div>

        {/* Peripheral soft glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_55%)]" />

        {/* Center Coin */}
        {gameStarted && !roundOver && (
          <motion.div
            ref={coinRef}
            onClick={onTap}
            onTouchStart={onTap}
            whileTap={{ scale: 0.92, rotate: flashToggle ? 0.3 : -0.3 }}
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: flashToggle
                ? "0 0 0 0 rgba(0,0,0,0)"
                : "0 0 60px 10px rgba(255, 221, 0, 0.45)",
              background:
                flashToggle
                  ? "radial-gradient(circle at 30% 30%, #FFD54F, #F59E0B 55%, #B45309)"
                  : "radial-gradient(circle at 70% 40%, #FFE082, #FBBF24 55%, #B45309)",
              borderColor: flashToggle ? "#FCD34D" : "#F59E0B",
            }}
            transition={{ duration: 0.2, ease: "easeOut", repeat: 0 }}
            className="relative w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full border-[10px] md:border-[14px] border-yellow-600 flex items-center justify-center cursor-pointer select-none"
          >
            {/* Logo in coin */}
            <img
              src="https://i.postimg.cc/wjCFMXdp/APTDOG.png"
              alt="APTDOG Coin"
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-contain pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
            />

            {/* Subtle rotating sheen */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.18))",
                mixBlendMode: "soft-light",
              }}
            />

            {/* Thin inner ring */}
            <div className="absolute inset-3 md:inset-4 rounded-full border-2 md:border-4 border-yellow-200/60" />
          </motion.div>
        )}

        {/* Floating +XP popups */}
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, opacity: 0, scale: 0.8 }}
              animate={{ y: p.y - 60, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: p.y - 100 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="pointer-events-none fixed z-50"
            >
              <div className="px-2 py-1 rounded-md bg-black/70 text-yellow-300 font-bold text-sm shadow">
                +{XP_PER_TAP} XP
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tiny particle burst */}
        <AnimatePresence>
          {particles.map((prt) => {
            const dx = Math.cos(prt.angle) * prt.dist;
            const dy = Math.sin(prt.angle) * prt.dist;
            return (
              <motion.span
                key={prt.id}
                initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                animate={{ x: dx, y: dy, opacity: 0, scale: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full bg-yellow-600 shadow-[0_0_12px_rgba(255,199,0,0.7)]"
                style={{ top: "50%", left: "50%" }}
              />
            );
          })}
        </AnimatePresence>

        {/* Combo banner */}
        <AnimatePresence>
          {comboLabel && (
            <motion.div
              key={comboLabel}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-2xl border border-yellow-400/30 text-yellow-200 font-extrabold tracking-wide"
            >
              {comboLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Round Over Modal */}
      {roundOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur z-50">
          <div className="bg-yellow-300 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4 ring-1 ring-yellow-200">
            <h2 className="text-2xl font-extrabold text-black mb-2">Time’s up! 🐶</h2>
            <div className="grid grid-cols-3 gap-3 text-black font-semibold my-4">
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Taps</div>
                <div className="text-xl">{score}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Best Combo</div>
                <div className="text-xl">{combo}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">XP Earned</div>
                <div className="text-xl">{xpEarned}</div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={initGame}
                className="px-4 py-2 rounded-xl bg-black text-yellow-300 font-semibold hover:bg-gray-900"
              >
                New Game
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
                {wallet ? "Play Again" : "Connect Wallet"}
              </button>
            </div>
            <p className="text-xs text-black/80 mt-3">
              XP saves to your profile automatically when the game ends.
            </p>
          </div>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
