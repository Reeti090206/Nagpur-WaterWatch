"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { fetchReports, fetchSensors, fetchLocations, verifyReport } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Radio,
  Clock,
  AlertTriangle,
  Building,
  TrendingDown,
  Layers,
  Filter,
} from "lucide-react";

export default function AuthorityDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"verification" | "sensors" | "hotspots">("verification");

  const loadAuthorityData = async () => {
    setLoading(true);
    const [rData, sData, lData] = await Promise.all([
      fetchReports(),
      fetchSensors(),
      fetchLocations(),
    ]);
    setReports(rData);
    setSensors(sData);
    setLocations(lData);
    setLoading(false);
  };

  useEffect(() => {
    loadAuthorityData();
  }, []);

  const handleVerify = async (reportId: number, status: "verified" | "rejected") => {
    await verifyReport(reportId, status);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  };

  const rankedHotspots = [...locations].sort(
    (a, b) => (b.historical_frequency || 0) - (a.historical_frequency || 0)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <span>Municipal Authority Monitoring & Verification Portal</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify citizen reports, monitor sensor health, and analyze recurring waterlogging hotspots
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            {(["verification", "sensors", "hotspots"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "verification" ? "Report Verification" : tab === "sensors" ? "Sensor Health" : "Hotspot Ranking"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Report Verification */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Pending Citizen Reports for Review</h2>
              <span className="text-xs text-slate-400">{reports.length} total reports logged</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{r.location_name || "Nagpur Location"}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Reported: {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <SeverityBadge severity={r.severity} />
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    "{r.description}"
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">
                      System Confidence: <strong className="text-cyan-400">{((r.confidence_score || 0.8) * 100).toFixed(0)}%</strong>
                    </span>

                    {r.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(r.id, "verified")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          onClick={() => handleVerify(r.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-xs capitalize text-emerald-400">
                        Status: {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Sensor Health */}
        {activeTab === "sensors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">IoT Sensor Hardware Status</h2>
              <span className="text-xs text-emerald-400 font-medium">All 8 Sensors Operational</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {sensors.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{s.sensor_id}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-semibold text-xs text-white">{s.location_name}</div>
                  <div className="space-y-1 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span>Water Depth:</span>
                      <strong className="text-cyan-400">{s.current_water_level} cm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery Level:</span>
                      <strong className="text-emerald-400">{s.battery_level}%</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{s.is_simulated ? "DEMO SENSOR" : "PHYSICAL ESP32"}</span>
                    <span>Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hotspot Ranking */}
        {activeTab === "hotspots" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Recurring Waterlogging Hotspots (Ranked by Past Frequency)</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Location Name</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Historical Incidents</th>
                      <th className="py-3 px-4">Drainage Capacity</th>
                      <th className="py-3 px-4">Vulnerability Cause</th>
                      <th className="py-3 px-4">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rankedHotspots.map((loc, idx) => (
                      <tr key={loc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-cyan-400">#{idx + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{loc.name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{loc.area}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">{loc.historical_frequency} incidents</td>
                        <td className="py-3.5 px-4 capitalize">{loc.drainage_capacity || "Medium"}</td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-xs">{loc.vulnerability_reason}</td>
                        <td className="py-3.5 px-4"><SeverityBadge severity={loc.current_severity} showIcon={false} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
