"use client";
import Image from "next/image";
import ConnectWallet from "@/components/connectwallet";
import { motion } from "framer-motion";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between w-full px-6 h-16
        bg-black/50 backdrop-blur-xl border-b border-yellow-400/30 
        shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
      >
        {/* Left: Logo */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="flex items-center gap-3 font-bold text-yellow-300 cursor-pointer"
        >
          <Image
            src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
            alt="Aptos Dog Logo"
            width={36}
            height={36}
            className="rounded-full border border-yellow-400 shadow-md"
          />
          <span className="hidden sm:block text-yellow-200 tracking-wide">
            Aptos Dog
          </span>
        </motion.div>

        {/* Center: Title (optional, empty now) */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="text-lg font-semibold tracking-widest text-yellow-100 drop-shadow-md"
        >
          {/* Title here */}
        </motion.div>

        {/* Right: Wallet */}
        <div className="flex items-center h-full max-h-12 px-2">
          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <ConnectWallet onProfileUpdate={() => {}} />
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
