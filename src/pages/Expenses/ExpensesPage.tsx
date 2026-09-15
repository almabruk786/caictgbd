import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { ExpenseEntry, ExpenseCategory, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { printSingleVoucher, printReport } from '../../utils/print';
import { downloadVoucherPDF, downloadStatementPDF } from '../../utils/pdfExport';
import {
  PlusCircle,
  TrendingDown,
  X,
  Search,
  Download,
  Printer,
  FileDown,
  CalendarDays,
  Filter,
  ChevronDown,
  FileText,
  BarChart3,
  CheckSquare,
  Square,
  Calendar,
} from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Owner Withdrawal',
  'Bank Deposit / Transfer',
  'Office Rent',
  'Salary',
  'Electricity',
  'Internet',
  'Office Supplies',
  'Printer Ink',
  'Marketing',
  'Transport',
  'Food/Refreshment',
  'Maintenance',
  'Software',
  'Bank Charges',
  'Other',
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHEQUE', label: 'Cheque' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const defaultForm = () => ({
  date: new Date().toISOString().split('T')[0],
  category: 'Office Rent' as ExpenseCategory,
  description: '',
  amount: '' as number | '',
  paymentMethod: 'CASH' as PaymentMethod,
  reference: '',
  notes: '',
});

export const ExpensesPage: React.FC = () => {
  const { expenses, accounts, addExpense, settings } = useAppData();

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm());

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Selected Rows for custom multi-item download/print
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dropdown menus
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);

  const availableYears = useMemo(() => {
    const yrs = new Set(expenses.map(e => e.date.slice(0, 4)));
    const cur = new Date().getFullYear().toString();
    yrs.add(cur);
    return Array.from(yrs).sort().reverse();
  }, [expenses]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const filtered = useMemo(() => {
    let list = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        e =>
          e.description.toLowerCase().includes(q) ||
          e.voucherNo.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.reference || '').toLowerCase().includes(q) ||
          e.date.includes(q)
      );
    }
    if (filterCategory !== 'ALL') list = list.filter(e => e.category === filterCategory);
    if (filterMethod !== 'ALL') list = list.filter(e => e.paymentMethod === filterMethod);
    if (filterDateFrom) list = list.filter(e => e.date >= filterDateFrom);
    if (filterDateTo) list = list.filter(e => e.date <= filterDateTo);
    if (filterMonth) list = list.filter(e => e.date.slice(5, 7) === filterMonth);
    if (filterYear) list = list.filter(e => e.date.slice(0, 4) === filterYear);

    return list;
  }, [expenses, search, filterCategory, filterMethod, filterDateFrom, filterDateTo, filterMonth, filterYear]);

  const filteredTotal = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);
  const hasActiveFilter =
    Boolean(search) ||
    filterCategory !== 'ALL' ||
    Boolean(filterDateFrom) ||
    Boolean(filterDateTo) ||
    Boolean(filterMonth) ||
    Boolean(filterYear) ||
    filterMethod !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('ALL');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMonth('');
    setFilterYear('');
    setFilterMethod('ALL');
    setSelectedIds([]);
  };

  // Row selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(e => e.id));
    }
  };

  const selectedItems = useMemo(
    () => filtered.filter(e => selectedIds.includes(e.id)),
    [filtered, selectedIds]
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((s, e) => s + e.amount, 0),
    [selectedItems]
  );

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    const items = selectedItems.length > 0 ? selectedItems : filtered;
    items.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered, selectedItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    addExpense({
      ...formData,
      amount: Number(formData.amount),
      accountId: accounts[0]?.id || 'acc-cash',
      supplierId: '',
    });
    setIsModalOpen(false);
    setFormData(defaultForm());
  };

  const exportCSV = () => {
    const dataToExport = selectedItems.length > 0 ? selectedItems : filtered;
    const rows = [
      ['Voucher No', 'Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference'],
      ...dataToExport.map(e => [
        e.voucherNo,
        e.date,
        e.category,
        `"${e.description}"`,
        e.amount,
        e.paymentMethod,
        e.reference || '',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Captain_Air_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilterDateLabel = () => {
    if (selectedItems.length > 0) return `Selected (${selectedItems.length} Records)`;
    if (filterDateFrom && filterDateTo) {
      return filterDateFrom === filterDateTo
        ? `Date: ${filterDateFrom}`
        : `${filterDateFrom} to ${filterDateTo}`;
    }
    if (filterDateFrom) return `From ${filterDateFrom}`;
    if (filterDateTo) return `Up to ${filterDateTo}`;
    if (filterMonth && filterYear) return `${MONTHS[parseInt(filterMonth) - 1]} ${filterYear}`;
    if (filterMonth) return `Month ${filterMonth}`;
    if (filterYear) return `Year ${filterYear}`;
    if (hasActiveFilter) return 'Filtered Expense Records';
    return 'All Records';
  };

  const handleDownloadPDF = () => {
    const dataToDownload = selectedItems.length > 0 ? selectedItems : filtered;
    downloadStatementPDF(dataToDownload, 'expense', getFilterDateLabel(), settings);
  };

  const handlePrint = () => {
    const dataToPrint = selectedItems.length > 0 ? selectedItems : filtered;
    printReport(dataToPrint, 'expense', getFilterDateLabel(), settings);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-500/30 text-white">
              <TrendingDown className="w-5 h-5" />
            </div>
            Expense Ledger & Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search by date, tick custom rows, and download/print selected expense entries
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Expenses',
            value: formatBDT(totalExpenses),
            sub: `${expenses.length} total entries`,
            color: 'from-rose-600 to-rose-500',
          },
          {
            label: 'Filtered Amount',
            value: formatBDT(filteredTotal),
            sub: `${filtered.length} entries matching`,
            color: 'from-slate-800 to-slate-700',
          },
          {
            label: 'Average Expense',
            value: filtered.length > 0 ? formatBDT(Math.round(filteredTotal / filtered.length)) : '৳0',
            sub: 'Per voucher average',
            color: 'from-orange-600 to-orange-500',
          },
          {
            label: 'Peak Outflow',
            value: filtered.length > 0 ? formatBDT(Math.max(...filtered.map(e => e.amount))) : '৳0',
            sub: 'Largest single voucher',
            color: 'from-pink-600 to-pink-500',
          },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} p-4 rounded-2xl shadow-sm text-white`}>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{card.label}</span>
            <div className="text-lg font-black mt-1">{card.value}</div>
            <span className="text-[10px] text-white/60 font-medium">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Fast Date Selection & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by date (e.g. 2026-08-15), description, voucher no, category, ref..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 bg-slate-50 placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Date From & Date To Direct Pickers */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => {
                  setFilterDateFrom(e.target.value);
                  if (!filterDateTo) setFilterDateTo(e.target.value);
                }}
                className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none"
                title="Date From"
              />
              <span className="text-xs text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none"
                title="Date To"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              More Filters
              {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
            </button>

            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Year
              </label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="">All Years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Month
              </label>
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="">All Months</option>
                {MONTHS.map((m, idx) => (
                  <option key={m} value={String(idx + 1).padStart(2, '0')}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category Head
              </label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="ALL">All Expense Heads</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Channel
              </label>
              <select
                value={filterMethod}
                onChange={e => setFilterMethod(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="ALL">All Methods</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Selected Rows Action Banner */}
      {selectedItems.length > 0 && (
        <div className="bg-rose-950 text-white px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fade-in border border-rose-800">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-rose-400" />
            <div>
              <span className="font-bold text-sm">
                {selectedItems.length} Expense Voucher{selectedItems.length !== 1 ? 's' : ''} Selected
              </span>
              <span className="text-xs text-rose-300 ml-2">Total: {formatBDT(selectedTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Selected ({selectedItems.length}) PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white text-rose-950 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5 text-rose-800" />
              Print Selected ({selectedItems.length})
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Expense Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-rose-700"
              title="Select / Deselect all visible rows"
            >
              {selectedIds.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-rose-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All</span>
            </button>

            <span className="text-slate-300">|</span>

            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {filtered.length} Expense Record{filtered.length !== 1 ? 's' : ''}
            </span>

            {hasActiveFilter && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                {getFilterDateLabel()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all shadow-sm active:scale-95"
              title="Download PDF for current filtered view or selected rows"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF ({selectedItems.length > 0 ? selectedItems.length : filtered.length})
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
              title="Print current filtered view or selected rows"
            >
              <Printer className="w-3.5 h-3.5" />
              Print ({selectedItems.length > 0 ? selectedItems.length : filtered.length})
            </button>

            {/* CSV Export */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-10 text-center px-3 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 text-rose-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-3.5 font-bold uppercase tracking-wider text-[10px]">#</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Voucher No</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Particulars</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Ref / Bill</th>
                <th className="text-right px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="text-center px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <TrendingDown className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="font-bold text-sm text-slate-600">No expense records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your date range or record a new voucher</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/20"
                    >
                      Add First Expense Voucher →
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${
                        isSelected ? 'bg-rose-50/80 font-medium' : 'hover:bg-rose-50/40'
                      }`}
                    >
                      <td className="text-center px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-rose-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                          {item.voucherNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                        {formatDateDisplay(item.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 max-w-[240px] truncate">{item.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        {item.reference ? (
                          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold">
                            {item.reference}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-sm text-rose-600 whitespace-nowrap">
                        -{formatBDT(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Download Single Voucher PDF */}
                          <button
                            onClick={() => downloadVoucherPDF(item, 'expense', settings)}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 border border-sky-100 transition-all"
                            title="Download Single Voucher PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Single Voucher */}
                          <button
                            onClick={() => printSingleVoucher(item, 'expense', settings)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all"
                            title="Print Single Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gradient-to-r from-rose-700 to-rose-600 text-white">
                  <td colSpan={7} className="px-4 py-3.5 font-bold uppercase tracking-wider text-xs">
                    {selectedItems.length > 0
                      ? `Selected Total (${selectedItems.length} Entries)`
                      : `Grand Total (${filtered.length} Entries)`}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-base">
                    -{formatBDT(selectedItems.length > 0 ? selectedTotal : filteredTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Category Breakdown Panel */}
        {filtered.length > 0 && categoryBreakdown.length > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Expense Head Allocation ({selectedItems.length > 0 ? 'Selected' : 'Filtered'})
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryBreakdown.map(([cat, total]) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm"
                >
                  <span className="text-[11px] font-semibold text-slate-700">{cat}</span>
                  <span className="text-[11px] font-black text-rose-600">{formatBDT(total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Add Expense Entry</h2>
                  <p className="text-xs text-slate-500">Record a new expense voucher</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData(defaultForm());
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Description / Particulars *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Office rent for August 2026 or Dell Laptop"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Reference / Bill No (Optional)
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g. B-3633965 (from Ryans), Bill #, or memo"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData(defaultForm());
                  }}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-600/25 transition-all hover:scale-105"
                >
                  Save Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
