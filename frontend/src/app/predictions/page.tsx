"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { fetchPredictions, fetchWeather } from "@/lib/api";
import {
  AlertTriangle,
  TrendingUp,
  CloudRain,
  Cpu,
  Info,
  Layers,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPredictions = async () => {
    setLoading(true);
    const [pData, wData] = await Promise.all([fetchPredictions(), fetchWeather()]);
    setPredictions(pData);
    setWeather(wData);
    setLoading(false);
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  // Trend Chart Sample Data
  const trendData = [
    { time: "08:00", rainfall: 5, risk: 15 },
    { time: "09:00", rainfall: 12, risk: 30 },
    { time: "10:00", rainfall: 25, risk: 55 },
    { time: "11:00", rainfall: 38, risk: 80 },
    { time: "12:00", rainfall: 32, risk: 75 },
    { time: "13:00 (Now)", rainfall: weather?.rainfall_mm || 32.5, risk: 78 },
    { time: "14:00 (Pred)", rainfall: 45, risk: 88 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Predictive Waterlogging Risk Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Rainfall-based risk estimation combining historical frequency, drainage capacity, and IoT sensors
            </p>
          </div>

          <button
            onClick={loadPredictions}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Re-run Prediction Engine</span>
          </button>
        </div>

        {/* Mandatory Transparency Box */}
        <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-white">Academic Integrity & Model Methodology Disclaimer:</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
              This module uses an explainable rule-based risk scoring algorithm (calibrated for Nagpur locations) as a baseline model because full historical ML training sets are unavailable. Risk scores represent relative probability based on rainfall intensity and drainage parameters — they are decision-support estimates and do not guarantee flooding.
            </p>
          </div>
        </div>

        {/* Top Grid: Recharts Trend Chart & Weather Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Nagpur Rainfall vs. Average Risk Score Trend</span>
                </h3>
                <p className="text-[11px] text-slate-400">Hourly progression & 1-hour forecast</p>
              </div>
              <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
                Model: rule-based-v1
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="risk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score %" />
                  <Area type="monotone" dataKey="rainfall" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRain)" name="Rainfall (mm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Model Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 justify-between flex">
                <span className="text-slate-400">Current Rainfall Intensity:</span>
                <strong className="text-cyan-400 uppercase font-mono">{weather?.intensity || "heavy"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 justify-between flex">
                <span className="text-slate-400">Accumulated 3h Rain:</span>
                <strong className="text-white">{((weather?.rainfall_mm || 32.5) * 2.8).toFixed(1)} mm</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 justify-between flex">
                <span className="text-slate-400">Primary Feature Weights:</span>
                <span className="text-slate-300 font-mono text-[11px]">Rainfall (35%), Freq (25%)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 justify-between flex">
                <span className="text-slate-400">Data Source Provenance:</span>
                <span className="text-amber-400 font-medium">SIMULATED / DEMO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Location Risk Forecasts & Contributing Factors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((p) => {
              const factors = p.contributing_factors ? JSON.parse(p.contributing_factors) : [];

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{p.location_name}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Forecast for: {new Date(p.prediction_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <SeverityBadge severity={p.risk_level} />
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Risk Score</div>
                      <div className="text-sm font-bold text-rose-400">{(p.risk_score * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Pred. Water Depth</div>
                      <div className="text-sm font-bold text-cyan-400">{p.predicted_water_level?.toFixed(1)} cm</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Model Ver.</div>
                      <div className="text-xs font-mono text-slate-300 mt-0.5">rule-v1</div>
                    </div>
                  </div>

                  {/* Explainable Factors */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Main Contributing Factors:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {factors.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
