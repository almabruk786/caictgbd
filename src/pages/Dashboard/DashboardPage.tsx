import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Calendar,
  Printer,
  FileDown,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Wallet,
  HandCoins,
  Sliders,
  X,
  Building2,
  Smartphone,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { printSingleVoucher, printReport, printFundingVoucher } from '../../utils/print';
import { downloadVoucherPDF, downloadStatementPDF, downloadFundingPDF } from '../../utils/pdfExport';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
}

type TimeFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear';
type ChartViewTab = 'cashflow' | 'profit';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    income,
    expenses,
    accounts,
    ownerFunds,
    updateAccountBalance,
    settings,
  } = useAppData();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [chartTab, setChartViewTab] = useState<ChartViewTab>('cashflow');
  const [recentSearch, setRecentSearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'FUNDING'>('ALL');

  // Quick Drawer Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [newCashInput, setNewCashInput] = useState('0');
  const [cashNotes, setCashNotes] = useState('');

  // Primary Office Cash Account
  const officeCashAccount = useMemo(() => {
    return accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash') || accounts[0];
  }, [accounts]);

  // 1. Date Range Filtering for Metrics
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curYear = now.getFullYear().toString();
    const curMonthStr = `${curYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // Calculate this week's start (Monday)
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const mondayStr = monday.toISOString().split('T')[0];

    let inc = [...income];
    let exp = [...expenses];
    let fnd = [...ownerFunds];

    if (timeFilter === 'today') {
      inc = inc.filter(i => i.date === todayStr);
      exp = exp.filter(e => e.date === todayStr);
      fnd = fnd.filter(f => f.date === todayStr);
    } else if (timeFilter === 'thisWeek') {
      inc = inc.filter(i => i.date >= mondayStr && i.date <= todayStr);
      exp = exp.filter(e => e.date >= mondayStr && e.date <= todayStr);
      fnd = fnd.filter(f => f.date >= mondayStr && f.date <= todayStr);
    } else if (timeFilter === 'thisMonth') {
      inc = inc.filter(i => i.date.startsWith(curMonthStr));
      exp = exp.filter(e => e.date.startsWith(curMonthStr));
      fnd = fnd.filter(f => f.date.startsWith(curMonthStr));
    } else if (timeFilter === 'lastMonth') {
      inc = inc.filter(i => i.date.startsWith(lastMonthStr));
      exp = exp.filter(e => e.date.startsWith(lastMonthStr));
      fnd = fnd.filter(f => f.date.startsWith(lastMonthStr));
    } else if (timeFilter === 'thisYear') {
      inc = inc.filter(i => i.date.startsWith(curYear));
      exp = exp.filter(e => e.date.startsWith(curYear));
      fnd = fnd.filter(f => f.date.startsWith(curYear));
    }

    return { inc, exp, fnd };
  }, [income, expenses, ownerFunds, timeFilter]);

  // Aggregated KPIs
  const totalIncome = useMemo(() => filteredData.inc.reduce((s, i) => s + i.amount, 0), [filteredData.inc]);
  const totalExpenses = useMemo(() => filteredData.exp.reduce((s, e) => s + e.amount, 0), [filteredData.exp]);
  const netOperationalProfit = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  // Total Combined Cash Liquidity across all accounts
  const officeCashBalance = useMemo(() => officeCashAccount?.currentBalance || 0, [officeCashAccount]);

  // Arif Vai Funding KPIs (All time vs Filtered)
  const fundingReceived = useMemo(() => {
    return ownerFunds.filter(f => f.type === 'INJECTION').reduce((s, f) => s + f.amount, 0);
  }, [ownerFunds]);

  const fundingReturned = useMemo(() => {
    return ownerFunds.filter(f => f.type === 'WITHDRAWAL').reduce((s, f) => s + f.amount, 0);
  }, [ownerFunds]);

  const netFundingBalance = fundingReceived - fundingReturned;

  // Monthly Chart Trends
  const chartData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};

    income.forEach(i => {
      const m = i.date.slice(0, 7);
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      map[m].income += i.amount;
    });

    expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      map[m].expense += e.amount;
    });

    const sortedMonths = Object.keys(map).sort();
    if (sortedMonths.length === 0) {
      return [{ month: 'Current', income: 0, expense: 0, net: 0 }];
    }

    return sortedMonths.map(m => {
      const [y, mon] = m.split('-');
      const d = new Date(parseInt(y), parseInt(mon) - 1, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const inc = map[m].income;
      const exp = map[m].expense;
      return {
        month: label,
        income: inc,
        expense: exp,
        net: inc - exp,
      };
    });
  }, [income, expenses]);

  // Expense Categories Breakdown
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.exp.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData.exp]);

  // Combined Activity for Live Feed
  const combinedActivity = useMemo(() => {
    const list: any[] = [
      ...income.map(i => ({ ...i, _feedType: 'income' as const })),
      ...expenses.map(e => ({ ...e, _feedType: 'expense' as const })),
      ...ownerFunds.map(f => ({
        id: f.id,
        voucherNo: f.referenceNo,
        date: f.date,
        category: 'Arif Vai Funding',
        description: f.type === 'INJECTION' ? `Fund In: ${f.notes || 'Deposit'}` : `Fund Out: ${f.notes || 'Repaid'}`,
        amount: f.amount,
        paymentMethod: f.paymentMethod,
        _feedType: 'funding' as const,
        _fundRaw: f,
      })),
    ];

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let res = list;
    if (activityTypeFilter !== 'ALL') {
      res = res.filter(item => {
        if (activityTypeFilter === 'INCOME') return item._feedType === 'income';
        if (activityTypeFilter === 'EXPENSE') return item._feedType === 'expense';
        if (activityTypeFilter === 'FUNDING') return item._feedType === 'funding';
        return true;
      });
    }

    if (recentSearch.trim()) {
      const q = recentSearch.toLowerCase().trim();
      res = res.filter(
        item =>
          item.description?.toLowerCase().includes(q) ||
          item.voucherNo?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          (item.reference || '').toLowerCase().includes(q) ||
          item.amount?.toString().includes(q)
      );
    }

    return res.slice(0, 10);
  }, [income, expenses, ownerFunds, activityTypeFilter, recentSearch]);

  const timeFilterLabels: Record<TimeFilter, string> = {
    all: 'All Time',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
  };

  const handleDownloadFullPDF = () => {
    const all = [
      ...income.map(i => ({ ...i, _t: 'income' as const })),
      ...expenses.map(e => ({ ...e, _t: 'expense' as const })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    downloadStatementPDF(all as any, 'combined', `${timeFilterLabels[timeFilter]} Executive Summary`, settings);
  };

  const handlePrintFullReport = () => {
    const all = [
      ...income.map(i => ({ ...i, _t: 'income' as const })),
      ...expenses.map(e => ({ ...e, _t: 'expense' as const })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    printReport(all as any, 'combined', `${timeFilterLabels[timeFilter]} Statement`, settings);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────────────────
          1. COMPACT SMALL PREMIUM HEADER BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-3.5 shadow-lg border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-brand-500/30 shrink-0">
            <span className="font-black text-sm">CA</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black tracking-tight text-white font-sans leading-none">
                {settings?.companyName || 'Captain Air International'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live ERP</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Financial Management Cockpit • Real-time Cash & Revenue Intelligence
            </p>
          </div>
        </div>

        {/* Right: Sleek Action Buttons Hub */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('income')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => onNavigate('funding')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Arif Vai Funding</span>
          </button>

          <button
            onClick={() => {
              setNewCashInput(String(officeCashBalance));
              setCashNotes('');
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105"
            title="Adjust Cash in Hand"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Cash</span>
          </button>

          <button
            onClick={handlePrintFullReport}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl text-xs transition-all hover:scale-105"
            title="Print Statement"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownloadFullPDF}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl text-xs transition-all hover:scale-105"
            title="Download PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-300" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. ACCOUNTING PERIOD FILTER BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
            Period:
          </span>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            {timeFilterLabels[timeFilter]}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'today', 'thisWeek', 'thisMonth', 'lastMonth', 'thisYear'] as TimeFilter[]).map(key => (
            <button
              key={key}
              onClick={() => setTimeFilter(key)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                timeFilter === key
                  ? 'bg-slate-900 text-white shadow-xs scale-102'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {timeFilterLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. 5 HIGH-IMPACT VIBRANT COLORFUL CARDS (BALANCED WIDTH & NO OVERFLOW)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* CARD 1: INFLOW (EMERALD) */}
        <div
          onClick={() => onNavigate('income')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/15 hover:shadow-lg hover:shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
              Total Inflow
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl xl:text-2xl font-black tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis my-1">
            {formatBDT(totalIncome)}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10.5px] font-semibold text-emerald-100">
            <span className="flex items-center gap-1 truncate">
              <ArrowUpRight className="w-3 h-3" />
              {filteredData.inc.length} entries
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9.5px] font-bold shrink-0">
              + Inflow
            </span>
          </div>
        </div>

        {/* CARD 2: OUTFLOW (ROSE) */}
        <div
          onClick={() => onNavigate('expenses')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white shadow-md shadow-rose-600/15 hover:shadow-lg hover:shadow-rose-600/25 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">
              Total Outflow
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl xl:text-2xl font-black tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis my-1">
            {formatBDT(totalExpenses)}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10.5px] font-semibold text-rose-100">
            <span className="flex items-center gap-1 truncate">
              <ArrowDownLeft className="w-3 h-3" />
              {filteredData.exp.length} expenses
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9.5px] font-bold shrink-0">
              - Outflow
            </span>
          </div>
        </div>

        {/* CARD 3: NET POSITION (ELECTRIC INDIGO) */}
        <div
          onClick={() => onNavigate('reports')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 text-white shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-100">
              Net Position
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl xl:text-2xl font-black tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis my-1">
            {formatBDT(netOperationalProfit)}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10.5px] font-semibold text-indigo-100">
            <span className="truncate">
              {netOperationalProfit >= 0 ? '● Surplus' : '● Deficit'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9.5px] font-bold shrink-0">
              {timeFilterLabels[timeFilter]}
            </span>
          </div>
        </div>

        {/* CARD 4: CASH IN HAND (PURPLE CYBER WITH ADJUST) */}
        <div
          onClick={() => {
            setNewCashInput(String(officeCashBalance));
            setCashNotes('');
            setIsAdjustModalOpen(true);
          }}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-950 text-white shadow-md shadow-purple-700/20 hover:shadow-lg hover:shadow-purple-700/30 transition-all duration-200 hover:-translate-y-1 cursor-pointer group border border-purple-400/20 flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-200">
              Cash in Hand
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-purple-200 border border-white/20">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl xl:text-2xl font-black tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis my-1">
            {formatBDT(officeCashBalance)}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10.5px] font-semibold text-purple-200">
            <span className="truncate">Office Drawer</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-400/30 text-white text-[9.5px] font-bold group-hover:bg-white group-hover:text-purple-900 transition-colors shrink-0">
              Adjust ⚙️
            </span>
          </div>
        </div>

        {/* CARD 5: ARIF VAI FUNDING (GOLD / AMBER) */}
        <div
          onClick={() => onNavigate('funding')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-white shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">
              Arif Vai Funding
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <HandCoins className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-xl xl:text-2xl font-black tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis my-1">
            {formatBDT(netFundingBalance)}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10.5px] font-semibold text-amber-100">
            <span className="truncate">Active Capital</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9.5px] font-bold shrink-0">
              Manage 🤝
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. INTERACTIVE FINANCIAL CHART & DRAWER BALANCES
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cash Flow Trends Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Cash Flow Intelligence</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Chronological revenue streams vs operating expenses</p>
            </div>

            {/* Chart View Toggle Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setChartViewTab('cashflow')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartTab === 'cashflow' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Inflow/Outflow
              </button>
              <button
                onClick={() => setChartViewTab('profit')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartTab === 'profit' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Net Margins
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'cashflow' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="geminiInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="geminiExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={val => `৳${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      formatBDT(value),
                      name === 'income' ? 'Revenue (Inflow)' : 'Expenses (Outflow)',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '14px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="income"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#geminiInc)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="expense"
                    stroke="#E11D48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#geminiExp)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={val => `৳${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatBDT(value), 'Net Margin']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '14px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="net" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Inflow (৳)
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Outflow (৳)
              </span>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <span>Full Statements</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Multi-Wallet Balances & Top Expense Heads (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Multi-Wallet Balances Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black text-slate-900">Active Accounts</h3>
              </div>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-[10.5px] font-bold text-purple-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {accounts.slice(0, 3).map(acc => {
                const isCash = acc.type === 'OFFICE_CASH' || acc.id === 'acc-cash';
                const isBank = acc.type === 'BANK';

                return (
                  <div
                    key={acc.id}
                    onClick={() => onNavigate('accounts')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCash ? 'bg-purple-100 text-purple-700' : isBank ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {isCash ? <Wallet className="w-3.5 h-3.5" /> : isBank ? <Building2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{acc.name}</h4>
                        <span className="text-[9.5px] text-slate-400 uppercase font-mono">{acc.type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="text-right font-black text-xs text-slate-900">
                      {formatBDT(acc.currentBalance)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Categories Breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-600" />
                <h3 className="text-xs font-black text-slate-900">Top Expenses</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-bold">{filteredData.exp.length} items</span>
            </div>

            {expenseByCategory.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">No expenses in this period</div>
            ) : (
              <div className="space-y-2">
                {expenseByCategory.slice(0, 3).map((item, idx) => {
                  const pct = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0;
                  const barColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500'];
                  return (
                    <div key={item.cat}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 truncate">{item.cat}</span>
                        <span className="font-extrabold text-slate-900">{formatBDT(item.total)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColors[idx % barColors.length]} rounded-full`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. LIVE RECENT ACCOUNTING STREAM
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Live Transaction Stream</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instant audit ledger — 1-click voucher print & PDF download
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
              {(['ALL', 'INCOME', 'EXPENSE', 'FUNDING'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActivityTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activityTypeFilter === t ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={recentSearch}
                onChange={e => setRecentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        {combinedActivity.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
            No transactions match your search filter
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="text-left px-3 py-2.5">Voucher #</th>
                  <th className="text-left px-3 py-2.5">Date</th>
                  <th className="text-left px-3 py-2.5">Category</th>
                  <th className="text-left px-3 py-2.5">Description</th>
                  <th className="text-left px-3 py-2.5">Method</th>
                  <th className="text-right px-3 py-2.5">Amount</th>
                  <th className="text-center px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {combinedActivity.map(item => {
                  const isInflow = item._feedType === 'income' || (item._feedType === 'funding' && item._fundRaw?.type === 'INJECTION');
                  const isFunding = item._feedType === 'funding';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-3 py-2.5 font-mono font-bold text-[11px] text-slate-700">
                        {item.voucherNo}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 font-medium whitespace-nowrap">
                        {formatDateDisplay(item.date)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isFunding ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          isInflow ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900 max-w-[220px] truncate">{item.description}</div>
                        {item.reference && (
                          <div className="text-[9.5px] text-slate-400 font-mono">Ref: {item.reference}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 font-semibold uppercase text-[9.5px]">
                        {(item.paymentMethod || 'CASH').replace(/_/g, ' ')}
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-xs whitespace-nowrap">
                        <span className={isInflow ? 'text-emerald-600' : 'text-rose-600'}>
                          {isInflow ? '+' : '-'}
                          {formatBDT(item.amount)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          {isFunding && item._fundRaw ? (
                            <>
                              <button
                                onClick={() => downloadFundingPDF(item._fundRaw, settings)}
                                className="p-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                title="Download PDF"
                              >
                                <FileDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => printFundingVoucher(item._fundRaw, settings)}
                                className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Print Voucher"
                              >
                                <Printer className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => downloadVoucherPDF(item, item._feedType === 'income' ? 'income' : 'expense', settings)}
                                className="p-1 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                                title="Download PDF"
                              >
                                <FileDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => printSingleVoucher(item, item._feedType === 'income' ? 'income' : 'expense', settings)}
                                className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Print Voucher"
                              >
                                <Printer className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. QUICK CASH IN HAND ADJUSTMENT MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Adjust Cash in Hand</h2>
                  <p className="text-[11px] text-slate-500">Correct active office drawer balance</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (officeCashAccount) {
                  updateAccountBalance(
                    officeCashAccount.id,
                    Number(newCashInput) || 0,
                    cashNotes || 'Manual Cash in Hand adjustment'
                  );
                }
                setIsAdjustModalOpen(false);
              }}
              className="p-5 space-y-3.5"
            >
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Current Drawer Balance
                </span>
                <div className="text-xl font-black text-slate-900">
                  {formatBDT(officeCashBalance)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  New Exact Cash (৳) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={newCashInput}
                    onChange={e => setNewCashInput(e.target.value)}
                    placeholder="0"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCashInput('0')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                  >
                    Set ৳0
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={cashNotes}
                  onChange={e => setCashNotes(e.target.value)}
                  placeholder="e.g. Physical count verification"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/25 transition-all"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
