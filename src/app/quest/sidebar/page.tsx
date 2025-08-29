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
        className="fixed top-4 left-4 z-50 p-2 bg-yellow-400 text-black rounded-lg shadow-md hover:bg-yellow-500 transition"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <aside className="fixed top-0 left-0 h-screen w-56 bg-yellow-400 text-black flex flex-col shadow-2xl border-r border-yellow-600/30 z-40">
          <div className="p-5 mt-14 flex flex-col flex-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <img
                src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
                alt="Aptos Dog Logo"
                className="w-11 h-11 rounded-full border-2 border-black shadow-lg"
              />
              <span className="text-lg font-extrabold tracking-wide">
                Aptos Dog
              </span>
            </div>

            {/* Main Nav */}
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map(({ name, href, icon: Icon, external }) => {
                const isActive = pathname === href;
                const baseStyle =
                  "flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-all shadow-sm";
                const activeStyle =
                  "bg-black text-yellow-400 shadow-lg scale-[1.02]";
                const inactiveStyle =
                  "bg-white/60 hover:bg-white text-black";

                return external ? (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseStyle} ${inactiveStyle}`}
                  >
                    <Icon size={18} /> {name}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className={`${baseStyle} ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                  >
                    <Icon size={18} /> {name}
                  </Link>
                );
              })}
            </nav>

            {/* Social Links */}
            <div className="mt-auto pt-5 border-t border-black/20">
              <div className="flex gap-3">
                {socials.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-black text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all shadow-md hover:scale-110"
                    title={name}
                  >
                    <Icon size={18} />
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
