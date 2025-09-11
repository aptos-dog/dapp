"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AudioPlayer from "@/app/components/AudioPlayer";

export default function AirdropPage() {
  const [wallet, setWallet] = useState<string>("");
  const [eligibleWallets, setEligibleWallets] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"eligible" | "not-eligible" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  // Refs for sounds
  const successSound = useRef<HTMLAudioElement | null>(null);
  const failSound = useRef<HTMLAudioElement | null>(null);

  // Fetch eligible wallets from GitHub
  useEffect(() => {
    async function fetchWallets() {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/aptos-dog/eligibility-check/refs/heads/main/eligible_wallets.txt"
        );
        const text = await res.text();
        const wallets = text.split("\n").map((w) => w.trim().toLowerCase());
        setEligibleWallets(new Set(wallets));
      } catch (err) {
        console.error("Error loading wallets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWallets();
  }, []);

  const handleCheck = () => {
    if (!wallet) return;
    setChecking(true);

    setTimeout(() => {
      const normalized = wallet.trim().toLowerCase();
      if (eligibleWallets.has(normalized)) {
        setStatus("eligible");
        successSound.current?.play();
      } else {
        setStatus("not-eligible");
        failSound.current?.play();
      }
      setChecking(false);
    }, 800); // small delay for UX polish
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-white">
      <Navbar />

      {/* Top spacing so navbar doesn’t block content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="bg-black/70 px-8 py-14 rounded-2xl shadow-2xl border border-yellow-400 text-center max-w-2xl w-full"
        >
          {/* Header */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-4"
          >
            🚀 Season 0 Airdrop Checker is Live!
          </motion.h2>

          {/* Headline */}
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_rgba(255,255,0,0.85)]"
          >
            APTDOG AIRDROP
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 text-lg sm:text-xl text-yellow-100/90 leading-relaxed"
          >
            The <span className="font-semibold text-yellow-300">most anticipated drop, </span>  
            on Aptos is almost here. <br />
            Early supporters will be rewarded, do not miss your chance.
          </motion.p>

          {/* New Season Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 bg-yellow-400/10 border border-yellow-400 rounded-xl p-6 text-yellow-100"
          >
            <p className="text-lg sm:text-xl">
              🎉 <span className="text-yellow-300 font-semibold">Season 0</span> has concluded.  
              Now, <span className="text-yellow-300 font-semibold">Season 1</span> is live!  
              Earn <span className="text-yellow-300 font-bold">more XP</span> by playing games and completing quests.
            </p>
            <p className="mt-4 text-xl font-bold text-yellow-300">
              Join Season 1 today and climb the leaderboard!
            </p>
            <p className="mt-3 text-base text-yellow-200">
              ✨check your eligibility for <span className="font-semibold text-yellow-300">Season 0</span> rewards!
            </p>
          </motion.div>

          {/* Eligibility Checker */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <input
              type="text"
              placeholder="Paste your wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-yellow-100 text-black text-lg placeholder-gray-500 focus:outline-none border-2 border-yellow-400"
            />
            <button
              onClick={handleCheck}
              disabled={loading || checking}
              className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold text-lg shadow-md hover:bg-yellow-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></span>
                  Loading Wallets...
                </>
              ) : checking ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></span>
                  Scanning...
                </>
              ) : (
                "🚀 Scan"
              )}
            </button>

            {status === "eligible" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-green-400 font-bold text-xl"
              >
                ✅ Congratulations! This wallet is eligible.
              </motion.div>
            )}
            {status === "not-eligible" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-400 font-bold text-xl"
              >
                ❌ Sorry, this wallet is not eligible.
              </motion.div>
            )}
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://aptosdog.xyz/game-hub"
              target="_blank"
              className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold text-lg shadow-md hover:bg-yellow-300 transition"
            >
              🏆 Join Season 1
            </a>
            <a
              href="https://aptosdog.xyz/games"
              target="_blank"
              className="px-6 py-3 rounded-xl bg-black/70 border border-yellow-400 text-yellow-300 font-semibold text-lg shadow-md hover:bg-black/90 transition"
            >
              🎮 Play Games
            </a>
          </motion.div>

          {/* Motivational Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.4,
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="mt-8 text-base sm:text-lg md:text-xl font-bold text-yellow-300"
          >
            Complete quests. Play games. <br className="sm:hidden" />  
            Get ready for <span className="text-green-400">$APTDOG</span>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
      <AudioPlayer />

      {/* Sound Effects */}
      <audio ref={successSound} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_b9fbd92f11.mp3?filename=success-1-6297.mp3" preload="auto" />
      <audio ref={failSound} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_3e97ef7ee7.mp3?filename=fail-1-89170.mp3" preload="auto" />

    </div>
  );
}
