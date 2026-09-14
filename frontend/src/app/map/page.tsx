"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InteractiveMap } from "@/components/InteractiveMap";
import { SeverityBadge } from "@/components/SeverityBadge";
import { fetchLocations, fetchReports } from "@/lib/api";
import {
  Map as MapIcon,
  Filter,
  PanelRightOpen,
  PanelRightClose,
  Info,
  Droplet,
  ChevronRight,
} from "lucide-react";

export default function MapPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedLoc, setSelectedLoc] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const locs = await fetchLocations();
      const reps = await fetchReports();
      setLocations(locs);
      setReports(reps);
    }
    load();
  }, []);

  const filteredLocations =
    filterSeverity === "all"
      ? locations
      : locations.filter((l) => l.current_severity === filterSeverity);

  const severeCounts = {
    severe: locations.filter((l) => l.current_severity === "severe").length,
    moderate: locations.filter((l) => l.current_severity === "moderate").length,
    low: locations.filter((l) => l.current_severity === "low").length,
    normal: locations.filter((l) => l.current_severity === "normal").length,
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      <Navbar />

      {/* Full-width map area with overlaid controls */}
      <main className="flex-1 relative overflow-hidden">
        {/* ─── Floating Header Bar ─── */}
        <div className="absolute top-4 left-4 right-4 z-[450] flex items-start justify-between pointer-events-none">
          {/* Title + Severity Filters */}
          <div className="pointer-events-auto flex flex-col gap-3">
            {/* Title Pill */}
            <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-slate-800 shadow-2xl">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-cyan-400" />
                <span>Nagpur Waterlogging Hotspot Map</span>
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time sensor data &amp; citizen reports
              </p>
            </div>

            {/* Severity Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl p-1 rounded-xl border border-slate-800 shadow-xl text-[11px]">
              <Filter className="w-3 h-3 text-slate-500 ml-1.5 mr-0.5" />
              {(
                [
                  { key: "all", label: "All", color: "cyan" },
                  { key: "severe", label: "Severe", color: "rose" },
                  { key: "moderate", label: "Moderate", color: "amber" },
                  { key: "low", label: "Low", color: "yellow" },
                  { key: "normal", label: "Normal", color: "emerald" },
                ] as const
              ).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setFilterSeverity(key)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    filterSeverity === key
                      ? "bg-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  {key !== "all" && (
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        color === "rose"
                          ? "bg-rose-500"
                          : color === "amber"
                          ? "bg-amber-500"
                          : color === "yellow"
                          ? "bg-yellow-500"
                          : color === "emerald"
                          ? "bg-emerald-500"
                          : "bg-cyan-500"
                      }`}
                    />
                  )}
                  <span>
                    {label}
                    {key !== "all" && (
                      <span className="ml-0.5 opacity-60">
                        ({severeCounts[key as keyof typeof severeCounts]})
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel Toggle Button (visible when panel is closed) */}
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl px-3 py-2.5 rounded-xl border border-slate-800 shadow-2xl hover:bg-slate-800 transition-all group flex items-center gap-2"
            >
              <PanelRightOpen className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white hidden sm:inline">
                Locations
              </span>
              <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-cyan-500/30">
                {filteredLocations.length}
              </span>
            </button>
          )}
        </div>

        {/* ─── Full-Width Map ─── */}
        <div className="w-full h-[calc(100vh-64px)]">
          <InteractiveMap
            locations={filteredLocations}
            reports={reports}
            selectedLocationId={selectedLoc?.id}
            onSelectLocation={(loc) => setSelectedLoc(loc)}
            height="h-full"
            showLayerToggle={false}
          />
        </div>

        {/* ─── Collapsible Side Panel ─── */}
        <div
          className={`absolute top-0 right-0 h-full z-[500] transition-transform duration-300 ease-in-out ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "340px" }}
        >
          {/* Panel Content */}
          <div className="h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  Monitored Locations
                </h3>
                <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                  {filteredLocations.length}
                </span>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Collapse panel"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Location Cards */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLoc(loc);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedLoc?.id === loc.id
                      ? "bg-slate-800/80 border-cyan-500/60 shadow-lg shadow-cyan-500/5"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  {/* Location Name & Area */}
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-cyan-100 transition-colors">
                        {loc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {loc.area}, Nagpur
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 mt-0.5 transition-all ${
                        selectedLoc?.id === loc.id
                          ? "text-cyan-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </div>

                  {/* Severity + Water Level */}
                  <div className="flex items-center justify-between">
                    <SeverityBadge
                      severity={loc.current_severity}
                      showIcon={false}
                    />
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {loc.current_water_level} cm
                    </span>
                  </div>

                  {/* Drainage info (shown when selected) */}
                  {selectedLoc?.id === loc.id && loc.drainage_capacity && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>
                        Drainage:{" "}
                        <span className="capitalize text-slate-300">
                          {loc.drainage_capacity}
                        </span>
                      </span>
                      {loc.historical_frequency !== undefined && (
                        <span>
                          History:{" "}
                          <span className="text-amber-400 font-semibold">
                            {loc.historical_frequency}x
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Panel Footer */}
            <div className="px-4 py-2.5 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1.5 shrink-0">
              <Info className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Click a card to focus on the map marker</span>
            </div>
          </div>
        </div>

        {/* ─── Collapsed Panel Tab (edge handle when closed) ─── */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-[500] bg-slate-900/90 backdrop-blur-xl border border-r-0 border-slate-700 rounded-l-xl px-1.5 py-6 hover:bg-slate-800 hover:border-cyan-500/40 transition-all group shadow-xl"
            title="Open locations panel"
          >
            <div className="flex flex-col items-center gap-1">
              <PanelRightOpen className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
              <span
                className="text-[9px] font-bold text-slate-400 group-hover:text-slate-200 tracking-widest uppercase"
                style={{ writingMode: "vertical-lr" }}
              >
                Locations
              </span>
            </div>
          </button>
        )}
      </main>
    </div>
  );
}
