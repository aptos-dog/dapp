"use client";

import { motion } from "framer-motion";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import RoadmapSection from "./components/RoadmapSection";
import AudioPlayer from "@/app/components/AudioPlayer";
import React from "react";
import FlipCard from "./components/FlipCard";
import Overview from "./components/Overview";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-yellow-400 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24 px-6 md:px-20 bg-gradient-to-br from-yellow-900/20 via-black to-black">
        {/* Glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,0,0.15),transparent)]" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-600 bg-clip-text text-transparent">
              GameFi & SocialFi
              <br />
              on Aptos
            </h1>
            <p className="text-gray-300 text-lg mb-10">
  Aptos Dog is a community-driven movement powered by
  <span className="text-yellow-400 font-semibold"> AI rewards</span> and
  <span className="text-yellow-400 font-semibold"> decentralized governance</span>. Connect, earn, and play.
</p>

            <div className="flex flex-wrap gap-5">
              <a
                href="/Airdrop"
                className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,0,0.6)] hover:scale-105 hover:bg-yellow-500 transition-all"
              >
                JOIN AIRDROP
              </a>
              <a
                href="https://t.me/aptosdog"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-yellow-400 px-8 py-3 rounded-full hover:bg-yellow-500 hover:text-black transition-all hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]"
              >
                Join Community
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://i.postimg.cc/bY0t5yWv/yellow-background-1024.png"
              alt="Aptos Dog Hero"
              className="w-full rounded-3xl shadow-[0_0_30px_rgba(255,255,0,0.3)]"
            />
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-6 md:px-20 bg-black relative">
        <h2 className="text-4xl font-bold text-center mb-14 bg-gradient-to-r from-yellow-200 to-orange-400 bg-clip-text text-transparent">
          🔧 Core Features
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            "GameFi + SocialFi",
            "AI-Driven Rewards",
            "Community Governance",
            "On-Chain Security",
            "NFT Utility",
            "Cross-Platform Ready",
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl bg-black/50 backdrop-blur-xl border border-yellow-500/40 hover:border-yellow-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,0,0.3)] transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-yellow-200">{feature}</h3>
            </motion.div>
          ))}
        </div>
      </section>

    <Overview />

      {/* $APTDOG CTA */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-r from-yellow-800/20 via-black to-yellow-800/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,0,0.07),transparent)]" />
        <motion.h2
          className="relative text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-orange-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          🔄 Claim $APTDOG Now
        </motion.h2>
        <motion.p
          className="relative text-gray-300 max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Unlock AI-powered rewards, exclusive NFT benefits, and governance perks with your $APTDOG tokens.
        </motion.p>
        <a
          href="/Airdrop"
          className="relative inline-block bg-yellow-500 hover:bg-yellow-600 transition-colors text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,0,0.4)] hover:scale-105"
        >
          Join Airdrop
        </a>
      </section>

      {/* ROADMAP */}
      <RoadmapSection />

{/* BRAND ETHOS - 3D FLIP CARDS */}
<section className="py-20 px-6 md:px-20 bg-gradient-to-b from-black to-gray-900 text-center">
  <motion.h2
    className="text-3xl font-extrabold mb-12 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    🐾 The Aptos Dog Spirit
  </motion.h2>

  <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
    {[
      {
        title: "Community First",
        icon: "🌐",
        desc: "The heart of Aptos Dog is its pack. Every member has a voice, from feature votes to co-creating content, the community drives the future.",
      },
      {
        title: "Earn As You Engage",
        icon: "💰",
        desc: "Play, share, and interact. Every action counts and is rewarded through AI-powered engagement tracking, making fun truly profitable.",
      },
      {
        title: "Always Evolving",
        icon: "🔄",
        desc: "From seasonal quests to NFT upgrades and new utilities, Aptos Dog never stands still. Expect fresh content and constant innovation.",
      },
    ].map((item, i) => (
      <FlipCard key={i} {...item} delay={i * 0.2} height="h-60" />
    ))}
  </div>
</section>

      <Footer />
      
      <AudioPlayer />
    </div>
  );
}
