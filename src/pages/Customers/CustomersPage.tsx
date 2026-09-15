import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Customer, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import {
  Users,
  PlusCircle,
  Search,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, accounts, addCustomer, updateCustomer, collectCustomerDue, settings } = useAppData();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    passportNumber: '',
    nid: '',
    notes: '',
  });

  // Due Form State
  const [dueAmount, setDueAmount] = useState('');
  const [dueAccountId, setDueAccountId] = useState(accounts[0]?.id || 'acc-cash');
  const [dueMethod, setDueMethod] = useState<PaymentMethod>('CASH');

  const totalDueReceivable = useMemo(() => customers.reduce((s, c) => s + c.totalDue, 0), [customers]);
  const totalCustomerVolume = useMemo(() => customers.reduce((s, c) => s + c.totalPurchases, 0), [customers]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.passportNumber || '').toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return;

    addCustomer(customerForm);
    setIsNewModalOpen(false);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      passportNumber: '',
      nid: '',
      notes: '',
    });
  };

  const handleOpenCollectDue = (c: Customer) => {
    setSelectedCustomer(c);
    setDueAmount(String(c.totalDue));
    setIsDueModalOpen(true);
  };

  const handleSaveDueCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = Number(dueAmount) || 0;
    if (amt <= 0) return;

    collectCustomerDue({
      customerId: selectedCustomer.id,
      amount: amt,
      accountId: dueAccountId,
      paymentMethod: dueMethod,
      date: new Date().toISOString().split('T')[0],
      notes: `Direct customer due settlement for ${selectedCustomer.name}`,
    });

    setIsDueModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white">
              <Users className="w-5 h-5" />
            </div>
            Customer & Passenger Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage passenger contact profiles, passport details, and collect outstanding dues
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Registered Customers
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{customers.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-indigo-600">Active Profiles</span>
            <span className="text-[10px] text-slate-400 font-mono">CRM</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Passenger Dues
          </span>
          <div className="text-2xl font-black text-amber-600 tracking-tight">{formatBDT(totalDueReceivable)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-amber-600">
              {customers.filter(c => c.totalDue > 0).length} with Unsettled Dues
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Receivables</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Customer Lifetime Sales
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(totalCustomerVolume)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-emerald-600">Total Booking Turnover</span>
            <span className="text-[10px] text-slate-400 font-mono">Sales</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, mobile number, passport number, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Customer List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-200" />
            <p className="font-bold text-sm text-slate-600">No customer records found</p>
            <p className="text-xs text-slate-400 mt-1">Add your frequent travelers and corporate clients</p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Add First Customer →
            </button>
          </div>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {c.customerId}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{c.name}</h3>
                </div>

                {c.totalDue > 0 ? (
                  <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                    {formatBDT(c.totalDue)} Due
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ● Cleared
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{c.phone}</span>
                </div>
                {c.passportNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-700">Passport: {c.passportNumber}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                  <div className="text-sm font-black text-slate-900">{formatBDT(c.totalPurchases)}</div>
                </div>

                {c.totalDue > 0 && (
                  <button
                    onClick={() => handleOpenCollectDue(c)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/25 transition-all hover:scale-105"
                  >
                    Collect Due
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Customer */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Add New Customer</h2>
                  <p className="text-xs text-slate-500">Record traveler contact & passport</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. Mohammad Rahim"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="01812345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Passport No
                  </label>
                  <input
                    type="text"
                    value={customerForm.passportNumber}
                    onChange={e => setCustomerForm({ ...customerForm, passportNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. A01234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="e.g. rahim@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Address
                </label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="e.g. GEC Circle, Chittagong"
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
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Collect Due */}
      {isDueModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Collect Due: {selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-500">Record money receipt into office drawer/bank</p>
                </div>
              </div>
              <button
                onClick={() => setIsDueModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDueCollection} className="p-6 space-y-4">
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                <span className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider block">Total Outstanding Due</span>
                <div className="text-2xl font-black text-amber-900">{formatBDT(selectedCustomer.totalDue)}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Payment Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  max={selectedCustomer.totalDue}
                  value={dueAmount}
                  onChange={e => setDueAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Deposit To</label>
                  <select
                    value={dueAccountId}
                    onChange={e => setDueAccountId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Method</label>
                  <select
                    value={dueMethod}
                    onChange={e => setDueMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDueModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/25 transition-all hover:scale-105"
                >
                  Record Money Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
