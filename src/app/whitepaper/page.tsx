"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  FaBone,
  FaPaw,
  FaRocket,
  FaUsers,
  FaGamepad,
  FaGift,
  FaCogs,
  FaGlobe,
} from "react-icons/fa";

const roadmap = [
  {
    title: "Puppy Genesis",
    date: "Q3 2025",
    desc:
      "Aptos Dog project revival. Launch of website, whitepaper, and community channels. This milestone establishes the foundational identity of the project, branding, community rules, and immediate engagement touchpoints. It includes the first public releases of design assets, community guidelines, and an initial governance primer.",
    icon: <FaPaw className="text-4xl text-rose-500" />,
  },
  {
    title: "Genesis Whitelist",
    date: "Q3 2025",
    desc:
      "Whitelist & early supporters rewarded with Puppy Pass NFTs. These holders will receive prioritized access to early features, governance previews, and participation in closed alpha tests. Whitelisting is intended to reward real contributors and early community builders rather than opportunistic bots.",
    icon: <FaBone className="text-4xl text-amber-500" />,
  },
  {
    title: "Fetch & Earn",
    date: "Q3 2025",
    desc:
      "Launch of Aptos Dog GameFi: a suite of mini-games, quests, and leaderboard mechanics. This stage emphasizes frictionless onboarding, clear reward signals, and incidence of play-to-earn that prioritizes retention and compelling gameplay loops.",
    icon: <FaGamepad className="text-4xl text-sky-500" />,
  },
  {
    title: "Airdrop",
    date: "Q4 2025",
    desc:
      "Airdrop of $APTDOG token to early players & NFT holders. Includes full audit summary and token generation event. Distribution methodology will be transparent and tamper-evident, with on-chain proofs and publication of eligible criteria.",
    icon: <FaGift className="text-4xl text-lime-500" />,
  },
  {
    title: "Alpha Rewards",
    date: "Q1 2026",
    desc:
      "AI-driven rewards system goes live. Machine-assisted scoring of engagement quality, contribution value, and long-term retention signals to dynamically allocate rewards to the most valuable participants.",
    icon: <FaCogs className="text-4xl text-violet-500" />,
  },
  {
    title: "Global Pack Expansion",
    date: "TBA",
    desc:
      "Cross-chain partnerships, tournaments, and community-driven seasonal updates. Scaling strategy focuses on interoperability and carefully selected integrations to preserve tokenomics and user experience.",
    icon: <FaGlobe className="text-4xl text-indigo-500" />,
  },
  {
    title: "Moon Dog Run",
    date: "TBA",
    desc:
      "Long-term vision: fully decentralized dog racing league with DAO governance. A place where token holders propose race rules, reward structures, and seasonal economics. The DAO will evolve with community input and measured safety controls.",
    icon: <FaRocket className="text-4xl text-red-500" />,
  },
];

function RoadmapTabs() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full relative overflow-hidden py-12">
      <div className="py-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-sky-700">
          Aptos Dog Roadmap
        </h2>
        <p className="text-base max-w-xl mx-auto text-gray-700">
          Progressive milestones, explained in detail and with community impact in mind.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-10">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {roadmap.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-extrabold transition-all duration-200 ${
                active === i
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg scale-105"
                  : "bg-white/60 text-gray-700 border border-gray-200 hover:scale-105"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="relative h-auto flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45 }}
              className="bg-white/95 border border-gray-200 rounded-2xl p-8 shadow-xl max-w-3xl w-full"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-white to-gray-50 shadow-sm mb-4">
                  {roadmap[active].icon}
                </div>
                <h3 className="text-2xl font-extrabold mb-1 text-gray-900">
                  {roadmap[active].title}
                </h3>
                <p className="text-sm italic mb-4 text-gray-500">
                  {roadmap[active].date}
                </p>
                <p className="text-base text-gray-700 leading-relaxed text-justify">
                  {roadmap[active].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setActive((active - 1 + roadmap.length) % roadmap.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-extrabold transition"
          >
            Prev
          </button>
          <div className="text-sm text-gray-600">Step {active + 1} of {roadmap.length}</div>
          <button
            onClick={() => setActive((active + 1) % roadmap.length)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-extrabold transition"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default function WhitepaperPage() {
  const sectionVariant = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 text-black antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-yellow-800">
            Aptos Dog Whitepaper
          </h1>
          <p className="max-w-3xl mx-auto text-gray-800">
            Play. Connect. Earn. Govern. A detailed exploration of the Aptos Dog vision, architecture, token model, and roadmap.
          </p>
        </motion.header>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-rose-600">Vision</h2>

          <div className="space-y-4 text-justify text-gray-800 leading-relaxed">
            <p>
              Aptos Dog is a community-first GameFi and SocialFi ecosystem built on the Aptos blockchain. Our vision is to create a
              long-lived, player-driven platform where gameplay, social contribution, and thoughtful governance all contribute to
              a sustainable economy. We believe that combining short-form, compelling mini-games with a robust referral and
              social-reward layer will drive better retention, healthier token flows, and a more resilient community.
            </p>

            <p>
              The platform is designed to reward players for more than just raw time spent. Quality of contribution, consistent
              participation, and community-building activity are primary signals in our reward engine. This approach reduces the
              incentive for low-quality grinding or bot-driven behaviour and instead encourages players to build, create, and
              meaningfully engage.
            </p>

            <p>
              Long-term, we see Aptos Dog evolving into a decentralized league where token holders and NFT owners participate in
              governance, shaping competitive rules, reward distribution, and economic parameters. The game ecosystem is a tool
              for community cohesion, not merely a monetization channel.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-sky-600">Executive Summary</h2>

          <div className="space-y-4 text-justify text-gray-800 leading-relaxed">
            <p>
              Aptos Dog is composed of a growing Game Hub of mini-games, a Social Quest layer that rewards real contribution, a
              set of scarce utility NFTs called DOGGOS CHRONICLES, and the native $APTDOG token which functions as both utility
              and governance currency. Our roadmap prioritizes transparent milestones, security (audits and timelocks), and
              community governance primitives.
            </p>

            <p>
              Initial phases focus on creating accessible, enjoyable games that are simple to pick up but offer depth through
              seasonal progression, leaderboards, and rewards. Parallel to the Game Hub launch, we will distribute early NFTs to
              community contributors and run carefully designed airdrops to incentivize long-term engagement rather than
              speculative flipping.
            </p>

            <p>
              The token model, combined with NFT utility and an AI-assisted reward mechanism, is intended to align short-term
              player incentives with long-term network health. The project emphasizes transparency at every stage: published
              audits, verifiable on-chain events, and community-driven governance.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-green-600">Problems We Solve</h2>

          <ul className="list-inside space-y-4 text-gray-800">
            <li>
              <span className="font-extrabold">Shallow play-to-earn models:</span>
              <div className="mt-2">
                <p>
                  Problem: Many P2E models prioritize repetitive grinding that produces short term rewards with little long term
                  value. Players burn out and token sinks are weak.
                </p>
                <p>
                  Solution: Aptos Dog's reward system combines gameplay skill, ownership (NFTs), referral quality, and seasonal
                  mechanics to keep value circulating. We use tiered rewards, diminishing returns on low-effort actions, and
                  engagement multipliers for meaningful contributions.
                </p>
              </div>
            </li>

            <li>
              <span className="font-extrabold">Fragmented social incentives:</span>
              <div className="mt-2">
                <p>
                  Problem: Social actions are often undervalued and easy to fake using bots or low-quality spam.
                </p>
                <p>
                  Solution: Social quests implement verification heuristics and AI scoring to upweight genuine creator efforts and
                  referrals that lead to real retention. Referral tracking leverages anti-sybil heuristics and human moderation
                  signals when edge cases arise.
                </p>
              </div>
            </li>

            <li>
              <span className="font-extrabold">Speculation without utility:</span>
              <div className="mt-2">
                <p>
                  Problem: NFTs and tokens without clear utilities become speculative assets with declining long-term value.
                </p>
                <p>
                  Solution: DOGGOS CHRONICLES are scarce, utility-first collectibles that provide airdrop rights, early access,
                  and governance weight. Their scarcity and on-chain provenance create combinatorial value with gameplay and
                  governance.
                </p>
              </div>
            </li>

            <li>
              <span className="font-extrabold">Lack of transparency & security:</span>
              <div className="mt-2">
                <p>
                  Problem: Early projects can lack clear communication about contracts, audits, and roadmap commitments.
                </p>
                <p>
                  Solution: We commit to publishing audit reports, maintaining an open changelog, and using timelocks and multisig
                  signoff for critical treasury or token-related operations.
                </p>
              </div>
            </li>

            <li>
              <span className="font-extrabold">Retention & discovery:</span>
              <div className="mt-2">
                <p>
                  Problem: Games without cross-promotion and event-driven content fail to retain attention.
                </p>
                <p>
                  Solution: The Game Hub centralizes multiple titles, cross-promotes seasonal events, and uses leaderboards and
                  meta-rewards to keep players returning and discovering new experiences.
                </p>
              </div>
            </li>
          </ul>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-purple-600">Core Features</h2>

          <div className="space-y-6 text-gray-800">
            <div>
              <h3 className="text-xl font-extrabold mb-2 text-rose-500">Game Hub (8+ Games)</h3>
              <p>
                The Game Hub is a curated collection of accessible mini-games that scale in complexity and reward. We emphasize
                low friction onboarding (walletless play for casual modes, wallet connect for progress persistence) and tight
                looped gameplay that rewards both skill and consistency. Each game contributes XP, seasonal progression and
                leaderboard points which feed into broader reward systems.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold mb-2 text-sky-500">Leaderboards & XP</h3>
              <p>
                Leaderboards operate on seasons. XP accrues through gameplay, social quests, and milestone achievements. Season
                leaders receive amplified rewards during settlement windows, while XP unlocks tiers granting privileges like early
                access to limited mints or exclusive tournaments.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold mb-2 text-amber-500">Social Quests & Referrals</h3>
              <p>
                Social Quests provide structured, measurable activities that reward quality contributions. Examples include: create
                a tutorial, host a community event, or create a short highlight reel. Referrals are tracked using unique codes
                and validated through behavioral signals and anti-abuse heuristics.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold mb-2 text-indigo-500">DOGGOS CHRONICLES (NFT)</h3>
              <p>
                DOGGOS CHRONICLES are limited-supply NFTs tied directly to utility: they grant airdrop claims, boost reward
                multipliers, and act as access keys to alpha events. The initial supply is intentionally limited to protect
                long-term holder value and create meaningful scarcity.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold mb-2 text-violet-500">AI-powered rewards</h3>
              <p>
                We use AI to assess contribution quality, not to replace human moderation. The scoring model considers repeat
                engagement, content value, and cross-channel retention to dynamically assign reward weight. This helps us avoid
                rewarding shallow or spammy behavior while cultivating creators and community leaders.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold mb-2 text-emerald-600">Governance & DAO</h3>
              <p>
                Governance begins as a guided process and transitions to token-weighted voting. Initial governance proposals will be
                curated to avoid economic attacks and to allow the community to gain experience. As the DAO matures, proposals
                will cover feature priorities, tournament rules, and treasury allocations.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-indigo-600">Tokenomics</h2>

          <div className="space-y-4 text-justify text-gray-800">
            <p>
              The $APTDOG token is the native currency for incentives, staking, and governance. Token supply, allocation, and
              vesting will be finalized and published alongside the token generation event and audit reports. Below is an
              illustrative model and the economic rationale behind each allocation bucket.
            </p>

            <div className="bg-white/90 p-6 rounded-lg border border-gray-200">
              <ul className="space-y-3 text-gray-800">
                <li>
                  <strong>Total Supply (illustrative):</strong> 1,000,000,000 $APTDOG — the final on-chain supply will be fixed at
                  token generation and will be published with contract addresses.
                </li>
                <li>
                  <strong>Public Allocation / Airdrop (example):</strong> 10% — distributed to early players, NFT holders, and
                  targeted community contributors to seed activity and decentralize initial ownership.
                </li>
                <li>
                  <strong>Team:</strong> Vesting and cliffs will be designed to retain talent while aligning incentives to long-term
                  project success.
                </li>
                <li>
                  <strong>VC / Partners:</strong> Carefully allocated with long vesting schedules and restrictions to prevent early
                  market dumps.
                </li>
                <li>
                  <strong>Liquidity:</strong> Provision for exchange listings and AMM pools to ensure healthy trading and access.
                </li>
                <li>
                  <strong>Ecosystem / Treasury:</strong> Reserved for grants, partnerships, tournaments, and developer bounties.
                </li>
              </ul>
            </div>

            <p>
              Allocations and vesting specifics are critical for long-term network health. We will publish a transparent schedule
              with cliff periods and vesting curves to prevent early concentration. Token sinks (staking, consumable boosts,
              tournament entry fees, cosmetic purchases) will help maintain deflationary pressure and real utility.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-amber-700">Security & Audit</h2>

          <div className="space-y-4 text-justify text-gray-800">
            <p>
              Security is a cornerstone. Prior to any token generation event, mint, or reward distribution, we will undergo
              independent smart contract audits by reputable firms. Audit results will be published alongside remediation plans
              and follow-up verifications.
            </p>

            <p>
              Best practices include multi-signature controls for critical treasury actions, time-locked governance changes during
              early phases, and publicly verifiable contract addresses for all treasury and distribution contracts. Open-source
              contracts and community review periods are part of our transparency commitment.
            </p>

            <p>
              For off-chain systems (leaderboards, reward engine), we will implement tamper-evident logging, signed events, and
              public proofs where possible to enable community verification of key settlement events.
            </p>
          </div>
        </motion.section>

        <RoadmapTabs />

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-fuchsia-700">Community & Growth</h2>

          <div className="space-y-4 text-justify text-gray-800">
            <p>
              Community is the backbone of Aptos Dog. We will invest in creator programs, tournaments, and ambassador
              initiatives to grow organically while preserving quality. Community voting, grants and seasonal content will be
              used to scale engagement without diluting value.
            </p>

            <h3 className="text-xl font-extrabold mt-4 mb-2 text-sky-600">Partnerships</h3>
            <p>
              Strategic partnerships will focus on gaming studios, tooling providers, and cross-chain bridges that align with our
              user experience and economic model. Each partnership must pass a vetting process to ensure long-term value and
              minimal token pressure.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-emerald-700">Problems & Our Solutions (Expanded)</h2>

          <div className="space-y-6 text-justify text-gray-800">
            <div>
              <h4 className="font-extrabold mb-2 text-rose-600">Shallow play-to-earn models</h4>
              <p>
                Many projects focus on rewarding repetitive actions, which creates brittle value. Aptos Dog uses a layered system
                where rewards are distributed across gameplay performance, social contribution, and ownership. This creates
                multiple demand channels for the token and reduces single-point failure modes.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold mb-2 text-sky-600">Fragmented social incentives</h4>
              <p>
                Social incentives are built to reward depth, not vanity. AI and heuristic verification systems filter out low-value
                referrals and spam. Human moderation and appeals processes handle nuanced cases where automated systems lack
                context.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold mb-2 text-indigo-600">Speculation without utility</h4>
              <p>
                By linking NFTs and token rights to clear in-game utilities — boosts, access, governance — we convert speculative
                interest into ongoing engagement and participation. Scarcity mechanics are balanced with utility to avoid purely
                speculative markets.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold mb-2 text-amber-600">Lack of transparency & security</h4>
              <p>
                Transparency is enforced through public audits, published timetables, and open-source code. We expect community
                auditors and will respond quickly to any security disclosures.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold mb-2 text-violet-600">Retention & discovery</h4>
              <p>
                The centralized Game Hub, combined with cross-promotions and seasonal meta-rewards, encourages exploration and
                long-term retention. Tournaments and creator-driven content keep discovery fresh and community-driven.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-cyan-700">FAQ</h2>

          <div className="space-y-4 text-gray-800">
            <div>
              <h4 className="font-extrabold">When is the $APTDOG token launching?</h4>
              <p>Exact dates will be announced after audits and tokenomics are finalized. Follow official channels for updates.</p>
            </div>

            <div>
              <h4 className="font-extrabold">How do I get DOGGOS CHRONICLES?</h4>
              <p>
                Limited minting windows will be available to whitelisted supporters and early contributors. Public minting steps
                and eligibility will be published on our website.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold">Will there be audits?</h4>
              <p>Yes. All major contracts will be audited and the reports published before any token generation or major distribution.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionVariant}
          transition={{ duration: 0.5 }}
          className="mb-24 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl font-extrabold mb-4 text-pink-700">Join the Pack</h2>
          <p className="mb-4 text-gray-800">
            Play, connect, and help shape the future of Aptos Dog. Early engagement, NFT ownership, and community contributions
            position you for rewards and governance participation.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="https://bit.ly/DOGGOSCHRONICLES"
              className="px-6 py-3 rounded-xl bg-black text-yellow-300 font-extrabold shadow-md hover:scale-105 transition transform"
            >
              Mint DOGGOS CHRONICLES
            </a>
            <a
              href="https://aptosdog.xyz/game-hub"
              className="px-6 py-3 rounded-xl border border-black text-black font-extrabold hover:bg-black/5 transition"
            >
              Visit Game Hub
            </a>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
