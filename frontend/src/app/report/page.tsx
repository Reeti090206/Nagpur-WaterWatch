"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { submitCitizenReport } from "@/lib/api";
import {
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  Info,
} from "lucide-react";

export default function ReportPage() {
  const [latitude, setLatitude] = useState<number | null>(21.1458);
  const [longitude, setLongitude] = useState<number | null>(79.0882);
  const [locationName, setLocationName] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [description, setDescription] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please enter coordinates manually.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
      },
      (error) => {
        setGpsError(`GPS Permission Denied / Error (${error.message}). Using default Nagpur center.`);
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const reportPayload = {
      latitude: latitude || 21.1458,
      longitude: longitude || 79.0882,
      location_name: locationName || "Custom Nagpur Location",
      severity,
      description,
    };

    await submitCitizenReport(reportPayload);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-800 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Citizen Waterlogging Reporting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsource live road conditions to alert citizens and assist municipal verification
          </p>
        </div>

        {/* Validation Notice */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white font-semibold">Verification Process:</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Reports are submitted as <em>Pending</em> and cross-referenced with IoT sensor readings and weather data. They are verified by municipal authorities before updating overall road severity.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Report Submitted Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Thank you for contributing to Nagpur WaterWatch. Your report ID has been logged for municipal review.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setDescription("");
                  setLocationName("");
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* GPS Location Auto-Detect */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                GPS Location Coordinates
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Lat: {latitude?.toFixed(4)}, Lng: {longitude?.toFixed(4)}</span>
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                  <span>{gpsLoading ? "Acquiring GPS..." : "Detect Location"}</span>
                </button>
              </div>

              {gpsError && (
                <p className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded-lg border border-amber-800/40">
                  {gpsError}
                </p>
              )}
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location Name / Landmark
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Near Ambazari Lake Gate / Sitabuldi Square"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Severity Radio Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Waterlogging Severity Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "low", label: "Low / Caution", desc: "Ankle deep (< 15cm)", color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300" },
                  { id: "moderate", label: "Moderate", desc: "Knee deep (15-30cm)", color: "border-amber-500/50 bg-amber-500/10 text-amber-300" },
                  { id: "severe", label: "Severe / Unsafe", desc: "Waist deep (> 30cm)", color: "border-rose-500/50 bg-rose-500/10 text-rose-300" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      severity === s.id
                        ? `${s.color} ring-2 ring-cyan-500/50 font-bold`
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold capitalize">{s.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description & Observed Conditions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe traffic impact, stuck vehicles, or overflowing drains..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Photo Attachment Placeholder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Attach Photograph (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-slate-700 transition-colors">
                <Camera className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                <span className="text-xs text-slate-400">Click to upload road photograph</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              <span>{loading ? "Submitting Report..." : "Submit Geotagged Report"}</span>
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
