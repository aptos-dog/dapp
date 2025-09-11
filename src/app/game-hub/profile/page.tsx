"use client";

import { useState, useEffect } from "react";
import Sidebar from "../sidebar/page";
import Topbar from "../topbar/page";
import ConnectWallet from "@/components/connectwallet";
import SetUsernameForm from "@/components/SetUsernameForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Users, Star, Trophy } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setLeaderboard(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (profile?.username || profile?.xp) {
      fetchLeaderboard();
    }
  }, [profile?.username, profile?.xp]);

  function copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  // Rank logic
  const rank = (() => {
    if (!profile || leaderboard.length === 0) return 0;

    const idx = leaderboard.findIndex((u) => {
      if (profile.id && u.id && u.id === profile.id) return true;
      if (profile.wallet && u.wallet && u.wallet === profile.wallet) return true;
      if (
        profile.username &&
        u.username &&
        String(u.username).toLowerCase() ===
          String(profile.username).toLowerCase()
      )
        return true;
      return false;
    });

    return idx >= 0 ? idx + 1 : 0;
  })();

  const level = Math.floor((profile?.xp ?? 0) / 100) + 1;

  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-yellow-100">
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
          <ConnectWallet onProfileUpdate={(p: any) => setProfile(p)} />
        </div>

        {/* Hero Section */}
        <section className="relative py-16 px-6 text-center bg-gradient-to-b from-black/50 via-black/70 to-transparent">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 relative rounded-full overflow-hidden ring-4 ring-yellow-400 shadow-lg">
              <Image
                src={
                  profile?.image_url ||
                  "https://i.postimg.cc/bvX12x2w/APTDOG.png"
                }
                alt="User Profile"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-yellow-300">
              {profile?.username ||
                (profile?.wallet ? short(profile.wallet) : "Guest")}
            </h1>
            <p
              onClick={() => copyToClipboard(profile?.wallet)}
              className="text-sm text-yellow-400 cursor-pointer"
            >
              {profile?.wallet || "Not connected"}
            </p>

            {profile && !profile.username && (
              <div className="mt-4 max-w-sm w-full">
                <SetUsernameForm
                  wallet={profile.wallet}
                  serverProfile={profile}
                  onProfileUpdate={setProfile}
                />
              </div>
            )}
          </motion.div>
        </section>

        {/* Stats Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 md:px-10 py-10">
          <StatBadge icon={<Star />} label="XP" value={profile?.xp ?? 0} />
          <StatBadge icon={<Award />} label="Level" value={`Lvl ${level}`} />
          <StatBadge
            icon={<Users />}
            label="Invites"
            value={profile?.invite_count ?? 0}
          />
          <StatBadge
            icon={<Trophy />}
            label="Rank"
            value={rank > 0 ? `#${rank}` : "Unranked"}
          />
        </section>

        {/* Leaderboard */}
        <section className="px-6 md:px-10 pb-20">
          <h2 className="text-2xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
            🏆 Leaderboard
          </h2>

          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
            {leaderboard.slice(0, 100).map((user, index) => {
              const isSelf =
                (profile?.id && user.id === profile.id) ||
                (profile?.wallet && user.wallet === profile.wallet) ||
                (profile?.username &&
                  user.username &&
                  String(user.username).toLowerCase() ===
                    String(profile.username).toLowerCase());

              return (
                <motion.div
                  key={user.id ?? `${user.username}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className={`flex justify-between items-center p-4 rounded-xl border shadow-md ${
                    isSelf
                      ? "bg-yellow-500/20 border-yellow-400 text-yellow-200 font-bold"
                      : "bg-black/50 border-yellow-500/30 hover:bg-yellow-500/10"
                  }`}
                >
                  <span className="w-12 font-bold text-center">
                    #{index + 1}
                  </span>
                  <span className="flex-1 text-left">
                    {user.username ||
                      (user.wallet ? short(user.wallet) : "—")}
                  </span>
                  <span className="font-semibold">{user.xp ?? 0} XP</span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg">
              Your Rank:{" "}
              <span className="font-bold text-yellow-400">
                {rank > 0 ? `#${rank}` : "Unranked"}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* 🔹 Reusable Stat Badge */
function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-yellow-500/30"
    >
      <div className="text-yellow-400 mb-2">{icon}</div>
      <p className="text-xl font-bold text-yellow-200">{value}</p>
      <p className="text-sm text-yellow-400">{label}</p>
    </motion.div>
  );
}
