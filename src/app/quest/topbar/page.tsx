"use client";
import ConnectWallet from "@/components/connectwallet";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex items-center bg-gradient-to-r from-black via-gray-900 to-yellow-800 text-yellow-200 shadow-md px-4 h-14 border-b border-yellow-500/20 backdrop-blur-md">
      {/* Centered Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-semibold tracking-wide">
        <span className="p-1 rounded-md bg-black/40 ring-1 ring-yellow-500/30">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-4 h-4"
            fill="currentColor"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 0 0-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.97a1 1 0 0 0-.364-1.118L2.95 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.97z" />
          </svg>
        </span>
        <span className="text-sm">Quest Dashboard</span>
      </div>

      {/* Right: Wallet */}
      <div className="ml-auto">
        <ConnectWallet onProfileUpdate={() => {}} />
      </div>
    </header>
  );
}
