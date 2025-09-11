"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ✅ Keep your existing fixed sidebar & wallet connect
import Sidebar from "@/app/game-hub/sidebar/page";
import ConnectWallet from "@/components/connectwallet";

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

/** Reusable Social Tasks Section */
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
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-yellow-300">
          {icon}
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-black/80 to-yellow-950/20 text-yellow-100 p-4 hover:shadow-lg hover:shadow-yellow-500/20 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
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
                            userId,
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
                    className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md font-bold transition ${
                      isDone || !userId
                        ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
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
      className={`bg-black/60 border border-yellow-500/30 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 text-yellow-300">
        <Sparkles className="w-5 h-5" />
        <h2 className="font-extrabold">Social Quests</h2>
      </div>
      <div className="space-y-8">
        <Section
          title="Twitter Tasks"
          icon={<Twitter className="w-5 h-5 text-sky-400" />}
          list={grouped.twitter}
        />
        <Section
          title="Discord Tasks"
          icon={<MessageCircle className="w-5 h-5 text-indigo-400" />}
          list={grouped.discord}
        />
        <Section
          title="Other Tasks"
          icon={<LinkIcon className="w-5 h-5 text-yellow-300" />}
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

  // ✅ fetch tasks when userId changes
  useEffect(() => {
    if (!userId) return;
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
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-black">
      <Sidebar />

      <main className="pt-14 md:pl-56 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-yellow-300">
              <Sparkles className="w-6 h-6" />
              <h1 className="text-xl md:text-2xl font-extrabold tracking-wide">
                Social Quests
              </h1>
            </div>
            <div className="ml-auto">
              <ConnectWallet
                onProfileUpdate={(profile: any) =>
                  setUserId(profile?.id || null)
                }
              />
            </div>
          </div>

          {/* How it works */}
          <section className="bg-gradient-to-br from-black/80 to-yellow-950/30 border border-yellow-500/40 rounded-2xl p-6 space-y-4 shadow-lg">
            <h2 className="text-lg md:text-xl font-bold text-yellow-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> How It Works
            </h2>
            <ul className="list-decimal list-inside space-y-3 text-sm md:text-base text-yellow-100/90 leading-relaxed">
              <li>
                Connect your wallet to{" "}
                <span className="font-semibold text-yellow-300">
                  unlock and track quests
                </span>
                .
              </li>
              <li>
                Complete tasks on <b>Twitter</b>, <b>Discord</b>, or through{" "}
                <b>custom links</b>. Each task earns{" "}
                <span className="font-semibold text-green-400">+100 XP</span>.
              </li>
              <li>
                Click{" "}
                <span className="font-semibold text-yellow-300">Open</span> to
                verify instantly and claim your points.
              </li>
              <li>
                Stay consistent,{" "}
                <span className="font-semibold text-yellow-300">
                  new quests arrive often
                </span>
                .
              </li>
              <li>
                Climb the leaderboard and prepare for rewards in{" "}
                <span className="text-green-400 font-bold">$APTDOG</span>.
              </li>
            </ul>
          </section>

          {/* Status */}
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

          {/* Social Tasks */}
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
