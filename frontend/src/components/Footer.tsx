"use client";

import { Ghost, ShieldCheck, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 glass mt-32 relative z-10 bg-white/50">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
                JobCheck AI
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              Advanced machine learning platform designed to protect job seekers from employment scams, phishing attempts, and fraudulent postings.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold mb-4 text-sm tracking-wider uppercase">Product</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/predict" className="hover:text-indigo-600 transition-colors">Scan a Job</Link></li>
              <li><Link href="/history" className="hover:text-indigo-600 transition-colors">My History</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <a href="mailto:support@jobcheck-ai.com" className="hover:text-indigo-600 transition-colors">support@jobcheck-ai.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobCheck AI. All rights reserved.</p>
          <div className="flex items-center gap-1 mt-4 md:mt-0">
            Powered by <Ghost className="w-3 h-3 mx-1" /> Next.js & FastAPI
          </div>
        </div>
      </div>
    </footer>
  );
}
