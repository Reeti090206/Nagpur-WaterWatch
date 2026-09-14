"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { loginUser, registerUser } from "@/lib/api";
import {
  Droplet,
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [username, setUsername] = useState("citizen");
  const [password, setPassword] = useState("citizen123");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleQuickFill = (role: "citizen" | "authority" | "admin") => {
    setMode("login");
    setErrorMessage(null);
    if (role === "citizen") {
      setUsername("citizen");
      setPassword("citizen123");
    } else if (role === "authority") {
      setUsername("authority");
      setPassword("authority123");
    } else if (role === "admin") {
      setUsername("admin");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === "login") {
        const result = await loginUser({ username, password });
        if (result.success) {
          const userRole = result.data.user.role;
          setSuccessMessage(`Welcome back, ${result.data.user.full_name || username}! Redirecting...`);
          setTimeout(() => {
            if (userRole === "admin") {
              router.push("/admin");
            } else if (userRole === "authority") {
              router.push("/authority");
            } else {
              router.push("/dashboard");
            }
          }, 1000);
        } else {
          setErrorMessage(result.error || "Invalid username or password");
        }
      } else {
        const result = await registerUser({
          username,
          email,
          password,
          full_name: fullName,
          phone,
        });
        if (result.success) {
          setSuccessMessage("Account created successfully! Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        } else {
          setErrorMessage(result.error || "Registration failed. Try a different username/email.");
        }
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_30%,rgba(6,182,212,0.15),rgba(2,6,23,0))]" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25 mb-2">
              <Droplet className="w-8 h-8 text-white fill-cyan-200" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === "login" ? "Sign In to Nagpur WaterWatch" : "Create Citizen Account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {mode === "login"
                ? "Access live sensor telemetry, verified reports, and navigation."
                : "Join citizens in reporting waterlogging and keeping Nagpur safe."}
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 shadow-lg backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Demo Quick-Fill Credentials:</span>
              </span>
              <span className="text-[10px] text-cyan-400/80">Click to autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill("citizen")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  username === "citizen" && mode === "login"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="font-bold text-[11px]">Citizen</div>
                <div className="text-[10px] opacity-70">citizen123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("authority")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  username === "authority" && mode === "login"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="font-bold text-[11px]">Authority</div>
                <div className="text-[10px] opacity-70">authority123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  username === "admin" && mode === "login"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="font-bold text-[11px]">Admin</div>
                <div className="text-[10px] opacity-70">admin123</div>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "register"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Register
              </button>
            </div>

            {/* Error & Success Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Extra Fields */}
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajesh@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In to System" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      Sign in instead
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Academic & Demo Notice */}
          <div className="text-center text-[11px] text-slate-500">
            Protected under Nagpur WaterWatch municipal security framework.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
