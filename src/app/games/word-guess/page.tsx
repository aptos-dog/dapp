"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/app/quest/topbar/page";
import ConnectWallet from "@/components/connectwallet";
import AudioPlayer from "@/app/components/AudioPlayer";
import { createClient } from "@supabase/supabase-js";
import { Clock, Award, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // add this with your other imports

// --- Supabase client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Word pool (exactly as provided) ---
const WORDS = [
  "APTOS","DOG","APTOS DOG","APTDOG","PUPPY","PUPPY PASS","BLOCKCHAIN","BITCOIN","ETHEREUM","DEFI",
  "RWA","GAMEFI","SOCIALFI","VALIDATOR","STAKING","YIELD","WALLET","AIRDROP","NFT","TOKEN",
  "CRYPTO","DAPP","BRIDGE","GAS","LAYER1","LAYER2","ARBITRUM","SOLANA","CHAIN","SMARTCONTRACT",
  "METAMASK","TRUSTWALLET","RABBY","ORACLE","SHARDING","SNARK","STABLECOIN","TREASURY","GOVERNANCE","TOKENOMICS",
  "WHITEPAPER","BURN","MINT","LIQUIDITY","ROLLUP","OPTIMISTIC","VALIDIUM","PRIVACY","ONCHAIN","OFFCHAIN",
  "MULTISIG","YIELD FARM","ZKSYNC","POLYGON","COSMOS","BINANCE","ALTCOIN","MEMECOIN","DOGE","SHIBA",
  "MARKET","BEAR","BULL","HODL","WHITELIST","LAUNCHPAD","IDO","ICO","TVL","APR",
  "APY","COLLATERAL","BORROW","LEND","FLASHLOAN","NFTDROP","PHISHING","RUGPULL","TOKENSALE","WHITELABEL",
  "SUI","CARDANO","XRP","TON","RUST","MOVE","EVM","GWEI","AI","ZK",
  "ZKROLLUP","AGENTS","BOT","WAGMI","NGMI","FOMO","FUD","MOON","REKT","APESTAKE"
];

// --- Helpers ---
const ROUND_SECONDS = 30;
const WORDS_PER_ROUND = 3;
const XP_PER_WORD = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeGuess(s: string) {
  return s.trim().replace(/\s+/g, " ").toUpperCase();
}

// scrambles letters but keeps spaces in their original positions for legibility
function scrambleWordKeepSpaces(word: string) {
  const chars = word.replace(/\s+/g, "").split("");
  const scrambled = shuffle(chars).join("");
  // rebuild with spaces in original places
  let idx = 0;
  return word
    .split("")
    .map((ch) => (ch === " " ? " " : scrambled[idx++]))
    .join("");
}

export default function WordGuessPage(): JSX.Element {
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);

  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [guessed, setGuessed] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState("");

  const [xpEarned, setXpEarned] = useState(0);
  const [roundOver, setRoundOver] = useState(false);

  const router = useRouter();

  // 🔊 Sounds
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const tickSound = useRef<HTMLAudioElement | null>(null);
  const endSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctSound.current = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");
    wrongSound.current = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    tickSound.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    endSound.current = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    [correctSound, wrongSound, tickSound, endSound].forEach(ref => { if (ref.current) ref.current.volume = 1.0; });
  }, []);

  // 🎯 Initialize a new round
  const initRound = useCallback(() => {
    const picks = shuffle(WORDS).slice(0, WORDS_PER_ROUND);
    const scrambles = picks.map(scrambleWordKeepSpaces);
    setTargetWords(picks);
    setScrambled(scrambles);
    setGuessed({});
    setInput("");
    setXpEarned(0);
    setTimeLeft(ROUND_SECONDS);
    setRoundOver(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    initRound();
  }, [initRound]);

  // ⏱️ Timer
  useEffect(() => {
    if (!gameStarted || roundOver) return;
    if (timeLeft <= 0) {
      setRoundOver(true);
      endSound.current?.play();
      return;
    }
    const t = setTimeout(() => {
      if (timeLeft <= 5) tickSound.current?.play();
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [gameStarted, roundOver, timeLeft]);

  // ✅ Submit a guess
  const onSubmitGuess = useCallback(() => {
    if (!gameStarted || roundOver) return;
    const guess = normalizeGuess(input);
    if (!guess) return;

    // check against remaining words
    const matchIdx = targetWords.findIndex(
      (w) => normalizeGuess(w) === guess && !guessed[w]
    );
    if (matchIdx !== -1) {
      // correct
      correctSound.current?.play();
      const word = targetWords[matchIdx];
      setGuessed((g) => ({ ...g, [word]: true }));
      setXpEarned((xp) => xp + XP_PER_WORD);
      setInput("");
    } else {
      // wrong
      wrongSound.current?.play();
    }
  }, [gameStarted, roundOver, input, targetWords, guessed]);

  // 🏁 Auto-end when all 3 are guessed
  useEffect(() => {
    const allFound =
      targetWords.length > 0 &&
      targetWords.every((w) => guessed[w]);
    if (gameStarted && !roundOver && allFound) {
      setRoundOver(true);
      endSound.current?.play();
    }
  }, [guessed, targetWords, gameStarted, roundOver]);

  // 💾 Save XP via Supabase RPC
  const saveXp = useCallback(async (earned: number) => {
    if (!wallet || earned <= 0) return;
    try {
      const { data, error } = await supabase.rpc("increment_xp", {
        wallet_input: wallet,
        inc: earned,
      });
      if (error) {
        console.error("❌ XP save error:", error);
      } else {
        console.log("✅ XP saved, new XP:", data);
      }
    } catch (err) {
      console.error("🔥 Unexpected saveXp error:", err);
    }
  }, [wallet]);

  // Auto-save when round ends
  useEffect(() => {
    if (roundOver) {
      saveXp(xpEarned);
    }
  }, [roundOver, xpEarned, saveXp]);

  const remainingToWin = useMemo(
    () => Math.max(0, WORDS_PER_ROUND - Object.values(guessed).filter(Boolean).length),
    [guessed]
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-yellow-600 text-yellow-100">
      <Topbar />

      <div className="absolute top-4 left-4">
  <button
    onClick={() => router.push("/games")}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900 shadow"
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </button>
</div>

      {/* Wallet */}
      <div className="absolute top-4 right-4">
        <ConnectWallet
          onProfileUpdate={(profile: any) => {
            setUserId(profile?.id || null);
            setWallet(profile?.wallet || null);
          }}
        />
      </div>

      <AudioPlayer />

      {/* Header / How to play */}
      <div className="px-6 pt-20 max-w-3xl mx-auto text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-yellow-300">🔤 Word Guess</h1>
        <p className="text-yellow-200/90 font-medium">
          Guess <b>3 words</b> in <b>30 seconds</b>. Each <b>full word</b> = <b>+20 XP</b>. Timer auto-submits.
        </p>
      </div>

      {/* Start + Timer */}
      <div className="flex justify-center mt-6">
        {!gameStarted && !roundOver && (
          <button
            onClick={() => setGameStarted(true)}
            disabled={!wallet}
            className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition
              ${wallet ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
          >
            {wallet ? "Start Round" : "Connect Wallet to Start"}
          </button>
        )}
      </div>

      {gameStarted && (
        <div className="flex justify-center mt-6 mb-4">
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-xl border border-yellow-400/30">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-semibold">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className="max-w-3xl mx-auto mt-6 px-4">
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-5 rounded-2xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {targetWords.map((word, i) => {
              const isGuessed = !!guessed[word];
              return (
                <motion.div
                  key={word}
                  className={`min-h-[120px] rounded-xl p-4 flex flex-col items-center justify-center text-center 
                    ${isGuessed ? "bg-black text-yellow-300" : "bg-yellow-200 text-black"}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  <div className="text-sm opacity-80 mb-2">Word #{i + 1}</div>
                  <AnimatePresence mode="wait">
                    {isGuessed ? (
                      <motion.div
                        key="revealed"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="font-extrabold text-xl break-words"
                      >
                        {word}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="scrambled"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="font-extrabold text-xl break-words"
                        title="Scrambled letters"
                      >
                        {scrambled[i]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-2 text-xs opacity-80">
                    {!isGuessed ? "Guess the full word" : "Found ✅"}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input */}
          <div className="mt-5 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmitGuess();
              }}
              disabled={!gameStarted || roundOver}
              placeholder="Type full word and press Enter"
              className="flex-1 px-4 py-3 rounded-xl text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black/50"
            />
            <button
              onClick={onSubmitGuess}
              disabled={!gameStarted || roundOver}
              className="px-5 py-3 rounded-xl bg-black text-yellow-400 font-bold hover:bg-gray-900 disabled:bg-gray-700 disabled:text-gray-300"
            >
              Submit
            </button>
          </div>

          {/* XP + Progress */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-black font-bold">
              <Award className="w-5 h-5" />
              XP this round: <span className="ml-1">{xpEarned}</span>
            </div>
            {!roundOver && (
              <div className="text-black/80">
                Words remaining: <b>{remainingToWin}</b> / {WORDS_PER_ROUND}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Round Over Modal */}
      {roundOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-extrabold text-black mb-4">
              {Object.values(guessed).filter(Boolean).length >= WORDS_PER_ROUND
                ? "🎉 Round Complete!"
                : "⏰ Time’s Up!"}
            </h2>

            <div className="text-left bg-black/10 rounded-2xl p-4 mb-4">
              <div className="font-semibold mb-2 text-black">Results</div>
              <ul className="space-y-1">
                {targetWords.map((w) => (
                  <li key={w} className="flex items-center gap-2 text-black">
                    {guessed[w] ? (
                      <CheckCircle2 className="w-5 h-5 text-green-700" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-700" />
                    )}
                    <span className="font-bold">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-black mb-6 font-medium">
              You earned <b>{xpEarned}</b> XP this round.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={initRound}
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
              >
                New Round
              </button>
              <button
                onClick={() => router.push("/games")}
                className="px-4 py-2 rounded-xl bg-black text-yellow-400 font-semibold hover:bg-gray-900"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

