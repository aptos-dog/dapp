"use client";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AudioPlayer from "@/app/components/AudioPlayer";

export default function AirdropPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-black">
      <Navbar />

      <main className="flex-grow flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-black/50 px-10 py-16 rounded-2xl shadow-2xl border border-yellow-300"
        >
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-extrabold text-yellow-300 drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]"
          >
          COMING SOON...
          </motion.h1>
        </motion.div>
      </main>

      <Footer />

      <AudioPlayer />
    </div>
  );
}
