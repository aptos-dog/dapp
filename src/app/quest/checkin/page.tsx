"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/quest/sidebar/page";
import ConnectWallet from "@/components/connectwallet";
import { Loader2, Sparkles, Clock } from "lucide-react";

/** Format seconds -> HH:MM:SS */
function formatCountdown(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function CheckinPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  // 🟢 Fetch profile info after wallet connect
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${userId}`);
        const data = await res.json();

        if (res.ok && data?.profile) {
          const lastCheckin = data.profile.last_checkin
            ? new Date(data.profile.last_checkin)
            : null;

          if (lastCheckin) {
            const next = new Date(lastCheckin.getTime() + 12 * 60 * 60 * 1000);
            setNextAvailable(next);
          } else {
            setNextAvailable(null);
          }

          setXpAwarded(data.profile.xp || 0);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [userId]);

  // ⏲️ countdown tick
  useEffect(() => {
    if (!nextAvailable) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((nextAvailable.getTime() - Date.now()) / 1000)
      );
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextAvailable]);

  const handleCheckin = async () => {
    if (!userId) {
      alert("Please connect your wallet first!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setXpAwarded((prev) => prev + 5);
        const next = new Date(Date.now() + 12 * 60 * 60 * 1000);
        setNextAvailable(next);
      } else {
        alert(data?.error || "Check-in failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-yellow-950">
      {/* Sidebar only */}
      <Sidebar />

      <main className="pt-14 md:pl-56 p-3 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-100">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-xl font-extrabold tracking-wide">
                Daily Check-in
              </h1>
            </div>

            {/* Wallet connect */}
            <div className="ml-auto">
              <ConnectWallet
                onProfileUpdate={(profile: any) =>
                  setUserId(profile?.id || null)
                }
              />
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-yellow-500/20 bg-black/60 text-yellow-100 p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold">Your Daily Streak</h2>
            <p className="text-sm text-yellow-200/70">
              Check in every 12 hours to keep earning <b>+5 XP</b>. The more
              consistent you are, the more XP you stack!
            </p>

            <div className="flex items-center justify-between bg-black/40 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex flex-col">
                <span className="text-sm opacity-80">Next Check-in</span>
                <span className="text-xl font-bold flex items-center gap-2">
                  {remaining > 0 ? (
                    <>
                      <Clock className="w-4 h-4 text-yellow-400" />
                      {formatCountdown(remaining)}
                    </>
                  ) : (
                    "Available Now"
                  )}
                </span>
              </div>

              <button
                disabled={loading || remaining > 0 || !userId}
                onClick={handleCheckin}
                className={`px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 ${
                  loading || remaining > 0 || !userId
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {remaining > 0
                  ? "Wait..."
                  : !userId
                  ? "Connect Wallet"
                  : "Check-in"}
              </button>
            </div>

            {xpAwarded > 0 && (
              <div className="text-sm text-green-400">
                🎉 You have earned <b>{xpAwarded}</b> XP so far.keep earning!git 
              </div>
            )}
          </div>

          {/* Extra variety / motivational section */}
          <div className="rounded-xl bg-black/40 border border-yellow-500/10 p-4 text-yellow-200/90">
            <h3 className="font-semibold mb-2">Why check in?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Stay consistent and earn rewards daily.</li>
              <li>Boost your profile XP to unlock more quests.</li>
              <li>Return every 12 hours to maximize your streak!</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
