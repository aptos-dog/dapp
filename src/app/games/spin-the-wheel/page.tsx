"use client";

import { useEffect, useRef, useState } from "react";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🎯 XP sectors (weighted for probability)
// We'll add multiple entries for "0 XP" to make 50 XP harder to hit
const SECTORS = [
  { label: "50 XP", xp: 50 },
  { label: "10 XP", xp: 10 },
  { label: "0 XP", xp: 0 },
  { label: "5 XP", xp: 5 },
  { label: "0 XP", xp: 0 },
  { label: "0 XP", xp: 0 },
];

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_SPINS = 1; // Only one spin per cycle

export default function SpinTheWheelPage() {
  const router = useRouter();

  // auth / wallet
  const [wallet, setWallet] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // spin state
  const [spinsLeft, setSpinsLeft] = useState<number>(MAX_SPINS);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);

  // UI state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<null | { label: string; xp: number }>(
    null
  );
  const [countdown, setCountdown] = useState("");
  const [message, setMessage] = useState("");

  // wheel visuals & audio
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  // small polling fallback when spins exhausted
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    spinSound.current = new Audio(
      "https://orangefreesounds.com/wp-content/uploads/2025/01/Spinning-prize-wheel-sound-effect.mp3"
    );
    winSound.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"
    );
    [spinSound, winSound].forEach((r) => {
      if (r.current) r.current.volume = 1.0;
    });
  }, []);

  // -------------------------
  // Authoritative fetch
  // -------------------------
  const fetchSpinData = async (walletAddr: string) => {
    if (!walletAddr) return null;

    try {
      const rpcRes = await supabase.rpc("get_and_fix_spin_state", {
        wallet_input: walletAddr,
      });
      if (!rpcRes.error && rpcRes.data) {
        const row = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
        const sl = Number(row?.spins_left ?? 0);
        let nextAt: Date | null = null;
        if (row?.next_spin_at) {
          const na = new Date(row.next_spin_at);
          if (!isNaN(na.getTime())) nextAt = na;
        } else if (row?.last_spin) {
          const ls = new Date(row.last_spin);
          if (!isNaN(ls.getTime())) nextAt = new Date(
            ls.getTime() + COOLDOWN_MS
          );
        }

        setSpinsLeft(sl);
        setNextSpinTime(sl <= 0 ? nextAt : null);
        setMessage(
          sl <= 0 && nextAt
            ? "You’ve used your spin. Come back after the cooldown ⏳"
            : ""
        );
        return { spins_left: sl, next_spin_at: nextAt };
      }
    } catch (err) {
      console.warn("RPC get_and_fix_spin_state failed:", err);
    }
    return null;
  };

  const handleProfileUpdate = (profile: any) => {
    const w = profile?.wallet || null;
    setWallet(w);
    setConnected(Boolean(w));
    if (w) fetchSpinData(w);
  };

  const spinWheel = async () => {
    if (!connected || !wallet || isSpinning) return;

    const latest = await fetchSpinData(wallet);
    if (!latest) {
      setMessage("Unable to check spins. Try again.");
      return;
    }
    if (latest.spins_left <= 0) {
      setMessage("No spins left. Cooldown is active.");
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Weighted randomness (make 50 XP harder)
    const weightedSectors = [
      { label: "50 XP", xp: 50 }, // rare
      { label: "10 XP", xp: 10 },
      { label: "10 XP", xp: 10 },
      { label: "5 XP", xp: 5 },
      { label: "5 XP", xp: 5 },
      { label: "0 XP", xp: 0 },
      { label: "0 XP", xp: 0 },
      { label: "0 XP", xp: 0 },
      { label: "0 XP", xp: 0 },
    ];
    const pick =
      weightedSectors[Math.floor(Math.random() * weightedSectors.length)];

    const idx = SECTORS.findIndex((s) => s.label === pick.label);
    const randomOffset = Math.floor(Math.random() * (360 / SECTORS.length));

    const newRotation =
      rotation +
      3600 +
      (360 / SECTORS.length) * idx +
      (360 / SECTORS.length) / 2 +
      randomOffset;
    setRotation(newRotation);
    if (wheelRef.current) {
      wheelRef.current.style.transition =
        "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
      wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
    }

    spinSound.current?.play().catch(() => {});

    setTimeout(async () => {
      setResult(pick);
      if (pick.xp > 0) winSound.current?.play().catch(() => {});

      try {
        const { error: rpcErr } = await supabase.rpc("increment_spin_xp", {
          wallet_input: wallet,
          xp_to_add: pick.xp,
        });
        if (rpcErr) console.error("Error adding XP:", rpcErr);
      } catch (err) {
        console.error("Unexpected error adding XP:", err);
      }

      try {
        const res = await supabase.rpc("consume_spin", {
          wallet_input: wallet,
        });
        if (res?.error) {
          console.error("consume_spin error:", res.error);
        } else if (res?.data) {
          const row = Array.isArray(res.data) ? res.data[0] : res.data;
          const sl = Number(row?.spins_left ?? 0);
          let nextAt: Date | null = null;
          if (row?.last_spin) {
            const ls = new Date(row.last_spin);
            if (!isNaN(ls.getTime()))
              nextAt = new Date(ls.getTime() + COOLDOWN_MS);
          }
          setSpinsLeft(sl);
          setNextSpinTime(sl <= 0 && nextAt ? nextAt : null);
          setMessage(
            sl <= 0 && nextAt
              ? "You’ve used your spin. Come back after the cooldown ⏳"
              : ""
          );
        }
      } catch (err) {
        console.error("Unexpected consume_spin error:", err);
      }

      await fetchSpinData(wallet);

      setIsSpinning(false);
    }, 4200);
  };

  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (!nextSpinTime) {
      setCountdown("");
      return;
    }

    const tick = () => {
      const diff = nextSpinTime.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("");
        if (wallet) fetchSpinData(wallet);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextSpinTime, wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-800/60 to-black text-white flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center ring-4 ring-yellow-300 shadow-lg shrink-0">
              <span className="font-extrabold text-xl md:text-2xl text-black">
                A
              </span>
            </div>
            <Topbar />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:block text-xs md:text-sm text-yellow-200">
              Wallet
            </div>
            <div className="w-[160px] md:w-[240px]">
              <ConnectWallet onProfileUpdate={handleProfileUpdate} />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
          {/* Left: Wheel */}
          <section className="md:col-span-2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-6 md:-inset-8 rounded-full bg-gradient-to-tr from-yellow-500/40 to-black/60 shadow-2xl"></div>

              <div
                ref={wheelRef}
                className="relative w-[280px] h-[280px] md:w-[460px] md:h-[460px] rounded-full border-8 border-yellow-500/80 overflow-hidden bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-2xl"
                style={{ transform: "rotate(0deg)" }}
              >
                {SECTORS.map((sec, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex items-center justify-end"
                    style={{
                      transform: `rotate(${(360 / SECTORS.length) * i}deg)`,
                    }}
                  >
                    <div
                      className="w-1/2 h-1/2 bg-black/10 flex items-center justify-center text-black font-extrabold text-xs md:text-lg tracking-wide"
                      style={{
                        transform: `rotate(${360 / SECTORS.length / 2}deg)`,
                      }}
                    >
                      {sec.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute -top-4 md:-top-5 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-4 md:w-6 h-12 md:h-16 bg-red-600 rounded-b-xl shadow-2xl"></div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 text-center">
              {result && !isSpinning && (
                <div className="inline-block bg-black/70 px-4 md:px-6 py-2 md:py-3 rounded-xl text-yellow-200 font-bold animate-pulse text-base md:text-lg shadow-md">
                  🎉 You got {result.label}!
                </div>
              )}
              {message && (
                <div className="mt-3 md:mt-4 text-xs md:text-sm text-red-200 font-semibold">
                  {message}
                </div>
              )}
            </div>
          </section>

          {/* Right: Controls */}
          <aside className="md:col-span-1 bg-black/70 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold">Your Spin</h2>
                <p className="text-xs md:text-sm text-yellow-100/80">
                  Available this cycle
                </p>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-yellow-300">
                {spinsLeft}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={spinWheel}
                disabled={!connected || spinsLeft <= 0 || isSpinning}
                className={`w-full py-3 md:py-4 rounded-2xl font-extrabold text-base md:text-lg shadow-lg transition transform hover:scale-[1.02] active:scale-95 duration-200 ${
                  connected && spinsLeft > 0 && !isSpinning
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSpinning
                  ? "Spinning..."
                  : spinsLeft > 0
                  ? `Spin Now`
                  : "On Cooldown"}
              </button>

              <div className="pt-2 border-t border-yellow-500/20">
                <div className="text-sm text-yellow-200/90">Cooldown</div>
                {countdown ? (
                  <div className="mt-2 text-lg md:text-2xl font-bold text-yellow-100">
                    {countdown}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-yellow-300/70">
                    No active cooldown
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-yellow-500/20">
                <div className="text-sm text-yellow-200/90">How it works</div>
                <ul className="mt-2 text-xs text-yellow-100/80 space-y-1 list-disc list-inside">
                  <li>1 spin per cycle.</li>
                  <li>After spin, a 2-hour cooldown starts.</li>
                  <li>Spins and cooldown are stored in your profile (server).</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="text-center text-xs text-yellow-200/60 py-8 md:py-10 border-t border-yellow-800/30">
        <div>You can toggle off the audio button anytime.</div>
      </footer>

      <AudioPlayer />
    </div>
  );
}
