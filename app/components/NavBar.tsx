"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home } from "lucide-react";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="container mx-auto flex justify-between items-center px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 min-h-[44px] min-w-[44px] -m-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Globex home"
        >
          <Image
            src="/globex%20Logo.png"
            alt="Globex"
            width={130}
            height={36}
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <button
          type="button"
          className="md:hidden touch-target rounded-lg p-2 -m-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary font-medium transition-colors"
          >
            <Home size={18} /> Home
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-white shadow-xl z-50 md:hidden flex flex-col pt-20 pb-8 px-6"
            >
              <Link
                href="/"
                className="flex items-center gap-3 py-4 px-3 rounded-xl text-gray-800 hover:bg-gray-100 font-medium touch-target-inline"
                onClick={() => setMenuOpen(false)}
              >
                <Home size={22} /> Home
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-3 py-4 px-3 rounded-xl text-gray-700 hover:bg-gray-100 touch-target-inline"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
