"use client";

import React, { useEffect, useState, useRef } from "react";
import { SeverityBadge } from "./SeverityBadge";
import { Layers, Info, Radio, MapPin } from "lucide-react";

interface LocationItem {
  id: number;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  description?: string;
  current_severity: string;
  current_water_level: number;
  vulnerability_reason?: string;
  historical_frequency?: number;
  drainage_capacity?: string;
}

interface ReportItem {
  id: number;
  location_name?: string;
  latitude: number;
  longitude: number;
  severity: string;
  description?: string;
  status: string;
  confidence_score?: number;
}

interface MapProps {
  locations?: LocationItem[];
  reports?: ReportItem[];
  selectedLocationId?: number | null;
  onSelectLocation?: (loc: LocationItem) => void;
  height?: string;
  showLayerToggle?: boolean;
}

export const InteractiveMap: React.FC<MapProps> = ({
  locations = [],
  reports = [],
  selectedLocationId,
  onSelectLocation,
  height = "h-[500px]",
  showLayerToggle = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [isClient, setIsClient] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"all" | "sensors" | "reports" | "hotspots">("all");
  const [selectedItem, setSelectedItem] = useState<LocationItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    // Dynamically import Leaflet to avoid SSR window issues
    import("leaflet").then((L) => {
      // Fix leaflet marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const container = mapContainerRef.current;
        if (!container) return;
        // Center on Nagpur (21.1458, 79.0882)
        const map = L.map(container, {
          center: [21.1458, 79.0882],
          zoom: 12,
          zoomControl: true,
        });

        // OpenStreetMap tile layer (free, no API key, highly reliable)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Force Leaflet to recalculate container size after render
        // This fixes white/blank map in flex/grid containers
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        setTimeout(() => {
          map.invalidateSize();
        }, 500);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add location markers
      locations.forEach((loc) => {
        let color = "#10b981"; // Emerald
        let pulse = false;

        if (loc.current_severity === "severe") {
          color = "#f43f5e"; // Rose
          pulse = true;
        } else if (loc.current_severity === "moderate") {
          color = "#f59e0b"; // Amber
        } else if (loc.current_severity === "low") {
          color = "#eab308"; // Yellow
        }

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background-color: ${color};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              cursor: pointer;
            ">
              <span style="display: block; width: 8px; height: 8px; background: white; border-radius: 50%;"></span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedItem(loc);
          if (onSelectLocation) onSelectLocation(loc);
          map.setView([loc.latitude, loc.longitude], 14, { animate: true });
        });

        markersRef.current.push(marker);
      });
    });
  }, [isClient, locations]);

  // Handle external selection
  useEffect(() => {
    if (selectedLocationId && mapInstanceRef.current) {
      const loc = locations.find((l) => l.id === selectedLocationId);
      if (loc) {
        setSelectedItem(loc);
        mapInstanceRef.current.setView([loc.latitude, loc.longitude], 14, { animate: true });
      }
    }
  }, [selectedLocationId, locations]);

  if (!isClient) {
    return (
      <div className={`${height} bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-sm`}>
        Loading Nagpur Map Engine...
      </div>
    );
  }

  return (
    <div className={`relative ${height} rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col`}>
      {/* Leaflet CSS is loaded globally via globals.css */}

      {/* Map Control Bar */}
      {showLayerToggle && (
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-lg text-xs">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Layers:
          </span>
          {(["all", "sensors", "reports", "hotspots"] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                activeLayer === layer
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg text-[11px] text-slate-300 flex items-center gap-3">
        <span className="font-semibold text-slate-400">Severity:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Normal</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Severe</span>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-[100]" />

      {/* Location Detail Modal / Sidebar inside Map */}
      {selectedItem && (
        <div className="absolute top-4 right-4 z-[500] w-80 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-sm text-white">{selectedItem.name}</h4>
              <p className="text-xs text-slate-400">{selectedItem.area}, Nagpur</p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <SeverityBadge severity={selectedItem.current_severity} />
          </div>

          <div className="space-y-2 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Water Level:</span>
              <span className="font-bold text-cyan-400">{selectedItem.current_water_level} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Drainage Capacity:</span>
              <span className="capitalize font-medium text-slate-200">{selectedItem.drainage_capacity || "Medium"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Historical Incidents:</span>
              <span className="font-semibold text-amber-400">{selectedItem.historical_frequency || 0} times</span>
            </div>
            {selectedItem.vulnerability_reason && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-slate-300">Vulnerability Factor:</strong> {selectedItem.vulnerability_reason}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>GPS: {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
