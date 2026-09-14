"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplet,
  Map,
  Navigation,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Menu,
  X,
  Radio,
  FileText,
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  // isCollapsed: true = contracted (slim icon rail, 72px), false = opened (full panel, 270px)
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<"citizen" | "authority" | "admin">("citizen");

  useEffect(() => {
    const saved = localStorage.getItem("nww_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("nww_sidebar_collapsed", String(next));
      return next;
    });
  };

  const navItems = [
    { href: "/", label: "Home", icon: Droplet },
    { href: "/dashboard", label: "Live Dashboard", icon: Activity },
    { href: "/map", label: "Waterlogging Map", icon: Map },
    { href: "/route-planner", label: "Safe Route Planner", icon: Navigation },
    { href: "/predictions", label: "Predictions", icon: AlertTriangle },
    { href: "/report", label: "Report Incident", icon: FileText },
    { href: "/authority", label: "Authority Dashboard", icon: ShieldCheck },
    { href: "/admin", label: "Admin Panel", icon: Settings },
    { href: "/login", label: "Sign In / Account", icon: User },
  ];

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-40 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Droplet className="w-4 h-4 text-white fill-cyan-200" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Nagpur WaterWatch
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Side Panel Navigation Bar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-screen z-50 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 text-white flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl shadow-slate-950/80 ${
          mobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-[72px]" : "md:w-64"}`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col">
          <div
            className={`h-16 flex items-center border-b border-slate-800/80 px-3.5 transition-all ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 overflow-hidden group"
              title="Nagpur WaterWatch"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5 text-white fill-cyan-200" />
              </div>

              {/* Title displayed when opened */}
              {!isCollapsed && (
                <div className="flex flex-col whitespace-nowrap overflow-hidden transition-opacity duration-200">
                  <span className="font-bold text-base leading-tight tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    Nagpur WaterWatch
                  </span>
                  <span className="text-[10px] text-cyan-400/90 font-medium tracking-wide">
                    Smart Water Monitor
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Contract Button in Header */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Contract side panel"
                aria-label="Contract side panel"
              >
                <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Expand Button for Contracted Desktop State */}
          {isCollapsed && (
            <div className="hidden md:flex justify-center pt-2 pb-1">
              <button
                onClick={toggleCollapse}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-all"
                title="Expand side panel"
                aria-label="Expand side panel"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2 space-y-1.5 mt-1 overflow-y-auto max-h-[calc(100vh-230px)] custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isActive
                          ? "text-cyan-400 scale-105"
                          : "text-slate-400 group-hover:text-cyan-400 group-hover:scale-110"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="whitespace-nowrap tracking-wide">
                        {item.label}
                      </span>
                    )}

                    {/* Active indicator dot on expanded */}
                    {!isCollapsed && isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    )}
                  </Link>

                  {/* Tooltip on Contracted Desktop Mode */}
                  {isCollapsed && (
                    <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-100 text-xs font-medium border border-slate-700 shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Role Switcher, System Status & Expand/Contract toggle */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          {/* Expanded bottom items */}
          {!isCollapsed ? (
            <>
              {/* Role Switcher */}
              <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span>ROLE MODE</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {(["citizen", "authority", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRole(r)}
                      className={`py-1 rounded-md capitalize text-[10px] font-semibold transition-all ${
                        activeRole === r
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                      }`}
                    >
                      {r === "authority" ? "Auth" : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Live status */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium text-slate-300">System Live</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">24/7 IoT</span>
              </div>

              {/* Bottom Contract Button */}
              <button
                onClick={toggleCollapse}
                className="w-full hidden md:flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span>Contract Panel</span>
              </button>
            </>
          ) : (
            /* Contracted bottom items */
            <div className="flex flex-col items-center gap-2 py-1">
              {/* Pulse status indicator with tooltip */}
              <div className="relative group flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-700/60 cursor-pointer">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 rounded-lg bg-slate-900 text-slate-100 text-xs font-medium border border-slate-700 shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>System Live (IoT Active)</span>
                </div>
              </div>

              {/* Expand button at bottom with tooltip */}
              <div className="relative group flex justify-center">
                <button
                  onClick={toggleCollapse}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 flex items-center justify-center transition-colors border border-slate-800"
                  title="Expand side panel"
                  aria-label="Expand side panel"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 rounded-lg bg-slate-900 text-cyan-400 text-xs font-medium border border-slate-700 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                  Expand Panel
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
