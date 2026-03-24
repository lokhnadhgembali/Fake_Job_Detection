"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ShieldAlert, BrainCircuit, Activity, ShieldCheck } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

interface AdminStats {
  total: number;
  fake: number;
  real: number;
  accuracy: number;
}

interface DailyStat {
  date: string;
  requests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dailyRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/daily-stats")
        ]);
        setStats(statsRes.data);
        setDailyData(dailyRes.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metricCards = stats ? [
    { title: "Total Scans", value: stats.total, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Fake Detected", value: stats.fake, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Authentic Jobs", value: stats.real, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "ML Accuracy", value: `${stats.accuracy}%`, icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-500/10" }
  ] : [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin System Dashboard</h1>
              <p className="text-slate-600 mt-1">Platform metrics and machine learning statistics</p>
            </div>
            
            <div className="flex items-center gap-3">

              <a 
                href="http://localhost:8000/admin/export-pdf" 
                target="_blank"
                className="px-4 py-2 text-sm font-medium border border-transparent rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-500/20"
               >
                 Download PDF Report
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse h-[140px] flex flex-col justify-center bg-white">
                <div className="h-10 w-10 bg-slate-100 rounded-full mb-4" />
                <div className="h-6 w-24 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-16 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card, i) => (
              <AnimatedSection key={card.title} direction="up" delay={i * 0.1}>
                <div className="glass-card relative overflow-hidden group bg-white border-slate-200">
                  <div className={`absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10 ${card.color}`}>
                    <card.icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
                  </div>
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold mb-1 text-slate-900">{card.value}</h3>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {/* Charts Section */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedSection direction="up" delay={0.4} className="lg:col-span-2">
              <div className="glass-card h-[400px] flex flex-col bg-white border-slate-200">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Prediction Requests (7 Days)
                </h3>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        itemStyle={{ color: '#0f172a' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRequests)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.5} className="lg:col-span-1">
              <div className="glass-card h-[400px] flex flex-col bg-white border-slate-200">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  Detection Distribution
                </h3>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Fake', value: stats?.fake || 0, fill: '#ef4444' },
                      { name: 'Real', value: stats?.real || 0, fill: '#10b981' }
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]} 
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}

      </div>
    </div>
  );
}
