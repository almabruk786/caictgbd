import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { OwnerFundEntry, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { printFundingVoucher, printFundingStatement } from '../../utils/print';
import { downloadFundingPDF, downloadFundingStatementPDF } from '../../utils/pdfExport';
import {
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Search,
  Printer,
  FileDown,
  Calendar,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface FundingPageProps {
  onNavigate?: (module: string) => void;
}

type PeriodFilter = 'all' | 'today' | 'thisMonth' | 'lastMonth' | 'thisYear';
type TypeFilter = 'ALL' | 'INJECTION' | 'WITHDRAWAL';

export const FundingPage: React.FC<FundingPageProps> = () => {
  const { ownerFunds, accounts, addOwnerFund, deleteOwnerFund, settings } = useAppData();

  // Filters & Search
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    type: 'INJECTION' | 'WITHDRAWAL';
    amount: string;
    date: string;
    accountId: string;
    paymentMethod: PaymentMethod;
    notes: string;
  }>({
    type: 'INJECTION',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    accountId: accounts[0]?.id || 'acc-cash',
    paymentMethod: 'CASH',
    notes: '',
  });

  // Target Account for balance preview
  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.id === formData.accountId) || accounts[0];
  }, [accounts, formData.accountId]);

  // Cash in Hand Account
  const cashAccount = useMemo(() => {
    return accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash') || accounts[0];
  }, [accounts]);

  // Period Labels
  const periodLabels: Record<PeriodFilter, string> = {
    all: 'All Time',
    today: 'Today',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year (2026)',
  };

  // Filtered entries
  const filteredFunds = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curYear = now.getFullYear().toString();
    const curMonthStr = `${curYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let list = [...ownerFunds];

    // Period filter
    if (periodFilter === 'today') {
      list = list.filter(f => f.date === todayStr);
    } else if (periodFilter === 'thisMonth') {
      list = list.filter(f => f.date.startsWith(curMonthStr));
    } else if (periodFilter === 'lastMonth') {
      list = list.filter(f => f.date.startsWith(lastMonthStr));
    } else if (periodFilter === 'thisYear') {
      list = list.filter(f => f.date.startsWith(curYear));
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      list = list.filter(f => f.type === typeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        f =>
          f.referenceNo.toLowerCase().includes(q) ||
          f.notes.toLowerCase().includes(q) ||
          (f.accountName || '').toLowerCase().includes(q) ||
          f.paymentMethod.toLowerCase().includes(q) ||
          f.amount.toString().includes(q)
      );
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [ownerFunds, periodFilter, typeFilter, searchQuery]);

  // Global KPIs (All Time vs Filtered)
  const totalReceived = useMemo(() => {
    return ownerFunds.filter(f => f.type === 'INJECTION').reduce((s, f) => s + f.amount, 0);
  }, [ownerFunds]);

  const totalReturned = useMemo(() => {
    return ownerFunds.filter(f => f.type === 'WITHDRAWAL').reduce((s, f) => s + f.amount, 0);
  }, [ownerFunds]);

  const netActiveBalance = totalReceived - totalReturned;

  // Open Modal Helpers
  const handleOpenAddModal = (type: 'INJECTION' | 'WITHDRAWAL') => {
    setFormData({
      type,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      accountId: cashAccount?.id || accounts[0]?.id || 'acc-cash',
      paymentMethod: 'CASH',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid funding amount greater than 0.');
      return;
    }

    addOwnerFund({
      date: formData.date,
      type: formData.type,
      amount: amountNum,
      accountId: formData.accountId,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
    });

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteOwnerFund(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handlePrintStatement = () => {
    printFundingStatement(filteredFunds, periodLabels[periodFilter], settings);
  };

  const handleDownloadPDFStatement = () => {
    downloadFundingStatementPDF(filteredFunds, periodLabels[periodFilter], settings);
  };

  // Live balance preview calculation
  const previewAmount = parseFloat(formData.amount) || 0;
  const currentAccBal = selectedAccount?.currentBalance || 0;
  const projectedAccBal =
    formData.type === 'INJECTION' ? currentAccBal + previewAmount : currentAccBal - previewAmount;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-700 border border-amber-500/20">
              Investor & Owner Capital
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-white">
              <HandCoins className="w-5 h-5" />
            </div>
            <span>Arif Vai Funding</span>
            <span className="text-slate-400 font-medium text-lg hidden sm:inline">(আরিফ ভাই ফান্ডিং)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record money received (+) from Arif Vai & payments returned (-). Reflects automatically in Office Cash in Hand.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenAddModal('INJECTION')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Receive from Arif Vai</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('WITHDRAWAL')}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>- Return to Arif Vai</span>
          </button>

          <button
            onClick={handleDownloadPDFStatement}
            className="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all hover:scale-105"
            title="Download PDF Statement"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrintStatement}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-105"
            title="Print Funding Statement"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Received */}
        <div
          onClick={() => setTypeFilter('INJECTION')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Received</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            +{formatBDT(totalReceived)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px]">
            <span className="text-slate-500 font-medium">
              {ownerFunds.filter(f => f.type === 'INJECTION').length} Deposits recorded
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
              Fund In
            </span>
          </div>
        </div>

        {/* Total Returned */}
        <div
          onClick={() => setTypeFilter('WITHDRAWAL')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Returned</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            -{formatBDT(totalReturned)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px]">
            <span className="text-slate-500 font-medium">
              {ownerFunds.filter(f => f.type === 'WITHDRAWAL').length} Repayments made
            </span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
              Fund Out
            </span>
          </div>
        </div>

        {/* Net Active Funding Balance */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Net Active Funding
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{formatBDT(netActiveBalance)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-amber-200/80 font-medium">
              {netActiveBalance >= 0 ? 'Arif Vai Active Capital' : 'Excess Repaid'}
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              Net Position
            </span>
          </div>
        </div>

        {/* Real-Time Cash in Hand */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash in Hand</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatBDT(cashAccount?.currentBalance || 0)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px]">
            <span className="text-purple-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auto Updated
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Office Drawer</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Entries ({ownerFunds.length})
          </button>
          <button
            onClick={() => setTypeFilter('INJECTION')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              typeFilter === 'INJECTION'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Received (+)
          </button>
          <button
            onClick={() => setTypeFilter('WITHDRAWAL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              typeFilter === 'WITHDRAWAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Returned (-)
          </button>
        </div>

        {/* Right side: Period selector + Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            {(['all', 'today', 'thisMonth', 'thisYear'] as PeriodFilter[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  periodFilter === p ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* 4. Funding Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">Arif Vai Funding Audit Ledger</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredFunds.length} Records)</span>
          </div>

          <div className="text-xs text-slate-500">
            All records directly impact the linked account ledger.
          </div>
        </div>

        {filteredFunds.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <HandCoins className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-sm font-bold text-slate-600">No Arif Vai Funding records found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click "+ Receive from Arif Vai" to record newly injected funds or "- Return to Arif Vai" to record repayments.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => handleOpenAddModal('INJECTION')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                + Record Fund Inflow
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="text-left px-4 py-3.5">Ref No</th>
                  <th className="text-left px-4 py-3.5">Date</th>
                  <th className="text-left px-4 py-3.5">Type</th>
                  <th className="text-left px-4 py-3.5">Linked Account</th>
                  <th className="text-left px-4 py-3.5">Payment Method</th>
                  <th className="text-left px-4 py-3.5">Particulars / Purpose</th>
                  <th className="text-right px-4 py-3.5">Amount (৳)</th>
                  <th className="text-center px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFunds.map(fund => {
                  const isInflow = fund.type === 'INJECTION';
                  return (
                    <tr key={fund.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                        {fund.referenceNo}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                        {formatDateDisplay(fund.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold ${
                            isInflow
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isInflow ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              <span>Received (+)</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              <span>Returned (-)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                          {fund.accountName || 'Office Cash'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">
                        {(fund.paymentMethod || 'CASH').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 max-w-[260px] truncate">
                          {fund.notes || 'Arif Vai Funding'}
                        </div>
                        <div className="text-[10px] text-slate-400">By: {fund.createdBy}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-sm whitespace-nowrap">
                        <span className={isInflow ? 'text-emerald-600' : 'text-rose-600'}>
                          {isInflow ? '+' : '-'}
                          {formatBDT(fund.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => printFundingVoucher(fund, settings)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Print Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => downloadFundingPDF(fund, settings)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
                            title="Download PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(fund.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete & Reverse Balance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* 5. Add / Record Funding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Record Arif Vai Funding</h3>
                  <p className="text-[11px] text-amber-200/80">
                    Automatic live balance update in Cash in Hand
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFund} className="p-6 space-y-4">
              {/* Type Toggle Tabs */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Funding Action Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INJECTION' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      formData.type === 'INJECTION'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Receive Money (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'WITHDRAWAL' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      formData.type === 'WITHDRAWAL'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-102'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Return Money (-)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Amount (৳ Taka) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-black border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Date & Linked Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Deposit/Draw Account
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (৳{acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="CASH">Cash in Hand</option>
                  <option value="BANK_TRANSFER">Bank Transfer / Cheque</option>
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Particulars / Purpose */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Purpose / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Working Capital deposit for Flight tickets, Office advance, or Repayment..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Real-Time Balance Effect Preview Box */}
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  formData.type === 'INJECTION'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Balance Impact ({selectedAccount?.name || 'Account'}):</span>
                  <span className={formData.type === 'INJECTION' ? 'text-emerald-700' : 'text-rose-700'}>
                    {formData.type === 'INJECTION' ? '+ ' : '- '}
                    {formatBDT(previewAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                  <span>Current: {formatBDT(currentAccBal)}</span>
                  <span>➔</span>
                  <span className="font-black font-mono">New Balance: {formatBDT(projectedAccBal)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 ${
                    formData.type === 'INJECTION'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  }`}
                >
                  Confirm & Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Funding Record?</h3>
            <p className="text-xs text-slate-500 mt-2">
              This will remove the transaction from the audit ledger and <strong>automatically reverse the balance impact</strong> on Cash in Hand / Account.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
              >
                Yes, Delete & Reverse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FundingPage;
