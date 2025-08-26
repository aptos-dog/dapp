"use client";
import { useEffect, useState } from "react";
import { EyeOff, Eye, Plus, Save, Trash2, LogIn } from "lucide-react";

export default function SocialAdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null); // {id?, title, platform, url, points, active}

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/social-tasks");
      if (res.status === 401) {
        setUnlocked(false);
        setTasks([]);
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);
      setUnlocked(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Try loading; if 401, show passcode form
    loadTasks();
  }, []);

  async function login() {
    setLoading(true);
    try {
      const res = await fetch("/api/social-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || "Invalid code");
        return;
      }
      setCode("");
      await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveTask() {
    if (!editing?.title || !editing?.platform || !editing?.url) {
      alert("title, platform and url are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/social-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Save failed");
        return;
      }
      setEditing(null);
      await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/social-tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Delete failed");
        return;
      }
      await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-black/70 text-yellow-200 border border-yellow-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4" />
            <h1 className="font-bold text-lg">Restricted</h1>
          </div>
          <p className="text-sm opacity-80">
            Enter the passcode to manage Social Quests.
          </p>
          <input
            type="password"
            className="w-full rounded-lg bg-gray-900 text-yellow-100 border border-yellow-500/20 px-3 py-2 outline-none"
            placeholder="Passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={login}
            disabled={loading || !code.trim()}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-semibold rounded-lg py-2 hover:bg-yellow-400 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Checking..." : "Unlock"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-yellow-200 text-xl font-bold flex items-center gap-2">
          <Eye className="w-5 h-5" /> Social Quest Admin
        </h1>
        <button
          onClick={() =>
            setEditing({ title: "", platform: "twitter", url: "", points: 0, active: true })
          }
          className="flex items-center gap-2 bg-yellow-500 text-black font-semibold px-3 py-2 rounded-lg hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="bg-black/70 border border-yellow-500/30 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-yellow-200">
          <div>
            <label className="text-xs opacity-70">Title</label>
            <input
              className="w-full rounded bg-gray-900 border border-yellow-500/20 px-3 py-2 outline-none"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs opacity-70">Platform</label>
            <select
              className="w-full rounded bg-gray-900 border border-yellow-500/20 px-3 py-2 outline-none"
              value={editing.platform}
              onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
            >
              <option value="twitter">Twitter</option>
              <option value="discord">Discord</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs opacity-70">URL</label>
            <input
              className="w-full rounded bg-gray-900 border border-yellow-500/20 px-3 py-2 outline-none"
              value={editing.url}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs opacity-70">Points</label>
            <input
              type="number"
              className="w-full rounded bg-gray-900 border border-yellow-500/20 px-3 py-2 outline-none"
              value={editing.points ?? 0}
              onChange={(e) => setEditing({ ...editing, points: Number(e.target.value || 0) })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={!!editing.active}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={saveTask}
              className="flex items-center gap-2 bg-yellow-500 text-black font-semibold px-3 py-2 rounded-lg hover:bg-yellow-400"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-3 py-2 rounded-lg border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading && <div className="text-yellow-300 text-sm">Loading…</div>}
        {tasks.map((t) => (
          <div
            key={t.id}
            className="bg-black/60 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-3 text-yellow-200"
          >
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs opacity-80">
                {t.platform} • {t.points} pts • {t.active ? "Active" : "Inactive"}
              </div>
              <a href={t.url} target="_blank" className="text-xs underline break-all">
                {t.url}
              </a>
            </div>
            <button
              onClick={() => setEditing({ ...t })}
              className="px-3 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/10"
            >
              Edit
            </button>
            <button
              onClick={() => deleteTask(t.id)}
              className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        ))}
        {!loading && tasks.length === 0 && (
          <div className="text-yellow-300 text-sm">No tasks yet.</div>
        )}
      </div>
    </div>
  );
}
