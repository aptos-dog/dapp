"use client";

import { useState } from "react";
import Sidebar from "./sidebar/page";
import Topbar from "./topbar/page";
import ConnectWallet from "@/components/connectwallet";
import Link from "next/link";

// icons
import { User, CheckCircle, Users, Star } from "lucide-react";

export default function QuestPage() {
  type Profile = { address: string } | null;
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-yellow-300">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Wallet Connect */}
        <div className="p-4">
          <ConnectWallet onProfileUpdate={setProfile} />
        </div>

        {/* Hero Section */}
        <section className="text-center py-10 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-transparent bg-clip-text drop-shadow-lg">
            Welcome to Aptos Dog Quest
          </h1>
          <p className="mt-4 text-lg md:text-xl text-yellow-200 max-w-3xl mx-auto">
            Earn <span className="font-bold">XP</span>, climb <span className="font-bold">Levels</span>, 
            and unlock the future of <span className="font-bold">$APTDOG</span> on the Aptos Blockchain. 
            Complete daily check-ins and social quests to grow your power.
          </p>
          <p className="mt-3 text-md italic text-yellow-400">
            ⚡ Do not miss out, only the strongest will rise in Aptos Dog Quest!
          </p>
        </section>

        {/* Quest Hub */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile preview */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500 hover:shadow-yellow-500/30 transition">
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
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500 hover:shadow-yellow-500/30 transition">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Daily Check-in</h2>
            </div>
            <p className="text-sm mb-2">
              Check-in every 12 hours and earn <span className="font-bold">+5 XP</span>. 
              Stay consistent and keep leveling up!
            </p>
            <Link
              href="/quest/checkin"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Open Check-in →
            </Link>
          </div>

          {/* Social Quests */}
          <div className="p-6 bg-black/70 backdrop-blur-md shadow-lg rounded-2xl border border-yellow-500 hover:shadow-yellow-500/30 transition">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Social Quests</h2>
            </div>
            <p className="text-sm mb-2">
              Join our social challenges, connect with the community, 
              and earn bonus XP by spreading the word about <b>$APTDOG</b>.
            </p>
            <Link
              href="/quest/social"
              className="text-yellow-400 hover:text-yellow-200 font-semibold"
            >
              Join Social Tasks →
            </Link>
          </div>
        </main>

        {/* How It Works Section */}
<section className="p-8 mt-6 bg-black/70 backdrop-blur-md border-t border-yellow-500/40 shadow-inner">
  <h2 className="text-3xl font-bold text-yellow-400 mb-4">How It Works</h2>
  <ul className="space-y-3 text-yellow-200">
    <li>🔥 Earn <b>XP</b> by completing daily check-ins and social quests.</li>
    <li>⬆️ Every <b>100 XP</b> = +1 <b>Level</b>. Level up and showcase your strength.</li>
    <li>👥 Invite friends, you will earn <b>+5 XP</b>, and they will get <b>+10 XP</b> for joining.</li>
    <li>🏆 Climb the quest ladder and prepare for the rise of <b>$APTDOG</b>.</li>
  </ul>
  <p className="mt-6 text-center font-semibold text-yellow-300 text-lg">
    The future of Aptos Dog belongs to the most loyal and active questers. 
    Will you rise to the top? 🐕⚡
  </p>
</section>

      </div>
    </div>
  );
}
