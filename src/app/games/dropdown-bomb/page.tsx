"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Clock, Award, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // or your wallet hook

type ItemType = "life" | "bonus" | "bomb";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ASSETS + SOUNDS */
const ASSETS: Record<ItemType, { src: string; points: number; sound: string }> = {
  life: {
    src: "https://i.postimg.cc/KYMLNJRF/APTDOG.png",
    points: 1,
    sound: "https://assets.mixkit.co/sfx/preview/mixkit-game-click-1114.mp3",
  },
  bonus: {
    src: "https://i.postimg.cc/MTH5qyGF/aptos-apt-logo.png",
    points: 10,
    sound: "https://assets.mixkit.co/sfx/preview/mixkit-extra-bonus-in-a-video-game-2045.mp3",
  },
  bomb: {
    src: "https://i.postimg.cc/sg09KMmP/1000044861-removebg-preview.png",
    points: -5,
    sound: "https://assets.mixkit.co/sfx/preview/mixkit-fast-small-gun-shot-1698.mp3",
  },
};

export default function DropdownBombGamePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null); // ✅ added
  const [connected, setConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameScore, setGameScore] = useState(0);
  const [activeItems, setActiveItems] = useState<
    { key: number; type: ItemType; leftPct: number; duration: number; delaySec?: number }[]
  >([]);
  const [floating, setFloating] = useState<{ id: number; text: string; x: number; y: number }[]>(
    []
  );
  const [bonusLimit, setBonusLimit] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [bombReact, setBombReact] = useState(false);
  const [saving, setSaving] = useState(false);

  // audio refs
  const audioRefs = useRef({
    life: null as HTMLAudioElement | null,
    bonus: null as HTMLAudioElement | null,
    bomb: null as HTMLAudioElement | null,
  });

  // timing refs
  const endTimeRef = useRef<number | null>(null);
  const nextSpawnRef = useRef<number>(0);
  const loopRef = useRef<number | null>(null);
  const floatingId = useRef(0);
  const itemKeyId = useRef(1);

  // spawn tuning
  const MAX_ACTIVE = 12;
  const MIN_SPAWN_MS = 800;
  const MAX_SPAWN_MS = 1400;

  // preload audio
  useEffect(() => {
    audioRefs.current.life = new Audio(ASSETS.life.sound);
    audioRefs.current.bonus = new Audio(ASSETS.bonus.sound);
    audioRefs.current.bomb = new Audio(ASSETS.bomb.sound);

    audioRefs.current.life.volume = 0.9;
    audioRefs.current.bonus.volume = 0.9;
    audioRefs.current.bomb.volume = 0.85;
  }, []);

  // --- handle wallet connect ---
  const handleProfileUpdate = (profile: any) => {
    setUserId(profile?.id || null);
    setConnected(Boolean(profile?.id));
    setWallet(profile?.wallet || null);
  };

  // --- spawn function ---
  const spawnOneAtTime = useCallback(
    (spawnTime: number) => {
      const r = Math.random();
      let type: ItemType = "life";
      if (r < 0.08 && bonusCount < bonusLimit) {
        type = "bonus";
      } else if (r < 0.28) {
        type = "bomb";
      }
      if (type === "bonus" && bonusCount >= bonusLimit) type = "life";

      const leftPct = 8 + Math.random() * 82;
      const duration = 3.6 + Math.random() * 1.8;

      const now = Date.now();
      const elapsed = Math.max(0, (now - spawnTime) / 1000);
      if (elapsed >= duration) return;

      if (type === "bonus") setBonusCount((c) => c + 1);

      const key = itemKeyId.current++;
      setActiveItems((prev) => [
        ...prev,
        { key, type, leftPct, duration, delaySec: -elapsed },
      ]);
    },
    [bonusCount, bonusLimit]
  );

  // --- game loop ---
  useEffect(() => {
    if (!isRunning) {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    if (!loopRef.current) {
      loopRef.current = window.setInterval(() => {
        const now = Date.now();
        const end = endTimeRef.current ?? now;
        const remainingMs = Math.max(0, end - now);
        setTimeLeft(Math.ceil(remainingMs / 1000));

        while (nextSpawnRef.current <= now) {
          spawnOneAtTime(nextSpawnRef.current);
          const gap = MIN_SPAWN_MS + Math.random() * (MAX_SPAWN_MS - MIN_SPAWN_MS);
          nextSpawnRef.current += Math.round(gap);
        }

        if (now >= end) setIsRunning(false);
      }, 120);
    }

    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [isRunning, spawnOneAtTime]);

  // --- start game ---
  const startGame = async () => {
    if (!connected || !userId || !wallet) {
      alert("Please connect your wallet before starting.");
      return;
    }

    try {
      for (const k of ["life", "bonus", "bomb"] as ItemType[]) {
        const a = audioRefs.current[k];
        if (!a) continue;
        await a.play().catch(() => {});
        a.pause();
        a.currentTime = 0;
      }
    } catch {}

    setBonusLimit(Math.floor(Math.random() * 4) + 2);
    setBonusCount(0);
    setGameScore(0);
    setActiveItems([]);
    setFloating([]);
    setTimeLeft(45);

    const now = Date.now();
    endTimeRef.current = now + 45 * 1000;
    nextSpawnRef.current = now + 250;
    setIsRunning(true);
  };

  const stopGame = () => setIsRunning(false);
  const restartGame = () => startGame();

  // --- item click ---
  const handleItemClick = async (e: React.MouseEvent, itemKey: number, type: ItemType) => {
    e.stopPropagation();
    const board = (e.currentTarget as HTMLElement).closest(".game-board") as HTMLElement | null;
    let x = e.clientX, y = e.clientY;
    if (board) {
      const rect = board.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const value = ASSETS[type].points;
    const text = value > 0 ? `+${value}` : `${value}`;

    const id = ++floatingId.current;
    setFloating((f) => [...f, { id, text, x, y }]);
    setTimeout(() => setFloating((f) => f.filter((ff) => ff.id !== id)), 900);

    if (type === "bomb") {
      setBombReact(true);
      setTimeout(() => setBombReact(false), 350);
    }

    try {
      const a = audioRefs.current[type];
      if (a) {
        a.currentTime = 0;
        await a.play().catch(() => {});
      }
    } catch {}

    setGameScore((s) => Math.max(0, s + value));
    setActiveItems((prev) => prev.filter((it) => it.key !== itemKey));
  };

  const handleItemAnimationEnd = (key: number) => {
    setActiveItems((prev) => prev.filter((i) => i.key !== key));
  };

  // --- save results ---
  useEffect(() => {
    const saveIfDone = async () => {
      if (!isRunning && timeLeft === 0 && userId && wallet) {
        setSaving(true);
        try {
          await fetch("/api/dropdown-bomb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: wallet, xpEarned: gameScore }),
          });
        } catch (err) {
          console.error("Error saving score:", err);
        } finally {
          setSaving(false);
        }
      }
    };
    saveIfDone();
  }, [isRunning, timeLeft, userId, wallet, gameScore]);

  const exitGame = () => {
    setIsRunning(false);
    router.push("/games");
  };

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  // --- render ---
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-black">
      <Topbar />

      <div className="w-full flex justify-end px-6 -mt-2">
        <div className="w-auto">
          <ConnectWallet onProfileUpdate={handleProfileUpdate} />
        </div>
      </div>

      {/* Instructions */}
      <div className="mx-auto w-full max-w-5xl px-4 mt-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/60 p-4 text-yellow-100 shadow-md">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-300" /> How to Play
          </h2>
          <p className="text-sm mt-2 text-yellow-200/80">
            Tap falling items: <b>Life</b> = +1, <b>Bonus</b> = +10 (appears 2–5 times), <b>Bomb</b> = -5. Game lasts 45 seconds.
            Connect your wallet, then press <b>Start Game</b>.
          </p>
        </div>
      </div>

      {/* Game Console */}
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div
          className={`relative w-full max-w-3xl lg:max-w-4xl h-[74vh] sm:h-[72vh] md:h-[78vh] bg-black/60 border-2 border-yellow-400 rounded-2xl overflow-hidden shadow-xl ${bombReact ? "animate-bomb-react" : ""}`}
        >
          {/* Header */}
          <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between text-yellow-300">
            <div className="flex items-center gap-4 bg-black/40 px-3 py-2 rounded-xl">
              <Clock className="w-5 h-5" />
              <div className="text-sm sm:text-base font-semibold">Time: {timeLeft}s</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl">
                <span className="text-sm sm:text-base font-semibold">Score</span>
                <span className="text-lg sm:text-2xl font-extrabold text-yellow-300">{gameScore}</span>
              </div>

              {!isRunning ? (
                <button
                  onClick={startGame}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    connected ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Start Game
                </button>
              ) : (
                <button onClick={stopGame} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                  Pause
                </button>
              )}

              <button onClick={exitGame} className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
                <X className="w-4 h-4 inline" /> Exit
              </button>
            </div>
          </div>

          {/* Game Board */}
          <div
            className="game-board absolute inset-0 z-10"
            style={{
              backgroundImage: "url('https://i.postimg.cc/wB660kqZ/9cf26ba438ce4eca607709218b3e504f.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/32" />

            {/* falling items */}
            <div className="absolute inset-0">
              {activeItems.map((it) => {
                const style: React.CSSProperties = {
                  left: `${it.leftPct}%`,
                  animation: `fall ${it.duration}s linear forwards`,
                  animationDelay: it.delaySec ? `${it.delaySec}s` : "0s",
                  zIndex: 20,
                  width: window.innerWidth < 640 ? "3.2rem" : "4rem",
                  height: window.innerWidth < 640 ? "3.2rem" : "4rem",
                };

                return (
                  <img
                    key={it.key}
                    src={ASSETS[it.type].src}
                    alt={it.type}
                    style={style}
                    className="absolute touch-manipulation rounded-full cursor-pointer select-none"
                    onClick={(e) => handleItemClick(e, it.key, it.type)}
                    onAnimationEnd={() => handleItemAnimationEnd(it.key)}
                    draggable={false}
                  />
                );
              })}
            </div>

            {/* floating feedback */}
            {floating.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -32 }}
                transition={{ duration: 0.9 }}
                style={{ left: f.x, top: f.y }}
                className="absolute z-50 pointer-events-none font-extrabold text-yellow-300 text-sm"
              >
                {f.text}
              </motion.div>
            ))}
          </div>

          {/* Game Over */}
          {!isRunning && timeLeft === 0 && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/72">
              <div className="bg-black/85 border border-yellow-400 rounded-xl p-6 text-center text-yellow-100 w-11/12 max-w-md">
                <h2 className="text-2xl font-extrabold mb-2">Game Over</h2>
                <p className="mb-4">You scored <span className="font-bold">{gameScore}</span> XP</p>
                <div className="flex justify-center gap-4">
                  <button onClick={restartGame} className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300">Restart</button>
                  <button onClick={exitGame} className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">Exit</button>
                </div>
                {saving && <p className="mt-3 text-sm text-yellow-200/70">Saving score...</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      <AudioPlayer />

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-12vh) scale(0.9);
            opacity: 0.95;
          }
          10% {
            transform: translateY(0vh) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(115vh) scale(1);
            opacity: 0.95;
          }
        }
        .animate-bomb-react {
          animation: bombShake 0.35s ease;
          box-shadow: 0 0 22px rgba(255, 80, 0, 0.35);
        }
        @keyframes bombShake {
          0% { transform: translateY(0); filter: brightness(1); }
          25% { transform: translateY(-6px) rotate(-1deg); filter: brightness(1.25); }
          50% { transform: translateY(3px) rotate(1deg); filter: brightness(0.9); }
          100% { transform: translateY(0); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
