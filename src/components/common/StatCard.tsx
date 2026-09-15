import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number; // percentage
  changeLabel?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemeStyles = {
    blue: {
      bgIcon: 'bg-brand-50 text-brand-600 border-brand-100',
      accentGlow: 'hover:border-brand-300',
      tag: 'bg-brand-50 text-brand-700',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accentGlow: 'hover:border-emerald-300',
      tag: 'bg-emerald-50 text-emerald-700',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600 border-rose-100',
      accentGlow: 'hover:border-rose-300',
      tag: 'bg-rose-50 text-rose-700',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600 border-amber-100',
      accentGlow: 'hover:border-amber-300',
      tag: 'bg-amber-50 text-amber-700',
    },
    purple: {
      bgIcon: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accentGlow: 'hover:border-indigo-300',
      tag: 'bg-indigo-50 text-indigo-700',
    },
    slate: {
      bgIcon: 'bg-slate-100 text-slate-700 border-slate-200',
      accentGlow: 'hover:border-slate-300',
      tag: 'bg-slate-100 text-slate-700',
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-card-hover transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${style.accentGlow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${style.bgIcon} shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold ${
                change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change >= 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-500 text-xs">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 font-medium">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
};
