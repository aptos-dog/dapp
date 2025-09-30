"use client";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AudioPlayer from "@/app/components/AudioPlayer";

export default function AirdropPage() {
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
            🚀 Season 0 Airdrop Checker
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

          {/* ✅ Coming Soon replaces checker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-12 text-3xl sm:text-4xl font-bold text-yellow-300"
          >
            ✨ Coming Soon...
          </motion.div>

          {/* New Season Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 bg-yellow-400/10 border border-yellow-400 rounded-xl p-6 text-yellow-100"
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
              🎮 Play games. Complete quests. Earn rewards.
            </p>
          </motion.div>

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
    </div>
  );
}

