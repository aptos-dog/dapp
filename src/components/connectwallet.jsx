"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Wallet,
  LogOut,
  Loader2,
  Star,
  Trophy,
} from "lucide-react";

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
  const xp = serverProfile?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  return (
    <div className="w-full max-w-[320px]">
      {account ? (
        <div className="relative flex flex-col items-center bg-black/40 backdrop-blur-md border border-yellow-500/40 rounded-2xl shadow-lg p-4 text-yellow-300">
          {/* Wallet Row */}
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold truncate max-w-[120px]">
                {`${account.address.slice(0, 5)}...${account.address.slice(-4)}`}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-1 hover:bg-red-600/20 rounded-lg transition"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* Circular XP Progress */}
          <div className="relative w-24 h-24 mb-2">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="rgba(255, 215, 0, 0.2)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="url(#grad)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={
                  2 * Math.PI * 42 - (progress / 100) * 2 * Math.PI * 42
                }
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-yellow-400">Lvl {level}</span>
              <span className="text-xs text-gray-300">{progress}/100</span>
            </div>
          </div>

          {/* XP Row */}
          <div className="flex justify-between w-full text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" /> {xp} XP
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" /> Rank up
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-4 py-2 rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
