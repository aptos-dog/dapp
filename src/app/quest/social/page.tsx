"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// import your existing fixed sidebar & topbar routes as components
import Sidebar from "@/app/quest/sidebar/page";
import ConnectWallet from "@/components/connectwallet"; // ✅ Import wallet

import {
  Twitter,
  MessageCircle,
  LinkIcon,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";

/** Small helper for resilient JSON parsing */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Card list used inside pages that want a compact “Social” block */
function Social({
  className = "",
  tasks = [],
  completed = [],
  onComplete,
  userId,
}: {
  className?: string;
  tasks?: Array<any>;
  completed: string[];
  onComplete: (taskId: string) => void;
  userId: string | null;
}) {
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { twitter: [], discord: [], other: [] };
    for (const t of tasks) {
      const p = (t.platform || "other").toLowerCase();
      if (p === "twitter") g.twitter.push(t);
      else if (p === "discord") g.discord.push(t);
      else g.other.push(t);
    }
    return g;
  }, [tasks]);

  const Section = ({
    title,
    icon,
    list,
  }: {
    title: string;
    icon: React.ReactNode;
    list: any[];
  }) => {
    if (!list?.length) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-yellow-200/90">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-yellow-500/20 bg-black/60 text-yellow-100 p-3 hover:border-yellow-400/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{task.title}</div>
                    <div className="text-xs opacity-80">
                      {task.points ?? 0} XP
                    </div>
                  </div>
                  <button
                    disabled={isDone || !userId}
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/social-tasks/complete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            taskId: task.id,
                            userId, // ✅ include userId
                          }),
                        });
                        const data = await safeJson(res);
                        if (res.ok && data?.success) {
                          onComplete(task.id);
                          window.open(task.url, "_blank");
                        } else {
                          alert(data?.error || "Error completing task");
                        }
                      } catch (e) {
                        alert("Network error");
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${
                      isDone || !userId
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-yellow-500 text-black hover:bg-yellow-400"
                    }`}
                  >
                    {isDone
                      ? "Completed"
                      : !userId
                      ? "Connect Wallet"
                      : "Open"}{" "}
                    {!isDone && userId && <ExternalLink className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-black/40 border border-yellow-500/20 rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 text-yellow-100">
        <Sparkles className="w-4 h-4" />
        <h2 className="font-bold">Social</h2>
      </div>

      <div className="space-y-6">
        <Section
          title="Twitter Tasks"
          icon={<Twitter className="w-4 h-4 text-sky-400" />}
          list={grouped.twitter}
        />
        <Section
          title="Discord Tasks"
          icon={<MessageCircle className="w-4 h-4 text-indigo-300" />}
          list={grouped.discord}
        />
        <Section
          title="Other Tasks"
          icon={<LinkIcon className="w-4 h-4 text-yellow-300" />}
          list={grouped.other}
        />

        {!tasks?.length && (
          <div className="text-sm text-yellow-200/80">
            No social tasks yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ fetch tasks whenever userId changes (so completed persists)
  useEffect(() => {
    if (!userId) return; // don’t fetch until wallet connected

    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        const res = await fetch(`/api/social-tasks?userId=${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const data = await safeJson(res);
        if (!res.ok || !data?.success) {
          setErrMsg(data?.error || "Failed to load tasks.");
          setTasks([]);
          setCompleted([]);
        } else {
          setTasks(Array.isArray(data.tasks) ? data.tasks : []);
          setCompleted(Array.isArray(data.completed) ? data.completed : []);
        }
      } catch (e: any) {
        setErrMsg(e?.message || "Network error.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleComplete = (taskId: string) => {
    setCompleted((prev) => [...prev, taskId]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-yellow-950">
      {/* Fixed chrome */}
      <Sidebar />
      

      {/* Content area (accounting for sidebar width and topbar height) */}
      <main className="pt-14 md:pl-56 p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Page header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-100">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-lg md:text-xl font-extrabold tracking-wide">
                Social Quests
              </h1>
            </div>

            {/* ✅ Wallet connect, updates userId */}
            <div className="ml-auto">
              <ConnectWallet
                onProfileUpdate={(profile: any) =>
                  setUserId(profile?.id || null)
                }
              />
            </div>
          </div>

{/* How It Works Section */}
<section className="bg-black/50 border border-yellow-500/30 rounded-2xl p-5 md:p-6 space-y-5 shadow-lg">
  <h2 className="text-lg md:text-xl font-bold text-yellow-300 flex items-center gap-2">
    <Sparkles className="w-5 h-5" /> How It Works
  </h2>
  <ul className="list-decimal list-inside space-y-3 text-sm md:text-base text-yellow-100/90 leading-relaxed">
    <li>
      Connect your wallet to <span className="font-semibold text-yellow-300">unlock and track quests</span>.
    </li>
    <li>
      Complete tasks on <b>Twitter</b>, <b>Discord</b>, or through <b>custom links</b>.  
      Each successful task earns you <span className="font-semibold text-green-400">+10 XP</span>.
    </li>
    <li>
      Click <span className="font-semibold text-yellow-300">Open</span> to verify instantly and claim your points.
    </li>
    <li>
      Stay consistent, <span className="font-semibold text-yellow-300">new quests are updated regularly</span>, so check back often.
    </li>
    <li>
      Climb the <span className="font-semibold text-yellow-300">leaderboard</span> and prepare for upcoming rewards in 
      <span className="text-green-400 font-bold"> $APTDOG</span>.
    </li>
  </ul>
</section>



          {/* Status line */}
          {loading && (
            <div className="flex items-center gap-2 text-yellow-200/80 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tasks…
            </div>
          )}
          {errMsg && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/40 p-2 rounded-lg">
              {errMsg}
            </div>
          )}

          {/* Social block */}
          {!loading && !errMsg && (
            <Social
              className="mt-2"
              tasks={tasks}
              completed={completed}
              onComplete={handleComplete}
              userId={userId}
            />
          )}
        </div>
      </main>
    </div>
  );
}