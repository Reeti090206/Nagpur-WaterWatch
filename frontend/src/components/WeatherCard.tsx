import React from "react";
import { CloudRain, Wind, Droplets, Thermometer, ShieldAlert, CheckCircle2 } from "lucide-react";

interface WeatherProps {
  weather: {
    rainfall_mm: number;
    intensity?: string;
    humidity?: number;
    temperature_c?: number;
    wind_speed_kmh?: number;
    weather_condition?: string;
    forecast_rainfall_mm?: number;
    data_source: string;
    is_simulated?: boolean;
    observed_at?: string;
  };
}

export const WeatherCard: React.FC<WeatherProps> = ({ weather }) => {
  const intensity = weather.intensity || "moderate";

  let intensityBadge = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (intensity === "heavy" || intensity === "very_heavy") {
    intensityBadge = "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse";
  } else if (intensity === "light" || intensity === "none") {
    intensityBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Nagpur Weather & Rainfall</h3>
            <p className="text-[11px] text-slate-400 capitalize">{weather.weather_condition || "Monitoring Station"}</p>
          </div>
        </div>

        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${intensityBadge}`}>
          {intensity.replace("_", " ")}
        </span>
      </div>

      {/* Main Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="text-[11px] text-slate-400 mb-1">Current Rainfall</div>
          <div className="text-xl font-bold text-cyan-400 flex items-baseline gap-1">
            {weather.rainfall_mm} <span className="text-xs text-slate-400 font-normal">mm</span>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="text-[11px] text-slate-400 mb-1">Humidity</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            <Droplets className="w-4 h-4 text-cyan-400 inline" />
            {weather.humidity || 85}%
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="text-[11px] text-slate-400 mb-1">Temperature</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-amber-400 inline" />
            {weather.temperature_c || 27}°C
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="text-[11px] text-slate-400 mb-1">Wind Speed</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            <Wind className="w-4 h-4 text-slate-400 inline" />
            {weather.wind_speed_kmh || 15} <span className="text-xs text-slate-400 font-normal">km/h</span>
          </div>
        </div>
      </div>

      {/* Provenance Footer */}
      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Source:</span>
          <span className="font-semibold text-slate-200 uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {weather.data_source}
          </span>
        </div>

        {weather.is_simulated ? (
          <span className="text-amber-400 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> DEMO SIMULATION
          </span>
        ) : (
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED API
          </span>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
