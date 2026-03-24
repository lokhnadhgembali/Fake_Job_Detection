"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Clock, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistoryRecord {
  post_id: number;
  label: string;
  confidence_score: number;
  submission_time: string;
  job_text: string;
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user?.email) {
          const { data } = await api.get(`/history?user_email=${user.email}`);
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const getRiskIcon = (label: string) => {
    return label === "FAKE" ? 
      <AlertTriangle className="w-5 h-5 text-red-500" /> : 
      <ShieldCheck className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        
        <AnimatedSection className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-slate-900">
              <Clock className="w-8 h-8 text-indigo-500" />
              Scan History
            </h1>
            <p className="text-slate-600">Review your past job description analyses</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium">
            {history.length} Records
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          {loading ? (
            // Skeleton loaders
            [...Array(5)].map((_, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="glass-card p-6 animate-pulse flex items-center justify-between bg-white/50">
                  <div className="space-y-3 w-2/3">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-100" />
                </div>
              </AnimatedSection>
            ))
          ) : history.length === 0 ? (
            <AnimatedSection>
              <div className="glass-card p-12 text-center border-dashed border-2 border-slate-200 bg-white/50">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900">No history found</h3>
                <p className="text-slate-600 max-w-sm mx-auto">You haven&apos;t scanned any job descriptions yet. Head over to the scanner to get started.</p>
              </div>
            </AnimatedSection>
          ) : (
            history.map((record, i) => (
              <AnimatedSection key={record.post_id} delay={i * 0.05} direction="up">
                <div className="glass-card p-6 hover:bg-white/80 transition-colors group bg-white/50 border border-slate-200">
                  <div className="flex justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getRiskIcon(record.label)}
                        <span className={`text-sm font-bold tracking-wider ${record.label === 'FAKE' ? 'text-red-500' : 'text-green-600'}`}>
                          {record.label} ({record.confidence_score}%)
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          • {formatDistanceToNow(new Date(record.submission_time))} ago
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-mono line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 group-hover:border-slate-300 transition-colors">
                        {record.job_text}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
