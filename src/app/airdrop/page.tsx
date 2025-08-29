"use client";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AudioPlayer from "@/app/components/AudioPlayer";

export default function AirdropPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-white">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="bg-black/60 px-8 py-14 rounded-2xl shadow-2xl border border-yellow-400 text-center max-w-2xl"
        >
          {/* Headline */}
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_rgba(255,255,0,0.85)]"
          >
            APTDOG Airdrop
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 text-lg sm:text-xl text-yellow-100/90 leading-relaxed"
          >
            The <span className="font-semibold text-yellow-300">most anticipated drop</span>  
            on Aptos is almost here. <br />
            Early supporters will be rewarded, do not miss your chance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://aptosdog.xyz/quest"
              target="_blank"
              className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold text-lg shadow-md hover:bg-yellow-300 transition"
            >
              🏆 Join Quests
            </a>
            <a
              href="https://aptosdog.xyz/games"
              target="_blank"
              className="px-6 py-3 rounded-xl bg-black/70 border border-yellow-400 text-yellow-300 font-semibold text-lg shadow-md hover:bg-black/90 transition"
            >
              🎮 Play Games
            </a>
          </motion.div>

          {/* Motivational Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.4,
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="mt-8 text-base sm:text-lg md:text-xl font-bold text-yellow-300"
          >
            Complete quests. Play games. <br className="sm:hidden" />  
            Get ready for <span className="text-green-400">$APTDOG</span> 
          </motion.div>
        </motion.div>
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  );
}
