"use client";

import { useState, useEffect } from "react";
import Topbar from "../topbar/page";
import Sidebar from "../sidebar/page";
import ConnectWallet from "@/components/connectwallet";
import SetUsernameForm from "@/components/SetUsernameForm";
import Image from "next/image";

export default function Profile({ className = "" }) {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // 📌 Fetch leaderboard from supabase API route
  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setLeaderboard(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Re-fetch leaderboard whenever user's xp/username changes
  useEffect(() => {
    if (profile?.username || profile?.xp) {
      fetchLeaderboard();
    }
  }, [profile?.username, profile?.xp]);

  // 📌 Copy to clipboard helper
  function copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  // 📌 Calculate user rank from leaderboard
  const rank =
    leaderboard.findIndex((p) => p.username === profile?.username) + 1;

  // 📌 Calculate level dynamically from XP (100 XP per level)
  const level = Math.floor((profile?.xp ?? 0) / 100) + 1;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-yellow-300 flex ${className}`}
    >
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="max-w-5xl mx-auto p-8 space-y-10">
          {/* Wallet connect */}
          <div className="mb-2">
            <ConnectWallet onProfileUpdate={(p: any) => setProfile(p)} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Info */}
            <div className="bg-black/70 rounded-2xl shadow-xl border border-yellow-500/40 p-8 flex flex-col items-center text-center">
              <div className="w-32 h-32 relative rounded-full overflow-hidden ring-2 ring-yellow-400 mb-4">
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

              <h2 className="text-3xl font-bold">
                {profile?.username || "Guest"}
              </h2>

              {/* User details (copyable) */}
              <p
                className="text-sm text-yellow-400 cursor-pointer"
                onClick={() => copyToClipboard(profile?.invite_code)}
                title="Click to copy"
              >
                Invite Code:{" "}
                <span className="font-mono">{profile?.invite_code || "-"}</span>
              </p>

              <p
                className="text-xs break-all cursor-pointer"
                onClick={() => copyToClipboard(profile?.wallet)}
                title="Click to copy"
              >
                Wallet:{" "}
                <span className="font-mono">
                  {profile?.wallet || "Not connected"}
                </span>
              </p>

              {/* Username + Referral form (only if username not set) */}
              {profile && !profile.username && (
                <div className="mt-6 w-full">
                  <SetUsernameForm
                    wallet={profile.wallet}
                    serverProfile={profile}
                    onProfileUpdate={setProfile}
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-black/70 rounded-2xl shadow-xl border border-yellow-500/40 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-6">Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-yellow-500/20 rounded-lg p-6 text-center">
                  <p className="text-2xl font-bold">{profile?.xp ?? 0}</p>
                  <p className="text-sm">XP</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-6 text-center">
                  <p className="text-2xl font-bold">Level {level}</p>
                  <p className="text-sm">Level</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-6 text-center">
                  <p className="text-2xl font-bold">
                    {profile?.invite_count ?? 0}
                  </p>
                  <p className="text-sm">Invites</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-6 text-center">
                  <p className="text-2xl font-bold">
                    #{rank > 0 ? rank : "Unranked"}
                  </p>
                  <p className="text-sm">User Rank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-black/70 rounded-2xl shadow-xl border border-yellow-500/40 p-8">
            <h3 className="text-xl font-semibold mb-6">Leaderboard</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-yellow-400 border-b border-yellow-500/30">
                  <th className="py-2 px-4">Rank</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr
                    key={`${user.username}-${index}`}
                    className={`${
                      user.username === profile?.username
                        ? "bg-yellow-500/20 font-bold"
                        : "hover:bg-yellow-500/10"
                    }`}
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{user.username}</td>
                    <td className="py-2 px-4">{user.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-center">
              <p className="text-lg">
                Your Rank:{" "}
                <span className="font-bold text-yellow-400">
                  #{rank > 0 ? rank : "Unranked"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
