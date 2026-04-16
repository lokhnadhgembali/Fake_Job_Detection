"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, ShieldCheck, Moon, Sun, Globe, ChevronDown, Search, History, LayoutDashboard, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (pathname === "/login" || pathname === "/signup") return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300
      ${scrolled
        ? "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-sm"
        : "bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold font-space bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 tracking-tight">
              JobCheck AI
            </span>
          </Link>

          {/* RIGHT: Nav links + icons */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/predict"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-emerald-600 ${isActive('/predict') ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}
                >
                  <Search className="w-4 h-4" /> Scan Job
                </Link>
                <Link
                  href="/history"
                  className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-emerald-600 ${isActive('/history') ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}
                >
                  <History className="w-4 h-4" /> My History
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 text-base font-medium transition-colors hover:text-emerald-600 ${isActive('/admin') ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}

                {/* Divider + icons */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  {/* Notifications Dropdown */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifOpen(prev => !prev)}
                      className="relative p-1.5 text-slate-500 hover:text-emerald-500 transition-colors rounded-full hover:bg-slate-100"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden text-slate-700 py-4 px-4 shadow-slate-200/50">
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No notifications</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">You're all caught up!</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 transition-all overflow-hidden"
                    title={`${user.username} — View Profile`}
                  >
                    {user.profile_pic ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_pic}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">

                {/* Log in */}
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 px-4 py-1.5 rounded-full transition-all hover:shadow-sm">
                  Log In
                </Link>

                {/* Sign up */}
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-1.5 rounded-full transition-all hover:shadow-lg shadow-sm hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Shared Global Tools: Language + Theme */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              


              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
