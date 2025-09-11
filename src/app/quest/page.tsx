"use client";

import { useState } from "react";
import Sidebar from "./sidebar/page";
import Topbar from "./topbar/page";
import ConnectWallet from "@/components/connectwallet";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, CheckCircle, Users, Gamepad2, Gift, Twitter, MessageCircle } from "lucide-react";

export default function QuestPage() {
  type Profile = { address: string; xp?: number } | null;
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-yellow-900/40 to-black text-yellow-100 overflow-hidden">
      {/* Background glow + grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-yellow-950 to-black opacity-95" />
        <div className="absolute inset-0 neon-grid opacity-30" />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Topbar */}
        <div className="sticky top-0 z-40">
          <Topbar />
        </div>

        {/* Wallet strip */}
        <div className="p-4 flex justify-end border-b border-yellow-500/10 bg-black/40 backdrop-blur-sm">
          <ConnectWallet onProfileUpdate={setProfile} />
        </div>

        {/* Hero */}
        <header className="px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-50 drop-shadow-lg">
                Quest Dashboard
              </h1>
              <p className="mt-3 text-yellow-200/80 max-w-xl">
                Manage your progress, track XP, and explore games & airdrops in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/quest/checkin"
                  className="px-5 py-2 rounded-full bg-yellow-500 text-black font-semibold shadow-neon hover:scale-[1.02] transition"
                >
                  Daily Check-in
                </Link>
                <Link
                  href="/quest/profile"
                  className="px-5 py-2 rounded-full border border-yellow-400/20 text-yellow-200 hover:border-yellow-400 transition"
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
              <div className="w-48 h-48 rounded-2xl bg-[rgba(10,10,10,0.65)] border border-yellow-400/20 backdrop-blur-lg shadow-xl flex flex-col items-center justify-center">
                <div className="text-xs text-yellow-200/80 font-semibold">TOTAL XP</div>
                <div className="mt-2 text-4xl font-extrabold text-yellow-100">
                  {profile?.xp ?? 0}
                </div>
                <div className="mt-3 text-sm text-yellow-200/70">
                  {profile ? truncate(profile.address) : "Connect Wallet"}
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 md:px-12 lg:px-20 pb-20 -mt-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <section className="lg:col-span-2 space-y-8">
              {/* Active quests */}
              <motion.div
                whileHover={{ translateY: -6 }}
                className="p-8 rounded-2xl bg-[rgba(12,12,12,0.65)] border border-yellow-400/10 backdrop-blur-xl shadow-2xl"
              >
                <h3 className="text-xl font-bold text-yellow-300">Active Quests</h3>
                <p className="mt-2 text-yellow-200/70">
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
                    subtitle="+50 XP"
                    hint="First-time"
                    icon={<User className="w-5 h-5 text-yellow-300" />}
                  />
                </div>
              </motion.div>
            </section>

            {/* Right column */}
            <aside className="space-y-6">
              {/* Quick actions */}
              <motion.div
                whileHover={{ translateY: -4 }}
                className="p-6 rounded-2xl bg-[rgba(10,10,10,0.6)] border border-yellow-400/10 backdrop-blur-xl shadow-xl"
              >
                <div className="text-xs text-yellow-200/80">Quick Access</div>
                <div className="mt-4 grid gap-3">
                  <Link
                    href="/games"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold shadow-neon hover:brightness-105 transition"
                  >
                    <Gamepad2 className="w-4 h-4" /> Games
                  </Link>
                  <Link
                    href="/airdrop"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-yellow-400/20 text-yellow-200 hover:bg-yellow-500/5 transition"
                  >
                    <Gift className="w-4 h-4" /> Airdrop
                  </Link>
                </div>
              </motion.div>

              {/* Community */}
              <motion.div
                whileHover={{ translateY: -4 }}
                className="p-6 rounded-2xl bg-[rgba(12,12,12,0.55)] border border-yellow-400/10 backdrop-blur-xl shadow-lg"
              >
                <div className="text-xs text-yellow-200/80">Community</div>
                <div className="mt-3 flex gap-3">
                  <a
                    href="https://discord.gg/XqHsxPxd8g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 flex items-center justify-center gap-2 rounded-md bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Discord
                  </a>
                  <a
                    href="https://twitter.com/aptosdog_xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 flex items-center justify-center gap-2 rounded-md border border-yellow-400/20 text-yellow-200 hover:bg-yellow-500/5 transition"
                  >
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                </div>
              </motion.div>
            </aside>
          </div>
        </main>
      </div>

      {/* Extra CSS */}
      <style jsx>{`
        .neon-grid {
          background-image:
            linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridShift 12s linear infinite;
        }
        @keyframes gridShift {
          0% { background-position: 0 0, 0 0; }
          50% { background-position: 30px 30px, -30px -30px; }
          100% { background-position: 0 0, 0 0; }
        }
        .shadow-neon {
          box-shadow: 0 0 20px rgba(234,179,8,0.25);
        }
      `}</style>
    </div>
  );
}

/* Helpers */
function truncate(addr?: string | null) {
  if (!addr) return "";
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr;
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
        <div className="text-sm font-semibold text-yellow-100">{title}</div>
        <div className="text-xs text-yellow-200/70">{subtitle} • {hint}</div>
      </div>
    </div>
  );
}
