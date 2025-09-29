"use client";

import React, { useState } from "react";
import { UserPlus, Gift, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SetUsernameForm({ wallet, serverProfile, onProfileUpdate }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }

  // Hide form if wallet not connected OR username already set
  if (!wallet || serverProfile?.username) return null;

  const safeParse = async (res) => {
    try {
      return await res.json();
    } catch {
      return {}; // always return object, never null
    }
  };

  const handleSubmit = async () => {
    if (!usernameInput.trim()) {
      setMessage({ type: "error", text: "Please enter a username." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          username: usernameInput.trim(),
          ...(referralInput.trim() ? { referral_code: referralInput.trim() } : {}),
        }),
      });

      const data = await safeParse(res);

      if (!res.ok || !data?.success) {
        setMessage({
          type: "error",
          text: data?.error || `Failed to set username (status ${res.status})`,
        });
        return;
      }

      setMessage({ type: "success", text: "Username set successfully!" });
      onProfileUpdate?.(data.profile || {});
      setUsernameInput("");
      setReferralInput("");
    } catch (e) {
      console.error("SetUsernameForm error:", e);
      setMessage({ type: "error", text: e?.message || "Unexpected error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-black/70 border border-yellow-500/40 rounded-2xl p-4 text-yellow-200 mt-4">
      <div className="text-sm mb-3">
        Set your <span className="font-semibold">username</span> (this also becomes your invite code).
        <br />
        <span className="opacity-80">Referral code is optional (use a friend’s username).</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* Username input */}
        <div className="flex-1 flex items-center gap-2">
          <UserPlus className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder="Choose a username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-yellow-100 outline-none"
          />
        </div>

        {/* Referral input */}
        <div className="flex-1 flex items-center gap-2">
          <Gift className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder="Referral code (optional)"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-yellow-100 outline-none"
          />
        </div>
      </div>

      {/* Inline message */}
      {message && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 ${
            message.type === "error"
              ? "bg-red-900/40 text-red-200"
              : "bg-green-900/40 text-green-200"
          }`}
        >
          {message.type === "error" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={saving || !usernameInput.trim()}
        className="mt-3 w-full py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Set Username"}
      </button>
    </div>
  );
}
