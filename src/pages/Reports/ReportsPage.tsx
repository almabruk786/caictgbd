import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { printReport } from '../../utils/print';
import { downloadStatementPDF } from '../../utils/pdfExport';
import {
  FileText,
  Printer,
  FileDown,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  CheckCircle2,
  Wallet,
  Building2,
  Layers,
  ArrowRight,
} from 'lucide-react';

type ReportTab = 'pnl' | 'cash_closing' | 'expenses_breakdown' | 'liquidity';
type Period = 'today' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all';

export const ReportsPage: React.FC = () => {
  const { income, expenses, tickets, accounts, settings } = useAppData();

  const [activeTab, setActiveTab] = useState<ReportTab>('pnl');
  const [period, setPeriod] = useState<Period>('thisMonth');

  // Filter by period
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curYear = now.getFullYear().toString();
    const curMonthStr = `${curYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let inc = [...income];
    let exp = [...expenses];
    let tkt = [...tickets];

    if (period === 'today') {
      inc = inc.filter(i => i.date === todayStr);
      exp = exp.filter(e => e.date === todayStr);
      tkt = tkt.filter(t => t.saleDate === todayStr);
    } else if (period === 'thisMonth') {
      inc = inc.filter(i => i.date.startsWith(curMonthStr));
      exp = exp.filter(e => e.date.startsWith(curMonthStr));
      tkt = tkt.filter(t => t.saleDate.startsWith(curMonthStr));
    } else if (period === 'lastMonth') {
      inc = inc.filter(i => i.date.startsWith(lastMonthStr));
      exp = exp.filter(e => e.date.startsWith(lastMonthStr));
      tkt = tkt.filter(t => t.saleDate.startsWith(lastMonthStr));
    } else if (period === 'thisYear') {
      inc = inc.filter(i => i.date.startsWith(curYear));
      exp = exp.filter(e => e.date.startsWith(curYear));
      tkt = tkt.filter(t => t.saleDate.startsWith(curYear));
    }

    return { inc, exp, tkt };
  }, [income, expenses, tickets, period]);

  // Calculations for P&L
  const directIncome = useMemo(() => filteredData.inc.reduce((s, i) => s + i.amount, 0), [filteredData.inc]);
  const ticketProfit = useMemo(() => filteredData.tkt.reduce((s, t) => s + t.netProfit, 0), [filteredData.tkt]);
  const totalGrossRevenue = directIncome + ticketProfit;

  const totalOperatingExpenses = useMemo(() => filteredData.exp.reduce((s, e) => s + e.amount, 0), [filteredData.exp]);
  const netOperatingProfit = totalGrossRevenue - totalOperatingExpenses;

  // Expense breakdown
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.exp.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredData.exp]);

  const periodLabels: Record<Period, string> = {
    today: 'Today',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year (2026)',
    all: 'All Time',
  };

  const handlePrintReport = () => {
    const all = [
      ...filteredData.inc.map(i => ({ ...i, _t: 'income' as const })),
      ...filteredData.exp.map(e => ({ ...e, _t: 'expense' as const })),
    ];
    printReport(all as any, 'combined', `${periodLabels[period]} Financial Report`, settings);
  };

  const handleDownloadPDF = () => {
    const all = [
      ...filteredData.inc.map(i => ({ ...i, _t: 'income' as const })),
      ...filteredData.exp.map(e => ({ ...e, _t: 'expense' as const })),
    ];
    downloadStatementPDF(all as any, 'combined', `${periodLabels[period]} Executive Statement`, settings);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white">
              <FileText className="w-5 h-5" />
            </div>
            Financial Statements & Executive Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Profit & Loss statements, cash closing balance sheets, and category breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Statement</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600 ml-1" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Accounting Period:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['today', 'thisMonth', 'lastMonth', 'thisYear', 'all'] as Period[]).map(key => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                period === key
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {periodLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'pnl' as ReportTab, label: 'Profit & Loss Statement', icon: DollarSign },
          { id: 'cash_closing' as ReportTab, label: 'Daily Cash Closing', icon: Wallet },
          { id: 'expenses_breakdown' as ReportTab, label: 'Expense Heads Breakdown', icon: Layers },
          { id: 'liquidity' as ReportTab, label: 'Account Liquidity Status', icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profit & Loss Statement */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Gross Inflow & Profit
              </span>
              <div className="text-2xl font-black text-emerald-600">{formatBDT(totalGrossRevenue)}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tickets (৳{ticketProfit.toLocaleString()}) + Other Income (৳{directIncome.toLocaleString()})
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Operating Expenses
              </span>
              <div className="text-2xl font-black text-rose-600">{formatBDT(totalOperatingExpenses)}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {filteredData.exp.length} Expense vouchers recorded
              </span>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${
              netOperatingProfit >= 0 ? 'bg-gradient-to-br from-slate-900 to-emerald-950 text-white border-slate-800' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Net Operating Position
              </span>
              <div className="text-2xl font-black">{formatBDT(netOperatingProfit)}</div>
              <span className="text-[10px] font-semibold text-emerald-400 mt-1 block">
                {netOperatingProfit >= 0 ? '● Operational Surplus' : '● Operational Deficit'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Profit & Loss Breakdown — {periodLabels[period]}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-700">
                <span>1. Revenue & Inflow</span>
                <span>Amount (৳)</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 pl-4">
                <span>Flight Ticketing Net Profit</span>
                <span className="font-bold text-emerald-600">+{formatBDT(ticketProfit)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 pl-4">
                <span>Direct Services & Commission Income</span>
                <span className="font-bold text-emerald-600">+{formatBDT(directIncome)}</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50/50 px-3 rounded-lg font-black text-emerald-800">
                <span>Total Gross Operational Inflow</span>
                <span>{formatBDT(totalGrossRevenue)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-700 pt-4">
                <span>2. Operating Expenditures</span>
                <span>Amount (৳)</span>
              </div>
              {expenseByCategory.map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-1.5 text-slate-600 pl-4">
                  <span>{cat}</span>
                  <span className="font-bold text-rose-600">-{formatBDT(amt)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 bg-rose-50/50 px-3 rounded-lg font-black text-rose-800">
                <span>Total Operational Expenses</span>
                <span>-{formatBDT(totalOperatingExpenses)}</span>
              </div>

              <div className="flex justify-between py-3 bg-slate-900 text-white px-4 rounded-xl font-black text-sm mt-4">
                <span>NET OPERATIONAL PROFIT / (LOSS)</span>
                <span className={netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatBDT(netOperatingProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cash Closing */}
      {activeTab === 'cash_closing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Cash Drawer Closing & Reconciliation</h3>
              <p className="text-xs text-slate-500">Physical drawer cash balance for Captain Air International</p>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Date: {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900">{acc.name}</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {acc.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Opening Balance:</span>
                  <span className="font-bold font-mono">{formatBDT(acc.openingBalance)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2 font-black text-slate-900">
                  <span>Current Closing Balance:</span>
                  <span className="text-base text-purple-700">{formatBDT(acc.currentBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Expenses Breakdown */}
      {activeTab === 'expenses_breakdown' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">
            Expenditure Distribution by Head — {periodLabels[period]}
          </h3>

          <div className="space-y-3">
            {expenseByCategory.map(([cat, amt]) => {
              const pct = totalOperatingExpenses > 0 ? (amt / totalOperatingExpenses) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-rose-600 font-mono">
                      {formatBDT(amt)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Liquidity */}
      {activeTab === 'liquidity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Liquidity & Capital Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {accounts.map(a => (
              <div key={a.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{a.type}</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{a.name}</div>
                <div className="text-xl font-black text-slate-900 mt-2">{formatBDT(a.currentBalance)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
