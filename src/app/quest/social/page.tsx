"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// import your existing fixed sidebar & topbar routes as components
import Sidebar from "@/app/quest/sidebar/page";
import Topbar from "@/app/quest/topbar/page";

import {
  Twitter,
  MessageCircle,
  LinkIcon,
  Sparkles,
  Loader2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

/** If your admin/editor lives at a different path, change this */
const ADMIN_PATH = "/admin/social-tasks";

/** Small helper for resilient JSON parsing */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Card list used inside pages that want a compact “Social” block */
export function Social({
  className = "",
  tasks = [],
}: {
  className?: string;
  tasks?: Array<any>;
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
          {list.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-yellow-500/20 bg-black/60 text-yellow-100 p-3 hover:border-yellow-400/40 transition"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold">{task.title}</div>
                  <div className="text-xs opacity-80">
                    {task.points ?? 0} pts
                  </div>
                </div>
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
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
            No social tasks yet. Create one below to get started.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        // expects your API to return: { success: true, tasks: [...] }
        const res = await fetch("/api/social-tasks?active=true", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const data = await safeJson(res);
        if (!res.ok || !data?.success) {
          setErrMsg(data?.error || "Failed to load tasks.");
          setTasks([]);
        } else {
          setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        }
      } catch (e: any) {
        setErrMsg(e?.message || "Network error.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-yellow-950">
      {/* Fixed chrome */}
      <Sidebar />
      <Topbar />

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

            <Link
              href={ADMIN_PATH}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 border border-yellow-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Task
            </Link>
          </div>

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
          {!loading && !errMsg && <Social className="mt-2" tasks={tasks} />}
        </div>
      </main>
    </div>
  );
}
