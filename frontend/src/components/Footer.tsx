import React from "react";
import Link from "next/link";
import { Droplet, ShieldAlert } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Droplet className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              <span>Nagpur WaterWatch</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Real-Time and Predictive Waterlogging Monitoring and Intelligent Route Recommendation System for Nagpur.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-lg max-w-md">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong>Academic Disclaimer:</strong> Initial coverage focuses on selected vulnerable locations in Nagpur. Simulated sensor data and predictions are clearly demarcated for demonstration.
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Live Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-cyan-400 transition-colors">Waterlogging Hotspot Map</Link></li>
              <li><Link href="/route-planner" className="hover:text-cyan-400 transition-colors">Safe Route Planner</Link></li>
              <li><Link href="/predictions" className="hover:text-cyan-400 transition-colors">Waterlogging Risk Predictions</Link></li>
              <li><Link href="/report" className="hover:text-cyan-400 transition-colors">Submit Citizen Report</Link></li>
            </ul>
          </div>

          {/* Column 3: Team */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">Project Team</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>Harshita Agrawal (32)</li>
              <li>Reeti Khandelwal (20)</li>
              <li>Richa Chandak (37)</li>
              <li>Ananya Biyani (27)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              Guided by: <strong className="text-slate-300">Dr. Avinash Agrawal</strong>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© 2026–27 Nagpur WaterWatch. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span className="text-cyan-400 font-mono text-[11px]">Nagpur, MH, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
