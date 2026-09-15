import React from 'react';
import {
  LayoutDashboard,
  Plane,
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onNavigate,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { hasPermission } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { id: 'tickets', label: 'Flight Tickets', icon: Plane, module: 'tickets' },
    { id: 'income', label: 'Income', icon: TrendingUp, module: 'income' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, module: 'expenses' },
    { id: 'funding', label: 'Arif Vai Funding', icon: HandCoins, module: 'funding' },
    { id: 'accounts', label: 'Cash & Accounts', icon: Wallet, module: 'accounts' },
    { id: 'customers', label: 'Customers & CRM', icon: Users, module: 'customers' },
    { id: 'suppliers', label: 'Airlines & Vendors', icon: Building2, module: 'suppliers' },
    { id: 'reports', label: 'Financial Reports', icon: FileText, module: 'reports' },
    { id: 'settings', label: 'Agency Settings', icon: Settings, module: 'settings' },
  ];

  const visibleNavItems = navItems.filter(item => hasPermission(item.module, 'view'));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-none font-sans">
                  Captain Air
                </span>
                <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase mt-1">
                  International
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom area */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] text-slate-400 font-medium">Online</span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
