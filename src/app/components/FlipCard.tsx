"use client";

import React from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
  title: string;
  icon: string;
  desc: string;
  delay: number;
  height?: string; // ✅ optional prop
}

export default function FlipCard({
  title,
  icon,
  desc,
  delay,
  height = "h-48",
}: FlipCardProps) {
  const [flipped, setFlipped] = React.useState(false);

  return (
    <motion.div
      className={`group [perspective:1000px] w-full ${height} cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]
          ${flipped ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"}
        `}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-xl border border-yellow-500/40 shadow-lg [backface-visibility:hidden]">
          <span className="text-3xl mb-2">{icon}</span>
          <h3 className="text-lg font-bold text-yellow-200">{title}</h3>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex items-center justify-center p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/40 text-center text-gray-300 text-sm leading-relaxed shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {desc}
        </div>
      </div>
    </motion.div>
  );
}

