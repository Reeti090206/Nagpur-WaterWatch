"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Settings, Users, Radio, MapPin, ShieldAlert, Cpu, Database, Save, Check } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"users" | "sensors" | "locations" | "config">("users");
  const [saved, setSaved] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, username: "citizen", email: "citizen@waterwatch.demo", role: "citizen", status: "active" },
    { id: 2, username: "authority", email: "authority@waterwatch.demo", role: "authority", status: "active" },
    { id: 3, username: "admin", email: "admin@waterwatch.demo", role: "admin", status: "active" },
  ]);

  const [config, setConfig] = useState({
    cautionThresholdCm: 5,
    moderateThresholdCm: 15,
    severeThresholdCm: 30,
    rainfallWeight: 0.35,
    frequencyWeight: 0.25,
    sensorApiKey: "demo-sensor-key-2026",
    autoRefreshSec: 30,
  });

  const handleSaveConfig = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <span>System Administrator Panel</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage user roles, sensor inventory, severity thresholds, and system prediction configs
            </p>
          </div>

          <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            {(["users", "sensors", "locations", "config"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>User Accounts & Role Assignments</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3.5 px-4 font-mono text-slate-400">#{u.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{u.username}</td>
                      <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            setUsers((prev) =>
                              prev.map((x) => (x.id === u.id ? { ...x, role: e.target.value } : x))
                            )
                          }
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-400 font-semibold focus:outline-none"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Severity & Prediction Configuration */}
        {activeTab === "config" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Severity Thresholds & Risk Engine Configuration</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Caution Level (Yellow)</label>
                  <input
                    type="number"
                    value={config.cautionThresholdCm}
                    onChange={(e) => setConfig({ ...config, cautionThresholdCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5">Water depth &gt;= 5 cm</span>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Moderate Level (Orange)</label>
                  <input
                    type="number"
                    value={config.moderateThresholdCm}
                    onChange={(e) => setConfig({ ...config, moderateThresholdCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5">Water depth &gt;= 15 cm</span>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Severe Level (Red)</label>
                  <input
                    type="number"
                    value={config.severeThresholdCm}
                    onChange={(e) => setConfig({ ...config, severeThresholdCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5">Water depth &gt;= 30 cm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">IoT Sensor API Secret Key</label>
                <input
                  type="text"
                  value={config.sensorApiKey}
                  onChange={(e) => setConfig({ ...config, sensorApiKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
                >
                  {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? "Configuration Saved!" : "Save Configuration"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "sensors" || activeTab === "locations") && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Admin Inventory Controls for {activeTab}. Use backend seed API or FastAPI /docs for bulk edits.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
