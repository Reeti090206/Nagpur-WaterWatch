import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Droplet,
  Map,
  Navigation,
  AlertTriangle,
  Radio,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Cpu,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 min-h-[680px] flex items-center">
        {/* Background Image - Full Visibility */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Very Light Gradient to fade smoothly at top & bottom edge only */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
        <div className="absolute inset-0 bg-black/25" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto space-y-6 bg-slate-950/70 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl shadow-black/80">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Droplet className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Real-Time Waterlogging Monitoring & Smart Navigation</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Nagpur WaterWatch
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-cyan-400 tracking-wide">
              Predict. Detect. Navigate.
            </p>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              A real-time IoT and predictive waterlogging monitoring system combined with intelligent route recommendation to ensure safer citizen travel across vulnerable roads in Nagpur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Map className="w-4 h-4" />
                <span>Live Dashboard & Map</span>
              </Link>

              <Link
                href="/route-planner"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Safe Route Planner</span>
              </Link>

              <Link
                href="/report"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Waterlogging</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">The Urban Challenge</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Understanding Waterlogging in Nagpur
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                During monsoon periods, recurring heavy rainfall repeatedly affects low-lying underpasses, flat road segments, and regions near overflowing nullahs in Nagpur (such as Ambazari Lake Road, Pardi Naka Underpass, and Pratap Nagar Square).
              </p>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Standard navigation apps provide general traffic data but lack localized, real-time water accumulation metrics. Drivers often enter flooded underpasses unknowingly, leading to vehicle submergence, heavy traffic gridlocks, and prolonged travel delays.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-2xl font-bold text-rose-400 mb-1">15+</div>
                  <div className="text-xs text-slate-400">Monitored Vulnerable Hotspots</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">Real-Time</div>
                  <div className="text-xs text-slate-400">IoT Sensor Telemetry</div>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <h3 className="font-semibold text-white text-base mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Multi-Source System Architecture</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white">1. IoT Water Sensors:</strong> ESP32/Arduino ultrasonic sensor API measuring live water depth in centimeters.
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <strong className="text-white">2. Weather Integration:</strong> IMD / OpenWeather rainfall observations and intensity tracking.
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <Users className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white">3. GPS Citizen Feedback:</strong> Verified citizen reports with geotags and timestamps.
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <Navigation className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <strong className="text-white">4. Safe Routing Overlay:</strong> Google Maps route segment risk evaluation & alternative recommendations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white">System Capabilities</h2>
            <p className="text-slate-400 text-sm mt-2">
              Combining real-time IoT data, historical patterns, and predictive risk scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Waterlogging Map</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Color-coded GIS severity visualization (Green, Yellow, Orange, Red) showing active sensor locations, road segments, and verified citizen reports across Nagpur.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Safer Route Recommendation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Evaluates source-to-destination routes against current and predicted flooding points. Recommends safer alternative routes that bypass high-risk road segments.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Authority Hotspot Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowers municipal authorities to verify citizen reports, track clearance times, rank recurring hotspots, and identify root causes such as blocked drains or low elevation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-12 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Experience the Demo Application</h2>
          <p className="text-slate-300 text-xs max-w-xl mx-auto">
            Explore live monitoring, test the safe route planner, or simulate rainfall scenarios.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-transform hover:scale-105"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
