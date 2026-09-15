import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  UserCheck,
  LogOut,
  ChevronDown,
  Plane,
  Menu,
  Check,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { DateRangePreset } from '../../utils/date';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (module: string) => void;
  activeModule: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNavigate,
  activeModule,
}) => {
  const { currentUser, logout } = useAuth();
  const { settings, dateRange, setDateRangePreset, exportDatabaseJSON } = useAppData();

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);

  // Page titles
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    tickets: 'Flight Ticketing & Sales',
    income: 'Income Records',
    expenses: 'Expense Records',
    funding: 'Arif Vai Funding',
    accounts: 'Cash Drawer & Bank Accounts',
    customers: 'Customers & CRM',
    suppliers: 'Airlines & Vendors',
    reports: 'Financial Reports',
    settings: 'Agency Settings',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) setIsDateMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const datePresets: { label: string; value: DateRangePreset }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last 3 Months', value: 'last3Months' },
    { label: 'This Year (2026)', value: 'thisYear' },
    { label: 'All Records', value: 'all' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left: Mobile toggle + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center shadow-sm">
            <Plane className="w-3.5 h-3.5 transform -rotate-45" />
          </div>
          <span className="font-bold text-slate-800 text-sm hidden sm:inline">
            {settings?.companyName || 'Captain Air International'}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="font-semibold text-slate-600 text-sm">
            {pageTitles[activeModule] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Date Range Picker */}
        <div className="relative" ref={dateMenuRef}>
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">
              {datePresets.find(p => p.value === dateRange.preset)?.label || 'Custom'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fade-in">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Accounting Period
              </div>
              {datePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setDateRangePreset(preset.value);
                    setIsDateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 flex items-center justify-between transition-colors"
                >
                  <span>{preset.label}</span>
                  {dateRange.preset === preset.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cloud & Data Tools */}
        <button
          onClick={() => {
            const el = document.getElementById('cloud-modal-trigger');
            if (el) el.click();
            else exportDatabaseJSON();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-semibold transition-colors"
          title="Backup & Cloud Database"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden md:inline">Cloud Backup</span>
        </button>

        {/* Admin Flight Deck Profile & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-100/80 border border-slate-200/70">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-none">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="text-[10px] font-bold text-brand-600 mt-0.5">
                Flight Deck Admin
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Log Out of Flight Deck"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
