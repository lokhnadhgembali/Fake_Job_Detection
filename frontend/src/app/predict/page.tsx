"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle, Search, HelpCircle, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PredictionResult {
  risk: string;
  label: string;
  confidence: number;
  real_prob: number;
  fake_prob: number;
  highlight_words: string[];
}

export default function Predict() {
  const { user } = useAuth();
  
  const [jobText, setJobText] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [requiredExperience, setRequiredExperience] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobText.trim()) {
      setError("Job description is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const metaValues = [];
      if (jobTitle) metaValues.push(`Job Title: ${jobTitle}`);
      if (department) metaValues.push(`Department: ${department}`);
      if (salaryRange) metaValues.push(`Salary Range: ${salaryRange}`);
      if (employmentType) metaValues.push(`Employment Type: ${employmentType}`);
      if (requiredExperience) metaValues.push(`Required Experience: ${requiredExperience}`);
      if (requiredEducation) metaValues.push(`Required Education: ${requiredEducation}`);

      const fullJobText = metaValues.length > 0
        ? metaValues.join("\n") + "\n\n" + jobText
        : jobText;

      const { data } = await api.post("/predict", {
        job_text: fullJobText,
        company,
        location,
        user_email: user?.email || "",
      });
      setResult(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during scanning");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-500 border-red-500 bg-red-500/10";
      case "medium": return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 border-green-500 bg-green-500/10";
      default: return "text-slate-500 border-slate-500 bg-slate-500/10";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high": return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "medium": return <HelpCircle className="w-6 h-6 text-yellow-500" />;
      case "low": return <CheckCircle className="w-6 h-6 text-green-500" />;
      default: return <ShieldCheck className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">Scan Job Description</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Paste the contents of any job posting below. Our ML engine will analyze semantic patterns to detect highly probable scams or phishing attempts.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Form */}
          <AnimatedSection direction="left" className="lg:col-span-7">
            <div className="glass-card p-6 md:p-8 bg-white/50 border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 text-red-400 bg-red-400/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Remote, NY"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Salary Range</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. $80k - $120k"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Required Experience</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Mid-Senior Level"
                      value={requiredExperience}
                      onChange={(e) => setRequiredExperience(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Required Education</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                      placeholder="e.g. Bachelor's Degree"
                      value={requiredEducation}
                      onChange={(e) => setRequiredEducation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={12}
                    required
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                    placeholder="Paste the full job description here..."
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                  />
                  <div className="mt-2 text-right text-xs text-slate-500">
                    {jobText.length} characters
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500 hidden sm:inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    Analyzed securely locally
                  </span>
                  
                  <button
                    type="submit"
                    disabled={loading || !jobText.trim()}
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-8 py-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
                    ) : (
                      <><Search className="w-5 h-5 mr-2" /> Start Scan</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedSection>

          {/* Results Display */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white/50 border-slate-200"
                  >
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                      <Brain className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">Analyzing Semantics...</h3>
                    <p className="text-slate-600 text-sm">Evaluating risk factors and trust markers against our models.</p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="glass-card shadow-2xl relative overflow-hidden bg-white/80 border-slate-200"
                  >
                    {/* Subtle background glow based on result */}
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-30 ${result.risk === 'high' ? 'bg-red-400' : result.risk === 'low' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900">Analysis Output</h2>
                        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${getRiskColor(result.risk)}`}>
                          {getRiskIcon(result.risk)}
                          {result.risk} RISK
                        </div>
                      </div>
  
                      <div className="flex justify-center mb-10 pt-4">
                        <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-white shadow-inner">
                          {/* Fake circular progress */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="88" cy="88" r="88"
                              className="stroke-current text-slate-100 fill-none" strokeWidth="8"
                              transform="translate(8,8)"
                            />
                          <motion.circle
                            initial={{ strokeDashoffset: 553 }}
                            animate={{ strokeDashoffset: 553 - (553 * result.confidence) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeDasharray="553"
                            cx="88" cy="88" r="88"
                            className={`stroke-current fill-none ${result.label === 'FAKE' ? 'text-red-500' : 'text-green-500'}`} 
                            strokeWidth="8"
                            strokeLinecap="round"
                            transform="translate(8,8)"
                          />
                        </svg>
                        <div className="text-center z-10">
                            <div className={`flex items-baseline justify-center font-extrabold ${result.label === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                              <span className="text-5xl">{Math.round(result.confidence)}</span>
                              <span className="text-2xl ml-1">%</span>
                            </div>
                            <div className="text-sm text-slate-500 mt-1 uppercase tracking-wide font-medium">
                              {result.label}
                            </div>
                          </div>
                        </div>
                      </div>
  
                      <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Authenticity Score</span>
                          <span className="font-mono font-bold text-green-600">{result.real_prob}%</span>
                        </div>
                        
                        <div className="h-px bg-slate-200 w-full" />
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Suspicious Score</span>
                          <span className="font-mono font-bold text-red-600">{result.fake_prob}%</span>
                        </div>
  
                        {result.highlight_words?.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              Detected High-Risk Triggers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.highlight_words.map((word: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-mono">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white/50 border-slate-200"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-400">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">Awaiting Input</h3>
                    <p className="text-slate-500 text-sm max-w-xs">Submit a job description on the left to view the AI analysis dashboard here.</p>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
