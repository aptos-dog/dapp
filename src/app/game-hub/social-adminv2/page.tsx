"use client";

import React, { useState } from "react";
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

  // Auth states
  // "authorized" indicates whether the user has successfully unlocked the UI in this page-load
  const [authorized, setAuthorized] = useState<boolean>(false); // default: show password form
  const [password, setPassword] = useState(""); // input field
  const [adminPassword, setAdminPassword] = useState<string | null>(null); // stored in-memory after successful login
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Helper: build headers including admin password (in-memory)
   */
  function authHeaders(pw?: string | null) {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const pass = pw ?? adminPassword;
    if (pass) h["x-admin-password"] = pass;
    return h;
  }

  /**
   * Load tasks from API using in-memory admin password (no cookies).
   * If 'pw' is provided it will be used (useful immediately after login).
   */
  async function loadTasks(pw?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/token-tasks", {
        method: "GET",
        headers: authHeaders(pw ?? null),
      });

      if (res.status === 401) {
        // unauthorized — password missing/invalid
        setAuthorized(false);
        setAuthError("Unauthorized: invalid admin password.");
        setTasks([]);
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
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Fetch failed");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Submit password: validate by calling the protected GET endpoint with header.
   * If OK → keep password in-memory and mark authorized.
   */
  async function submitPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    // 🚫 Prevent login if password field is empty
if (!password.trim()) {
  setAuthError("Password is required.");
  setAuthLoading(false);
  return;
}


    try {
      // validate by calling the protected endpoint with header
      const res = await fetch("/api/token-tasks", {
        method: "GET",
        headers: authHeaders(password),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        // invalid password
        setAuthError("Invalid password.");
        setAuthorized(false);
        return;
      }

      if (!res.ok) {
        const msg = (data && data.error) || `HTTP ${res.status}`;
        setAuthError(String(msg));
        setAuthorized(false);
        return;
      }

      // success → store password in memory and load tasks
      setAdminPassword(password);
      setPassword("");
      setAuthorized(true);
      setAuthError(null);

      // Use the password we just validated to load tasks immediately
      await loadTasks(password);
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthError(err?.message || "Login failed");
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }

  // create or update task (includes in-memory admin password in header)
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
        headers: authHeaders(),
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
        headers: authHeaders(),
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

  // Logout / Lock: clear in-memory password and return to login screen
  function lock() {
    setAdminPassword(null);
    setAuthorized(false);
    setTasks([]);
    setForm({ title: "", contract: "", points: 0, active: true });
    setEditingId(null);
    setError(null);
    setAuthError(null);
    setPassword("");
  }

  // Render password form when unauthorized
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
                autoFocus
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
                onClick={() => {
                  // attempt a retry by calling the endpoint with current input (same as submit)
                  submitPassword();
                }}
                className="ml-auto px-3 py-2 rounded bg-gray-800 text-sm"
              >
                Try
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            Enter the admin code to access the tasks panel. The password is kept in memory only for this page session.
          </p>
        </div>
      </div>
    );
  }

  // authorized === true → render admin UI
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

              <button onClick={lock} className="text-sm px-3 py-1 rounded bg-gray-700">
                Lock
              </button>
            </div>
          </div>

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
            <h2 className="text-lg font-semibold text-yellow-200">Existing Tasks</h2>

            <div className="grid gap-3">
              {loading && <div className="p-4 bg-gray-900 rounded">Loading tasks...</div>}

              {!loading && tasks.length === 0 && <div className="p-4 bg-gray-900 rounded text-sm">No tasks yet.</div>}

              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-black/60 rounded border border-yellow-500/10 flex items-center justify-between"
                >
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
