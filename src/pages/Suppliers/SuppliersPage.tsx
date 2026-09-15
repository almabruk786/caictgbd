import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Supplier, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import {
  Building2,
  PlusCircle,
  Search,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { suppliers, accounts, addSupplier, updateSupplier, paySupplier, settings } = useAppData();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Pay Form State
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || 'acc-cash');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');

  const totalPayable = useMemo(() => suppliers.reduce((s, sup) => s + sup.totalPayable, 0), [suppliers]);
  const totalPurchasesVolume = useMemo(() => suppliers.reduce((s, sup) => s + sup.totalPurchases, 0), [suppliers]);

  const filtered = useMemo(() => {
    if (!search) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.supplierId.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) return;

    addSupplier(supplierForm);
    setIsNewModalOpen(false);
    setSupplierForm({
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
  };

  const handleOpenPay = (s: Supplier) => {
    setSelectedSupplier(s);
    setPayAmount(String(s.totalPayable));
    setIsPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) return;

    paySupplier({
      supplierId: selectedSupplier.id,
      amount: amt,
      accountId: payAccountId,
      paymentMethod: payMethod,
      date: new Date().toISOString().split('T')[0],
      notes: `Supplier settlement disbursement for ${selectedSupplier.name}`,
    });

    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            Airline Partners & Wholesalers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage B2B ticketing vendors, airline consolidators, and disburse payable dues
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Wholesalers & Airlines
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{suppliers.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-blue-600">B2B Partners</span>
            <span className="text-[10px] text-slate-400 font-mono">Vendors</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Outstanding Payables
          </span>
          <div className="text-2xl font-black text-rose-600 tracking-tight">{formatBDT(totalPayable)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-rose-600">
              {suppliers.filter(s => s.totalPayable > 0).length} Unsettled Vendors
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Payables</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Inventory / Ticket Purchases
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(totalPurchasesVolume)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-emerald-600">Purchased Volume</span>
            <span className="text-[10px] text-slate-400 font-mono">Turnover</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier by name, company, phone, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Supplier List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-slate-200" />
            <p className="font-bold text-sm text-slate-600">No airline suppliers recorded</p>
            <p className="text-xs text-slate-400 mt-1">Add your B2B flight wholesalers and airline portals</p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Add First Supplier →
            </button>
          </div>
        ) : (
          filtered.map(s => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {s.supplierId}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{s.name}</h3>
                  {s.company && <span className="text-xs text-slate-500 font-semibold">{s.company}</span>}
                </div>

                {s.totalPayable > 0 ? (
                  <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                    {formatBDT(s.totalPayable)} Payable
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ● Settled
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Purchases</span>
                  <div className="text-sm font-black text-slate-900">{formatBDT(s.totalPurchases)}</div>
                </div>

                {s.totalPayable > 0 && (
                  <button
                    onClick={() => handleOpenPay(s)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all hover:scale-105"
                  >
                    Pay Supplier
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Supplier */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Add New Supplier</h2>
                  <p className="text-xs text-slate-500">Record airline vendor / B2B wholesaler</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Supplier / Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Biman Bangladesh Airlines or Sabre Vendor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={supplierForm.company}
                  onChange={e => setSupplierForm({ ...supplierForm, company: e.target.value })}
                  placeholder="e.g. Biman Head Office"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Mobile / Phone
                  </label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="01700000000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="sales@vendor.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Address
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="e.g. Agrabad, Chittagong"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Supplier */}
      {isPayModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Pay Supplier: {selectedSupplier.name}</h2>
                  <p className="text-xs text-slate-500">Disburse payable from office cash/bank</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
                <span className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wider block">Total Outstanding Payable</span>
                <div className="text-2xl font-black text-rose-900">{formatBDT(selectedSupplier.totalPayable)}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Payment Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  max={selectedSupplier.totalPayable}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Pay From Account</label>
                  <select
                    value={payAccountId}
                    onChange={e => setPayAccountId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatBDT(acc.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="BKASH">bKash</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/25 transition-all hover:scale-105"
                >
                  Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
