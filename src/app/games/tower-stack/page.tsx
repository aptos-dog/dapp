"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Award, Zap, ArrowLeft, TimerReset, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Supabase client (same approach as your Word Guess) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Game tuning constants ---
const BLOCK_H = 24;                 // Height of each block (px)
const START_BLOCK_W_RATIO = 0.65;   // Start block width as % of canvas width
const BASE_SPEED = 1.6;             // Base px/frame
const SPEED_RAMP = 0.035;           // Extra speed per placed block
const PERFECT_THRESH = 3;           // ≤ px offset counts as "perfect"
const MIN_BLOCK_W = 16;             // Game over when next width < this
const XP_PER_LAYER = 10;            // XP for each successful stack
const XP_PERFECT_BONUS = 5;         // Extra XP for perfect stacks
const ROUND_TIME = 60;              // Optional hard timer (seconds)

// Simple helper
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Layer = {
  x: number;        // left
  w: number;        // width
  y: number;        // top (from canvas top)
  color: string;    // layer color
};

export default function TowerStackPage(): JSX.Element {
  const router = useRouter();

  // Wallet/User
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [score, setScore] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  // Canvas refs & sizes
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef<number>(1);

  // Tower + moving block refs (kept in refs to avoid re-render cost every frame)
  const layersRef = useRef<Layer[]>([]);
  const movingRef = useRef<{ x: number; w: number; y: number; dir: 1 | -1 } | null>(null);
  const baseXRef = useRef<number>(0); // initial travel bounds
  const boundsRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  const placedCountRef = useRef<number>(0);

  // Sounds
  const sPlace = useRef<HTMLAudioElement | null>(null);
  const sPerfect = useRef<HTMLAudioElement | null>(null);
  const sMiss = useRef<HTMLAudioElement | null>(null);
  const sTick = useRef<HTMLAudioElement | null>(null);
  const sStart = useRef<HTMLAudioElement | null>(null);
  const sCombo = useRef<HTMLAudioElement | null>(null);
  const sEnd = useRef<HTMLAudioElement | null>(null);

  // Init sounds once
  useEffect(() => {
    sPlace.current   = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_trunk_drop.ogg");
    sPerfect.current = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    sMiss.current    = new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg");
    sTick.current    = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    sStart.current   = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    sCombo.current   = new Audio("https://actions.google.com/sounds/v1/cartoon/boing.ogg");
    sEnd.current     = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");
    [
      sPlace, sPerfect, sMiss, sTick, sStart, sCombo, sEnd
    ].forEach(ref => { if (ref.current) ref.current.volume = 1.0; });
  }, []);

  // Colors per layer (brand-ish: black → yellow gradient)
  const layerColors = useMemo(() => {
    const stops = [
      "#111111", "#191919", "#222222", "#2b2b2b",
      "#3d3200", "#4d3f00", "#5a4900", "#6b5500",
      "#7a5f00", "#8a6900", "#9a7300", "#ad7f00",
      "#c18b00", "#d09700", "#e0a300", "#f0b000"
    ];
    return stops;
  }, []);

  // Resize canvas to wrapper
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    // Keep a nice aspect ratio for mobile/desktop
    const width = Math.floor(rect.width);
    const height = Math.floor(clamp(rect.height, 360, 720));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;

    // Update travel bounds for moving block (a bit inset)
    boundsRef.current = { left: 8, right: width - 8 };
  }, []);

  useEffect(() => {
    resizeCanvas();
    const obs = new ResizeObserver(resizeCanvas);
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, [resizeCanvas]);

  // Start a fresh round
  const initRound = useCallback(() => {
    setGameStarted(false);
    setRoundOver(false);
    setScore(0);
    setPerfects(0);
    setCombo(0);
    setBestCombo(0);
    setXpEarned(0);
    setTimeLeft(ROUND_TIME);

    layersRef.current = [];
    movingRef.current = null;
    placedCountRef.current = 0;

    // seed base/platform layer
    const canvas = canvasRef.current;
    if (!canvas) return;
    const widthCss = parseInt(canvas.style.width || "360", 10);
    const startW = Math.floor(widthCss * START_BLOCK_W_RATIO);
    const platformX = Math.floor((widthCss - startW) / 2);
    const groundY = Math.floor(parseInt(canvas.style.height || "560", 10) - BLOCK_H - 16);

    layersRef.current.push({
      x: platformX,
      w: startW,
      y: groundY,
      color: layerColors[0]
    });

    // prepare first moving block just above base
    movingRef.current = {
      x: boundsRef.current.left,
      w: startW,
      y: groundY - BLOCK_H,
      dir: 1
    };
  }, [layerColors]);

  // Drop the current moving block
  const drop = useCallback(() => {
    if (!gameStarted || roundOver) return;
    const moving = movingRef.current;
    const layers = layersRef.current;
    if (!moving || !layers.length) return;

    const prev = layers[layers.length - 1];
    const leftOverlap = Math.max(moving.x, prev.x);
    const rightOverlap = Math.min(moving.x + moving.w, prev.x + prev.w);
    const overlapW = rightOverlap - leftOverlap;

    // Missed completely
    if (overlapW <= 0 || overlapW < MIN_BLOCK_W) {
      sMiss.current?.play();
      endRound();
      return;
    }

    // Perfect?
    const offset = Math.abs((moving.x) - prev.x);
    const isPerfect = offset <= PERFECT_THRESH && overlapW <= prev.w;

    // New layer becomes the overlapped slice
    const newLayer: Layer = {
      x: Math.floor(leftOverlap),
      w: Math.floor(overlapW),
      y: moving.y,
      color: layerColors[(layers.length) % layerColors.length]
    };
    layers.push(newLayer);

    // Update score/combos/xp
    setScore((s) => s + 1);
    setXpEarned((xp) => xp + XP_PER_LAYER + (isPerfect ? XP_PERFECT_BONUS : 0));
    if (isPerfect) {
      setPerfects((p) => p + 1);
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((b) => Math.max(b, nc));
        if (nc > 0) sCombo.current?.play();
        return nc;
      });
      sPerfect.current?.play();
    } else {
      setCombo(0);
      sPlace.current?.play();
    }

    // Next moving block starts above the new layer
    const canvas = canvasRef.current;
    if (!canvas) return;
    const heightCss = parseInt(canvas.style.height || "560", 10);

    const nextY = Math.max(16, newLayer.y - BLOCK_H);
    movingRef.current = {
      x: boundsRef.current.left,            // restart travel at left bound
      w: newLayer.w,
      y: nextY,
      dir: 1
    };

    placedCountRef.current += 1;

    // Optional: If we reach top → you win the round
    if (nextY <= 32) {
      sEnd.current?.play();
      endRound(true);
    }
  }, [gameStarted, roundOver, layerColors]);

  // End round (+ optional "win" flag)
  const endRound = useCallback((win = false) => {
    setRoundOver(true);
    setGameStarted(false);
    if (!win) sEnd.current?.play();
  }, []);

  // Save XP via Supabase RPC when round ends (same pattern)
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

  // Animation loop
  const loop = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const widthCss = parseInt(canvas.style.width || "360", 10);
    const heightCss = parseInt(canvas.style.height || "560", 10);

    // Clear
    ctx.clearRect(0, 0, widthCss, heightCss);

    // Background gradient (black → warm yellow)
    const grad = ctx.createLinearGradient(0, 0, widthCss, heightCss);
    grad.addColorStop(0, "#000000");
    grad.addColorStop(1, "#b58900");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widthCss, heightCss);

    // Draw placed layers
    const layers = layersRef.current;
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      ctx.fillStyle = L.color;
      ctx.fillRect(L.x, L.y, L.w, BLOCK_H);
      // slight top highlight
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(L.x, L.y, L.w, 4);
    }

    // Draw moving block
    const moving = movingRef.current;
    if (moving && gameStarted && !roundOver) {
      // Move horizontally
      const speed = BASE_SPEED + placedCountRef.current * SPEED_RAMP;
      moving.x += moving.dir * speed;

      if (moving.x <= boundsRef.current.left) {
        moving.x = boundsRef.current.left;
        moving.dir = 1;
      } else if (moving.x + moving.w >= boundsRef.current.right) {
        moving.x = boundsRef.current.right - moving.w;
        moving.dir = -1;
      }

      ctx.fillStyle = "#ffd34d";
      ctx.fillRect(moving.x, moving.y, moving.w, BLOCK_H);
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(moving.x, moving.y + BLOCK_H - 3, moving.w, 3);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [gameStarted, roundOver]);

  // Mount/unmount animation loop
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loop]);

  // Timer
  useEffect(() => {
    if (!gameStarted || roundOver) return;
    if (timeLeft <= 0) {
      setRoundOver(true);
      sEnd.current?.play();
      return;
    }
    const t = setTimeout(() => {
      if (timeLeft <= 5) sTick.current?.play();
      setTimeLeft((v) => v - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [gameStarted, roundOver, timeLeft]);

  // Start handler
  const onStart = useCallback(() => {
    if (!wallet) return;
    if (roundOver) initRound();
    sStart.current?.play();
    setGameStarted(true);
  }, [wallet, roundOver, initRound]);

  // Key/tap handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop]);

  const onCanvasClick = useCallback(() => {
    drop();
  }, [drop]);

  // Initialize once
  useEffect(() => {
    initRound();
  }, [initRound]);

  const speedDisplay = useMemo(
    () => (BASE_SPEED + placedCountRef.current * SPEED_RAMP).toFixed(2),
    [placedCountRef.current]
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-yellow-700 text-yellow-100 pb-16">
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
        <h1 className="text-3xl font-extrabold text-yellow-300">🏗️ Tower Stack</h1>
        <p className="text-yellow-200/90 font-medium">
          Drop the moving block to stack it on the tower. Line it up cleanly to keep your block wide—miss and the round ends.
        </p>
        <p className="text-yellow-100/80 text-sm">
          <b>Perfect</b> drops (≤{PERFECT_THRESH}px offset) give bonus XP and build <b>combos</b>. Speed ramps up every layer. You have <b>{ROUND_TIME}s</b>.
        </p>
      </div>

      {/* Controls */}
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
          <span className="font-semibold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
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
          <span className="font-semibold">Speed: {speedDisplay}px/f</span>
        </div>
      </div>

      {/* Canvas Stage */}
      <div className="mt-6 max-w-3xl mx-auto px-4">
        <div
          ref={wrapperRef}
          className="rounded-2xl overflow-hidden border border-yellow-400/30 shadow-2xl"
          style={{ height: "60vh", minHeight: 360 }}
        >
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            className="w-full h-full cursor-pointer touch-none"
          />
        </div>

        {/* Helper */}
        <div className="text-center text-yellow-100/80 text-sm mt-3">
          Tap / Click / Press <kbd className="px-2 py-0.5 bg-black/50 rounded">Space</kbd> or <kbd className="px-2 py-0.5 bg-black/50 rounded">Enter</kbd> to drop.
        </div>
      </div>

      {/* If game already started, show a subtle pulse on canvas click target */}
      <AnimatePresence>
        {gameStarted && !roundOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0"
          >
            <div className="absolute inset-x-0 top-[calc(20vh+60px)] flex justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0.0 }}
                animate={{ scale: 1.0, opacity: 0.15 }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.2 }}
                className="w-40 h-10 bg-yellow-300 rounded-full blur-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round Over Modal */}
      {roundOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-extrabold text-black mb-2">
              {score > 0 ? "🎉 Tower Complete!" : "⏰ Time’s Up / Miss!"}
            </h2>
            <div className="grid grid-cols-2 gap-3 text-black font-semibold my-4">
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Score</div>
                <div className="text-xl">{score}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Perfects</div>
                <div className="text-xl">{perfects}</div>
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
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
              >
                New Round
              </button>
              <button
                onClick={() => router.push("/games")}
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
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
              XP is saved automatically to your profile when the round ends.
            </p>
          </div>
        </div>
      )}

      {/* Sticky footer spacer */}
      <div className="h-10" />
    </div>
  );
}
