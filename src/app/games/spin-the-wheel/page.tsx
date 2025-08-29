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

// XP sectors
const SECTORS = [
  { label: "0 XP", xp: 0 },
  { label: "5 XP", xp: 5 },
  { label: "0 XP", xp: 0 },
  { label: "10 XP", xp: 10 },
  { label: "0 XP", xp: 0 },
  { label: "2 XP", xp: 2 },
];

const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function SpinTheWheelPage() {
  const router = useRouter();

  // auth / wallet
  const [wallet, setWallet] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // spin state
  const [spinsLeft, setSpinsLeft] = useState<number>(3);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);

  // UI state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<null | { label: string; xp: number }>(null);
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
    winSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
    [spinSound, winSound].forEach((r) => {
      if (r.current) r.current.volume = 1.0;
    });
  }, []);

  // -------------------------
  // Authoritative fetch
  // Tries RPC 'get_and_fix_spin_state' first (recommended).
  // Falls back to direct SELECT from profiles if RPC blocked or missing.
  // -------------------------
  const fetchSpinData = async (walletAddr: string) => {
    if (!walletAddr) return null;

    try {
      // 1) Try RPC that returns canonical state
      const rpcRes = await supabase.rpc("get_and_fix_spin_state", { wallet_input: walletAddr });
      // Supabase sometimes returns { error: {} } as an "error" object; handle defensively:
      if (!rpcRes.error && rpcRes.data) {
        const row = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
        const sl = Number(row?.spins_left ?? 0);
        // prefer next_spin_at if returned
        let nextAt: Date | null = null;
        if (row?.next_spin_at) {
          const na = new Date(row.next_spin_at);
          if (!isNaN(na.getTime())) nextAt = na;
        } else if (row?.last_spin) {
          const ls = new Date(row.last_spin);
          if (!isNaN(ls.getTime())) nextAt = new Date(ls.getTime() + COOLDOWN_MS);
        }

        setSpinsLeft(sl);
        // only set nextSpinTime when spins are exhausted (frontend expects that)
        setNextSpinTime(sl <= 0 ? nextAt : null);
        setMessage(sl <= 0 && nextAt ? "You’ve used all your spins. Come back after the cooldown ⏳" : "");
        return { spins_left: sl, next_spin_at: nextAt };
      }
    } catch (err) {
      // RPC may be blocked by RLS or doesn't exist; fall back to direct SELECT
      console.warn("RPC get_and_fix_spin_state failed, falling back to SELECT:", err);
    }

    // 2) Fallback: read directly from profiles table
    try {
      const { data, error } = await supabase.from("profiles").select("spins_left,last_spin").eq("wallet", walletAddr).single();
      if (error) {
        // `error` can be an empty object in some cases; log and return
        console.error("profiles select error:", error);
        return null;
      }

      const sl = Number(data?.spins_left ?? 0);
      let nextAt: Date | null = null;
      if (data?.last_spin) {
        const ls = new Date(data.last_spin);
        if (!isNaN(ls.getTime())) nextAt = new Date(ls.getTime() + COOLDOWN_MS);
      }

      setSpinsLeft(sl);
      setNextSpinTime(sl <= 0 && nextAt ? nextAt : null);
      setMessage(sl <= 0 && nextAt ? "You’ve used all your spins. Come back after the cooldown ⏳" : "");
      return { spins_left: sl, next_spin_at: nextAt };
    } catch (err) {
      console.error("Unexpected fetchSpinData error:", err);
      return null;
    }
  };

  // update wallet/profile from ConnectWallet component
  const handleProfileUpdate = (profile: any) => {
    const w = profile?.wallet || null;
    setWallet(w);
    setConnected(Boolean(w));
    if (w) fetchSpinData(w);
  };

  // -------------------------
  // Spin action (frontend)
  // - First re-fetch authoritative state and block if spins_left <= 0
  // - Animate wheel
  // - Call increment_spin_xp (unchanged)
  // - Call consume_spin RPC; use its returned data if available
  // - Finally fetch authoritative state to ensure UI in sync
  // -------------------------
  const spinWheel = async () => {
    if (!connected || !wallet || isSpinning) return;

    // authoritative check
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

    // pick sector randomly (unpredictable)
    const pick = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const idx = SECTORS.indexOf(pick);
    const randomOffset = Math.floor(Math.random() * (360 / SECTORS.length));

    // cumulative rotation so wheel animates every time
    const newRotation = rotation + 3600 + (360 / SECTORS.length) * idx + (360 / SECTORS.length) / 2 + randomOffset;
    setRotation(newRotation);
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
      wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
    }

    spinSound.current?.play().catch(() => {});

    // wait slightly longer than animation so audio/result lines up
    setTimeout(async () => {
      setResult(pick);
      if (pick.xp > 0) winSound.current?.play().catch(() => {});

      // 1) Add XP on backend (keeps your existing logic)
      try {
        const { error: rpcErr } = await supabase.rpc("increment_spin_xp", {
          wallet_input: wallet,
          xp_to_add: pick.xp,
        });
        if (rpcErr) console.error("Error adding XP:", rpcErr);
      } catch (err) {
        console.error("Unexpected error adding XP:", err);
      }

      // 2) Consume spin on the server (RPC). We use returned data if available
      try {
        const res = await supabase.rpc("consume_spin", { wallet_input: wallet });
        if (res?.error) {
          // RPC returned an "empty" error object or similar; log but continue to re-fetch
          console.error("consume_spin error:", res.error);
        } else if (res?.data) {
          // Use returned authoritative values if present
          const row = Array.isArray(res.data) ? res.data[0] : res.data;
          const sl = Number(row?.spins_left ?? 0);
          let nextAt: Date | null = null;
          if (row?.last_spin) {
            const ls = new Date(row.last_spin);
            if (!isNaN(ls.getTime())) nextAt = new Date(ls.getTime() + COOLDOWN_MS);
          }
          setSpinsLeft(sl);
          setNextSpinTime(sl <= 0 && nextAt ? nextAt : null);
          setMessage(sl <= 0 && nextAt ? "You’ve used all your spins. Come back after the cooldown ⏳" : "");
        }
      } catch (err) {
        console.error("Unexpected consume_spin error:", err);
      }

      // 3) Always re-fetch authoritative state to be 100% synced
      await fetchSpinData(wallet);

      setIsSpinning(false);
    }, 4200);
  };

  // -------------------------
  // Countdown effect driven by nextSpinTime (authoritative)
  // -------------------------
  useEffect(() => {
    // clear any existing poll
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (!nextSpinTime) {
      setCountdown("");
      // if spins are still zero but no nextSpinTime, double-check server once
      if (spinsLeft <= 0) {
        // poll every 10s to see if server reset (defensive)
        pollRef.current = window.setInterval(() => {
          if (wallet) fetchSpinData(wallet);
        }, 10000);
      }
      return;
    }

    const tick = () => {
      const diff = nextSpinTime.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("");
        // refresh authoritative state; server should reset spins_left to 3 if cooldown ended
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
    return () => {
      clearInterval(iv);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [nextSpinTime, wallet, spinsLeft]);

  // -------------------------
  // Layout & Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 via-black to-yellow-500 text-white">
      {/* Top header */}
      <header className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center ring-4 ring-yellow-400">
            <span className="font-bold text-lg text-yellow-300">AD</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold"> Spin Rewards</h1>
            <p className="text-sm text-yellow-100/80">Win XP every day, 3 spins then 4h cooldown.</p>
          </div>
          <Topbar />
        </div>

        {/* wallet: positioned top-right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-yellow-200">Wallet</div>
          <div className="w-[220px]">
            {/* Keep your existing ConnectWallet component (it should call onProfileUpdate with { wallet }) */}
            <ConnectWallet onProfileUpdate={handleProfileUpdate} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Wheel (big and pretty) */}
          <section className="md:col-span-2 flex flex-col items-center">
            <div className="relative">
              {/* outer ring: black with shadow */}
              <div className="absolute -inset-6 rounded-full bg-black shadow-[0_35px_60px_rgba(0,0,0,0.6)]"></div>

              {/* wheel: inner gradient (black+yellow feel) */}
              <div
                ref={wheelRef}
                className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border-8 border-black overflow-hidden bg-gradient-to-br from-yellow-200 via-yellow-400 to-black shadow-xl"
                style={{ transform: "rotate(0deg)" }}
              >
                {/* render sectors */}
                {SECTORS.map((sec, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex items-center justify-end"
                    style={{ transform: `rotate(${(360 / SECTORS.length) * i}deg)` }}
                  >
                    <div
                      className="w-1/2 h-1/2 bg-black/10 flex items-center justify-center text-black font-bold text-sm md:text-base"
                      style={{ transform: `rotate(${360 / SECTORS.length / 2}deg)` }}
                    >
                      {sec.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* pointer */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-6 h-16 bg-red-600 rounded-b shadow-lg"></div>
              </div>
            </div>

            {/* result + message */}
            <div className="mt-6 text-center">
              {result && !isSpinning && (
                <div className="inline-block bg-black/60 px-4 py-2 rounded-lg text-yellow-200 font-semibold animate-pulse">
                  🎉 You got {result.label}!
                </div>
              )}
              {message && (
                <div className="mt-4 text-sm text-red-200 font-medium">{message}</div>
              )}
            </div>
          </section>

          {/* Right: controls & info */}
          <aside className="md:col-span-1 bg-black/60 p-6 rounded-xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your Spins</h2>
                <p className="text-sm text-yellow-100/80">Available this cycle</p>
              </div>
              <div className="text-3xl font-extrabold text-yellow-300">{spinsLeft}</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={spinWheel}
                disabled={!connected || spinsLeft <= 0 || isSpinning}
                className={`w-full py-3 rounded-2xl font-bold shadow-lg transition ${
                  connected && spinsLeft > 0 && !isSpinning
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isSpinning ? "Spinning..." : spinsLeft > 0 ? `Spin (${spinsLeft} left)` : "On Cooldown"}
              </button>

              <button
                onClick={() => fetchSpinData(wallet || "")}
                className="w-full py-2 rounded-lg bg-black text-yellow-300 border border-yellow-600"
              >
                Refresh State
              </button>

              <div className="pt-2 border-t border-yellow-400/10">
                <div className="text-sm text-yellow-200/90">Cooldown</div>
                {countdown ? (
                  <div className="mt-2 text-xl font-semibold text-yellow-100">{countdown}</div>
                ) : (
                  <div className="mt-2 text-sm text-yellow-200/70">No active cooldown</div>
                )}
              </div>

              <div className="pt-2 border-t border-yellow-400/10">
                <div className="text-sm text-yellow-200/90">How it works</div>
                <ul className="mt-2 text-xs text-yellow-100/80 space-y-1">
                  <li>- You have 3 spins per cycle.</li>
                  <li>- After the 3rd spin, a 4-hour cooldown starts.</li>
                  <li>- Spins and cooldown are stored in your profile (server).</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* footer actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push("/games")}
            className="px-6 py-2 rounded-lg bg-black text-yellow-300 hover:bg-black/90"
          >
            Back to games
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-yellow-200/60 py-8">
        <div>You can Toggle off the audio button anytime.</div>
      </footer>

      <AudioPlayer />
    </div>
  );
}
