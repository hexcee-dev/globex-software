"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Upload,
  LogOut,
  Package,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload", label: "Bulk & Paste", icon: Upload },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile: top bar + overlay menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-admin-card border-b border-admin-border text-white flex items-center justify-between px-4 z-50 shadow-admin-card">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-admin-accent/20 flex items-center justify-center">
            <Package className="text-admin-accent" size={20} />
          </div>
          <span className="font-semibold">Globex Admin</span>
        </div>
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed top-14 left-0 bottom-0 w-64 bg-admin-card border-r border-admin-border z-40 lg:hidden shadow-admin-card flex flex-col pt-6 pb-8"
            >
              <nav className="flex-1 px-3 space-y-1">
                {links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        active
                          ? "bg-admin-accent text-admin-bg shadow-admin-glow"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={20} /> {label}
                    </Link>
                  );
                })}
              </nav>
              <form action="/api/auth/logout" method="POST" className="px-3 pt-4 border-t border-admin-border">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOut size={20} /> Logout
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-admin-card border-r border-admin-border text-white shadow-admin-card z-30">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-admin-border">
          <div className="w-10 h-10 rounded-xl bg-admin-accent/20 flex items-center justify-center ring-1 ring-admin-accent/30">
            <Package className="text-admin-accent" size={22} />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Globex</span>
            <span className="block text-[10px] font-medium text-admin-accent uppercase tracking-widest">Admin</span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active
                    ? "bg-admin-accent text-admin-bg shadow-admin-glow"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-admin-border">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={20} /> Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
