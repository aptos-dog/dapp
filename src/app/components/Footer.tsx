import { FaDiscord, FaTwitter, FaBookOpen } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-400 via-black to-yellow-400 text-white text-sm py-3 mt-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        
        {/* Left: Copyright */}
        <p className="text-black font-medium bg-yellow-300 px-2.5 py-0.5 rounded-full shadow-sm text-xs">
          &copy; {new Date().getFullYear()} Aptos Dog. All rights reserved.
        </p>

        {/* Center + Right merged: Powered by Aptos + Links */}
        <div className="flex items-center gap-2">
          {/* Yellow circle behind logo */}
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-300 shadow-md">
            <motion.img
              src="https://i.postimg.cc/RFMPnsn1/aptos-apt-logo.png"
              alt="Aptos Logo"
              className="w-4 h-4 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span className="text-xs font-bold tracking-wide text-black bg-yellow-300 px-2.5 py-0.5 rounded-full shadow-md">
            Powered by Aptos
          </span>

          {/* Links + Socials */}
          <div className="flex items-center gap-3 ml-3">
            <Link href="/whitepaper">
              <FaBookOpen className="text-lg text-black hover:text-yellow-200" />
            </Link>
            <a
              href="https://discord.gg/9XKPr52uRM"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="text-lg text-black hover:text-yellow-200" />
            </a>
            <a
              href="https://twitter.com/aptosdog_xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="text-lg text-black hover:text-yellow-200" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

