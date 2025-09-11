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
  Gamepad2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", href: "https://aptosdog.xyz/", icon: Home, external: true },
  { name: "Dashboard", href: "/quest", icon: LayoutDashboard },
  { name: "Profile", href: "/quest/profile", icon: User },
  { name: "Quests", href: "/quest/checkin", icon: CheckSquare },
  { name: "Social Quest", href: "/quest/social", icon: Users },
  { name: "Games", href: "/games", icon: Gamepad2 },
];

const socials = [
  { name: "Discord", href: "https://discord.gg/XqHsxPxd8g", icon: MessageCircle },
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
        className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg shadow-lg hover:scale-110 transition"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-0 left-0 h-screen w-64 
                       bg-yellow-400/30 backdrop-blur-xl 
                       border-r border-yellow-500/40 
                       text-black flex flex-col shadow-[0_0_30px_rgba(250,204,21,0.5)] 
                       z-40"
          >
            <div className="p-5 mt-14 flex flex-col flex-1">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-10">
                <motion.img
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
                  alt="Aptos Dog Logo"
                  className="w-12 h-12 rounded-full border-2 border-black shadow-lg"
                />
                <span className="text-xl font-extrabold tracking-wide drop-shadow-lg">
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
                    "bg-black text-yellow-400 shadow-lg scale-[1.05]";
                  const inactiveStyle =
                    "bg-white/20 hover:bg-white/40 text-black hover:scale-[1.02]";

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

              {/* Play Games Highlight */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-6 p-4 bg-black/80 rounded-xl text-yellow-400 text-center shadow-lg cursor-pointer"
              >
                <Link href="/games" className="flex flex-col items-center gap-2">
                  <Sparkles size={28} className="animate-pulse" />
                  <span className="font-bold text-base tracking-wide">
                    Play Games
                  </span>
                  <p className="text-xs text-yellow-300/80">
                     start playing today!
                  </p>
                </Link>
              </motion.div>

              {/* Social Links */}
              <div className="mt-auto pt-6 border-t border-yellow-500/30">
                <div className="flex gap-3 justify-center">
                  {socials.map(({ name, href, icon: Icon }) => (
                    <motion.a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      className="p-2 rounded-lg bg-black text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all shadow-md"
                      title={name}
                    >
                      <Icon size={18} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

