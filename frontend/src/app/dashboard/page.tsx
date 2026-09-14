"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WeatherCard } from "@/components/WeatherCard";
import { InteractiveMap } from "@/components/InteractiveMap";
import { SeverityBadge } from "@/components/SeverityBadge";
import { fetchLocations, fetchStats, fetchWeather, fetchReports } from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  RefreshCw,
  TrendingUp,
  Building,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const [sData, lData, wData, rData] = await Promise.all([
      fetchStats(),
      fetchLocations(),
      fetchWeather(),
      fetchReports(),
    ]);
    setStats(sData);
    setLocations(lData);
    setWeather(wData);
    setReports(rData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const severeLocations = locations.filter(
    (l) => l.current_severity === "severe" || l.current_severity === "moderate"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              <span>Live Monitoring Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time IoT sensor telemetry and spatial waterlogging detection across Nagpur
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <div className="text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Aggregate Severity KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Monitored Locations</div>
            <div className="text-2xl font-bold text-white">{stats?.total_locations || locations.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Active urban sensors</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Active IoT Sensors</div>
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 animate-pulse inline" />
              {stats?.active_sensors || locations.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">ESP32 telemetry online</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Severe Risk (Red)</div>
            <div className="text-2xl font-bold text-rose-400">{stats?.severe_locations || 1}</div>
            <div className="text-[10px] text-rose-400/80 mt-1">Road unsafe / avoid</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Moderate (Orange)</div>
            <div className="text-2xl font-bold text-amber-400">{stats?.moderate_locations || 3}</div>
            <div className="text-[10px] text-amber-400/80 mt-1">Caution advised</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Low Caution (Yellow)</div>
            <div className="text-2xl font-bold text-yellow-400">{stats?.low_locations || 3}</div>
            <div className="text-[10px] text-slate-500 mt-1">Minor water build-up</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Normal (Green)</div>
            <div className="text-2xl font-bold text-emerald-400">{stats?.normal_locations || 1}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Road clear</div>
          </div>
        </div>

        {/* Main Grid: Weather Card & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Weather & High-Risk Alert List */}
          <div className="space-y-6">
            {/* Weather Card */}
            {weather && <WeatherCard weather={weather} />}

            {/* Severe / Moderate Hotspots Warning Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>High Waterlogging Areas</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {severeLocations.length} active
                </span>
              </div>

              <div className="space-y-3">
                {severeLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">{loc.name}</span>
                      <SeverityBadge severity={loc.current_severity} showIcon={false} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Water Depth: <strong className="text-cyan-400">{loc.current_water_level} cm</strong></span>
                      <span>Drainage: <span className="capitalize">{loc.drainage_capacity}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <Link
                  href="/map"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  <span>View Full GIS Hotspot Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (2 Spans): GIS Interactive Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Nagpur Spatial GIS Monitoring Map</span>
              </h2>
              <span className="text-xs text-slate-400">Click markers for details</span>
            </div>

            <InteractiveMap
              locations={locations}
              reports={reports}
              selectedLocationId={selectedLoc?.id}
              height="h-[580px]"
            />
          </div>
        </div>

        {/* Recent Alerts & Verified Citizen Reports Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recent Citizen Road Reports & Verification Status</span>
            </h3>
            <Link
              href="/report"
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 font-medium transition-colors"
            >
              + Submit Report
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">{r.location_name || "Nagpur Location"}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.description}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      r.status === "verified"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  <span>Confidence Score: <strong className="text-slate-300">{((r.confidence_score || 0.8) * 100).toFixed(0)}%</strong></span>
                  <span>Reported: {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
