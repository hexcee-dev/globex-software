"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Upload, LogOut } from "lucide-react";

export default function AdminNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/upload", label: "Bulk & Paste", icon: Upload },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="lg:hidden touch-target rounded-lg p-2 -m-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary font-medium transition-colors"
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </div>

          <form action="/api/auth/logout" method="POST" className="ml-auto lg:ml-0">
            <button
              type="submit"
              className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[260px] bg-white shadow-xl z-50 lg:hidden flex flex-col pt-20 pb-8 px-4"
            >
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-4 px-3 rounded-xl text-gray-800 hover:bg-gray-100 font-medium min-h-[48px]"
                >
                  <Icon size={22} /> {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
