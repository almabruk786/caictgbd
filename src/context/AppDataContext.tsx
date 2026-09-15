import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Account,
  Transaction,
  IncomeEntry,
  ExpenseEntry,
  TicketSale,
  Customer,
  Supplier,
  OwnerFundEntry,
  CompanySettings,
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { DateRange, DateRangePreset, getDateRangeFromPreset } from '../utils/date';

interface AppDataContextType {
  // Domain data
  accounts: Account[];
  transactions: Transaction[];
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  tickets: TicketSale[];
  customers: Customer[];
  suppliers: Supplier[];
  ownerFunds: OwnerFundEntry[];
  settings: CompanySettings;

  // Date Filtering state
  dateRange: DateRange;
  setDateRangePreset: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;

  // Domain Actions
  addExpense: (expenseData: any) => ExpenseEntry;
  addIncome: (incomeData: any) => IncomeEntry;
  addTicket: (ticketData: any) => TicketSale;
  addCustomer: (customerData: any) => Customer;
  updateCustomer: (customer: Customer) => void;
  addSupplier: (supplierData: any) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  collectCustomerDue: (paymentData: any) => void;
  paySupplier: (paymentData: any) => void;
  addOwnerFund: (fundData: any) => OwnerFundEntry;
  deleteOwnerFund: (id: string) => void;
  updateAccountBalance: (accountId: string, newBalance: number, notes?: string) => void;
  updateAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  updateSettings: (settings: CompanySettings) => void;

  // System
  refreshData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;
  syncToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Primary State
  const [accounts, setAccounts] = useState<Account[]>(StorageService.getAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [income, setIncome] = useState<IncomeEntry[]>(StorageService.getIncome());
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(StorageService.getExpenses());
  const [tickets, setTickets] = useState<TicketSale[]>(StorageService.getTickets());
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(StorageService.getSuppliers());
  const [ownerFunds, setOwnerFunds] = useState<OwnerFundEntry[]>(StorageService.getOwnerFunds());
  const [settings, setSettings] = useState<CompanySettings>(StorageService.getSettings());

  // Date Range
  const initialRange = getDateRangeFromPreset('thisMonth');
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'thisMonth',
    startDate: initialRange.startDate,
    endDate: initialRange.endDate,
  });

  const refreshData = useCallback(() => {
    setAccounts(StorageService.getAccounts());
    setTransactions(StorageService.getTransactions());
    setIncome(StorageService.getIncome());
    setExpenses(StorageService.getExpenses());
    setTickets(StorageService.getTickets());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
    setOwnerFunds(StorageService.getOwnerFunds());
    setSettings(StorageService.getSettings());
  }, []);

  useEffect(() => {
    StorageService.pullFromFirestore().then(res => {
      if (res.success && (res.count || 0) > 0) {
        refreshData();
      }
    }).catch(() => {});
  }, [refreshData]);

  const setDateRangePreset = (preset: DateRangePreset, customStart?: string, customEnd?: string) => {
    if (preset === 'custom' && customStart && customEnd) {
      setDateRange({ preset: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      const range = getDateRangeFromPreset(preset);
      setDateRange({ preset, startDate: range.startDate, endDate: range.endDate });
    }
  };

  const getActiveUser = () => currentUser || StorageService.getCurrentUser();

  const addExpense = (expenseData: any): ExpenseEntry => {
    const created = StorageService.createExpense(expenseData, getActiveUser());
    refreshData();
    showToast(`Expense voucher ${created.voucherNo} recorded.`, 'success');
    return created;
  };

  const addIncome = (incomeData: any): IncomeEntry => {
    const created = StorageService.createIncome(incomeData, getActiveUser());
    refreshData();
    showToast(`Income voucher ${created.voucherNo} recorded.`, 'success');
    return created;
  };

  const addTicket = (ticketData: any): TicketSale => {
    const created = StorageService.createTicketSale(ticketData, getActiveUser());
    refreshData();
    showToast(`Flight Ticket ${created.ticketId} issued successfully!`, 'success');
    return created;
  };

  const addCustomer = (customerData: any): Customer => {
    const currentCusts = StorageService.getCustomers();
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      customerId: `CUST-${String(currentCusts.length + 1).padStart(4, '0')}`,
      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
      totalRefunded: 0,
      createdAt: new Date().toISOString(),
      ...customerData,
    };
    StorageService.saveCustomers([newCust, ...currentCusts]);
    refreshData();
    showToast(`Customer ${newCust.name} added successfully.`, 'success');
    return newCust;
  };

  const updateCustomer = (customer: Customer) => {
    const currentCusts = StorageService.getCustomers();
    const updated = currentCusts.map(c => c.id === customer.id ? customer : c);
    StorageService.saveCustomers(updated);
    refreshData();
    showToast(`Customer ${customer.name} updated.`, 'success');
  };

  const addSupplier = (supplierData: any): Supplier => {
    const currentSups = StorageService.getSuppliers();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      supplierId: `SUP-${String(currentSups.length + 1).padStart(4, '0')}`,
      totalPurchases: 0,
      totalPaid: 0,
      totalPayable: 0,
      createdAt: new Date().toISOString(),
      ...supplierData,
    };
    StorageService.saveSuppliers([newSup, ...currentSups]);
    refreshData();
    showToast(`Supplier ${newSup.name} added successfully.`, 'success');
    return newSup;
  };

  const updateSupplier = (supplier: Supplier) => {
    const currentSups = StorageService.getSuppliers();
    const updated = currentSups.map(s => s.id === supplier.id ? supplier : s);
    StorageService.saveSuppliers(updated);
    refreshData();
    showToast(`Supplier ${supplier.name} updated.`, 'success');
  };

  const collectCustomerDue = (paymentData: any) => {
    StorageService.collectCustomerDue(paymentData, getActiveUser());
    refreshData();
    showToast(`Due payment collected successfully.`, 'success');
  };

  const paySupplier = (paymentData: any) => {
    StorageService.paySupplier(paymentData, getActiveUser());
    refreshData();
    showToast(`Supplier payment disbursed successfully.`, 'success');
  };

  const addOwnerFund = (fundData: any): OwnerFundEntry => {
    const created = StorageService.recordOwnerFund(fundData, getActiveUser());
    refreshData();
    const actionLabel = created.type === 'INJECTION' ? 'Fund Received (+)' : 'Fund Returned (-)';
    showToast(`Arif Vai Funding ${actionLabel} ${created.referenceNo} recorded successfully!`, 'success');
    return created;
  };

  const deleteOwnerFund = (id: string) => {
    const success = StorageService.deleteOwnerFund(id, getActiveUser());
    if (success) {
      refreshData();
      showToast('Arif Vai Funding record deleted and Cash balance reversed.', 'info');
    } else {
      showToast('Failed to delete funding record.', 'error');
    }
  };

  const updateAccountBalance = (accountId: string, newBalance: number, notes?: string) => {
    StorageService.updateAccountBalance(accountId, newBalance, notes);
    refreshData();
    showToast(`Account balance updated to ৳${newBalance.toLocaleString()}.`, 'success');
  };

  const updateAccount = (account: Account) => {
    StorageService.updateAccount(account);
    refreshData();
    showToast(`Account ${account.name} updated successfully.`, 'success');
  };

  const addAccount = (account: Account) => {
    StorageService.addAccount(account);
    refreshData();
    showToast(`Account ${account.name} added successfully.`, 'success');
  };

  const updateSettings = (newSettings: CompanySettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast(`Agency settings saved successfully.`, 'success');
  };

  const exportDatabaseJSON = () => {
    const data = {
      income: StorageService.getIncome(),
      expenses: StorageService.getExpenses(),
      tickets: StorageService.getTickets(),
      customers: StorageService.getCustomers(),
      suppliers: StorageService.getSuppliers(),
      ownerFunds: StorageService.getOwnerFunds(),
      accounts: StorageService.getAccounts(),
      transactions: StorageService.getTransactions(),
      settings: StorageService.getSettings(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Captain_Air_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Backup downloaded successfully.', 'success');
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.income) StorageService.saveIncome(data.income);
      if (data.expenses) StorageService.saveExpenses(data.expenses);
      if (data.tickets) StorageService.saveTickets(data.tickets);
      if (data.customers) StorageService.saveCustomers(data.customers);
      if (data.suppliers) StorageService.saveSuppliers(data.suppliers);
      if (data.ownerFunds) StorageService.saveOwnerFunds(data.ownerFunds);
      if (data.accounts) StorageService.saveAccounts(data.accounts);
      if (data.transactions) StorageService.saveTransactions(data.transactions);
      if (data.settings) StorageService.saveSettings(data.settings);
      refreshData();
      showToast('Backup restored successfully!', 'success');
      return true;
    } catch {
      showToast('Failed to import backup file.', 'error');
      return false;
    }
  };

  const syncToCloud = async () => {
    const res = await StorageService.syncAllToFirestore();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const pullFromCloud = async () => {
    const res = await StorageService.pullFromFirestore();
    if (res.success) {
      refreshData();
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        accounts,
        transactions,
        income,
        expenses,
        tickets,
        customers,
        suppliers,
        ownerFunds,
        settings,
        dateRange,
        setDateRangePreset,
        addExpense,
        addIncome,
        addTicket,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        collectCustomerDue,
        paySupplier,
        addOwnerFund,
        deleteOwnerFund,
        updateAccountBalance,
        updateAccount,
        addAccount,
        updateSettings,
        refreshData,
        exportDatabaseJSON,
        importDatabaseJSON,
        syncToCloud,
        pullFromCloud,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
