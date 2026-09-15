import React, { useState } from 'react';
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
  Wind,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mechanical switch toggles (visual interactive cockpit features)
  const [avionicsMaster, setAvionicsMaster] = useState(true);
  const [radarActive, setRadarActive] = useState(true);

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

  const handleFillCredentials = () => {
    setLoginId('admin');
    setPassword('Arif@2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* 1. Dynamic Aviation Night Sky & Radar Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 2. Soaring Jet Animation Across the Sky */}
      <div className="absolute top-12 -left-32 animate-[flight_25s_linear_infinite] opacity-60 pointer-events-none">
        <div className="relative flex items-center">
          <Plane className="w-16 h-16 text-sky-400 transform rotate-12 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          {/* Contrail trail */}
          <div className="h-1 w-96 bg-gradient-to-l from-sky-400/80 via-sky-500/20 to-transparent blur-[1px] transform -translate-y-1 -translate-x-2" />
        </div>
      </div>

      {/* 3. Glowing Radar Circle Background */}
      <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full border border-sky-500/20 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 rounded-full border border-sky-500/10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-emerald-500/20 animate-ping" />
        </div>
      </div>

      {/* 4. Main Cockpit Avionics Panel Card */}
      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        {/* Cockpit HUD Top Instrument Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-x border-slate-700/80 rounded-t-3xl p-4 px-6 flex items-center justify-between shadow-2xl text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HUD ONLINE</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">FREQ: 124.85 MHz</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>ALT: 38,000 FT</span>
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>HDG: 085°</span>
            </span>
          </div>
        </div>

        {/* Cockpit Main Body Console */}
        <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-b-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-brand-500 to-emerald-400" />

          {/* Header Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-500/20 mb-3 group">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Plane className="w-8 h-8 text-sky-400 transform -rotate-45 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              Captain Air International
            </h1>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
              Flight Operations & ERP Cockpit
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Flight Admin ID / Callsign
                </span>
                <span className="text-[10px] text-sky-400/80">DEFAULT: admin</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="Enter admin ID"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all shadow-inner"
                />
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  Cockpit Clearance Key
                </span>
                <span className="text-[10px] text-emerald-400/80">KEY SECURED</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter authorization password"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all shadow-inner"
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

            {/* Mechanical Cockpit Instrument Controls */}
            <div className="grid grid-cols-2 gap-3 py-2">
              <div
                onClick={() => setAvionicsMaster(!avionicsMaster)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  avionicsMaster
                    ? 'bg-slate-800/80 border-sky-500/40 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10.5px] font-mono font-bold uppercase">Avionics Master</span>
                <span className={`w-2 h-2 rounded-full ${avionicsMaster ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`} />
              </div>

              <div
                onClick={() => setRadarActive(!radarActive)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  radarActive
                    ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10.5px] font-mono font-bold uppercase">Radar Transponder</span>
                <span className={`w-2 h-2 rounded-full ${radarActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-sky-500 via-brand-600 to-indigo-600 hover:from-sky-400 hover:via-brand-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
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
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-[11px] font-mono font-semibold text-slate-400 hover:text-sky-300 underline transition-colors"
              >
                ⚡ 1-Click Fill Admin Credentials (admin / Arif@2026)
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>TERMINAL: CTG-AIR-01</span>
            <span>SYSTEM VER: 2.0.26-EXEC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
