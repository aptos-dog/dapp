"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/game-hub/sidebar/page";
import ConnectWallet from "@/components/connectwallet";
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AptosClient } from "aptos";

// format seconds -> HH:MM:SS
function formatCountdown(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * small safeJson used client-side as well.
 * returns parsed JSON or throws with good message
 */
async function safeJsonOrThrow(res: Response) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (json && json.error) {
      throw new Error(json.error);
    }
    return json;
  } catch (err: any) {
    // try to extract Next dev error
    const m = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        const next = JSON.parse(m[1]);
        const serverMsg =
          next?.props?.pageProps?.err?.message ||
          next?.props?.pageProps?.err?.stack ||
          JSON.stringify(next?.props?.pageProps?.err);
        throw new Error(String(serverMsg || "Server returned non-JSON response"));
      } catch (e) {
        //
      }
    }
    throw new Error(err?.message || "Failed to parse server response");
  }
}

export default function TokenHubPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  // secondary tasks
  const [tasks, setTasks] = useState<any[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

  // load profile
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/token-claim?userId=${userId}`);
        const data = await safeJsonOrThrow(res);
        if (data?.profile) {
          const lastClaim = data.profile.last_token_claim ? new Date(data.profile.last_token_claim) : null;
          if (lastClaim) {
            const next = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
            setNextAvailable(next);
          } else {
            setNextAvailable(null);
          }
          setXpAwarded(data.profile.xp || 0);
        }
      } catch (err: any) {
        console.error("Failed to fetch token profile", err);
      }
    };

    fetchProfile();
  }, [userId]);

  // fetch secondary tasks
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/token-tasks");
        const data = await safeJsonOrThrow(res);
        setTasks(data.tasks || []);
      } catch (err: any) {
        console.error("Error fetching token tasks:", err);
        setTasks([]);
      }
    }
    loadTasks();
  }, []);

  // countdown tick
  useEffect(() => {
    if (!nextAvailable) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.floor((nextAvailable.getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextAvailable]);

  // parent claim
  const handleClaim = async () => {
    if (!userId || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    setLoading(true);

    try {
      // verify wallet has APT
      const resources = await client.getAccountResources(walletAddress);
      const hasAPT = resources.some(
  (r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
);


      if (!hasAPT) {
        alert("You dont hold APT.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/token-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, walletAddress, task: "APT" }),
      });

      const data = await safeJsonOrThrow(res);

      if (data?.success) {
        setXpAwarded((prev) => prev + (data.xpEarned || 0));
        const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setNextAvailable(next);
      } else {
        alert(data?.error || "Claim failed");
      }
    } catch (err: any) {
      console.error("Claim error:", err);
      alert(err?.message || "Blockchain verification error");
    } finally {
      setLoading(false);
    }
  };

  // secondary claim
  const claimTask = async (task: any) => {
    if (!userId || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    setClaiming(task.id);

    try {
      const resources = await client.getAccountResources(walletAddress);
      const hasAsset = resources.some((r: any) => r.type.includes(task.contract));
      if (!hasAsset) {
        alert(`You don’t hold the required ${task.title}.`);
        setClaiming(null);
        return;
      }

      const res = await fetch("/api/token-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, walletAddress, taskId: task.id }),
      });

      const data = await safeJsonOrThrow(res);

      if (data?.success) {
        setClaimed((prev) => ({ ...prev, [task.id]: true }));
        setXpAwarded((prev) => prev + (data.xpEarned || 0));
      } else {
        alert(data?.error || "Verification failed");
      }
    } catch (err: any) {
      console.error("Secondary claim error:", err);
      alert(err?.message || "Blockchain verification error");
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-black flex">
      <Sidebar />
      <main className="flex-1 pt-14 md:pl-56 p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl space-y-10">
          {/* Hero */}
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow">
              Token Hub
            </motion.h1>
            <p className="text-yellow-200/80 max-w-xl text-sm md:text-base">
              Hold APT, NFTs, or tokens in your Aptos wallet? Verify ownership to earn XP.
            </p>
            <ConnectWallet
              onProfileUpdate={(profile: any) => {
                setUserId(profile?.id || null);
                setWalletAddress(profile?.wallet || null);
              }}
            />
          </div>

          {/* Parent APT Task */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="rounded-3xl border border-yellow-400/20 bg-black/70 p-10 shadow-2xl space-y-6 backdrop-blur">
            <div className="flex flex-col items-center gap-2">
              <span className="text-yellow-200/70 text-sm">Next APT Claim</span>
              <div className="flex items-center gap-2 text-3xl font-bold text-yellow-300">
                {remaining > 0 ? (
                  <>
                    <Clock className="w-6 h-6 text-yellow-400" />
                    {formatCountdown(remaining)}
                  </>
                ) : (
                  "✅ Available Now"
                )}
              </div>
            </div>

            {remaining > 0 && (
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-yellow-500 h-3 transition-all duration-1000" style={{ width: `${100 - (remaining / (24 * 60 * 60)) * 100}%` }} />
              </div>
            )}

            <div className="flex justify-center">
              <button disabled={loading || remaining > 0 || !userId} onClick={handleClaim} className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 inline-flex items-center gap-3 ${loading || remaining > 0 || !userId ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105 shadow-lg"}`}>
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {remaining > 0 ? "Wait..." : !userId ? "Connect Wallet" : "Claim Now"}
              </button>
            </div>
          </motion.div>

          {/* Secondary Tasks */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-black/70 border border-yellow-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-xs opacity-70">Contract: {task.contract} • {task.points} XP</p>
                  </div>
                  <div>
                    {claimed[task.id] ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-5 h-5" /> Claimed
                      </div>
                    ) : (
                      <button disabled={claiming === task.id} onClick={() => claimTask(task)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50">
                        {claiming === task.id ? (<><Loader2 className="w-4 h-4 animate-spin" /> Verifying</>) : ("Verify & Claim")}
                      </button>
                    )}
                  </div>
                </div>
                {!task.active && (
                  <div className="mt-2 text-xs flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-4 h-4" /> This task is inactive
                  </div>
                )}
              </motion.div>
            ))}
            {tasks.length === 0 && <div className="text-sm opacity-70">No secondary token quests yet.</div>}
          </div>

          {/* XP summary */}
          {xpAwarded > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-400 text-sm mt-6">
              🎉 You have earned <b>{xpAwarded}</b> XP so far!
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
