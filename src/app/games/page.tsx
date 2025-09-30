"use client";

import { motion } from "framer-motion";
import Topbar from "@/app/game-hub/topbar/page";
import Sidebar from "@/app/game-hub/sidebar/page"; // ✅ Sidebar import
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import Link from "next/link";
import {
  Gamepad2,
  Bomb,
  RotateCcw,
  Brain,
  Map,
  Home,
  Layers,
  Dog,
  Star,
} from "lucide-react";

export default function Page() {
  const games = [
    {
      title: "Dropdown Bomb",
      icon: (
        <Bomb className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/dropdown-bomb",
      desc: "Pick items, but avoid the bomb!",
    },
    {
      title: "Spin the Wheel",
      icon: (
        <RotateCcw className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/spin-the-wheel",
      desc: "Try your luck and win XP rewards.",
    },
    {
      title: "Memory Flip",
      icon: (
        <Brain className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/memory-flip",
      desc: "Test your memory and earn XP.",
    },
    {
      title: "Word Guess Game",
      icon: (
        <Map className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/word-guess",
      desc: "Guess the location for XP!",
    },
    {
      title: "Tower Stack",
      icon: (
        <Layers className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/tower-stack",
      desc: "Stack the blocks perfectly to earn XP.",
    },
    {
      title: "Whack-a-Dog",
      icon: (
        <Dog className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/whack-a-dog",
      desc: "Whack the sneaky dogs to score XP!",
    },
    {
      title: "Simon Says",
      icon: (
        <Star className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/simon-says",
      desc: "Follow the sequence and test your memory!",
    },
    {
      title: "Quick Tap Reflex",
      icon: (
        <Gamepad2 className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]" />
      ),
      href: "/games/quick-tap",
      desc: "Test your reflexes, tap as fast as you can before time runs out!",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* Animated glowing background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,0,0.15),transparent_60%)]" />
      </div>

      {/* Topbar */}
      <Topbar />

      {/* Layout with Sidebar + Main Content */}
      <div className="flex flex-grow relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          {/* Wallet Connect + Home Link */}
          <div className="flex justify-between items-center px-6 mt-4">
            <Link
              href="/game-hub"
              className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-400 rounded-xl px-4 py-2 shadow-[0_0_15px_rgba(255,255,0,0.7)] hover:shadow-[0_0_25px_rgba(255,255,0,1)] hover:scale-105 transition"
            >
              <Home className="w-6 h-6 text-yellow-300" />
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
              className="text-6xl font-extrabold text-yellow-400 drop-shadow-[0_0_25px_rgba(255,255,0,0.9)] mb-10 text-center tracking-wider"
            >
              🕹️ Game Hub
            </motion.h1>

            {/* Intro Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl bg-yellow-500/10 border border-yellow-400/60 rounded-2xl shadow-[0_0_25px_rgba(255,255,0,0.8)] p-10 mb-16 text-center backdrop-blur-lg"
            >
              <h2 className="text-3xl font-bold text-yellow-300 mb-4">
                Welcome to Aptos Dog Arcade
              </h2>
              <p className="text-gray-200 leading-relaxed mb-3">
                Step into the{" "}
                <span className="font-bold text-yellow-400">$APTDOG</span>{" "}
                universe and explore thrilling blockchain-powered games. Each
                challenge is built to test your skills while earning XP that
                pushes you up the leaderboard.
              </p>
              <p className="text-yellow-300 font-semibold text-lg">
                Play, compete, and claim your place as the ultimate Aptos Dog
                gamer!
              </p>
            </motion.div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
              {games.map((game, i) => (
                <motion.div
                  key={game.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  className="bg-gradient-to-br from-zinc-900 to-black border-2 border-yellow-400 rounded-3xl shadow-[0_0_30px_rgba(255,255,0,0.6)] p-8 hover:shadow-[0_0_40px_rgba(255,255,0,1)] transition transform cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-yellow-400/10 blur-2xl"></div>
                  <Link href={game.href}>
                    <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                      {game.icon}
                      <h2 className="text-2xl font-bold text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]">
                        {game.title}
                      </h2>
                      <p className="text-gray-300 text-sm">{game.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Keep Audio */}
      <AudioPlayer />
    </div>
  );
}
