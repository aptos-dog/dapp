"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/app/game-hub/sidebar/page";
import { Loader2, Trash2, Edit } from "lucide-react";

/**
 * Helper: parse response safely
 * - If server returns HTML (Next dev error page), we try to extract __NEXT_DATA__ and surface the server error.
 * - Returns parsed JSON object on success OR { error, _raw } on failure.
 */
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // try extract __NEXT_DATA__ from Next.js dev error
    const m = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        const next = JSON.parse(m[1]);
        const serverErr =
          next?.props?.pageProps?.err?.message ||
          next?.props?.pageProps?.err?.stack ||
          next?.props?.pageProps?.statusCode;
        console.error("Server-side error (from __NEXT_DATA__):", serverErr);
        return { error: serverErr || "Server error (non-JSON response)", _raw: text.slice(0, 2000) };
      } catch (e) {
        // fall through
      }
    }
    console.error("Non-JSON response (first 2000 chars):", text.slice(0, 2000));
    return { error: "Non-JSON response from server", _raw: text.slice(0, 2000) };
  }
}

export default function SocialAdminV2() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ title: "", contract: "", points: 0, active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // auth states
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = unknown/loading, false = need password, true = ok
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // load tasks (uses credentials so cookie is sent)
  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/token-tasks", { credentials: "same-origin" });
      // if server returned 401, we mark authorized false and stop
      if (res.status === 401) {
        setAuthorized(false);
        setTasks([]);
        setLoading(false);
        return;
      }
      const data = await safeJson(res);
      if (!res.ok) {
        const msg = (data && data.error) || `HTTP ${res.status}`;
        setError(String(msg));
        setTasks([]);
      } else if (data?.error) {
        setError(String(data.error));
        setTasks([]);
      } else {
        setTasks(data.tasks || []);
        setAuthorized(true); // success → we are authorized
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Fetch failed");
      setTasks([]);
      // If we couldn't reach server, keep authorized as null so user can try again
    } finally {
      setLoading(false);
    }
  }

  // on mount try to load tasks (this will set authorized accordingly)
  useEffect(() => {
    loadTasks();
  }, []);

  // submit password to /api/login
  async function submitPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/social-adminv2", {     // ✅ changed endpoint
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),                // ✅ changed field name
});

      const data = await safeJson(res);
      if (!res.ok) {
        // wrong password or server error
        const msg = (data && data.error) || `HTTP ${res.status}`;
        setAuthError(String(msg));
        setAuthorized(false);
      } else if (data?.error) {
        setAuthError(String(data.error));
        setAuthorized(false);
      } else {
        // success — server sets httpOnly cookie; now we fetch tasks
        setAuthorized(true);
        setPassword("");
        await loadTasks();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthError(err?.message || "Login failed");
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }

  // create or update task (includes credentials)
  async function saveTask(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        title: String(form.title).trim(),
        contract: String(form.contract).trim(),
        chain: form.chain || null,
        points: Number(form.points) || 0,
        active: !!form.active,
      };

      if (!payload.title || !payload.contract) {
        setError("Title and contract are required.");
        setSaving(false);
        return;
      }

      if (editingId) payload.id = editingId;

      const res = await fetch("/api/token-tasks", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        setError((data && data.error) || `HTTP ${res.status}`);
        if (res.status === 401) setAuthorized(false);
      } else if (data?.error) {
        setError(String(data.error));
      } else {
        // success
        setForm({ title: "", contract: "", points: 0, active: true });
        setEditingId(null);
        await loadTasks();
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id: string) {
    if (!confirm("Delete this task?")) return;
    setError(null);
    try {
      const res = await fetch("/api/token-tasks", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError((data && data.error) || `HTTP ${res.status}`);
        if (res.status === 401) setAuthorized(false);
      } else if (data?.error) {
        setError(String(data.error));
      } else {
        await loadTasks();
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message || "Delete failed");
    }
  }

  function startEdit(task: any) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      contract: task.contract || "",
      points: task.points || 0,
      active: !!task.active,
      chain: task.chain || "",
    });
  }

  // Render password form when unauthorized
  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-yellow-900 to-black p-6">
        <div className="w-full max-w-md bg-black/70 border border-yellow-500/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-200 mb-4">Admin login</h2>

          {authError && <div className="bg-red-900/60 p-2 rounded text-sm text-red-200 mb-3">{authError}</div>}

          <form onSubmit={submitPassword} className="space-y-3">
            <div>
              <label className="text-sm text-yellow-200 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                placeholder="Enter admin password"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={authLoading}
                className="px-4 py-2 rounded bg-yellow-500 text-black font-semibold flex items-center gap-2"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPassword("");
                  setAuthError(null);
                }}
                className="px-3 py-2 rounded bg-gray-800 text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => loadTasks()}
                className="ml-auto px-3 py-2 rounded bg-gray-800 text-sm"
              >
                Try again
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            Enter the admin code to access the tasks panel.
          </p>
        </div>
      </div>
    );
  }

  // Loading or authorized === null: show a simple loader
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-yellow-900 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  // authorized === true → render admin UI
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-yellow-900 to-black">
      <Sidebar />
      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-yellow-300">Token Tasks Admin</h1>

          {error && <div className="bg-red-900/60 p-3 rounded text-sm text-red-200">{error}</div>}

          <section className="bg-black/60 p-6 rounded-lg border border-yellow-500/20">
            <h2 className="text-lg font-semibold text-yellow-200 mb-3">Create / Edit Task</h2>

            <form onSubmit={saveTask} className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  placeholder="Title (e.g. Cool NFT)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  className="w-56 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  placeholder="Contract (type or module)"
                  value={form.contract}
                  onChange={(e) => setForm({ ...form, contract: e.target.value })}
                />
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="w-28 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                />
                <input
                  className="p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  placeholder="Chain (optional)"
                  value={form.chain || ""}
                  onChange={(e) => setForm({ ...form, chain: e.target.value })}
                />
                <label className="ml-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />{" "}
                  Active
                </label>

                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ title: "", contract: "", points: 0, active: true });
                      setEditingId(null);
                    }}
                    className="px-3 py-2 rounded bg-gray-700 text-sm"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-yellow-500 text-black font-semibold flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-yellow-200">Existing Tasks</h2>
              <button onClick={loadTasks} className="text-sm px-3 py-1 rounded bg-gray-800">
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="grid gap-3">
              {loading && <div className="p-4 bg-gray-900 rounded">Loading tasks...</div>}

              {!loading && tasks.length === 0 && <div className="p-4 bg-gray-900 rounded text-sm">No tasks yet.</div>}

              {tasks.map((t) => (
                <div key={t.id} className="p-4 bg-black/60 rounded border border-yellow-500/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs opacity-70">
                      {t.contract} • {t.points} XP • {t.chain || "any chain"} • {t.active ? "active" : "inactive"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => startEdit(t)} className="px-2 py-1 bg-gray-800 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeTask(t.id)} className="px-2 py-1 bg-red-900 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
