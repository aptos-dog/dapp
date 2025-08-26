"use client";

import { motion } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import Link from "next/link";
import { Gamepad2, Bomb, RotateCcw, Brain, Map, Home } from "lucide-react";

export default function GamesDashboard() {
  const games = [
    {
      title: "Dropdown Bomb",
      icon: <Bomb className="w-10 h-10 text-yellow-400" />,
      href: "/games/dropdown-bomb",
      desc: "Pick items, but avoid the bomb!",
    },
    {
      title: "Spin the Wheel",
      icon: <RotateCcw className="w-10 h-10 text-yellow-400" />,
      href: "/games/spin-the-wheel",
      desc: "Try your luck and win XP rewards.",
    },
    {
      title: "Memory Flip",
      icon: <Brain className="w-10 h-10 text-yellow-400" />,
      href: "/games/memory-flip",
      desc: "Test your memory and earn points.",
    },
    {
      title: "Where Game",
      icon: <Map className="w-10 h-10 text-yellow-400" />,
      href: "/games/where",
      desc: "Guess the location for XP!",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-black">
      {/* Topbar */}
      <Topbar />

      {/* Wallet Connect + Home Link */}
      <div className="flex justify-between items-center px-6 mt-4">
        <Link
          href="https://aptosdog.xyz/"
          className="flex items-center gap-3 bg-black/70 border border-yellow-400 rounded-xl px-4 py-2 shadow-md hover:shadow-yellow-400/40 hover:scale-105 transition"
        >
          <Home className="w-5 h-5 text-yellow-300" />
          <span className="text-yellow-200 font-semibold">
            Return to Home
          </span>
        </Link>
        <ConnectWallet onProfileUpdate={() => {}} />
      </div>

      {/* Dashboard Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-10">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)] mb-6 text-center"
        >
          🎮 Choose Your Game
        </motion.h1>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl bg-black/60 border border-yellow-400/40 rounded-2xl shadow-md p-8 mb-12 text-center"
        >
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">
            Welcome to Aptos Dog Games
          </h2>
          <p className="text-white/80 leading-relaxed mb-3">
            Enter the world of <span className="font-bold">$APTDOG</span> and
            explore fun blockchain-powered games. Each game is designed to test
            your luck, skill, and memory — while rewarding you with XP to climb
            the leaderboard.
          </p>
          <p className="text-yellow-200 font-semibold">
            Play daily, earn XP, and prove yourself in the Aptos Dog Quest
            universe!
          </p>
        </motion.div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {games.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="bg-black/70 border border-yellow-400 rounded-2xl shadow-xl p-8 hover:shadow-yellow-400/50 hover:scale-105 transition transform"
            >
              <Link href={game.href}>
                <div className="flex flex-col items-center text-center space-y-4 cursor-pointer">
                  {game.icon}
                  <h2 className="text-2xl font-bold text-yellow-300">
                    {game.title}
                  </h2>
                  <p className="text-white/80 text-sm">{game.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Keep Audio */}
      <AudioPlayer />
    </div>
  );
}
