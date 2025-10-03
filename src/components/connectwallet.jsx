"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet, LogOut, Loader2, Star, Trophy } from "lucide-react";

export default function ConnectWallet({ onProfileUpdate }) {
  const { connect, disconnect, account, wallets } = useWallet();
  const [loading, setLoading] = useState(false);
  const [serverProfile, setServerProfile] = useState(null);

  // 🔥 Sync profile with backend
  useEffect(() => {
    if (!account?.address) {
      setServerProfile(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: account.address }),
        });
        const data = await res.json();
        if (data?.success) {
          setServerProfile(data.profile);
          onProfileUpdate?.(data.profile);
        }
      } catch (err) {
        console.error("API error:", err);
      }
    })();
  }, [account?.address, onProfileUpdate]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (!wallets || wallets.length === 0) {
        alert("⚠️ No wallets available. Install Petra or Martian.");
        return;
      }
      const petra = wallets.find((w) => w.name === "Petra");
      const martian = wallets.find((w) => w.name === "Martian");
      const walletToUse =
        petra?.readyState === "Installed"
          ? petra
          : martian?.readyState === "Installed"
          ? martian
          : null;

      if (!walletToUse) {
        alert("⚠️ Neither Petra nor Martian detected.");
        return;
      }
      await connect(walletToUse.name);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setServerProfile(null);
    onProfileUpdate?.(null);
  };

  // XP / Level
  const currentLevelXP = 10000;
const level = Math.floor((xp || 0) / currentLevelXP) + 1;
const progress = ((xp || 0) % currentLevelXP) / currentLevelXP * 100;

  return (
    <div className="w-full max-w-[180px]">
      {account ? (
        <div className="flex flex-col gap-2 bg-black/70 backdrop-blur-md border border-yellow-400/30 rounded-lg shadow p-2 text-yellow-200">
          {/* Wallet Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Wallet className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-medium truncate max-w-[80px]">
                {`${account.address.slice(0, 4)}...${account.address.slice(-3)}`}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-0.5 hover:bg-red-600/20 rounded-md transition"
              title="Disconnect"
            >
              <LogOut className="w-3 h-3 text-red-500" />
            </button>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full h-1.5 bg-gray-700/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats Row */}
          <div className="flex justify-between text-[9px] text-gray-300">
            <span className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-yellow-400" /> {xp} XP
            </span>
            <span className="flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5 text-yellow-400" /> Lvl {level}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-medium px-2 py-1.5 rounded-md shadow transition disabled:opacity-50 text-[11px]"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Wallet className="w-3.5 h-3.5" />
          )}
          {loading ? "Connecting..." : "Connect"}
        </button>
      )}
    </div>
  );
}
