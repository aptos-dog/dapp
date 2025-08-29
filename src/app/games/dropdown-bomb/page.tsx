"use client";

import { motion } from "framer-motion";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-black to-yellow-500 text-white px-4">
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
    </div>
  );
}
