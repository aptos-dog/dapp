"use client";

import FlipCard from "./FlipCard";

const features = [
  {
    title: "Fast Transactions",
    icon: "⚡",
    desc: "Experience lightning-fast swaps and transfers with minimal fees.",
  },
  {
    title: "Secure by Design",
    icon: "🔒",
    desc: "Your assets are protected with industry-leading security standards.",
  },
  {
    title: "Community Driven",
    icon: "🌍",
    desc: "Governed by the community — your voice shapes the future.",
  },
];

export default function Overview() {
  return (
    <section id="overview" className="relative py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-yellow-400 mb-12">
          Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, i) => (
            <FlipCard
              key={i}
              delay={i * 0.15}
              height="h-48" // ✅ now supported
              title={item.title}
              icon={item.icon}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
