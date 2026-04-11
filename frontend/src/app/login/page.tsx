"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { ShieldCheck, Loader2, Mail, Lock, AlertTriangle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/* ── Animated network dots canvas ── */
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DOTS = 55;
    const dots = Array.from({ length: DOTS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1.5 + Math.random() * 2,
      // randomly mark some as "suspicious"
      fake: Math.random() < 0.25,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,220,150,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      // dots
      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.fake ? "rgba(255,90,90,0.7)" : "rgba(99,220,150,0.7)";
        ctx.fill();
        // move
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  // Handle search params safely for OAuth errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error");
      if (oauthError) setError(decodeURIComponent(oauthError));
    }
  }, []);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/login", { email, password });
      if (isAdminMode && data.role !== "admin") {
        setError("This account does not have admin privileges.");
        setLoading(false);
        return;
      }
      login(data.token, { email: data.email, role: data.role, username: data.username });
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex">

      {/* ── LEFT: dark themed panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-[#050d1a] flex-col items-center justify-center overflow-hidden select-none">
        <Link 
          href="/" 
          className="absolute top-8 left-8 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <NetworkCanvas />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 px-12 max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">JobCheck <span className="text-emerald-400">AI</span></span>
          </div>

          {/* Fake job stats visual */}
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              { label: "Fake Jobs Detected", val: "14,820+", color: "text-red-400" },
              { label: "Users Protected", val: "98,000+", color: "text-emerald-400" },
              { label: "Accuracy Rate", val: "94.2%", color: "text-cyan-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-white leading-snug mb-4">
            Stay Safe from<br />
            <span className="text-emerald-400">Fraudulent Job Postings</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our AI scans thousands of signals to protect job seekers from scams.
            <span className="text-emerald-400"> Red nodes = suspicious.</span>
          </p>

          {/* Scan label */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live threat detection active
          </div>
        </div>
      </div>

      {/* ── RIGHT: form panel ── */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo and back button */}
          <div className="flex lg:hidden items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">JobCheck <span className="text-emerald-500">AI</span></span>
            </div>
            
            <Link 
              href="/" 
              className="p-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-1">
            {isAdminMode ? "Admin Access" : "Welcome back!"}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {isAdminMode ? "Sign in to access the admin dashboard." : "Login to your account and protect your career."}
          </p>

          {/* Mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-7 gap-1">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isAdminMode ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Candidate Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isAdminMode ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Admin Login
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email" required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"} required
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me / Forgot password */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </button>
          </form>

          {/* ── OR divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── Google button (full width) ── */}
          <button
            type="button"
            onClick={() => { window.location.href = 'http://localhost:8000/auth/google'; }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group mb-3"
          >
            {/* Google SVG logo */}
            <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          {/* ── LinkedIn + GitHub (side by side) ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => { window.location.href = 'http://localhost:8000/auth/linkedin'; }}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-[#0A66C2]/5 hover:border-[#0A66C2]/30 hover:shadow-md transition-all duration-200"
            >
              {/* LinkedIn SVG logo */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#0A66C2" className="shrink-0">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => { window.location.href = 'http://localhost:8000/auth/github'; }}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-900/5 hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              {/* GitHub SVG logo */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#111827" className="shrink-0">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
