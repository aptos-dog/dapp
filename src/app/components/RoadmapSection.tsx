'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBone,
  FaPaw,
  FaRocket,
  FaUsers,
  FaGamepad,
  FaGift,
  FaCogs,
  FaGlobe,
} from 'react-icons/fa';

const roadmap = [
  {
    title: 'Puppy Genesis',
    date: 'Q3 2025',
    desc: 'Aptos Dog project revival. Launch of website, whitepaper, and community channels.',
    icon: <FaPaw className="text-yellow-400 text-3xl" />,
  },
  {
    title: 'Genesis Whitelist',
    date: 'Q3 2025',
    desc: 'Whitelist & early supporters rewarded with Puppy Pass NFTs for governance and perks.',
    icon: <FaBone className="text-orange-400 text-3xl" />,
  },
  {
    title: 'Fetch & Earn',
    date: 'Q3 2025',
    desc: 'launch of Aptos Dog GameFi. mini-games, quests, and leaderboard.',
    icon: <FaGamepad className="text-green-400 text-3xl" />,
  },
  {
    title: 'Airdrop',
    date: 'Q4 2025',
    desc: 'Airdrop of $APTDOG token to early players & NFT holders. Smart contract audit and token generation event.',
    icon: <FaGift className="text-purple-400 text-3xl" />,
  },
  {
    title: 'Alpha Rewards',
    date: 'Q1 2026',
    desc: 'AI-driven rewards system goes live. Users earn based on gameplay, activity, and community input.',
    icon: <FaCogs className="text-red-400 text-3xl" />,
  },
  {
    title: 'Global Pack Expansion',
    date: 'TBA',
    desc: 'Cross-chain partnerships, tournaments, and community-driven seasonal updates.',
    icon: <FaGlobe className="text-cyan-400 text-3xl" />,
  },
  {
    title: 'Moon Dog Run',
    date: 'TBA',
    desc: 'Long-term vision: fully decentralized dog racing league with DAO governance.',
    icon: <FaRocket className="text-yellow-500 text-3xl" />,
  },
];

export default function RoadmapTabs() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full text-white bg-black relative overflow-hidden">
      <div className="py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-6 tracking-wide">
          🌀 Aptos Dog Roadmap
        </h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
  Flip forward, one paw at a time.
</p>
</div>


      <div className="max-w-4xl mx-auto px-4 md:px-10">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {roadmap.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                active === i
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Active Slide */}
        <div className="relative h-72 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-800/60 rounded-2xl p-8 shadow-lg max-w-lg w-full text-center"
            >
              <div className="flex justify-center mb-4">{roadmap[active].icon}</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">{roadmap[active].title}</h3>
              <p className="text-sm text-gray-500 italic mb-3">{roadmap[active].date}</p>
              <p className="text-base text-gray-300">{roadmap[active].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setActive((active - 1 + roadmap.length) % roadmap.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-400 font-bold"
          >
            ⬅ Prev
          </button>
          <button
            onClick={() => setActive((active + 1) % roadmap.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-400 font-bold"
          >
            Next ➡
          </button>
        </div>
      </div>
    </section>
  );
}
