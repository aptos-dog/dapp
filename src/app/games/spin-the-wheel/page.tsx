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

const SECTORS = [
  { label: "0 XP", xp: 0 },
  { label: "5 XP", xp: 5 },
  { label: "0 XP", xp: 0 },
  { label: "10 XP", xp: 10 },
  { label: "0 XP", xp: 0 },
  { label: "2 XP", xp: 2 },
];

export default function SpinTheWheelPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<null | { label: string; xp: number }>(null);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

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

  const handleProfileUpdate = (profile: any) => {
    const w = profile?.wallet || null;
    setWallet(w);
    setConnected(Boolean(w));
    if (w) fetchSpinData(w);
  };

  // ✅ Fetch + persist cooldown state
  const fetchSpinData = async (walletAddr: string) => {
    try {
      const { data, error } = await supabase
        .from("spin_wheel_timer")
        .select("last_spin, spins_left")
        .eq("wallet", walletAddr)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        let spins = data.spins_left;
        let nxt: Date | null = null;

        if (data.last_spin) {
          const last = new Date(data.last_spin);
          const nextTime = new Date(last.getTime() + 4 * 60 * 60 * 1000); // 4 hrs
          if (nextTime > new Date() && spins <= 0) {
            // still cooling down
            nxt = nextTime;
          } else if (nextTime <= new Date()) {
            // cooldown expired → reset spins
            spins = 3;
            nxt = null;
            await supabase
              .from("spin_wheel_timer")
              .update({ spins_left: 3 })
              .eq("wallet", walletAddr);
          }
        }
        setSpinsLeft(spins);
        setNextSpinTime(nxt);
      } else {
        await supabase.from("spin_wheel_timer").insert({
          wallet: walletAddr,
          spins_left: 3,
          last_spin: null,
        });
        setSpinsLeft(3);
        setNextSpinTime(null);
      }
    } catch (err) {
      console.error("Error fetching spin data:", err);
    }
  };

  const spinWheel = async () => {
    if (!connected || !wallet || isSpinning || spinsLeft <= 0) return;
    setIsSpinning(true);
    setResult(null);

    // Pick sector randomly
    const pick = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const idx = SECTORS.indexOf(pick);
    const randomOffset = Math.floor(Math.random() * (360 / SECTORS.length));
    const degrees =
      3600 + (360 / SECTORS.length) * idx + (360 / SECTORS.length) / 2 + randomOffset;

    wheelRef.current?.style.setProperty(
      "transition",
      "transform 4s cubic-bezier(0.33, 1, 0.68, 1)"
    );
    wheelRef.current?.style.setProperty("transform", `rotate(${degrees}deg)`);

    spinSound.current?.play().catch(() => {});

    setTimeout(async () => {
      setResult(pick);
      if (pick.xp > 0) winSound.current?.play().catch(() => {});

      try {
        // add XP
        const { error: rpcErr } = await supabase.rpc("increment_spin_xp", {
          wallet_input: wallet,
          xp_to_add: pick.xp,
        });
        if (rpcErr) console.error("Error adding XP:", rpcErr);
      } catch (err) {
        console.error("Unexpected error adding XP:", err);
      }

      try {
        const newSpins = spinsLeft - 1;
        let nxt: Date | null = null;

        if (newSpins <= 0) {
          nxt = new Date(Date.now() + 4 * 60 * 60 * 1000);
        }

        await supabase.from("spin_wheel_timer").upsert({
          wallet,
          last_spin: new Date().toISOString(),
          spins_left: newSpins,
        });

        setSpinsLeft(newSpins);
        setNextSpinTime(nxt);
      } catch (err) {
        console.error("Unexpected error updating spin timer:", err);
      }

      setIsSpinning(false);
    }, 4000);
  };

  // Countdown text
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!nextSpinTime) return;
    const iv = setInterval(() => {
      const diff = nextSpinTime.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("");
        setSpinsLeft(3);
        setNextSpinTime(null);
        if (wallet) {
          supabase
            .from("spin_wheel_timer")
            .update({ spins_left: 3 })
            .eq("wallet", wallet);
        }
        clearInterval(iv);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(iv);
  }, [nextSpinTime, wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-black to-yellow-500 flex flex-col items-center p-6 text-white">
      <Topbar />
      <ConnectWallet onProfileUpdate={handleProfileUpdate} />

      <div className="mt-6 text-center bg-black/70 p-4 rounded-xl max-w-md">
        <h1 className="text-3xl font-bold mb-2">Spin The Wheel</h1>
        <p>3 spins every 4 hours. Try your luck and earn XP!</p>
      </div>

      {/* Wheel */}
      <div className="relative mt-10">
        <div className="absolute -inset-4 rounded-full bg-black shadow-2xl"></div>
        <div
          ref={wheelRef}
          className="relative w-72 h-72 rounded-full border-[10px] border-yellow-400 overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-lg"
          style={{ transition: "none", transform: "rotate(0deg)" }}
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
                className="w-1/2 h-1/2 bg-black/20 flex items-center justify-center text-black font-bold text-sm"
                style={{
                  transform: `rotate(${360 / SECTORS.length / 2}deg)`,
                }}
              >
                {sec.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-1/2 w-4 h-14 bg-red-600 rounded-b transform -translate-x-1/2 z-10 shadow-lg"></div>
      </div>

      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={!connected || spinsLeft <= 0 || isSpinning}
        className={`mt-6 px-8 py-3 text-lg font-bold rounded-2xl shadow-xl ${
          connected && spinsLeft > 0 && !isSpinning
            ? "bg-yellow-500 text-black hover:bg-yellow-400"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }`}
      >
        {isSpinning ? "Spinning..." : spinsLeft > 0 ? `Spin (${spinsLeft} left)` : "On Cooldown"}
      </button>

      {result && !isSpinning && (
        <div className="mt-4 text-xl text-yellow-200 animate-pulse">
          🎉 You got {result.label}!
        </div>
      )}

      {countdown && (
        <div className="mt-3 text-yellow-100 font-semibold text-lg">
          Next spins in: {countdown}
        </div>
      )}

      <button
        onClick={() => router.push("/games")}
        className="mt-6 px-6 py-2 bg-black text-yellow-400 rounded hover:bg-gray-800"
      >
        Go Back
      </button>

      <AudioPlayer />
    </div>
  );
}
