"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
  title: string;
  icon: string;
  desc: string;
  delay?: number;   // for animation delay
  height?: string;  // for card height (like h-60, h-48)
}

export default function FlipCard({
  title,
  icon,
  desc,
  delay = 0,
  height = "h-60",
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="group [perspective:1000px] cursor-pointer w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onClick={() => setFlipped(!flipped)} // tap-to-flip
    >
      <div
        className={`relative w-full ${height} rounded-2xl transition-transform duration-700 [transform-style:preserve-3d]
          ${flipped ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"}
        `}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl border border-yellow-500/40 rounded-2xl shadow-lg [backface-visibility:hidden]">
          <span className="text-4xl mb-3">{icon}</span>
          <h3 className="text-lg font-bold text-yellow-200">{title}</h3>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-yellow-500/10 border border-yellow-500/40 rounded-2xl shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-sm text-gray-200 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
