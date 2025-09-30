"use client";

import { useState } from "react";
import Sidebar from "./sidebar/page";
import Topbar from "./topbar/page";
import ConnectWallet from "@/components/connectwallet";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  CheckCircle,
  Users,
  Gamepad2,
  Gift,
  Twitter,
  MessageCircle,
  Share2,
  Sun,
  Moon,
} from "lucide-react";
import AudioPlayer from "@/app/components/AudioPlayer";

export default function QuestPage() {
  type Profile = { address: string; xp?: number } | null;
  const [profile, setProfile] = useState<Profile>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-black via-zinc-900 to-black text-yellow-100"
          : "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-200 text-black"
      }`}
    >
      {/* Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Topbar with theme toggle + wallet */}
        <div
          className={`sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 border-b ${
            isDark
              ? "bg-black/60 border-yellow-500/10 text-yellow-100"
              : "bg-yellow-300/60 border-black/20 text-black"
          } backdrop-blur-md`}
        >
          <Topbar />

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold shadow ${
                isDark
                  ? "border-yellow-500/20 hover:bg-yellow-500/10"
                  : "border-black/30 hover:bg-black/10"
              } transition`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" /> Dark
                </>
              )}
            </button>

            {/* Wallet */}
            <ConnectWallet onProfileUpdate={setProfile} />
          </div>
        </div>

        {/* Hero */}
        <header className="px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className={`text-4xl md:text-5xl font-extrabold ${
                  isDark
                    ? "bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-50"
                    : "bg-clip-text text-transparent bg-gradient-to-r from-black via-zinc-700 to-black"
                } drop-shadow-lg`}
              >
                Quest Dashboard
              </h1>
              <p
                className={`mt-3 max-w-xl ${
                  isDark ? "text-yellow-200/80" : "text-black/70"
                }`}
              >
                Manage your progress, track XP, and explore quests, games &
                rewards in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/game-hub/checkin"
                  className={`px-5 py-2 rounded-full font-semibold shadow hover:scale-[1.02] transition ${
                    isDark
                      ? "bg-yellow-500 text-black"
                      : "bg-black text-yellow-300"
                  }`}
                >
                  Daily Check-in
                </Link>
                <Link
                  href="/game-hub/profile"
                  className={`px-5 py-2 rounded-full border transition ${
                    isDark
                      ? "border-yellow-400/20 text-yellow-200 hover:border-yellow-400"
                      : "border-black/30 text-black hover:border-black"
                  }`}
                >
                  Profile
                </Link>
              </div>
            </motion.div>

            {/* XP block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-shrink-0"
            >
              <div
                className={`w-48 h-48 rounded-2xl border backdrop-blur-lg shadow-xl flex flex-col items-center justify-center ${
                  isDark
                    ? "bg-black/60 border-yellow-400/20"
                    : "bg-yellow-200/60 border-black/20"
                }`}
              >
                <div
                  className={`text-xs font-semibold ${
                    isDark ? "text-yellow-200/80" : "text-black/60"
                  }`}
                >
                  TOTAL XP
                </div>
                <div
                  className={`mt-2 text-4xl font-extrabold ${
                    isDark ? "text-yellow-100" : "text-black"
                  }`}
                >
                  {profile?.xp ?? 0}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    isDark ? "text-yellow-200/70" : "text-black/70"
                  }`}
                >
                  {profile ? truncate(profile.address) : "Connect Wallet"}
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 md:px-12 lg:px-20 pb-20 -mt-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Active quests */}
            <section className="lg:col-span-2 space-y-8">
              <motion.div
                whileHover={{ translateY: -6 }}
                className={`p-8 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                  isDark
                    ? "bg-black/70 border-yellow-400/10"
                    : "bg-yellow-100 border-black/20"
                }`}
              >
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-yellow-300" : "text-black"
                  }`}
                >
                  Active Quests
                </h3>
                <p
                  className={`mt-2 ${
                    isDark ? "text-yellow-200/70" : "text-black/70"
                  }`}
                >
                  Complete tasks, earn XP, and rise up the leaderboard.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniPanel
                    title="Daily Check-in"
                    subtitle="+100 XP"
                    hint="Every 12h"
                    icon={<CheckCircle className="w-5 h-5 text-yellow-300" />}
                  />
                  <MiniPanel
                    title="Invite Friends"
                    subtitle="+10 XP"
                    hint="Referral"
                    icon={<Users className="w-5 h-5 text-yellow-300" />}
                  />
                  <MiniPanel
                    title="Setup Profile"
                    subtitle="+10 XP"
                    hint="First-time"
                    icon={<User className="w-5 h-5 text-yellow-300" />}
                  />
                  <MiniPanel
                    title="Social Quest"
                    subtitle="+100 XP"
                    hint="Twitter / Discord / Telegram"
                    icon={<Share2 className="w-5 h-5 text-yellow-300" />}
                  />
                </div>
              </motion.div>
            </section>

            {/* Right column */}
            <aside className="space-y-6">
              {/* Quick actions */}
              <motion.div
                whileHover={{ translateY: -4 }}
                className={`p-6 rounded-2xl border backdrop-blur-xl shadow-xl ${
                  isDark
                    ? "bg-black/70 border-yellow-400/10"
                    : "bg-yellow-100 border-black/20"
                }`}
              >
                <div
                  className={`text-xs ${
                    isDark ? "text-yellow-200/80" : "text-black/70"
                  }`}
                >
                  Quick Access
                </div>
                <div className="mt-4 grid gap-3">
                  <Link
                    href="/games"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      isDark
                        ? "bg-yellow-500 text-black hover:brightness-110"
                        : "bg-black text-yellow-300 hover:brightness-90"
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" /> Games
                  </Link>
                  <Link
                    href="/airdrop"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      isDark
                        ? "border border-yellow-400/20 text-yellow-200 hover:bg-yellow-500/10"
                        : "border border-black/30 text-black hover:bg-black/10"
                    }`}
                  >
                    <Gift className="w-4 h-4" /> Airdrop
                  </Link>
                  <Link
                    href="/game-hub/social"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      isDark
                        ? "border border-yellow-400/20 text-yellow-200 hover:bg-yellow-500/10"
                        : "border border-black/30 text-black hover:bg-black/10"
                    }`}
                  >
                    <Share2 className="w-4 h-4" /> Social Quest
                  </Link>
                </div>
              </motion.div>

              {/* Community */}
              <motion.div
                whileHover={{ translateY: -4 }}
                className={`p-6 rounded-2xl border backdrop-blur-xl shadow-lg ${
                  isDark
                    ? "bg-black/60 border-yellow-400/10"
                    : "bg-yellow-100 border-black/20"
                }`}
              >
                <div
                  className={`text-xs ${
                    isDark ? "text-yellow-200/80" : "text-black/70"
                  }`}
                >
                  Community
                </div>
                <div className="mt-3 flex gap-3">
                  <a
                    href="https://discord.gg/XqHsxPxd8g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 rounded-md font-medium transition ${
                      isDark
                        ? "bg-yellow-500 text-black hover:bg-yellow-400"
                        : "bg-black text-yellow-300 hover:bg-black/80"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" /> Discord
                  </a>
                  <a
                    href="https://twitter.com/aptosdog_xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 rounded-md transition ${
                      isDark
                        ? "border border-yellow-400/20 text-yellow-200 hover:bg-yellow-500/10"
                        : "border border-black/30 text-black hover:bg-black/10"
                    }`}
                  >
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                </div>
              </motion.div>
            </aside>
          </div>
        </main>
      </div>

      <AudioPlayer />
    </div>
  );
}

/* Helpers */
function truncate(addr?: string | null) {
  if (!addr) return "";
  return addr.length > 12
    ? `${addr.slice(0, 6)}...${addr.slice(-6)}`
    : addr;
}

function MiniPanel({
  title,
  subtitle,
  hint,
  icon,
}: {
  title: string;
  subtitle: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-yellow-400/6 backdrop-blur-sm flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-black/40 border border-yellow-400/8">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-80">
          {subtitle} • {hint}
        </div>
      </div>
    </div>
  );
}
