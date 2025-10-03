"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/game-hub/sidebar/page";
import ConnectWallet from "@/components/connectwallet";
import { Loader2, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
        setXpAwarded((prev) => prev + 1000); // XP changed to 100
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
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-black flex">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 pt-14 md:pl-56 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl space-y-10"
        >
          {/* Hero Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow"
            >
              Daily XP Check-in
            </motion.h1>
            <p className="text-yellow-200/80 max-w-xl text-sm md:text-base">
              Come back every <b>12 hours</b> to earn <b>+100 XP</b> and keep
              your streak alive. Build your profile and unlock more quests!
            </p>
            <ConnectWallet
              onProfileUpdate={(profile: any) => setUserId(profile?.id || null)}
            />
          </div>

          {/* Check-in Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-yellow-400/20 bg-black/70 p-10 shadow-2xl space-y-6 backdrop-blur"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-yellow-200/70 text-sm">
                Next Check-in Time
              </span>
              <div className="flex items-center gap-2 text-3xl font-bold text-yellow-300">
                {remaining > 0 ? (
                  <>
                    <Clock className="w-6 h-6 text-yellow-400" />
                    {formatCountdown(remaining)}
                  </>
                ) : (
                  "✅ Available Now"
                )}
              </div>
            </div>

            {/* Progress bar */}
            {remaining > 0 && (
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-yellow-500 h-3 transition-all duration-1000"
                  style={{
                    width: `${100 - (remaining / (12 * 60 * 60)) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Check-in Button */}
            <div className="flex justify-center">
              <button
                disabled={loading || remaining > 0 || !userId}
                onClick={handleCheckin}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 inline-flex items-center gap-3 ${
                  loading || remaining > 0 || !userId
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105 shadow-lg"
                }`}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {remaining > 0
                  ? "Wait..."
                  : !userId
                  ? "Connect Wallet"
                  : "Check-in Now"}
              </button>
            </div>

            {xpAwarded > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-green-400 text-sm mt-4"
              >
                🎉 You have earned <b>{xpAwarded}</b> XP so far, keep stacking!
              </motion.div>
            )}
          </motion.div>

          {/* Motivational Tips as Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Stay Consistent",
                text: "Check in twice a day to maximize your XP streaks.",
              },
              {
                title: "Boost Your XP",
                text: "Higher XP unlocks more quests and hidden rewards.",
              },
              {
                title: "Keep Coming Back",
                text: "Your streak resets if you miss, do not break it!",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="rounded-2xl bg-black/60 border border-yellow-400/10 p-6 text-yellow-200/90 shadow-lg hover:scale-105 transition-transform"
              >
                <h3 className="font-semibold text-yellow-300 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
