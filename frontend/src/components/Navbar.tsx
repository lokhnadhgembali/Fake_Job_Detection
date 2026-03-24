"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, ShieldCheck } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold font-space bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-800 tracking-tight">
                JobCheck AI
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {user ? (
              <>
                <Link 
                  href="/predict" 
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/predict') ? 'text-indigo-700' : 'text-slate-600'}`}
                >
                  Scan Job
                </Link>
                <Link 
                  href="/history" 
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/history') ? 'text-indigo-700' : 'text-slate-600'}`}
                >
                  My History
                </Link>
                {user.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className={`text-sm font-medium transition-colors hover:text-purple-600 ${isActive('/admin') ? 'text-purple-700' : 'text-slate-600'}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <User className="w-4 h-4" />
                    <span>{user.username}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-full transition-all hover:shadow-lg shadow-md hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
