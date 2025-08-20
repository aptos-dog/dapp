"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Overview() {
  return (
    <>
      {/* OVERVIEW */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-black via-zinc-900/40 to-black text-center">
        <motion.h2
          className="text-5xl font-black mb-6 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Play. Earn. Connect.
        </motion.h2>
        <motion.p
          className="text-gray-300 text-lg max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Dive into Aptos Dog: a fun, fast, AI-rewarded journey inside the Aptos blockchain. Be early. Be bold.
        </motion.p>
      </section>

      {/* INFO 3D FLIP CARDS */}
      <section className="py-20 px-6 md:px-20 bg-black">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "About Aptos Dog",
              icon: "🐶",
              desc: "A playful yet powerful GameFi x SocialFi project on Aptos. Built for the community, powered by AI rewards.",
            },
            {
              title: "Why Join?",
              icon: "🚀",
              desc: "Early members unlock airdrops, governance rights, and beta access. Join the first wave!",
            },
            {
              title: "NFT Utility",
              icon: "🎟️",
              desc: "Puppy Pass NFTs give perks: boosted rewards, exclusive quests, and priority features.",
            },
            {
              title: "Community First",
              icon: "🌐",
              desc: "The pack leads. Decisions, events, and growth are shaped by the community.",
            },
            {
              title: "AI Rewards",
              icon: "🤖",
              desc: "AI-driven system tailors rewards to your activity. Play more, engage more, earn more.",
            },
            {
              title: "Evolving Quests",
              icon: "🎮",
              desc: "Seasonal missions and new challenges keep the experience fresh and rewarding.",
            },
          ].map((item, i) => {
            const [flipped, setFlipped] = React.useState(false);
            return (
              <motion.div
                key={i}
                className="group [perspective:1000px] w-full h-48 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onClick={() => setFlipped(!flipped)} // tap-to-flip for mobile
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]
                    ${flipped ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"}
                  `}
                >
                  {/* FRONT */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-xl border border-yellow-500/40 shadow-lg [backface-visibility:hidden]">
                    <span className="text-3xl mb-2">{item.icon}</span>
                    <h3 className="text-lg font-bold text-yellow-200">{item.title}</h3>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/40 text-center text-gray-300 text-sm leading-relaxed shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
