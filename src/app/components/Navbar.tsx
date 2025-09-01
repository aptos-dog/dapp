import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Trophy,
  Gamepad2,
  Gift,
  Twitter,
  MessageCircle,
  Send, // Telegram icon
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const navLink =
    "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition text-sm hover:scale-105";

  const solid =
    `${navLink} bg-black text-yellow-400 shadow-md hover:shadow-black/50`;
  const outline =
    `${navLink} border border-black text-black hover:bg-black/20 hover:text-black`;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="bg-yellow-400 backdrop-blur-xl border border-black/20 rounded-full px-6 py-3 flex justify-between items-center shadow-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://i.postimg.cc/BnFb7BNw/aptos-dog.jpg"
            alt="Aptos Dog Logo"
            className="w-9 h-9 rounded-full border-2 border-black"
          />
          <span className="text-lg font-bold text-black">Aptos Dog</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          <Link href="/" className={outline}>
            <Home size={16} /> Home
          </Link>
          <Link href="/quest" className={solid}>
            <Trophy size={16} /> Quest
          </Link>
          <Link href="/games" className={solid}>
            <Gamepad2 size={16} /> Games
          </Link>
          <Link href="/airdrop" className={solid}>
            <Gift size={16} /> Airdrop
          </Link>
          <a
            href="https://discord.gg/9XKPr52uRM"
            target="_blank"
            rel="noopener noreferrer"
            className={outline}
          >
            <MessageCircle size={16} /> Discord
          </a>
          <a
            href="https://t.me/aptosdog_xyz"
            target="_blank"
            rel="noopener noreferrer"
            className={outline}
          >
            <Send size={16} /> Telegram
          </a>
          <a
            href="https://twitter.com/aptosdog_xyz"
            target="_blank"
            rel="noopener noreferrer"
            className={outline}
          >
            <Twitter size={16} /> Twitter
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-black" onClick={toggleMenu}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 bg-yellow-300 border border-black/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          <Link href="/" onClick={toggleMenu} className={outline}>
            <Home size={16} /> Home
          </Link>
          <Link href="/quest" onClick={toggleMenu} className={solid}>
            <Trophy size={16} /> Quest
          </Link>
          <Link href="/games" onClick={toggleMenu} className={solid}>
            <Gamepad2 size={16} /> Games
          </Link>
          <Link href="/airdrop" onClick={toggleMenu} className={solid}>
            <Gift size={16} /> Airdrop
          </Link>
          <a
            href="https://discord.gg/9XKPr52uRM"
            target="_blank"
            rel="noopener noreferrer"
            onClick={toggleMenu}
            className={outline}
          >
            <MessageCircle size={16} /> Discord
          </a>
          <a
            href="https://t.me/aptosdog_xyz"
            target="_blank"
            rel="noopener noreferrer"
            onClick={toggleMenu}
            className={outline}
          >
            <Send size={16} /> Telegram
          </a>
          <a
            href="https://twitter.com/aptosdog_xyz"
            target="_blank"
            rel="noopener noreferrer"
            onClick={toggleMenu}
            className={outline}
          >
            <Twitter size={16} /> Twitter
          </a>
        </div>
      )}
    </header>
  );
}
