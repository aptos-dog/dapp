"use client";

import { useState } from "react";
import Sidebar from "./sidebar/page";
import Topbar from "./topbar/page";
import ConnectWallet from "@/components/connectwallet";
import Link from "next/link";
import { motion } from "framer-motion";

// icons
import { User, CheckCircle, Users } from "lucide-react";

export default function QuestPage() {
  type Profile = { address: string } | null;
  const [profile, setProfile] = useState<Profile>(null);
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-950 text-yellow-100">
      {/* Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-40">
          <Topbar />
        </div>

        {/* Wallet Connect */}
        <div className="p-4 flex justify-end border-b border-yellow-500/20 bg-black/40 backdrop-blur-md">
          <ConnectWallet onProfileUpdate={setProfile} />
        </div>

        {/* Hero Banner */}
        <section className="relative py-16 px-6 text-center bg-gradient-to-r from-yellow-400/10 via-yellow-700/20 to-black border-b border-yellow-500/20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-yellow-300 drop-shadow-lg"
          >
            Aptos Dog Quest Dashboard
          </motion.h1>
          <p className="mt-4 text-yellow-200/90 max-w-2xl mx-auto">
            Choose your path: complete daily check-ins, upgrade your profile, or join social quests.  
            Every step brings you closer to the top of the leaderboard.
          </p>
        </section>

        {/* Main Layout: Sidebar Stats + Content */}
        <div className="flex flex-1">
          {/* Left Quest Progress Panel */}
          <aside className="hidden md:flex flex-col w-64 bg-black/50 border-r border-yellow-500/20 p-6 space-y-6">
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-300">Your Progress</p>
              <div className="mt-4">
                <p className="text-sm text-yellow-200/70">XP</p>
                <p className="text-2xl font-extrabold">{profile ? 120 : 0}</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-yellow-200/70">Level</p>
                <p className="text-xl font-bold">5</p>
              </div>
              <div className="mt-6">
                <div className="w-full bg-yellow-900/40 rounded-full h-3">
                  <div className="bg-yellow-400 h-3 rounded-full w-[60%]" />
                </div>
                <p className="mt-1 text-xs text-yellow-200">60% to next level</p>
              </div>
            </div>
          </aside>

          {/* Right Main Quest Content */}
          <main className="flex-1 p-8">
            {/* Tabs */}
            <div className="flex justify-center gap-6 mb-10">
              {[
                { id: "profile", label: "Profile", icon: <User /> },
                { id: "checkin", label: "Daily Check-in", icon: <CheckCircle /> },
                { id: "social", label: "Social Quests", icon: <Users /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                    activeTab === tab.id
                      ? "bg-yellow-500/20 border-yellow-400 text-yellow-300"
                      : "bg-black/40 border-yellow-500/20 hover:bg-yellow-500/10"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "profile" && (
                <QuestSection
                  title="Your Profile"
                  description={
                    profile
                      ? `Connected: ${profile.address}`
                      : "Please connect your wallet to get started."
                  }
                  link={{ href: "/quest/profile", text: "Go to Profile →" }}
                />
              )}

              {activeTab === "checkin" && (
                <QuestSection
                  title="Daily Check-in"
                  description="Log in every 12 hours to earn +5 XP. Stay consistent and grow stronger!"
                  link={{ href: "/quest/checkin", text: "Open Check-in →" }}
                />
              )}

              {activeTab === "social" && (
                <QuestSection
                  title="Social Quests"
                  description="Join community challenges, share the movement, and earn bonus XP."
                  link={{ href: "/quest/social", text: "Join Social Tasks →" }}
                />
              )}
            </div>
          </main>
        </div>

        {/* How It Works - Horizontal Story Path */}
        <section className="px-6 md:px-10 py-20 mt-10 bg-gradient-to-t from-black via-black/70 to-black/40 border-t border-yellow-500/20">
          <h2 className="text-3xl font-bold text-yellow-300 mb-12 text-center drop-shadow-lg">
            How It Works
          </h2>

          <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4">
            {[
              "🔥 Earn XP through quests.",
              "⬆️ Every 100 XP = +1 Level.",
              "👥 Invite friends for bonus XP.",
              "🏆 Climb the leaderboard.",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center min-w-[12rem]"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-400 shadow-lg mb-4">
                  <span className="text-yellow-300 font-bold text-lg">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-yellow-100 text-center">{step}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* 🔹 Reusable Quest Section */
function QuestSection({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: { href: string; text: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-black/60 backdrop-blur-lg rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-400/20 transition"
    >
      <h3 className="text-xl font-bold text-yellow-300 mb-2">{title}</h3>
      <p className="text-sm text-yellow-100/90">{description}</p>
      <Link
        href={link.href}
        className="mt-4 inline-block text-yellow-400 hover:text-yellow-200 font-semibold transition"
      >
        {link.text}
      </Link>
    </motion.div>
  );
}
