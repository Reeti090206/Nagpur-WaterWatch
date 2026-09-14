"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { analyzeRoute } from "@/lib/api";
import {
  Navigation,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Info,
  Layers,
} from "lucide-react";

export default function RoutePlanner() {
  const [source, setSource] = useState("Katol Road, Nagpur");
  const [destination, setDestination] = useState("Pardi Naka, Nagpur");
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);

  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Coordinate mapping for demo presets
    const originCoords = { lat: 21.175, lng: 79.062 };
    const destCoords = { lat: 21.156, lng: 79.092 };

    const res = await analyzeRoute(originCoords, destCoords);
    setRouteResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-cyan-400" />
            <span>Intelligent Safe Route Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recommends safer travel routes by evaluating Google Maps routes against real-time waterlevel sensors and risk predictions
          </p>
        </div>

        {/* Mandatory Disclaimer Box */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white font-semibold">Google Maps Overlay Notice:</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Google Maps itself does not supply waterlogging information. Nagpur WaterWatch overlays its own verified IoT sensor telemetry, citizen reports, and AI risk predictions onto Google Maps routing results to calculate segment safety scores.
            </p>
          </div>
        </div>

        {/* Route Form & Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Enter Trip Details</span>
              </h3>

              <form onSubmit={handlePlanRoute} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Source Location
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Katol Road or Sitabuldi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Pardi Naka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{loading ? "Analyzing Route Risks..." : "Calculate Safe Routes"}</span>
                </button>
              </form>

              {/* Demo Quick Presets */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sample Nagpur Demo Routes:
                </div>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => {
                      setSource("Katol Road");
                      setDestination("Pardi Naka Underpass");
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    Katol Road → Pardi Naka (Severe Risk Test)
                  </button>

                  <button
                    onClick={() => {
                      setSource("Sitabuldi Metro Station");
                      setDestination("Ambazari Lake Road");
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    Sitabuldi → Ambazari (Moderate Risk Test)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!routeResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <Navigation className="w-10 h-10 text-slate-700 animate-bounce" />
                <div className="font-semibold text-slate-400">Ready to Analyze Route Risk</div>
                <p className="text-xs max-w-sm">
                  Click "Calculate Safe Routes" to evaluate travel options against sensor water levels and risk predictions.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Recommendation Banner */}
                <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 fill-emerald-500/20" />
                    <span>System Recommendation</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {routeResult.recommendation_reason}
                  </p>
                </div>

                {/* Route Option Cards Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {routeResult.routes.map((r: any, idx: number) => {
                    const isRecommended = idx === routeResult.recommended_route;

                    return (
                      <div
                        key={r.route_index}
                        className={`rounded-2xl p-5 border transition-all ${
                          isRecommended
                            ? "bg-slate-900 border-emerald-500/60 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white text-sm">{r.summary}</h4>
                          {isRecommended ? (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Recommended
                            </span>
                          ) : (
                            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> High Risk
                            </span>
                          )}
                        </div>

                        {/* Core Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                          <div>
                            <div className="text-[10px] text-slate-400">Distance</div>
                            <div className="text-sm font-bold text-white">{r.distance_km} km</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Est. Time</div>
                            <div className="text-sm font-bold text-white">{r.duration_min} min</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Risk Score</div>
                            <div
                              className={`text-sm font-bold ${
                                r.risk_score > 0.5 ? "text-rose-400" : "text-emerald-400"
                              }`}
                            >
                              {(r.risk_score * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>

                        {/* Affected Segments Breakdown */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Evaluated Waterlogging Segments ({r.affected_segments}):
                          </div>
                          {r.segments.length === 0 ? (
                            <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>No waterlogged road segments detected along this route.</span>
                            </div>
                          ) : (
                            r.segments.map((seg: any, i: number) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-slate-200">{seg.location_name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    Water depth: <strong className="text-cyan-400">{seg.water_level} cm</strong>
                                  </div>
                                </div>
                                <SeverityBadge severity={seg.severity} showIcon={false} />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
