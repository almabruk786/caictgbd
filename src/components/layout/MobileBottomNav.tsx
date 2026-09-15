import React from 'react';
import {
  LayoutDashboard,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Wallet,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule,
  onNavigate,
  onOpenSidebar,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'funding', label: 'Funding', icon: HandCoins, isHighlight: true },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'accounts', label: 'Cash', icon: Wallet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-sky-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-6 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 scale-110'
                    : item.isHighlight
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[54px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition-all"
        >
          <div className="p-1 rounded-lg text-slate-400 hover:text-white">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">More</span>
        </button>
      </div>
    </nav>
  );
};
