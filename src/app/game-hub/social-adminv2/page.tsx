"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/app/game-hub/sidebar/page";
import { Loader2, Trash2, Edit } from "lucide-react";

// -------------------------------------
// Helper: parse API response safely
// -------------------------------------
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    const m = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        const next = JSON.parse(m[1]);
        const serverErr =
          next?.props?.pageProps?.err?.message ||
          next?.props?.pageProps?.err?.stack ||
          next?.props?.pageProps?.statusCode;
        return { error: serverErr || "Server error (non-JSON response)", _raw: text.slice(0, 2000) };
      } catch {}
    }
    return { error: "Non-JSON response from server", _raw: text.slice(0, 2000) };
  }
}

export default function TokenTasksAdmin() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    title: "",
    contract: "",
    type: "nft", // default
    points: 0,
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Admin login
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function authHeaders(pw?: string | null) {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const pass = pw ?? adminPassword;
    if (pass) h["x-admin-password"] = pass;
    return h;
  }

  // --------------------------
  // Load tasks
  // --------------------------
  async function loadTasks(pw?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/token-tasks", {
        method: "GET",
        headers: authHeaders(pw ?? null),
      });

      if (res.status === 401) {
        setAuthorized(false);
        setAuthError("Unauthorized: invalid admin password.");
        setTasks([]);
        return;
      }

      const data = await safeJson(res);
      if (!res.ok || data?.error) {
        setError(data?.error || `HTTP ${res.status}`);
        setTasks([]);
      } else {
        setTasks(data.tasks || []);
      }
    } catch (err: any) {
      setError(err?.message || "Fetch failed");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // Login
  // --------------------------
  async function submitPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setAuthError("Password is required.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/token-tasks", {
        method: "GET",
        headers: authHeaders(password),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        setAuthError("Invalid password.");
        setAuthorized(false);
        return;
      }

      if (!res.ok || data?.error) {
        setAuthError(data?.error || `HTTP ${res.status}`);
        setAuthorized(false);
        return;
      }

      setAdminPassword(password);
      setPassword("");
      setAuthorized(true);
      await loadTasks(password);
    } catch (err: any) {
      setAuthError(err?.message || "Login failed");
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }

  // --------------------------
  // Save (create/update)
  // --------------------------
  async function saveTask(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        title: String(form.title).trim(),
        contract: String(form.contract).trim(),
        type: form.type,
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
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok || data?.error) {
        setError(data?.error || `HTTP ${res.status}`);
        if (res.status === 401) setAuthorized(false);
      } else {
        setForm({ title: "", contract: "", type: "nft", points: 0, active: true });
        setEditingId(null);
        await loadTasks();
      }
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------
  // Delete task
  // --------------------------
  async function removeTask(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch("/api/token-tasks", {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      const data = await safeJson(res);
      if (!res.ok || data?.error) {
        setError(data?.error || `HTTP ${res.status}`);
        if (res.status === 401) setAuthorized(false);
      } else {
        await loadTasks();
      }
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    }
  }

  function startEdit(task: any) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      contract: task.contract || "",
      type: task.type || "nft",
      points: task.points || 0,
      active: !!task.active,
    });
  }

  function lock() {
    setAdminPassword(null);
    setAuthorized(false);
    setTasks([]);
    setForm({ title: "", contract: "", type: "nft", points: 0, active: true });
    setEditingId(null);
    setError(null);
    setAuthError(null);
    setPassword("");
  }

  // --------------------------
  // Render
  // --------------------------
  if (!authorized) {
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
            <button
              type="submit"
              disabled={authLoading}
              className="px-4 py-2 rounded bg-yellow-500 text-black font-semibold flex items-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-yellow-900 to-black">
      <Sidebar />
      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-yellow-300">Token Tasks Admin</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => loadTasks()} className="text-sm px-3 py-1 rounded bg-gray-800">
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button onClick={lock} className="text-sm px-3 py-1 rounded bg-gray-700">Lock</button>
            </div>
          </div>

          {error && <div className="bg-red-900/60 p-3 rounded text-sm text-red-200">{error}</div>}

          <section className="bg-black/60 p-6 rounded-lg border border-yellow-500/20">
            <h2 className="text-lg font-semibold text-yellow-200 mb-3">Create / Edit Task</h2>

            <form onSubmit={saveTask} className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  className="w-56 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  placeholder="Contract / Module"
                  value={form.contract}
                  onChange={(e) => setForm({ ...form, contract: e.target.value })}
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  className="p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="nft">NFT</option>
                  <option value="token">Token</option>
                </select>

                <input
                  type="number"
                  className="w-28 p-2 rounded bg-gray-800 border border-gray-700 text-sm"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                />

                <label className="ml-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  /> Active
                </label>

                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ title: "", contract: "", type: "nft", points: 0, active: true });
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
            <h2 className="text-lg font-semibold text-yellow-200">Existing Tasks</h2>
            <div className="grid gap-3">
              {loading && <div className="p-4 bg-gray-900 rounded">Loading tasks...</div>}
              {!loading && tasks.length === 0 && <div className="p-4 bg-gray-900 rounded text-sm">No tasks yet.</div>}
              {tasks.map((t) => (
                <div key={t.id} className="p-4 bg-black/60 rounded border border-yellow-500/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs opacity-70">
                      {t.contract} • {t.type} • {t.points} XP • {t.active ? "active" : "inactive"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(t)} className="px-2 py-1 bg-gray-800 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => removeTask(t.id)} className="px-2 py-1 bg-red-900 rounded"><Trash2 className="w-4 h-4" /></button>
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
git