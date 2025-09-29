"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/app/game-hub/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Award, Zap, ArrowLeft, Crown, TimerReset } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Supabase client (same setup as other games) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Game tuning constants ---
const COLORS = ["red", "green", "blue", "yellow"]; // 4 buttons
const XP_PER_ROUND = 5; // ✅ flat XP per successful round
const ROUND_TIME = 60; // seconds max per game

export default function SimonSaysPage(): JSX.Element {
  const router = useRouter();

  // Wallet/User
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Game state
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [showingSequence, setShowingSequence] = useState(false);

  // Sounds
  const sCorrect = useRef<HTMLAudioElement | null>(null);
  const sWrong = useRef<HTMLAudioElement | null>(null);
  const sClick = useRef<HTMLAudioElement | null>(null);
  const sEnd = useRef<HTMLAudioElement | null>(null);

  // Init sounds
  useEffect(() => {
    sCorrect.current = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    sWrong.current = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    sClick.current = new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg");
    sEnd.current = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

    [sCorrect, sWrong, sClick, sEnd].forEach(ref => {
      if (ref.current) ref.current.volume = 1.0;
    });
  }, []);

  // Start game
  const initGame = useCallback(() => {
    setGameStarted(false);
    setRoundOver(false);
    setRound(0);
    setScore(0);
    setXpEarned(0);
    setSequence([]);
    setPlayerSequence([]);
    setTimeLeft(ROUND_TIME);
  }, []);

  const nextRound = useCallback(() => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, nextColor]);
    setPlayerSequence([]);
    setRound(r => r + 1);
    setShowingSequence(true);
  }, []);

  // Play sequence for player
  useEffect(() => {
    if (!showingSequence || sequence.length === 0) return;
    let idx = 0;
    const interval = setInterval(() => {
      const color = sequence[idx];
      const el = document.getElementById(`btn-${color}`);
      if (el) {
        el.classList.add("opacity-100", "scale-110");
        setTimeout(() => el.classList.remove("opacity-100", "scale-110"), 400);
      }
      sClick.current?.play();
      idx++;
      if (idx >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setShowingSequence(false), 500);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [sequence, showingSequence]);

  // Player input
  const onPlayerPress = (color: string) => {
    if (!gameStarted || roundOver || showingSequence) return;
    sClick.current?.play();
    setPlayerSequence(prev => {
      const newSeq = [...prev, color];
      const isCorrect = sequence[newSeq.length - 1] === color;
      if (!isCorrect) {
        // Wrong input -> game over
        sWrong.current?.play();
        setRoundOver(true);
        setGameStarted(false);
        sEnd.current?.play();
        return newSeq;
      }
      // If sequence complete
      if (newSeq.length === sequence.length) {
        sCorrect.current?.play();
        setScore(s => s + 1);
        setXpEarned(x => x + XP_PER_ROUND);
        setTimeout(nextRound, 800);
      }
      return newSeq;
    });
  };

  // Timer
  useEffect(() => {
    if (!gameStarted || roundOver) return;
    if (timeLeft <= 0) {
      setRoundOver(true);
      setGameStarted(false);
      sEnd.current?.play();
      return;
    }
    const t = setTimeout(() => {
      setTimeLeft(v => v - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [gameStarted, roundOver, timeLeft]);

 // Save XP on game over (accumulative update)
useEffect(() => {
  if (!roundOver || !wallet || xpEarned <= 0) return;

  (async () => {
    try {
      // 1. Fetch current XP
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("xp")
        .eq("wallet", wallet)
        .single();

      if (fetchError) {
        console.error("❌ Failed to fetch current XP:", fetchError);
        return;
      }

      const currentXp = profile?.xp || 0;
      const newXp = currentXp + xpEarned;

      // 2. Update with new XP total
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ xp: newXp })
        .eq("wallet", wallet);

      if (updateError) {
        console.error("❌ Failed to update XP:", updateError);
      } else {
        console.log(`✅ XP updated: ${currentXp} + ${xpEarned} = ${newXp}`);
      }
    } catch (err) {
      console.error("🔥 Unexpected saveXp error:", err);
    }
  })();
}, [roundOver, wallet, xpEarned]);


  // Start handler
  const onStart = useCallback(() => {
    if (!wallet) return;
    if (roundOver) initGame();
    setGameStarted(true);
    setTimeout(nextRound, 500);
  }, [wallet, roundOver, initGame, nextRound]);

  const timePercent = Math.max(0, Math.min(100, (timeLeft / ROUND_TIME) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-yellow-800 text-yellow-100 pb-16">
      <Topbar />

      {/* Back */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900 shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Wallet connect */}
      <div className="absolute top-4 right-4">
        <ConnectWallet
          onProfileUpdate={(profile: any) => {
            setUserId(profile?.id || null);
            setWallet(profile?.wallet || null);
          }}
        />
      </div>

      <AudioPlayer />

      {/* Header */}
      <div className="pt-20 px-6 max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-extrabold text-yellow-300">Simon Says 🧠</h1>
        </div>
        <p className="text-yellow-200/90 font-medium">
          Memorize and repeat the sequence! Each round gets harder.
        </p>
        <p className="text-yellow-100/80 text-sm">
          Complete a round to earn <b>{XP_PER_ROUND} XP</b>. You have <b>{ROUND_TIME}s</b>.
        </p>
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-5">
        {!gameStarted && !roundOver && (
          <button
            onClick={onStart}
            disabled={!wallet}
            className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition
              ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
          >
            {wallet ? "Start Game" : "Connect Wallet to Start"}
          </button>
        )}
      </div>

      {/* HUD */}
      <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <TimerReset className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Round: {round}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-xl border border-yellow-400/20">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">XP: {xpEarned}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="mt-6 max-w-xl mx-auto rounded-3xl shadow-2xl bg-yellow-300 p-6 ring-1 ring-yellow-200">
        {/* Time bar */}
        <div className="w-full h-2 rounded-full bg-yellow-200 overflow-hidden mb-4">
          <div className="h-full bg-black" style={{ width: `${timePercent}%` }} />
        </div>

        {/* Simon buttons */}
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map(c => (
            <motion.div
              key={c}
              id={`btn-${c}`}
              onClick={() => onPlayerPress(c)}
              className={`aspect-square rounded-2xl cursor-pointer flex items-center justify-center text-black font-bold text-xl shadow-inner opacity-80 hover:opacity-100 transition select-none`}
              style={{
                backgroundColor: c,
              }}
              whileTap={{ scale: 0.9 }}
            >
              {c.toUpperCase()}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Round Over Modal */}
      {roundOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-yellow-300 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4 ring-1 ring-yellow-200">
            <h2 className="text-2xl font-extrabold text-black mb-2">Game Over</h2>
            <div className="grid grid-cols-3 gap-3 text-black font-semibold my-4">
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Score</div>
                <div className="text-xl">{score}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">Rounds</div>
                <div className="text-xl">{round}</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3">
                <div className="text-xs opacity-80">XP Earned</div>
                <div className="text-xl">{xpEarned}</div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={initGame}
                className="px-4 py-2 rounded-xl bg-black text-yellow-300 font-semibold hover:bg-gray-900"
              >
                New Game
              </button>
              <button
                onClick={() => router.push("/games")}
                className="px-4 py-2 rounded-xl bg-black text-yellow-300 font-semibold hover:bg-gray-900"
              >
                Exit
              </button>
              <button
                onClick={onStart}
                disabled={!wallet}
                className={`px-4 py-2 rounded-xl font-semibold shadow
                  ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
              >
                {wallet ? "Play Again" : "Connect Wallet"}
              </button>
            </div>
            <p className="text-xs text-black/80 mt-3">
              XP saves to your profile automatically when the game ends.
            </p>
          </div>
        </div>
      )}
      <div className="h-10" />
    </div>
  );
}
