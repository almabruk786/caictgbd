import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plane,
  ShieldCheck,
  Lock,
  User,
  Key,
  Radio,
  Compass,
  Gauge,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Navigation,
  Globe2,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live Cockpit Clock
  const [timeStr, setTimeStr] = useState('');
  const [utcStr, setUtcStr] = useState('');

  // Interactive Cockpit Toggles
  const [avionicsMaster, setAvionicsMaster] = useState(true);
  const [radarActive, setRadarActive] = useState(true);
  const [secureCloud, setSecureCloud] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setUtcStr(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginId, password);
      if (!res.success) {
        setError(res.error || 'Access Denied: Invalid Flight Authorization Credentials');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleQuickLogin = (id: string, pass: string) => {
    setLoginId(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. AVIATION NIGHT SKY & DYNAMIC RADAR BACKGROUND
      ────────────────────────────────────────────────────────────── */}
      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(99,102,241,0.08),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(16,185,129,0.12),rgba(0,0,0,0))] pointer-events-none" />

      {/* Cyber Avionics Coordinate Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4918_1px,transparent_1px),linear-gradient(to_bottom,#082f4918_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Glowing Radar Rings in Corner */}
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full border border-sky-500/15 pointer-events-none flex items-center justify-center">
        <div className="w-60 h-60 rounded-full border border-sky-500/10 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-emerald-500/20 animate-ping" />
        </div>
      </div>

      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full border border-indigo-500/15 pointer-events-none" />

      {/* Jet Silhouette Flight Path Animation */}
      <div className="absolute top-8 -left-36 animate-[flight_28s_linear_infinite] opacity-50 pointer-events-none hidden sm:block">
        <div className="relative flex items-center">
          <Plane className="w-14 h-14 text-sky-400 transform rotate-12 drop-shadow-[0_0_16px_rgba(56,189,248,0.9)]" />
          <div className="h-1 w-96 bg-gradient-to-l from-sky-400/90 via-sky-500/20 to-transparent blur-[1px] transform -translate-y-1 -translate-x-2" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN COCKPIT FLIGHT DECK CARD
      ────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg relative z-10 animate-fade-in my-auto">
        {/* Cockpit HUD Top Status Bar */}
        <div className="bg-slate-900/95 backdrop-blur-2xl border-t border-x border-slate-700/80 rounded-t-3xl p-3.5 px-4 sm:px-6 flex items-center justify-between shadow-2xl text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HUD ONLINE</span>
            </div>
            <span className="font-mono text-[10.5px] text-sky-400 hidden sm:inline flex items-center gap-1">
              <Radio className="w-3 h-3" />
              <span>CTG ✈ DAC [CA-786]</span>
            </span>
          </div>

          {/* Real-time Clock */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white tracking-wide">{timeStr || '12:00:00 PM'}</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">({utcStr})</span>
          </div>
        </div>

        {/* Cockpit Main Body Console */}
        <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-3xl border border-slate-700/80 rounded-b-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Top Neon Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-brand-500 to-emerald-400" />

          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-emerald-400 p-[1.5px] shadow-lg shadow-sky-500/20 mb-2.5 group">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Plane className="w-7 h-7 text-sky-400 transform -rotate-45 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
              Captain Air International
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-widest font-mono">
                Executive Flight Operations & ERP
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Flight Admin ID / Callsign
                </span>
                <span className="text-[10px] text-sky-400/80 font-bold">DEFAULT: admin</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="Enter login ID"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all shadow-inner"
                />
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  Cockpit Clearance Key
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">256-BIT SECURED</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all shadow-inner"
                />
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cockpit Instrument Switches */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                onClick={() => setAvionicsMaster(!avionicsMaster)}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  avionicsMaster
                    ? 'bg-slate-800/80 border-sky-500/40 text-sky-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-mono font-bold uppercase">Avionics</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${avionicsMaster ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`} />
              </div>

              <div
                onClick={() => setRadarActive(!radarActive)}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  radarActive
                    ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold uppercase">Radar Active</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${radarActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-brand-600 to-indigo-600 hover:from-sky-400 hover:via-brand-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ENGAGING FLIGHT DECK...</span>
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4 transform -rotate-45" />
                  <span>AUTHORIZE & ENGAGE FLIGHT DECK</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick 1-Click Fill Credentials Badge */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider text-center mb-1.5">
                ⚡ 1-Click Quick Demo Login:
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'Arif@2026')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-sky-950/70 border border-slate-700 hover:border-sky-500/50 text-[10.5px] font-mono text-sky-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                >
                  <span>👑 Admin</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">admin / Arif@2026</span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-sky-400" />
              <span>TERMINAL: CTG-AIR-01</span>
            </span>
            <span>SYSTEM: v2026.1-RELEASE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
