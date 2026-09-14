"use client";

import React, { useEffect, useState, useRef } from "react";
import { SeverityBadge } from "./SeverityBadge";
import { Layers, Info, Navigation, Compass, Plus, Minus, MapPin } from "lucide-react";

export interface LocationItem {
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

export interface ReportItem {
  id: number;
  location_name?: string;
  latitude: number;
  longitude: number;
  severity: string;
  description?: string;
  status: string;
  confidence_score?: number;
}

export interface RoutePolyline {
  points: [number, number][];
  color: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  label?: string;
}

export interface MapProps {
  locations?: LocationItem[];
  reports?: ReportItem[];
  polylines?: RoutePolyline[];
  userLocation?: { lat: number; lng: number } | null;
  originCoords?: { lat: number; lng: number } | null;
  destinationCoords?: { lat: number; lng: number } | null;
  selectedLocationId?: number | null;
  onSelectLocation?: (loc: LocationItem) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  showLayerToggle?: boolean;
  interactivePickMode?: boolean;
}

export const InteractiveMap: React.FC<MapProps> = ({
  locations = [],
  reports = [],
  polylines = [],
  userLocation = null,
  originCoords = null,
  destinationCoords = null,
  selectedLocationId,
  onSelectLocation,
  onMapClick,
  height = "h-[550px]",
  showLayerToggle = true,
  interactivePickMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);

  const [isClient, setIsClient] = useState(false);
  const [activeTileType, setActiveTileType] = useState<"streets" | "voyager" | "satellite">("streets");
  const [selectedItem, setSelectedItem] = useState<LocationItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Tile layer URLs (100% Free, reliable, no API key required)
  const TILE_URLS = {
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const TILE_ATTRIBUTIONS = {
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    voyager: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const container = mapContainerRef.current;
        if (!container) return;

        const map = L.map(container, {
          center: [21.1458, 79.0882],
          zoom: 13,
          zoomControl: false, // We render custom glassmorphism zoom controls
        });

        // Add base tile layer (OpenStreetMap streets)
        const tileLayer = L.tileLayer(TILE_URLS.streets, {
          attribution: TILE_ATTRIBUTIONS.streets,
          maxZoom: 19,
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Map Click event handler
        map.on("click", (e: any) => {
          if (onMapClick) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });

        mapInstanceRef.current = map;

        setTimeout(() => map.invalidateSize(), 150);
        setTimeout(() => map.invalidateSize(), 500);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers and polylines
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      polylinesRef.current.forEach((p) => p.remove());
      polylinesRef.current = [];

      // 1. Draw Route Polylines
      polylines.forEach((poly) => {
        if (!poly.points || poly.points.length < 2) return;

        const polyline = L.polyline(poly.points, {
          color: poly.color || "#06b6d4",
          weight: poly.weight || 6,
          opacity: poly.opacity || 0.85,
          dashArray: poly.dashArray,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        if (poly.label) {
          polyline.bindTooltip(poly.label, { permanent: false, direction: "center" });
        }

        polylinesRef.current.push(polyline);
      });

      // Fit bounds if polylines exist
      if (polylines.length > 0 && polylines[0].points.length > 1) {
        const allPoints = polylines.flatMap((p) => p.points);
        if (allPoints.length > 0) {
          map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 15 });
        }
      }

      // 2. Add Location Markers (Waterlogging Hotspots / Sensors)
      locations.forEach((loc) => {
        let color = "#10b981"; // Emerald Normal
        if (loc.current_severity === "severe") color = "#f43f5e"; // Rose Severe
        else if (loc.current_severity === "moderate") color = "#f59e0b"; // Amber Moderate
        else if (loc.current_severity === "low") color = "#eab308"; // Yellow Low

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background-color: ${color};
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="width: 8px; height: 8px; background: white; border-radius: 50%;"></span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedItem(loc);
          if (onSelectLocation) onSelectLocation(loc);
          map.setView([loc.latitude, loc.longitude], 14, { animate: true });
        });

        markersRef.current.push(marker);
      });

      // 3. User Location Blue Pulsing Marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-gps-marker",
          html: `
            <div style="
              position: relative;
              width: 24px;
              height: 24px;
              background-color: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.35);
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const uMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        uMarker.bindTooltip("Your Current Location", { permanent: true, direction: "top" });
        markersRef.current.push(uMarker);
      }

      // 4. Origin Marker (Green 'A')
      if (originCoords) {
        const originIcon = L.divIcon({
          className: "origin-pin-marker",
          html: `
            <div style="
              background: #10b981;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            ">
              <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">A</span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        const oMarker = L.marker([originCoords.lat, originCoords.lng], { icon: originIcon }).addTo(map);
        markersRef.current.push(oMarker);
      }

      // 5. Destination Marker (Red 'B')
      if (destinationCoords) {
        const destIcon = L.divIcon({
          className: "dest-pin-marker",
          html: `
            <div style="
              background: #f43f5e;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            ">
              <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">B</span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        const dMarker = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon }).addTo(map);
        markersRef.current.push(dMarker);
      }
    });
  }, [isClient, locations, polylines, userLocation, originCoords, destinationCoords]);

  // Handle external location selection focus
  useEffect(() => {
    if (selectedLocationId && mapInstanceRef.current) {
      const loc = locations.find((l) => l.id === selectedLocationId);
      if (loc) {
        setSelectedItem(loc);
        mapInstanceRef.current.setView([loc.latitude, loc.longitude], 14, { animate: true });
      }
    }
  }, [selectedLocationId, locations]);

  // Handle tile switch
  const handleTileChange = (type: "streets" | "voyager" | "satellite") => {
    setActiveTileType(type);
    if (mapInstanceRef.current && tileLayerRef.current) {
      import("leaflet").then((L) => {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        const newLayer = L.tileLayer(TILE_URLS[type], {
          attribution: TILE_ATTRIBUTIONS[type],
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
        tileLayerRef.current = newLayer;
      });
    }
  };

  // Map Controls (Zoom In, Zoom Out, Center Location)
  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const centerUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.1458, 79.0882], 13, { animate: true });
    }
  };

  if (!isClient) {
    return (
      <div className={`${height} bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-sm`}>
        Loading Nagpur Map Engine...
      </div>
    );
  }

  return (
    <div className={`relative ${height} rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col`}>
      {/* Map Tile Layer Toggle Bar */}
      {showLayerToggle && (
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-xl text-xs">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Map Type:
          </span>
          {(["streets", "voyager", "satellite"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTileChange(type)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                activeTileType === type
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Google Maps Style Navigation Controls (Right Side) */}
      <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={centerUserLocation}
          title="Center on My Location"
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-cyan-400 hover:bg-cyan-600 hover:text-white flex items-center justify-center shadow-xl transition-all hover:scale-105"
        >
          <Compass className="w-5 h-5" />
        </button>

        <div className="flex flex-col rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl overflow-hidden">
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="w-10 h-10 text-slate-200 hover:bg-slate-800 flex items-center justify-center border-b border-slate-800"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="w-10 h-10 text-slate-200 hover:bg-slate-800 flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Map Picker Overlay Banner */}
      {interactivePickMode && (
        <div className="absolute top-4 right-4 z-[400] bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-xl animate-pulse">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Click anywhere on map to select coordinates</span>
        </div>
      )}

      {/* Map Severity Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg text-[11px] text-slate-300 flex items-center gap-3">
        <span className="font-semibold text-slate-400">Severity:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Normal</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Severe</span>
      </div>

      {/* Leaflet Map Target Div */}
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
