"use client";

import { useState, useEffect } from "react";
import Sidebar from "../sidebar/page";
import Topbar from "../topbar/page";
import ConnectWallet from "@/components/connectwallet";
import SetUsernameForm from "@/components/SetUsernameForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Users, Star, Trophy, Sun, Moon } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [theme, setTheme] = useState<"yellow" | "black">("yellow");

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
    try {
      navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      alert("Copied!");
    }
  }

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

  const level = Math.floor((profile?.xp ?? 0) / 10000) + 1;
  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const isYellow = theme === "yellow";

 return (
  <div
    className={`min-h-screen flex flex-col lg:flex-row ${
      isYellow ? "bg-yellow-400 text-black" : "bg-black text-yellow-300"
    }`}
  >
    {/* ✅ Topbar moved here */}
     <div
  className={`fixed top-0 left-0 right-0 z-40 flex items-center px-4 py-2 ${
    isYellow ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"
  }`}
>
  <Topbar />
</div>


    {/* Sidebar (desktop only) */}
    <div
      className={`hidden lg:flex ${
        isYellow ? "bg-black text-yellow-300" : "bg-yellow-400 text-black"
      } w-16`}
    >
      <Sidebar />
    </div>

    {/* Main content */}
    <div className="flex-1 flex flex-col pt-14">
      {/* Wallet Connect */}
      <div
        className={`p-3 flex justify-end border-b ${
          isYellow ? "border-black bg-yellow-300" : "border-yellow-400 bg-black"
        }`}
      >
        <ConnectWallet onProfileUpdate={(p: any) => setProfile(p)} />
      </div>


        {/* Main content area: responsive */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Profile Section */}
          <section
            className={`w-full lg:w-1/3 p-6 border-b-4 lg:border-b-0 lg:border-r-4 ${
              isYellow ? "border-black" : "border-yellow-400"
            } flex justify-center`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center ${
                isYellow
                  ? "bg-yellow-200 border-4 border-black"
                  : "bg-black border-4 border-yellow-400"
              }`}
            >
              <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-current shadow-md">
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

              <h1 className="mt-4 text-2xl font-extrabold uppercase text-center">
                {profile?.username ||
                  (profile?.wallet ? short(profile.wallet) : "Guest")}
              </h1>

              {/* Wallet button */}
              <button
                onClick={() => copyToClipboard(profile?.wallet ?? "")}
                className={`mt-3 px-4 py-2 rounded-md border-2 font-mono text-sm ${
                  isYellow
                    ? "border-black bg-yellow-300 hover:bg-yellow-100"
                    : "border-yellow-400 bg-black hover:bg-yellow-900"
                }`}
              >
                {profile?.wallet ? short(profile.wallet) : "Not connected"}
              </button>

              {profile && !profile.username && (
                <div className="mt-4 w-full">
                  <SetUsernameForm
                    wallet={profile.wallet}
                    serverProfile={profile}
                    onProfileUpdate={setProfile}
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                <StatBadge
                  icon={<Star />}
                  label="XP"
                  value={profile?.xp ?? 0}
                  theme={theme}
                />
                <StatBadge
                  icon={<Award />}
                  label="Level"
                  value={`Lvl ${level}`}
                  theme={theme}
                />
                <StatBadge
                  icon={<Users />}
                  label="Invites"
                  value={profile?.invite_count ?? 0}
                  theme={theme}
                />
                <StatBadge
                  icon={<Trophy />}
                  label="Rank"
                  value={rank > 0 ? `#${rank}` : "Unranked"}
                  theme={theme}
                />
              </div>
            </motion.div>
          </section>

          {/* Leaderboard Section */}
          <section className="flex-1 p-6">
            <h2
              className={`text-2xl font-extrabold mb-6 border-b-4 pb-2 flex items-center gap-2 ${
                isYellow ? "border-black" : "border-yellow-400"
              }`}
            >
              🏆 Leaderboard
            </h2>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
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
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className={`flex justify-between items-center p-3 rounded-md border-2 ${
                      isSelf
                        ? isYellow
                          ? "bg-black text-yellow-300 border-yellow-300 font-bold"
                          : "bg-yellow-400 text-black border-black font-bold"
                        : isYellow
                        ? "bg-yellow-200 hover:bg-yellow-100 border-black"
                        : "bg-black hover:bg-yellow-900 border-yellow-400"
                    }`}
                  >
                    <span className="w-10 font-bold text-center">
                      #{index + 1}
                    </span>
                    <span className="flex-1 text-left truncate">
                      {user.username || (user.wallet ? short(user.wallet) : "—")}
                    </span>
                    <span className="font-semibold">{user.xp ?? 0} XP</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 text-center font-bold">
              Your Rank: {rank > 0 ? `#${rank}` : "Unranked"}
            </div>
          </section>
        </div>

        {/* Theme Toggle at bottom */}
        <div className="p-4 flex justify-center border-t mt-4">
          <button
            onClick={() =>
              setTheme((prev) => (prev === "yellow" ? "black" : "yellow"))
            }
            className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-current font-bold"
          >
            {isYellow ? (
              <>
                <Moon size={16} /> Dark Mode
              </>
            ) : (
              <>
                <Sun size={16} /> Light Mode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  theme: "yellow" | "black";
}) {
  const isYellow = theme === "yellow";
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-md border-2 shadow ${
        isYellow
          ? "bg-yellow-300 text-black border-black"
          : "bg-black text-yellow-300 border-yellow-400"
      }`}
    >
      <div className="mb-1">{icon}</div>
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

