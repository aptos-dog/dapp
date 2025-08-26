"use client";

import { useState } from "react";
import Sidebar from "./sidebar/page";
import Topbar from "./topbar/page";
import ConnectWallet from "@/components/connectwallet";
import Link from "next/link";

// icons
import { User, CheckCircle, Users, Share2, Coins, Star, Trophy } from "lucide-react";

export default function QuestPage() {
  type Profile = { address: string } | null;
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Wallet Connect */}
        <div className="p-4">
          <ConnectWallet onProfileUpdate={setProfile} />
        </div>

        {/* Main Hub */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-yellow-300">
          {/* Profile preview */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Profile</h2>
            </div>
            {profile ? (
              <p className="text-sm">Connected: {profile.address}</p>
            ) : (
              <p className="text-sm">Please connect your wallet.</p>
            )}
            <Link
              href="/quest/profile"
              className="text-yellow-400 hover:text-yellow-200 font-semibold mt-3 block"
            >
              Go to Profile →
            </Link>
          </div>

          {/* Daily Check-in */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Daily Check-in</h2>
            </div>
            <Link
              href="/quest/checkin"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Open Check-in →
            </Link>
          </div>

          {/* Social */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Social</h2>
            </div>
            <Link
              href="/quest/social"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Join Social Tasks →
            </Link>
          </div>

          {/* Referral */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Referral</h2>
            </div>
            <Link
              href="/quest/referral"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              View Referral Program →
            </Link>
          </div>

          {/* Token */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Token</h2>
            </div>
            <Link
              href="/quest/token"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Token Dashboard →
            </Link>
          </div>

          {/* Extra */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Extra</h2>
            </div>
            <Link
              href="/quest/extra"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Explore Extra Quests →
            </Link>
          </div>

          {/* Leaderboard */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Leaderboard</h2>
            </div>
            <Link
              href="/quest/leaderboard"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              View Leaderboard →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
