"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-admin-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(6,182,212,0.06),transparent)] pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="bg-admin-card backdrop-blur rounded-3xl shadow-admin-card border border-admin-border overflow-hidden">
          <div className="px-8 pt-10 pb-2 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-admin-accent/20 ring-1 ring-admin-accent/40 mb-4">
              <Package className="text-admin-accent" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">Globex Couriers · Secure access</p>
          </div>
          <form onSubmit={handleSubmit} className="px-8 pb-10 pt-6 space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-admin-border bg-admin-bg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-admin-border bg-admin-bg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[50px] rounded-xl bg-admin-accent text-admin-bg py-3 font-semibold hover:bg-admin-accent-hover disabled:opacity-50 shadow-admin-glow flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-slate-500 hover:text-white text-sm inline-flex items-center gap-1 transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
