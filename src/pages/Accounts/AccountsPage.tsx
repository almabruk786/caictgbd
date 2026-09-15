import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Account, AccountType, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import {
  Wallet,
  HandCoins,
  Building2,
  Smartphone,
  PlusCircle,
  Edit3,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Printer,
  FileDown,
  X,
  CheckCircle2,
  RefreshCw,
  Sliders,
  CreditCard,
  Layers,
} from 'lucide-react';

interface AccountsPageProps {
  onNavigate?: (module: string) => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: any }[] = [
  { type: 'OFFICE_CASH', label: 'Office Cash Drawer', icon: Wallet },
  { type: 'BANK', label: 'Bank Account', icon: Building2 },
  { type: 'BKASH', label: 'bKash Merchant / Personal', icon: Smartphone },
  { type: 'NAGAD', label: 'Nagad Account', icon: Smartphone },
  { type: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
  { type: 'PETTY_CASH', label: 'Petty Cash', icon: Wallet },
  { type: 'OTHER', label: 'Other Account', icon: Layers },
];

export const AccountsPage: React.FC<AccountsPageProps> = ({ onNavigate }) => {
  const { accounts, transactions, updateAccountBalance, updateAccount, addAccount, settings } = useAppData();

  // Selected Account for Ledger
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || 'acc-cash');

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Quick Balance Adjustment state
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<string>('0');
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');

  // Search in ledger
  const [ledgerSearch, setLedgerSearch] = useState('');

  // New / Edit Account form state
  const [accountForm, setAccountForm] = useState<{
    name: string;
    type: AccountType;
    bankName: string;
    accountNumber: string;
    openingBalance: string;
    notes: string;
  }>({
    name: '',
    type: 'BANK',
    bankName: '',
    accountNumber: '',
    openingBalance: '0',
    notes: '',
  });

  const selectedAccount = useMemo(
    () => accounts.find(a => a.id === selectedAccountId) || accounts[0],
    [accounts, selectedAccountId]
  );

  const totalLiquidity = useMemo(() => accounts.reduce((s, a) => s + a.currentBalance, 0), [accounts]);
  const cashInHand = useMemo(() => {
    const cashAcc = accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash');
    return cashAcc ? cashAcc.currentBalance : 0;
  }, [accounts]);
  const bankLiquidity = useMemo(
    () => accounts.filter(a => a.type === 'BANK').reduce((s, a) => s + a.currentBalance, 0),
    [accounts]
  );
  const mobileWalletLiquidity = useMemo(
    () => accounts.filter(a => ['BKASH', 'NAGAD'].includes(a.type)).reduce((s, a) => s + a.currentBalance, 0),
    [accounts]
  );

  // Ledger for active account
  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return [];
    let list = transactions.filter(t => t.accountId === selectedAccount.id);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase();
      list = list.filter(
        t =>
          t.description.toLowerCase().includes(q) ||
          t.txnNumber.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.reference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, selectedAccount, ledgerSearch]);

  const handleOpenAdjustModal = (acc: Account) => {
    setTargetAccount(acc);
    setNewBalanceInput(String(acc.currentBalance));
    setAdjustmentNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) return;
    const val = Number(newBalanceInput) || 0;
    updateAccountBalance(
      targetAccount.id,
      val,
      adjustmentNotes || 'Manual Cash Drawer / Account Balance Adjustment'
    );
    setIsAdjustModalOpen(false);
  };

  const handleOpenNewAccountModal = () => {
    setEditingAccount(null);
    setAccountForm({
      name: '',
      type: 'BANK',
      bankName: '',
      accountNumber: '',
      openingBalance: '0',
      notes: '',
    });
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccountModal = (acc: Account) => {
    setEditingAccount(acc);
    setAccountForm({
      name: acc.name,
      type: acc.type,
      bankName: acc.bankName || '',
      accountNumber: acc.accountNumber || '',
      openingBalance: String(acc.openingBalance),
      notes: acc.notes || '',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name) return;

    const opBal = Number(accountForm.openingBalance) || 0;

    if (editingAccount) {
      const updated: Account = {
        ...editingAccount,
        name: accountForm.name,
        type: accountForm.type,
        bankName: accountForm.bankName,
        accountNumber: accountForm.accountNumber,
        notes: accountForm.notes,
      };
      updateAccount(updated);
    } else {
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        name: accountForm.name,
        type: accountForm.type,
        bankName: accountForm.bankName,
        accountNumber: accountForm.accountNumber,
        openingBalance: opBal,
        currentBalance: opBal,
        status: 'ACTIVE',
        notes: accountForm.notes,
      };
      addAccount(newAcc);
    }

    setIsAccountModalOpen(false);
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'OFFICE_CASH':
      case 'PETTY_CASH':
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      case 'BANK':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'BKASH':
      case 'NAGAD':
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      case 'CREDIT_CARD':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/30 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            Cash Drawer & Bank Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Office Cash in Hand, Bank balances, Mobile money wallets, and view audit ledgers
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigate && (
            <button
              onClick={() => onNavigate('funding')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <HandCoins className="w-4 h-4" />
              <span>Arif Vai Funding</span>
            </button>
          )}

          {accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash') && (
            <button
              onClick={() => {
                const cashAcc = accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash') || accounts[0];
                handleOpenAdjustModal(cashAcc);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust Cash in Hand</span>
            </button>
          )}

          <button
            onClick={handleOpenNewAccountModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Liquidity</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(totalLiquidity)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-indigo-600">All Accounts Combined</span>
            <span className="text-[10px] text-slate-400 font-mono">{accounts.length} Active</span>
          </div>
        </div>

        {/* Office Cash in Hand Card with Fast 1-Click Zero Button */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Cash in Hand</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-300" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{formatBDT(cashInHand)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-purple-300">Active Office Cash</span>
            <button
              onClick={() => {
                const cashAcc = accounts.find(a => a.type === 'OFFICE_CASH' || a.id === 'acc-cash') || accounts[0];
                handleOpenAdjustModal(cashAcc);
              }}
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              Adjust
            </button>
          </div>
        </div>

        {/* Bank Balances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Accounts</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(bankLiquidity)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-blue-600">Commercial Banks</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {accounts.filter(a => a.type === 'BANK').length} Accounts
            </span>
          </div>
        </div>

        {/* Mobile Banking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Wallets</span>
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(mobileWalletLiquidity)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-pink-600">bKash / Nagad</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {accounts.filter(a => ['BKASH', 'NAGAD'].includes(a.type)).length} Wallets
            </span>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const isSelected = selectedAccountId === acc.id;
          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-gradient-to-b from-white to-purple-50/40 border-purple-300 shadow-md ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-100 shadow-sm hover:shadow hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getAccountTypeIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{acc.name}</h3>
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      {acc.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenAdjustModal(acc);
                    }}
                    className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                    title="Quick Adjust Balance"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenEditAccountModal(acc);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Edit Account Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {acc.bankName && (
                <div className="text-xs text-slate-600 mb-1">
                  <span className="font-semibold">{acc.bankName}</span>
                  {acc.accountNumber && <span className="text-slate-400 font-mono ml-2">A/C: {acc.accountNumber}</span>}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Balance</span>
                  <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    {formatBDT(acc.currentBalance)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block">Opening: {formatBDT(acc.openingBalance)}</span>
                  <span className="text-[10px] font-bold text-purple-600">
                    {isSelected ? '● Viewing Ledger' : 'Click to view'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Account Ledger */}
      {selectedAccount && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  {getAccountTypeIcon(selectedAccount.type)}
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedAccount.name} — Transaction History
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Audit trail for all income, expenses, and balance adjustments linked to this account
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <button
                onClick={() => handleOpenAdjustModal(selectedAccount)}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-purple-200"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>
            </div>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-200" />
              <p className="text-xs font-semibold">No transactions recorded for this account yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                    <th className="text-left px-4 py-3">Txn #</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Description</th>
                    <th className="text-right px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {accountTransactions.map(txn => {
                    const isInflow = ['INCOME', 'TICKET_SALE', 'OWNER_FUND_IN', 'CUSTOMER_PAYMENT'].includes(txn.type);
                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[11px] text-slate-600">
                          {txn.txnNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                          {formatDateDisplay(txn.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isInflow
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                          >
                            {txn.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[10.5px]">
                            {txn.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 max-w-[280px] truncate">{txn.description}</div>
                          {txn.reference && (
                            <div className="text-[10px] text-slate-400 font-mono">Ref: {txn.reference}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-sm whitespace-nowrap">
                          <span className={isInflow ? 'text-emerald-600' : 'text-rose-600'}>
                            {isInflow ? '+' : '-'}
                            {formatBDT(txn.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Quick Adjust Drawer / Account Balance */}
      {isAdjustModalOpen && targetAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Adjust Balance: {targetAccount.name}</h2>
                  <p className="text-xs text-slate-500">Set exact Cash in Hand or Drawer amount</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceAdjustment} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Current Recorded Balance
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {formatBDT(targetAccount.currentBalance)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  New Exact Balance (৳) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={newBalanceInput}
                    onChange={e => setNewBalanceInput(e.target.value)}
                    placeholder="0"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setNewBalanceInput('0')}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                  >
                    Set ৳0
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Click <strong>Set ৳0</strong> if you have no current cash in hand.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={adjustmentNotes}
                  onChange={e => setAdjustmentNotes(e.target.value)}
                  placeholder="e.g. Physical cash count verification or zero starting cash"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/25 transition-all hover:scale-105"
                >
                  Save & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create / Edit Account */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {editingAccount ? 'Edit Account' : 'Add New Account'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure bank, drawer or digital wallet</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="e.g. City Bank Primary / Office Cash"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Account Type *
                  </label>
                  <select
                    value={accountForm.type}
                    onChange={e => setAccountForm({ ...accountForm, type: e.target.value as AccountType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {ACCOUNT_TYPES.map(t => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingAccount && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Opening Balance (৳)
                    </label>
                    <input
                      type="number"
                      value={accountForm.openingBalance}
                      onChange={e => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                      placeholder="0"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {accountForm.type === 'BANK' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={accountForm.bankName}
                      onChange={e => setAccountForm({ ...accountForm, bankName: e.target.value })}
                      placeholder="e.g. Islami Bank Bangladesh"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountForm.accountNumber}
                      onChange={e => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      placeholder="e.g. 205012345678"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Notes
                </label>
                <input
                  type="text"
                  value={accountForm.notes}
                  onChange={e => setAccountForm({ ...accountForm, notes: e.target.value })}
                  placeholder="Optional account description"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105"
                >
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
