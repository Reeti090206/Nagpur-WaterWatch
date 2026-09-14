"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { InteractiveMap, LocationItem, RoutePolyline } from "@/components/InteractiveMap";
import { analyzeRoute, fetchLocations } from "@/lib/api";
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
  Compass,
  ExternalLink,
  Car,
  Layers,
  Sparkles,
} from "lucide-react";

export default function RoutePlanner() {
  const [source, setSource] = useState("Katol Road, Nagpur");
  const [destination, setDestination] = useState("Pardi Naka, Nagpur");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 21.175, lng: 79.062 });
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }>({ lat: 21.156, lng: 79.092 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [pickingMode, setPickingMode] = useState<"origin" | "destination" | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(1);

  // Preset location library for fast selection
  const NAGPUR_PRESETS = [
    { name: "Katol Road Square", lat: 21.175, lng: 79.062 },
    { name: "Sitabuldi Metro Station", lat: 21.1458, lng: 79.0882 },
    { name: "Pardi Naka Underpass", lat: 21.1567, lng: 79.0921 },
    { name: "Ambazari Lake Road", lat: 21.1305, lng: 79.0495 },
    { name: "Wardha Road (Airport)", lat: 21.0922, lng: 79.0617 },
    { name: "Sadar Flyover", lat: 21.161, lng: 79.08 },
    { name: "Pratap Nagar Square", lat: 21.121, lng: 79.069 },
    { name: "Hingna T-Point", lat: 21.11, lng: 79.015 },
  ];

  // Fetch Nagpur waterlogging locations for map markers
  useEffect(() => {
    fetchLocations().then((data) => setLocations(data));
  }, []);

  // Handle GPS / Browser Geolocation
  const handleAcquireLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please type your starting location manually.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setOriginCoords({ lat: userLat, lng: userLng });
        setSource(`My Current Location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = "Unable to acquire location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please enter your origin manually or pick a location on the map.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable. Please type your starting location manually.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please enter your origin manually.";
        }
        setGeoError(errorMsg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Route Calculation Submit
  const handlePlanRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setRouteResult(null);

    const res = await analyzeRoute(originCoords, destinationCoords);
    setRouteResult(res);
    if (res && res.recommended_route !== undefined) {
      setSelectedRouteIdx(res.recommended_route);
    }
    setLoading(false);
  };

  // Calculate automatically on first mount
  useEffect(() => {
    handlePlanRoute();
  }, []);

  // Map Click Picker Handler
  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (pickingMode === "origin") {
      setOriginCoords(coords);
      setSource(`Selected Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      setPickingMode(null);
    } else if (pickingMode === "destination") {
      setDestinationCoords(coords);
      setDestination(`Selected Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      setPickingMode(null);
    }
  };

  // Launch External Google Maps Navigation
  const handleStartGoogleNavigation = (routeSummary?: string) => {
    let url = "";
    if (originCoords && destinationCoords) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Format route polylines for map rendering
  const mapPolylines: RoutePolyline[] = [];
  if (routeResult && routeResult.routes) {
    routeResult.routes.forEach((r: any, idx: number) => {
      const isSelected = idx === selectedRouteIdx;
      const isRecommended = idx === routeResult.recommended_route;

      if (r.coordinates && r.coordinates.length > 0) {
        mapPolylines.push({
          points: r.coordinates,
          color: isRecommended ? "#06b6d4" : "#a855f7",
          weight: isSelected ? 7 : 4,
          opacity: isSelected ? 0.95 : 0.6,
          dashArray: isRecommended ? undefined : "8, 8",
          label: `${r.summary} (${r.distance_km} km)`,
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Navigation className="w-6 h-6 text-cyan-400" />
              <span>Google Maps–Style Safe Navigation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time waterlogging risk evaluation overlaid on Google Maps navigation for Nagpur city
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Sensor + Flood Avoidance Engine</span>
            </span>
          </div>
        </div>

        {/* Location Error / Notice Banner */}
        {geoError && (
          <div className="bg-amber-950/60 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-200 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">{geoError}</div>
            <button
              onClick={() => setGeoError(null)}
              className="text-amber-400 hover:text-white text-xs underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Data Provenance & API Notice */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300 shadow-xl">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white font-semibold">Google Maps Navigation Integration:</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Standard Google Maps does not report live water depth or submerged underpass risks. Nagpur WaterWatch combines IoT sensor telemetry and AI predictions with spatial routing, calculating the safest path around flooded areas and launching turn-by-turn navigation directly in Google Maps.
            </p>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Route Planner Input & Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <h3 className="font-bold text-white text-base flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Trip Origin & Destination</span>
                </span>

                <button
                  type="button"
                  onClick={handleAcquireLocation}
                  disabled={geoLoading}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all"
                  title="Acquire current position via browser GPS"
                >
                  <Compass className={`w-3.5 h-3.5 ${geoLoading ? "animate-spin" : ""}`} />
                  <span>{geoLoading ? "Locating..." : "Your Location"}</span>
                </button>
              </h3>

              <form onSubmit={handlePlanRoute} className="space-y-4">
                {/* Source Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Starting Location (Origin)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPickingMode(pickingMode === "origin" ? null : "origin")}
                      className={`text-[11px] font-medium transition-colors ${
                        pickingMode === "origin" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-cyan-400"
                      }`}
                    >
                      {pickingMode === "origin" ? "Cancel Map Pick" : "📍 Pick on Map"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Enter starting location or address..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <div className="absolute right-3 top-2.5 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Destination Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Destination
                    </label>
                    <button
                      type="button"
                      onClick={() => setPickingMode(pickingMode === "destination" ? null : "destination")}
                      className={`text-[11px] font-medium transition-colors ${
                        pickingMode === "destination" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-cyan-400"
                      }`}
                    >
                      {pickingMode === "destination" ? "Cancel Map Pick" : "📍 Pick on Map"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination in Nagpur..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <div className="absolute right-3 top-2.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{loading ? "Calculating Safest Route..." : "Calculate Safe Navigation Route"}</span>
                </button>
              </form>

              {/* Quick Nagpur Destination Chips */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Select Nagpur Destination:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NAGPUR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDestination(preset.name);
                        setDestinationCoords({ lat: preset.lat, lng: preset.lng });
                      }}
                      className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Route Options Comparison Cards */}
            {routeResult && routeResult.routes && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                  <span>Available Route Options ({routeResult.routes.length}):</span>
                  <span className="text-cyan-400">Click card to highlight on map</span>
                </div>

                {routeResult.routes.map((r: any, idx: number) => {
                  const isRecommended = idx === routeResult.recommended_route;
                  const isSelected = idx === selectedRouteIdx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRouteIdx(idx)}
                      className={`rounded-2xl p-5 border cursor-pointer transition-all ${
                        isSelected
                          ? isRecommended
                            ? "bg-slate-900 border-cyan-500/80 shadow-2xl ring-1 ring-cyan-500/40"
                            : "bg-slate-900 border-purple-500/80 shadow-2xl ring-1 ring-purple-500/40"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{r.summary}</span>
                          </h4>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3 text-cyan-400" />
                              {r.traffic_condition || "Normal Traffic"}
                            </span>
                          </div>
                        </div>

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

                      {/* Route Metric Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
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
                              r.risk_score > 0.4 ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {(r.risk_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      {/* Avoided flooded underpasses notice */}
                      {r.avoided_underpasses && r.avoided_underpasses.length > 0 && (
                        <div className="mb-3 text-[11px] bg-emerald-950/40 text-emerald-300 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            <strong>Avoided Hazards:</strong> Bypasses {r.avoided_underpasses.join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Affected Segments */}
                      {r.segments && r.segments.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">
                            Submerged Segments ({r.segments.length}):
                          </div>
                          {r.segments.map((seg: any, i: number) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-300 font-medium">{seg.location_name}</span>
                              <SeverityBadge severity={seg.severity} showIcon={false} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Start Navigation Action Button */}
                      {isRecommended && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartGoogleNavigation(r.summary);
                          }}
                          className="mt-4 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Start Navigation in Google Maps</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Google Maps Style Interactive Map Display */}
          <div className="lg:col-span-7 space-y-4 sticky top-6">
            {/* System Recommendation Banner */}
            {routeResult && (
              <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-emerald-400 text-sm">Safe Route Recommendation</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {routeResult.recommendation_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Leaflet Map with Google Maps Controls & Polylines */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <InteractiveMap
                locations={locations}
                polylines={mapPolylines}
                userLocation={userLocation}
                originCoords={originCoords}
                destinationCoords={destinationCoords}
                height="h-[620px]"
                showLayerToggle={true}
                interactivePickMode={pickingMode !== null}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
