"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import { ShieldCheck, Brain, Zap, ArrowRight, Activity, SearchCheck, ShieldAlert, FileText, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AbstractAI } from "@/components/AbstractAI";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="relative">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-24 pb-12 mt-10">
        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedSection direction="up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 text-blue-700 text-sm font-medium mb-8 shadow-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Next-Gen Machine Learning Engine Active</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold font-space tracking-tight mb-6 text-slate-900 leading-tight">
                Detect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Fake</span> Jobs, 
                <br />Protect Your Career.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-sans">
                JobCheck AI analyzes job descriptions using advanced NLP to instantly identify scams, multi-level marketing traps, and phishing attempts before you apply.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link 
                    href="/predict" 
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_30px_rgba(79,70,229,0.3)] rounded-full hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] hover:scale-105 overflow-hidden"
                  >
                    <span className="mr-2">Scan a Job Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signup" 
                      className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_30px_rgba(79,70,229,0.3)] rounded-full hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] hover:scale-105 overflow-hidden"
                    >
                      <span className="mr-2">Create Free Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      href="/login" 
                      className="px-8 py-4 font-medium text-slate-700 transition-all duration-300 bg-white/70 backdrop-blur-lg rounded-full hover:bg-white hover:text-blue-700 border border-slate-200 hover:shadow-lg shadow-sm"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center pt-8">
            
            {/* Left Floating Cards */}
            <div className="space-y-6 flex flex-col items-end hidden lg:flex">
              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-right"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">AI Scam Detection</h3>
                    <p className="text-sm text-slate-500 font-sans">99.8% precision rate</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-right mr-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">NLP Analysis</h3>
                    <p className="text-sm text-slate-500 font-sans">Semantic pattern matching</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-right"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">Authenticity Verify</h3>
                    <p className="text-sm text-slate-500 font-sans">Cross-checks employer data</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Center Abstract AI visual */}
            <div className="flex justify-center h-[500px]">
              <AnimatedSection className="w-full h-full">
                <AbstractAI />
              </AnimatedSection>
            </div>

            {/* Right Floating Cards */}
            <div className="space-y-6 flex flex-col items-start hidden lg:flex">
                <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">Fraud Risk Score</h3>
                    <p className="text-sm text-slate-500 font-sans">100-point safety index</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-left ml-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">Real-time Analysis</h3>
                    <p className="text-sm text-slate-500 font-sans">Instant screening results</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group hover:scale-105 transition-transform origin-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-space">Career Protection AI</h3>
                    <p className="text-sm text-slate-500 font-sans">Stop exposing personal info</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-space mb-4 text-slate-900">Enterprise-Grade Detection</h2>
            <p className="text-slate-600 font-sans">Powered by millions of real and fake job postings data points.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection direction="up" delay={0.1}>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 rounded-2xl h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-space mb-3 text-slate-900">AI/NLP Engine</h3>
                <p className="text-slate-600 leading-relaxed font-sans">
                  Our custom scikit-learn pipeline analyzes semantic patterns, urgent language, and missing corporate details instantly.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2}>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 rounded-2xl h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-lg">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-space mb-3 text-slate-900">Real-time Analysis</h3>
                <p className="text-slate-600 leading-relaxed font-sans">
                  Get a comprehensive trust score within milliseconds, featuring highlighted suspicious keywords and phrases.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3}>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 rounded-2xl h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-space mb-3 text-slate-900">Personal History</h3>
                <p className="text-slate-600 leading-relaxed font-sans">
                  Keep a running log of all jobs you&apos;ve scanned to identify trends and compare suspect listings automatically.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How it works UI mock section */}
      <section className="py-24 relative z-10 border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <AnimatedSection direction="left">
                <h2 className="text-3xl md:text-5xl font-bold font-space mb-6 text-slate-900 leading-tight">Transparent Scoring. <br/>Immediate Results.</h2>
                <p className="text-lg text-slate-600 mb-8 font-sans">
                  Stop guessing if an opportunity is real. Our proprietary scanning tool breaks down exactly why an application might be fraudulent.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: SearchCheck, title: "1. Paste Description", desc: "Copy the job posting from LinkedIn, Indeed, or email.", color: "blue" },
                    { icon: Brain, title: "2. NLP Processor Extracts Features", desc: "Removes stop-words and vectorizes the text via TF-IDF.", color: "purple" },
                    { icon: ShieldAlert, title: "3. Evaluate Risk Factors", desc: "Flags known scam markers like 'WhatsApp interview' or 'Upfront fee'.", color: "pink" }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${step.color}-50 flex items-center justify-center text-${step.color}-600 group-hover:scale-110 group-hover:bg-${step.color}-100 transition-all`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold font-space">{step.title}</h4>
                        <p className="text-slate-600 text-sm mt-1 font-sans">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Dashboard Mockup Animation */}
            <AnimatedSection direction="right" className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/30 to-purple-300/30 blur-3xl opacity-50 rounded-[40px]" />
              <div className="relative bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto w-1/2 h-5 bg-slate-100 rounded-full" />
                </div>
                
                <div className="p-6">
                  {/* Gauge mock */}
                  <div className="flex justify-center mb-8">
                    <div className="relative w-48 h-48 rounded-full border-8 border-red-100 flex items-center justify-center">
                      <motion.div 
                        initial={{ rotate: -130 }}
                        whileInView={{ rotate: 45 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        viewport={{ once: true }}
                        className="absolute inset-2 border-8 border-transparent border-t-red-500 border-r-red-500 rounded-full"
                      />
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600">85%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">High Risk</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Words mock */}
                  <div className="space-y-4">
                    <div className="h-4 w-1/3 bg-slate-100 rounded" />
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-mono">urgenthiring</span>
                      <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-mono">registration fee</span>
                      <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-mono">whatsapp</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <AnimatedSection direction="up">
            <h2 className="text-4xl md:text-5xl font-bold font-space mb-6 text-slate-900 leading-tight">Ready to scan your first job?</h2>
            <p className="text-slate-600 mb-10 text-lg font-sans">
              Join thousands of job seekers testing their offers instantly. Create a free account to track your history and protect your career.
            </p>
            {user ? (
              <Link 
                href="/predict" 
                className="inline-flex items-center justify-center px-10 py-5 font-bold text-lg text-white transition-all bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:scale-105 shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_50px_rgba(147,51,234,0.4)]"
              >
                Scan a Job Now
              </Link>
            ) : (
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-10 py-5 font-bold text-lg text-white transition-all bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:scale-105 shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_50px_rgba(147,51,234,0.4)]"
              >
                Get Started for Free
              </Link>
            )}
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
