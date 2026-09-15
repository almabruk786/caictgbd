import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { IncomeEntry, IncomeCategory, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { printSingleVoucher, printReport } from '../../utils/print';
import { downloadVoucherPDF, downloadStatementPDF } from '../../utils/pdfExport';
import {
  PlusCircle,
  TrendingUp,
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

const CATEGORIES: IncomeCategory[] = [
  'Owner Capital / Deposit',
  'Ticket Commission',
  'Service Charge',
  'Visa Processing',
  'Travel Package',
  'Hotel Commission',
  'Insurance',
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
  category: 'Service Charge' as IncomeCategory,
  description: '',
  amount: '' as number | '',
  paymentMethod: 'CASH' as PaymentMethod,
  reference: '',
  notes: '',
});

export const IncomePage: React.FC = () => {
  const { income, accounts, addIncome, settings } = useAppData();

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

  // Derived available years
  const availableYears = useMemo(() => {
    const yrs = new Set(income.map(i => i.date.slice(0, 4)));
    const cur = new Date().getFullYear().toString();
    yrs.add(cur);
    return Array.from(yrs).sort().reverse();
  }, [income]);

  const totalIncome = useMemo(() => income.reduce((s, i) => s + i.amount, 0), [income]);

  // Filtered List
  const filtered = useMemo(() => {
    let list = [...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.description.toLowerCase().includes(q) ||
          i.voucherNo.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.reference || '').toLowerCase().includes(q) ||
          i.date.includes(q)
      );
    }
    if (filterCategory !== 'ALL') list = list.filter(i => i.category === filterCategory);
    if (filterMethod !== 'ALL') list = list.filter(i => i.paymentMethod === filterMethod);
    if (filterDateFrom) list = list.filter(i => i.date >= filterDateFrom);
    if (filterDateTo) list = list.filter(i => i.date <= filterDateTo);
    if (filterMonth) list = list.filter(i => i.date.slice(5, 7) === filterMonth);
    if (filterYear) list = list.filter(i => i.date.slice(0, 4) === filterYear);

    return list;
  }, [income, search, filterCategory, filterMethod, filterDateFrom, filterDateTo, filterMonth, filterYear]);

  const filteredTotal = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered]);
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
      setSelectedIds(filtered.map(i => i.id));
    }
  };

  const selectedItems = useMemo(
    () => filtered.filter(i => selectedIds.includes(i.id)),
    [filtered, selectedIds]
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((s, i) => s + i.amount, 0),
    [selectedItems]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    addIncome({ ...formData, amount: Number(formData.amount), accountId: accounts[0]?.id || 'acc-cash' });
    setIsModalOpen(false);
    setFormData(defaultForm());
  };

  const exportCSV = () => {
    const dataToExport = selectedItems.length > 0 ? selectedItems : filtered;
    const rows = [
      ['Voucher No', 'Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference'],
      ...dataToExport.map(i => [
        i.voucherNo,
        i.date,
        i.category,
        `"${i.description}"`,
        i.amount,
        i.paymentMethod,
        i.reference || '',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Captain_Air_Income_${new Date().toISOString().split('T')[0]}.csv`;
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
    if (hasActiveFilter) return 'Filtered Income Records';
    return 'All Records';
  };

  const handleDownloadPDF = () => {
    const dataToDownload = selectedItems.length > 0 ? selectedItems : filtered;
    downloadStatementPDF(dataToDownload, 'income', getFilterDateLabel(), settings);
  };

  const handlePrint = () => {
    const dataToPrint = selectedItems.length > 0 ? selectedItems : filtered;
    printReport(dataToPrint, 'income', getFilterDateLabel(), settings);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/30 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            Income Ledger & Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search by date, tick custom rows, and download/print selected entries
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Income',
            value: formatBDT(totalIncome),
            sub: `${income.length} total entries`,
            color: 'from-emerald-600 to-emerald-500',
          },
          {
            label: 'Filtered Amount',
            value: formatBDT(filteredTotal),
            sub: `${filtered.length} entries matching`,
            color: 'from-slate-800 to-slate-700',
          },
          {
            label: 'Average Entry',
            value: filtered.length > 0 ? formatBDT(Math.round(filteredTotal / filtered.length)) : '৳0',
            sub: 'Per voucher average',
            color: 'from-blue-600 to-blue-500',
          },
          {
            label: 'Peak Inflow',
            value: filtered.length > 0 ? formatBDT(Math.max(...filtered.map(i => i.amount))) : '৳0',
            sub: 'Largest single voucher',
            color: 'from-teal-600 to-teal-500',
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50 placeholder:text-slate-400"
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
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
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
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              More Filters
              {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
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
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="ALL">All Categories</option>
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
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
        <div className="bg-emerald-900 text-white px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fade-in border border-emerald-700">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-sm">
                {selectedItems.length} Voucher{selectedItems.length !== 1 ? 's' : ''} Selected
              </span>
              <span className="text-xs text-emerald-300 ml-2">Total: {formatBDT(selectedTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Selected ({selectedItems.length}) PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-800" />
              Print Selected ({selectedItems.length})
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-emerald-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Income Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700"
              title="Select / Deselect all visible rows"
            >
              {selectedIds.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All</span>
            </button>

            <span className="text-slate-300">|</span>

            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {filtered.length} Income Record{filtered.length !== 1 ? 's' : ''}
            </span>

            {hasActiveFilter && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
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
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-3.5 font-bold uppercase tracking-wider text-[10px]">#</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Voucher No</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Particulars</th>
                <th className="text-left px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Method</th>
                <th className="text-right px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="text-center px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="font-bold text-sm text-slate-600">No income records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your date range or add a new voucher</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                    >
                      Add First Income Voucher →
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
                        isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-emerald-50/40'
                      }`}
                    >
                      <td className="text-center px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
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
                        {item.reference && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {item.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {item.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-sm text-emerald-600 whitespace-nowrap">
                        +{formatBDT(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Download Single Voucher PDF */}
                          <button
                            onClick={() => downloadVoucherPDF(item, 'income', settings)}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 border border-sky-100 transition-all"
                            title="Download Single Voucher PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Single Voucher */}
                          <button
                            onClick={() => printSingleVoucher(item, 'income', settings)}
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
                <tr className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
                  <td colSpan={7} className="px-4 py-3.5 font-bold uppercase tracking-wider text-xs">
                    {selectedItems.length > 0
                      ? `Selected Total (${selectedItems.length} Entries)`
                      : `Grand Total (${filtered.length} Entries)`}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-base">
                    +{formatBDT(selectedItems.length > 0 ? selectedTotal : filteredTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Add Income Entry</h2>
                  <p className="text-xs text-slate-500">Record a new income voucher</p>
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as IncomeCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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
                  placeholder="e.g. Visa processing fee for 2 applicants"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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
                  placeholder="Invoice # or bill reference"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
                >
                  Save Income Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
