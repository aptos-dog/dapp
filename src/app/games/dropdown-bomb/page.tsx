"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Topbar from "@/app/quest/topbar/page";
import AudioPlayer from "@/app/components/AudioPlayer";
import { ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-white">
      {/* Topbar */}
      <Topbar />

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 text-yellow-300 hover:bg-black/60 border border-yellow-400/40 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
      </div>

      {/* Coming Soon Content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg"
          >
            🚀 Coming Soon
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-4 text-lg sm:text-xl md:text-2xl text-yellow-200/90"
          >
            Something exciting is on the way...
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 2,
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="mt-8 text-sm sm:text-base md:text-lg font-medium text-yellow-300"
          >
            Stay tuned!
          </motion.div>
        </motion.div>
      </main>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}
