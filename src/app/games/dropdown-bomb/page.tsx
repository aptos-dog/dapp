"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Clock, Award, X } from "lucide-react";
import { useRouter } from "next/navigation";

type ItemType = "life" | "bonus" | "bomb";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ASSETS + SOUNDS (feel free to replace sound URLs) */
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
    sound: "https://assets.mixkit.co/sfx/preview/mixkit-fast-small-gun-shot-1698.mp3", // sharper "shoot"
  },
};

/**
 * IMPORTANT: Change the placeholder URL below (inside .game-bg style) to your image:
 * Replace "YOUR_IMAGE_URL_HERE" with: https://i.postimg.cc/wB660kqZ/9cf26ba438ce4eca607709218b3e504f.jpg
 */

export default function DropdownBombGamePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameScore, setGameScore] = useState(0);
  const [activeItems, setActiveItems] = useState<
    {
      key: number;
      type: ItemType;
      leftPct: number;
      duration: number;
      // negative delay will be applied when item was 'spawned earlier' while user away
      delaySec?: number;
    }[]
  >([]);
  const [floating, setFloating] = useState<
    { id: number; text: string; x: number; y: number }[]
  >([]);
  const [bonusLimit, setBonusLimit] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [bombReact, setBombReact] = useState(false);
  const [saving, setSaving] = useState(false);

  // audio refs (preloaded)
  const audioRefs = useRef({
    life: null as HTMLAudioElement | null,
    bonus: null as HTMLAudioElement | null,
    bomb: null as HTMLAudioElement | null,
  });

  // precise timing refs for "continue while hidden"
  const endTimeRef = useRef<number | null>(null); // absolute ms timestamp
  const nextSpawnRef = useRef<number>(0); // absolute ms timestamp for next spawn
  const loopRef = useRef<number | null>(null);
  const floatingId = useRef(0);
  const itemKeyId = useRef(1);

  // spawn tuning
  const MAX_ACTIVE = 12;
  const MIN_SPAWN_MS = 800;
  const MAX_SPAWN_MS = 1400;

  // --- Preload audio and set default volumes ---
  useEffect(() => {
    audioRefs.current.life = new Audio(ASSETS.life.sound);
    audioRefs.current.bonus = new Audio(ASSETS.bonus.sound);
    audioRefs.current.bomb = new Audio(ASSETS.bomb.sound);

    // set comfortable volumes (0.0 - 1.0)
    audioRefs.current.life.volume = 0.9;
    audioRefs.current.bonus.volume = 0.9;
    audioRefs.current.bomb.volume = 0.85;

    // do not autoplay; we will "unlock" on Start (user gesture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- handle wallet connect callback (matches your other pages) ---
  const handleProfileUpdate = (profile: any) => {
    const id = profile?.id || null;
    setUserId(id);
    setConnected(Boolean(id));
  };

  // --- spawn function that works with absolute timestamps ---
  const spawnOneAtTime = useCallback(
    (spawnTime: number) => {
      // pick type probabilistically, respect bonus limits
      const r = Math.random();
      let type: ItemType = "life";
      if (r < 0.08 && bonusCount < bonusLimit) {
        type = "bonus";
      } else if (r < 0.28) {
        type = "bomb";
      } else {
        type = "life";
      }
      if (type === "bonus" && bonusCount >= bonusLimit) type = "life";

      const leftPct = 8 + Math.random() * 82;
      const duration = 3.6 + Math.random() * 1.8; // seconds

      // compute elapsed since spawnTime (in seconds)
      const now = Date.now();
      const elapsed = Math.max(0, (now - spawnTime) / 1000);

      // if already fully elapsed, skip (it would've fallen)
      if (elapsed >= duration) return;

      if (type === "bonus") setBonusCount((c) => c + 1);

      const key = itemKeyId.current++;
      setActiveItems((prev) => [
        ...prev,
        {
          key,
          type,
          leftPct,
          duration,
          delaySec: -elapsed, // negative delay = start animation progressed
        },
      ]);
    },
    [bonusCount, bonusLimit]
  );

  // --- game loop: updates timer and spawn catch-up if needed ---
  useEffect(() => {
    if (!isRunning) {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    // start loop
    if (!loopRef.current) {
      loopRef.current = window.setInterval(() => {
        const now = Date.now();

        // update timer via endTimeRef
        const end = endTimeRef.current ?? now;
        const remainingMs = Math.max(0, end - now);
        setTimeLeft(Math.ceil(remainingMs / 1000));

        // spawn catch-up loop (spawn while nextSpawnRef <= now)
        while (nextSpawnRef.current <= now) {
          const spawnAt = nextSpawnRef.current;
          spawnOneAtTime(spawnAt);

          // advance nextSpawnRef by a randomized gap
          const gap = MIN_SPAWN_MS + Math.random() * (MAX_SPAWN_MS - MIN_SPAWN_MS);
          nextSpawnRef.current += Math.round(gap);
        }

        // if time is up -> stop game
        if (now >= end) {
          setIsRunning(false);
        }
      }, 120); // tick ~8x per second (fine balance)
    }

    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [isRunning, spawnOneAtTime]);

  // --- Start game: set end timestamp, set nextSpawnRef and "unlock" audio by issuing a brief play ---
  const startGame = async () => {
    if (!connected || !userId) {
      alert("Please connect your wallet before starting.");
      return;
    }

    // unlock audio: browsers allow audio after a user gesture (click); calling play then pause helps
    try {
      for (const k of ["life", "bonus", "bomb"] as ItemType[]) {
        const a = audioRefs.current[k];
        if (!a) continue;
        // start & pause to unlock autoplay permission in some browsers
        await a.play().catch(() => {});
        a.pause();
        a.currentTime = 0;
      }
    } catch (e) {
      // ignore unlock errors
    }

    setBonusLimit(Math.floor(Math.random() * 4) + 2); // 2..5
    setBonusCount(0);
    setGameScore(0);
    setActiveItems([]);
    setFloating([]);
    setTimeLeft(45);

    const now = Date.now();
    endTimeRef.current = now + 45 * 1000;
    // schedule first spawn shortly
    nextSpawnRef.current = now + 250; // small delay before first spawn
    setIsRunning(true);
  };

  // --- Pause/stop / restart ---
  const stopGame = () => {
    setIsRunning(false);
  };
  const restartGame = () => {
    // same behavior as start but with same connected user
    startGame();
  };

  // --- handle clicks on items ---
  const handleItemClick = async (
    e: React.MouseEvent,
    itemKey: number,
    type: ItemType
  ) => {
    e.stopPropagation();
    // compute click position relative to board for floating label
    const board = (e.currentTarget as HTMLElement).closest(".game-board") as HTMLElement | null;
    let x = 0,
      y = 0;
    if (board) {
      const rect = board.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    const value = ASSETS[type].points;
    const text = value > 0 ? `+${value}` : `${value}`;

    const id = ++floatingId.current;
    setFloating((f) => [...f, { id, text, x, y }]);
    setTimeout(() => setFloating((f) => f.filter((ff) => ff.id !== id)), 900);

    // bomb reaction
    if (type === "bomb") {
      setBombReact(true);
      setTimeout(() => setBombReact(false), 350);
    }

    // play sound (reset to start)
    try {
      const a = audioRefs.current[type];
      if (a) {
        a.currentTime = 0;
        await a.play().catch(() => {});
      }
    } catch (err) {
      // ignore play errors
    }

    // update score
    setGameScore((s) => Math.max(0, s + value));

    // remove item
    setActiveItems((prev) => prev.filter((it) => it.key !== itemKey));
  };

  // --- on animation end remove item ---
  const handleItemAnimationEnd = (key: number) => {
    setActiveItems((prev) => prev.filter((i) => i.key !== key));
  };

// --- when a round ends (timeLeft reaches 0 and isRunning is false) save results ---
useEffect(() => {
  const saveIfDone = async () => {
    if (!isRunning && timeLeft === 0 && userId) {
      setSaving(true);
      try {
        await fetch("/api/dropdown-bomb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: userId,     // or wallet address if that's what you're storing
            xpEarned: gameScore,
          }),
        });
      } catch (err) {
        console.error("Error saving score:", err);
      } finally {
        setSaving(false);
      }
    }
  };
  saveIfDone();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isRunning, timeLeft]);


  // --- Exit to main games hub ---
  const exitGame = () => {
    setIsRunning(false);
    router.push("/games");
  };

  // --- cleanup when unmounting ---
  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-black">
      <Topbar />

      {/* Wallet under topbar (right aligned) */}
      <div className="w-full flex justify-end px-6 -mt-2">
        <div className="w-auto">
          <ConnectWallet onProfileUpdate={handleProfileUpdate} />
        </div>
      </div>

      {/* Instruction */}
      <div className="mx-auto w-full max-w-5xl px-4 mt-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/60 p-4 text-yellow-100 shadow-md">
          <h2 className="text-lg font-bold flex items-center gap-2"><Award className="w-5 h-5 text-yellow-300" /> How to Play</h2>
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
          {/* Console header (score, timer, controls) */}
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
                <button onClick={stopGame} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Pause</button>
              )}

              <button onClick={exitGame} className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
                <X className="w-4 h-4 inline" /> Exit
              </button>
            </div>
          </div>

          {/* GAME BOARD (put your in-console background here) */}
          <div
            className="game-board absolute inset-0 z-10"
            style={{
              // <-- CHANGE THIS IMAGE URL HERE to: https://i.postimg.cc/wB660kqZ/9cf26ba438ce4eca607709218b3e504f.jpg
              backgroundImage: "url('https://i.postimg.cc/wB660kqZ/9cf26ba438ce4eca607709218b3e504f.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/32" />

            {/* falling items container */}
            <div className="absolute inset-0">
              {activeItems.map((it) => {
                const style: React.CSSProperties = {
                  left: `${it.leftPct}%`,
                  animation: `fall ${it.duration}s linear forwards`,
                  // apply negative delay so the animation starts in-progress when user returns after inactivity
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
                style={{
                  left: f.x,
                  top: f.y,
                }}
                className="absolute z-50 pointer-events-none font-extrabold text-yellow-300 text-sm"
              >
                {f.text}
              </motion.div>
            ))}
          </div>

          {/* Game Over screen (persistent until user clicks) */}
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

      {/* inline styles */}
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
          0% {
            transform: translateY(0);
            filter: brightness(1);
          }
          25% {
            transform: translateY(-6px) rotate(-1deg);
            filter: brightness(1.25);
          }
          50% {
            transform: translateY(3px) rotate(1deg);
            filter: brightness(0.9);
          }
          100% {
            transform: translateY(0);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
}
