"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Wallet,
  LogOut,
  Loader2,
  Star,
  Trophy,
  ArrowUpCircle,
} from "lucide-react";

export default function ConnectWallet({ onProfileUpdate }) {
  const { connect, disconnect, account, wallets } = useWallet();
  const [loading, setLoading] = useState(false);
  const [serverProfile, setServerProfile] = useState(null);

  // 🔥 Sync with backend
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
        if (!res.ok || data?.error || !data?.success) {
          console.error("Profile fetch failed:", data?.error || res.statusText);
          return;
        }
        setServerProfile(data.profile);
        onProfileUpdate?.(data.profile);
      } catch (err) {
        console.error("API error:", err);
      }
    })();
  }, [account?.address, onProfileUpdate]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (!wallets || wallets.length === 0) {
        alert("⚠️ No wallets available. Please install Petra or Martian.");
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
        alert("⚠️ Neither Petra nor Martian is detected in your browser.");
        return;
      }
      await connect(walletToUse.name);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Wallet connection failed, check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setServerProfile(null);
    onProfileUpdate?.(null);
  };

  // Compute rank
  const xp = serverProfile?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  return (
    <div className="w-full max-w-sm">
      {account ? (
        <div className="flex flex-col gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-md rounded-xl px-3 py-2 border border-yellow-300">
          {/* Wallet Row */}
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-yellow-700" />
            <span className="text-gray-900 font-medium text-sm truncate">
              {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
            </span>
            <button
              onClick={handleDisconnect}
              className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition"
            >
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>

          {/* XP + Level Row */}
          <div className="flex justify-between items-center text-xs font-medium text-gray-800">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-600" />
              <span>{xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-orange-600" />
              <span>Lvl {level}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-yellow-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>{progress}/100 XP</span>
            <span className="flex items-center gap-0.5">
              Next <ArrowUpCircle className="w-3 h-3" />
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50 text-sm"
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
