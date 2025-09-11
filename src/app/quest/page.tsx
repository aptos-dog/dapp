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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-600 to-black text-yellow-100">
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

        {/* Hero Section */}
        <section className="relative py-20 px-6 text-center bg-gradient-to-b from-black/50 via-black/60 to-transparent">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 text-transparent bg-clip-text drop-shadow-2xl"
          >
            Welcome to Aptos Dog Quest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-yellow-100/90 max-w-3xl mx-auto leading-relaxed"
          >
            Earn <span className="font-bold">XP</span>, climb {" "}
            <span className="font-bold">Levels</span>, and unlock the future of {" "}
            <span className="font-bold">$APTDOG</span> on the Aptos Blockchain.
            Complete daily check-ins and social quests to grow your power.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3 text-md italic text-yellow-200"
          >
            ⚡ Do not miss out, only the strongest will rise in Aptos Dog Quest!
          </motion.p>
        </section>

        {/* Quest Hub */}
        <main className="px-6 md:px-10 pb-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <QuestCard
            icon={<User className="w-7 h-7 text-yellow-400" />}
            title="Profile"
            description={
              profile
                ? `Connected: ${profile.address}`
                : "Please connect your wallet."
            }
            link={{ href: "/quest/profile", text: "Go to Profile →" }}
          />

          <QuestCard
            icon={<CheckCircle className="w-7 h-7 text-yellow-400" />}
            title="Daily Check-in"
            description="Check-in every 12 hours and earn +5 XP. Stay consistent and keep leveling up!"
            link={{ href: "/quest/checkin", text: "Open Check-in →" }}
          />

          <QuestCard
            icon={<Users className="w-7 h-7 text-yellow-400" />}
            title="Social Quests"
            description="Join our social challenges, connect with the community, and earn bonus XP by spreading the word about $APTDOG."
            link={{ href: "/quest/social", text: "Join Social Tasks →" }}
          />
        </main>

        {/* How It Works */}
        <section className="px-6 md:px-10 py-20 mt-10 bg-gradient-to-t from-black via-black/70 to-black/40 border-t border-yellow-500/20 shadow-inner rounded-t-3xl">
          <h2 className="text-3xl font-bold text-yellow-300 mb-12 text-center drop-shadow-lg">
            How It Works
          </h2>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-5 top-0 w-1 h-full bg-gradient-to-b from-yellow-400/90 to-yellow-700/30 rounded-full" />

            <div className="space-y-12">
              {[
                "🔥 Earn XP by completing daily check-ins and social quests.",
                "⬆️ Every 100 XP = +1 Level. Level up and showcase your strength.",
                "👥 Invite friends, you earn +5 XP, they get +10 XP for joining.",
                "🏆 Climb the quest ladder and prepare for the rise of $APTDOG.",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative pl-14"
                >
                  {/* Step Circle */}
                  <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-400 shadow-lg">
                    <span className="text-yellow-300 font-bold">{i + 1}</span>
                  </div>

                  {/* Step Content */}
                  <div className="p-5 bg-black/50 border border-yellow-500/30 rounded-xl shadow-lg hover:shadow-yellow-400/20 transition">
                    <p className="text-yellow-100 text-sm md:text-base">
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-14 text-center font-semibold text-yellow-200 text-lg max-w-xl mx-auto">
            The future of Aptos Dog belongs to the most loyal and active questers.
            Will you rise to the top? 🐕⚡
          </p>
        </section>
      </div>
    </div>
  );
}

/* Reusable Card Component */
function QuestCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: { href: string; text: string };
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="p-6 bg-black/70 backdrop-blur-lg rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-400/30 transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h2 className="text-xl font-bold text-yellow-300">{title}</h2>
        </div>
        <p className="text-sm text-yellow-100/90">{description}</p>
      </div>
      <Link
        href={link.href}
        className="mt-4 inline-block text-yellow-400 hover:text-yellow-200 font-semibold transition"
      >
        {link.text}
      </Link>
    </motion.div>
  );
}
