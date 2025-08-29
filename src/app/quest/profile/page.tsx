"use client";

import { useState, useEffect } from "react";
import Topbar from "../topbar/page";
import Sidebar from "../sidebar/page";
import ConnectWallet from "@/components/connectwallet";
import SetUsernameForm from "@/components/SetUsernameForm";
import Image from "next/image";

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
        String(u.username).toLowerCase() === String(profile.username).toLowerCase()
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-yellow-300 flex">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Full-width Topbar */}
        <div className="w-full">
          <Topbar />
        </div>

        {/* Main body content */}
        <div className="max-w-6xl mx-auto p-6 space-y-10 w-full">
          {/* Wallet connect */}
          <div className="mb-2">
            <ConnectWallet onProfileUpdate={(p: any) => setProfile(p)} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Info */}
            <div className="bg-black/70 rounded-2xl shadow-lg border border-yellow-500/40 p-8 flex flex-col items-center text-center">
              <div className="w-28 h-28 relative rounded-full overflow-hidden ring-2 ring-yellow-400 mb-4">
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

              <h2 className="text-2xl font-bold mb-2">
                {profile?.username || (profile?.wallet ? short(profile.wallet) : "Guest")}
              </h2>

              <p
                className="text-sm text-yellow-400 cursor-pointer mb-1"
                onClick={() => copyToClipboard(profile?.invite_code)}
                title="Click to copy"
              >
                Invite Code:{" "}
                <span className="font-mono">{profile?.invite_code || "-"}</span>
              </p>

              <p
                className="text-xs break-all cursor-pointer text-yellow-200"
                onClick={() => copyToClipboard(profile?.wallet)}
                title="Click to copy"
              >
                Wallet:{" "}
                <span className="font-mono">
                  {profile?.wallet || "Not connected"}
                </span>
              </p>

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
            <div className="bg-black/70 rounded-2xl shadow-lg border border-yellow-500/40 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-6">Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-yellow-500/20 rounded-lg p-5 text-center">
                  <p className="text-2xl font-bold">{profile?.xp ?? 0}</p>
                  <p className="text-sm">XP</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-5 text-center">
                  <p className="text-2xl font-bold">Lvl {level}</p>
                  <p className="text-sm">Level</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-5 text-center">
                  <p className="text-2xl font-bold">
                    {profile?.invite_count ?? 0}
                  </p>
                  <p className="text-sm">Invites</p>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-5 text-center">
                  <p className="text-2xl font-bold">
                    #{rank > 0 ? rank : "Unranked"}
                  </p>
                  <p className="text-sm">Rank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-black/70 rounded-2xl shadow-lg border border-yellow-500/40 p-6">
            <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard (Top 100)</h3>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-yellow-500/20">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/80">
                  <tr className="text-yellow-400 border-b border-yellow-500/30">
                    <th className="py-2 px-4">Rank</th>
                    <th className="py-2 px-4">User</th>
                    <th className="py-2 px-4">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 100).map((user, index) => (
                    <tr
                      key={user.id ?? `${user.username}-${index}`}
                      className={`${
                        (profile?.id && user.id === profile.id) ||
                        (profile?.wallet && user.wallet === profile.wallet) ||
                        (profile?.username &&
                          user.username &&
                          String(user.username).toLowerCase() ===
                            String(profile.username).toLowerCase())
                          ? "bg-yellow-500/20 font-bold"
                          : "hover:bg-yellow-500/10"
                      }`}
                    >
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">
                        {user.username || (user.wallet ? short(user.wallet) : "—")}
                      </td>
                      <td className="py-2 px-4">{user.xp ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
