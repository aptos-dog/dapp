"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  User,
  CheckSquare,
  Users,
  Twitter,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "https://aptosdog.xyz/", icon: Home, external: true },
  { name: "Dashboard", href: "/quest", icon: LayoutDashboard },
  { name: "Profile", href: "/quest/profile", icon: User },
  { name: "Quests", href: "/quest/checkin", icon: CheckSquare },
  { name: "Social Quest", href: "/quest/social", icon: Users },
];

const socials = [
  { name: "Discord", href: "https://discord.gg/9XKPr52uRM", icon: MessageCircle },
  { name: "Twitter", href: "https://twitter.com/aptosdog_xyz", icon: Twitter },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-black/70 text-yellow-300 rounded-lg shadow-md hover:bg-yellow-500 hover:text-black transition"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <aside className="fixed top-0 left-0 h-screen w-52 bg-black/80 backdrop-blur-xl text-yellow-200 flex flex-col shadow-2xl border-r border-yellow-500/20 z-40">
          <div className="p-5 mt-14 flex flex-col flex-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <img
                src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
                alt="Aptos Dog Logo"
                className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-md"
              />
              <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Aptos Dog
              </span>
            </div>

            {/* Main Nav */}
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map(({ name, href, icon: Icon, external }) => {
                const isActive = pathname === href;
                const baseStyle =
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all";
                const activeStyle =
                  "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black shadow-lg scale-[1.02]";
                const inactiveStyle =
                  "hover:bg-yellow-500/20 hover:text-yellow-300 text-yellow-200";

                return external ? (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseStyle} ${inactiveStyle}`}
                  >
                    <Icon size={16} /> {name}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className={`${baseStyle} ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                  >
                    <Icon size={16} /> {name}
                  </Link>
                );
              })}
            </nav>

            {/* Social Links */}
            <div className="mt-auto pt-5 border-t border-yellow-500/20">
              <div className="flex gap-3">
                {socials.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-800/60 hover:bg-yellow-500 hover:text-black transition-all shadow-md hover:scale-110"
                    title={name}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
