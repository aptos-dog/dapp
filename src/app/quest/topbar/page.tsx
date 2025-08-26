"use client";
import Image from "next/image";
import ConnectWallet from "@/components/connectwallet";

export default function Topbar() {
  return (
    <header className="sticky top-4 z-40 flex justify-center">
      <div className="flex items-center justify-between w-[92%] max-w-5xl px-6 h-16 rounded-full bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-lg overflow-hidden">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 font-bold text-yellow-300">
          <Image
            src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
            alt="Aptos Dog Logo"
            width={32}
            height={32}
            className="rounded-full border border-yellow-400"
          />
          <span className="hidden sm:block text-yellow-200">Aptos Dog</span>
        </div>

        {/* Center: Title */}
        <div className="text-base font-semibold tracking-wider text-yellow-200">
          Quest Dashboard
        </div>

        {/* Right: Wallet (resized + wrapped) */}
        <div className="flex items-center h-full max-h-12 px-2">
          <div className="scale-90 sm:scale-100 w-full">
            <ConnectWallet onProfileUpdate={() => {}} />
          </div>
        </div>
      </div>
    </header>
  );
}
