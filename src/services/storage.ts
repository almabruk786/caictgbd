import { 
  Account, 
  Transaction, 
  IncomeEntry, 
  ExpenseEntry, 
  TicketSale, 
  Customer, 
  Supplier, 
  Product, 
  Purchase, 
  OwnerFundEntry, 
  User, 
  ActivityLog, 
  AppNotification, 
  CompanySettings 
} from '../types';
import { 
  initialCompanySettings, 
  initialUsers, 
  initialAccounts, 
  initialCustomers, 
  initialSuppliers, 
  initialTickets, 
  initialIncome, 
  initialExpenses, 
  initialOwnerFunds, 
  initialProducts, 
  initialPurchases, 
  initialTransactions, 
  initialActivityLogs, 
  initialNotifications 
} from '../mock/seedData';
import { calculateTicketProfit } from '../utils/calculations';
import { db, initFirebase } from './firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

const STORAGE_KEYS = {
  SETTINGS: 'cai_v2_settings',
  USERS: 'cai_v2_users',
  ACCOUNTS: 'cai_v2_accounts',
  CUSTOMERS: 'cai_v2_customers',
  SUPPLIERS: 'cai_v2_suppliers',
  TICKETS: 'cai_v2_tickets',
  INCOME: 'cai_v2_income',
  EXPENSES: 'cai_v2_expenses',
  OWNER_FUNDS: 'cai_v2_owner_funds',
  PRODUCTS: 'cai_v2_products',
  PURCHASES: 'cai_v2_purchases',
  TRANSACTIONS: 'cai_v2_transactions',
  ACTIVITY_LOGS: 'cai_v2_activity_logs',
  NOTIFICATIONS: 'cai_v2_notifications',
  CURRENT_USER: 'cai_v2_current_user',
  AUTH_SESSION: 'cai_v2_auth_session',
};

export class StorageService {
  // Authentication & Session
  static authenticate(loginId: string, pass: string): { success: boolean; user?: User; error?: string } {
    const idClean = loginId.trim().toLowerCase();
    const passClean = pass.trim();

    if ((idClean === 'admin' || idClean === 'admin@captainairbd.com') && passClean === 'Arif@2026') {
      const adminUser: User = initialUsers[0];
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(adminUser));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
      this.saveUsers([adminUser]);
      this.logActivity(adminUser, 'LOGIN', 'Flight Deck Auth', `Admin flight authorization granted`);
      return { success: true, user: adminUser };
    }

    return { success: false, error: 'Invalid Flight Clearance. Verification ID or Password incorrect.' };
  }

  static getAuthSession(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    return data ? JSON.parse(data) : null;
  }

  static clearAuthSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  // Load or initialize state
  static getSettings(): CompanySettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : initialCompanySettings;
  }

  static saveSettings(settings: CompanySettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.firebaseConfig) {
      initFirebase(settings.firebaseConfig);
    }
  }

  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return initialUsers;
    const parsed = JSON.parse(data);
    // If old multiple users exist, sanitize to single admin user
    if (!Array.isArray(parsed) || parsed.length !== 1 || parsed[0].role !== 'ADMIN') {
      this.saveUsers(initialUsers);
      return initialUsers;
    }
    return parsed;
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getAccounts(): Account[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      this.saveAccounts(initialAccounts);
      return initialAccounts;
    }
    try {
      const parsed: Account[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveAccounts(initialAccounts);
        return initialAccounts;
      }
      const officeAcc = parsed.find(a => a.id === 'acc-cash');
      if (officeAcc && officeAcc.currentBalance === 0 && initialAccounts[0]?.currentBalance !== 0) {
        officeAcc.currentBalance = initialAccounts[0].currentBalance;
        this.saveAccounts(parsed);
      }
      return parsed;
    } catch {
      this.saveAccounts(initialAccounts);
      return initialAccounts;
    }
  }

  static saveAccounts(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  static updateAccount(account: Account): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    this.saveAccounts(accounts);
  }

  static addAccount(account: Account): void {
    const accounts = this.getAccounts();
    accounts.push(account);
    this.saveAccounts(accounts);
  }

  static updateAccountBalance(accountId: string, newBalance: number, notes: string = 'Manual Drawer Balance Adjustment'): void {
    const accounts = this.getAccounts();
    const txns = this.getTransactions();
    const accIndex = accounts.findIndex(a => a.id === accountId);
    if (accIndex === -1) return;

    const oldBalance = accounts[accIndex].currentBalance;
    const diff = newBalance - oldBalance;
    accounts[accIndex].currentBalance = newBalance;
    accounts[accIndex].openingBalance = newBalance;

    if (diff !== 0) {
      const txnNumber = `ADJ-2026-${String(txns.length + 1).padStart(5, '0')}`;
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        txnNumber,
        date: new Date().toISOString().split('T')[0],
        type: diff > 0 ? 'OWNER_FUND_IN' : 'OWNER_WITHDRAWAL',
        category: 'Cash Drawer Adjustment',
        description: `Cash in Hand Balance Adjustment: ${notes} (Previous: ৳${oldBalance.toLocaleString()} ➔ New: ৳${newBalance.toLocaleString()})`,
        amount: Math.abs(diff),
        accountId,
        accountName: accounts[accIndex].name,
        paymentMethod: 'CASH',
        reference: txnNumber,
        createdBy: 'Captain Boss (Owner)',
        createdAt: new Date().toISOString(),
      };
      this.saveTransactions([newTxn, ...txns]);
    }

    this.saveAccounts(accounts);
  }

  static getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : initialCustomers;
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static getSuppliers(): Supplier[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return data ? JSON.parse(data) : initialSuppliers;
  }

  static saveSuppliers(suppliers: Supplier[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }

  static getTickets(): TicketSale[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : initialTickets;
  }

  static saveTickets(tickets: TicketSale[]): void {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }

  static getIncome(): IncomeEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.INCOME);
    if (!data) {
      this.saveIncome(initialIncome);
      return initialIncome;
    }
    try {
      const parsed: IncomeEntry[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveIncome(initialIncome);
        return initialIncome;
      }
      const existingIds = new Set(parsed.map(i => i.id || i.voucherNo));
      const missing = initialIncome.filter(i => !existingIds.has(i.id) && !existingIds.has(i.voucherNo));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        this.saveIncome(merged);
        return merged;
      }
      return parsed;
    } catch {
      this.saveIncome(initialIncome);
      return initialIncome;
    }
  }

  static saveIncome(income: IncomeEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
  }

  static getExpenses(): ExpenseEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!data) {
      this.saveExpenses(initialExpenses);
      return initialExpenses;
    }
    try {
      const parsed: ExpenseEntry[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveExpenses(initialExpenses);
        return initialExpenses;
      }
      const existingIds = new Set(parsed.map(e => e.id || e.voucherNo));
      const missing = initialExpenses.filter(e => !existingIds.has(e.id) && !existingIds.has(e.voucherNo));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        this.saveExpenses(merged);
        return merged;
      }
      return parsed;
    } catch {
      this.saveExpenses(initialExpenses);
      return initialExpenses;
    }
  }

  static saveExpenses(expenses: ExpenseEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  static getOwnerFunds(): OwnerFundEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.OWNER_FUNDS);
    return data ? JSON.parse(data) : initialOwnerFunds;
  }

  static saveOwnerFunds(funds: OwnerFundEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.OWNER_FUNDS, JSON.stringify(funds));
  }

  static getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : initialProducts;
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  static getPurchases(): Purchase[] {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return data ? JSON.parse(data) : initialPurchases;
  }

  static savePurchases(purchases: Purchase[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }

  static getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      this.saveTransactions(initialTransactions);
      return initialTransactions;
    }
    try {
      const parsed: Transaction[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveTransactions(initialTransactions);
        return initialTransactions;
      }
      const existingIds = new Set(parsed.map(t => t.id || t.txnNumber));
      const missing = initialTransactions.filter(t => !existingIds.has(t.id) && !existingIds.has(t.txnNumber));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        this.saveTransactions(merged);
        return merged;
      }
      return parsed;
    } catch {
      this.saveTransactions(initialTransactions);
      return initialTransactions;
    }
  }

  static saveTransactions(txns: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }

  static getActivityLogs(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return data ? JSON.parse(data) : initialActivityLogs;
  }

  static saveActivityLogs(logs: ActivityLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  }

  static getNotifications(): AppNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : initialNotifications;
  }

  static saveNotifications(notifs: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : initialUsers[0]; // Default to Super Admin (Captain Boss)
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // --- ATOMIC DOMAIN ACTIONS ---

  /**
   * Log an activity
   */
  static logActivity(user: User, action: string, module: string, details: string, recordId?: string): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      module,
      recordId,
      details,
      ipAddress: '127.0.0.1 (Web Terminal)',
      timestamp: new Date().toISOString(),
    };
    this.saveActivityLogs([newLog, ...logs]);
  }

  /**
   * Create a flight ticket sale with atomic ledger & balance updates
   */
  static createTicketSale(
    ticketData: Omit<TicketSale, 'id' | 'ticketId' | 'netProfit' | 'customerDue' | 'supplierDue' | 'createdAt'>,
    currentUser: User
  ): TicketSale {
    const tickets = this.getTickets();
    const accounts = this.getAccounts();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const txns = this.getTransactions();
    const notifs = this.getNotifications();

    const count = tickets.length + 1;
    const ticketId = `TKT-2026-${String(count).padStart(5, '0')}`;
    const id = `tkt-${Date.now()}`;

    const sellingPrice = Number(ticketData.sellingPrice) || 0;
    const purchaseCost = Number(ticketData.purchaseCost) || 0;
    const discount = Number(ticketData.discount) || 0;
    const commission = Number(ticketData.commission) || 0;
    const serviceCharge = Number(ticketData.serviceCharge) || 0;
    const customerPaid = Number(ticketData.customerPaid) || 0;
    const supplierPaid = Number(ticketData.supplierPaid) || 0;

    const netProfit = calculateTicketProfit({ sellingPrice, purchaseCost, discount, commission, serviceCharge });
    const customerDue = Math.max(0, sellingPrice - customerPaid);
    const supplierDue = Math.max(0, purchaseCost - supplierPaid);

    // Resolve customer and supplier names
    let customerName = ticketData.customerName;
    if (ticketData.customerId) {
      const c = customers.find(item => item.id === ticketData.customerId);
      if (c) customerName = c.name;
    }

    let supplierName = ticketData.supplierName;
    if (ticketData.supplierId) {
      const s = suppliers.find(item => item.id === ticketData.supplierId);
      if (s) supplierName = s.name;
    }

    const newTicket: TicketSale = {
      ...ticketData,
      id,
      ticketId,
      netProfit,
      customerDue,
      supplierDue,
      customerName,
      supplierName,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // 1. Update Account balance with customerPaid
    if (customerPaid > 0 && ticketData.accountId) {
      const accIndex = accounts.findIndex(a => a.id === ticketData.accountId);
      if (accIndex !== -1) {
        accounts[accIndex].currentBalance += customerPaid;
      }
    }

    // 2. Update Customer records (if linked)
    if (ticketData.customerId) {
      const custIndex = customers.findIndex(c => c.id === ticketData.customerId);
      if (custIndex !== -1) {
        customers[custIndex].totalPurchases += sellingPrice;
        customers[custIndex].totalPaid += customerPaid;
        customers[custIndex].totalDue += customerDue;
      }
    }

    // 3. Update Supplier records (if linked)
    if (ticketData.supplierId) {
      const supIndex = suppliers.findIndex(s => s.id === ticketData.supplierId);
      if (supIndex !== -1) {
        suppliers[supIndex].totalPurchases += purchaseCost;
        suppliers[supIndex].totalPaid += supplierPaid;
        suppliers[supIndex].totalPayable += supplierDue;
      }
    }

    // 4. Create Ledger Transaction
    const account = accounts.find(a => a.id === ticketData.accountId);
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${String(txns.length + 1).padStart(5, '0')}`,
      date: ticketData.saleDate,
      type: 'TICKET_SALE',
      category: 'Ticket Sales',
      description: `Flight Ticket (${ticketData.airline} - ${ticketData.route}) for ${ticketData.passengerName} [PNR: ${ticketData.pnr}]`,
      amount: customerPaid > 0 ? customerPaid : sellingPrice,
      accountId: ticketData.accountId,
      accountName: account?.name || 'Main Account',
      paymentMethod: ticketData.paymentMethod,
      customerId: ticketData.customerId,
      customerName,
      supplierId: ticketData.supplierId,
      supplierName,
      reference: ticketId,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // 5. Check if due notification should be created
    if (customerDue > 0) {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Customer Due Added',
        message: `${ticketData.passengerName} has an outstanding due of ৳${customerDue.toLocaleString()} for ticket ${ticketId}.`,
        type: 'DUE_ALERT',
        read: false,
        timestamp: new Date().toISOString(),
        link: 'customers',
      };
      this.saveNotifications([newNotif, ...notifs]);
    }

    this.saveTickets([newTicket, ...tickets]);
    this.saveAccounts([...accounts]);
    this.saveCustomers([...customers]);
    this.saveSuppliers([...suppliers]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'CREATE',
      'Ticket Sales',
      `Issued ticket ${ticketId} (${ticketData.airline} ${ticketData.route}) for ${ticketData.passengerName} - Selling: ৳${sellingPrice.toLocaleString()}, Profit: ৳${netProfit.toLocaleString()}`,
      ticketId
    );

    return newTicket;
  }

  /**
   * Create an Expense Entry with account deduction
   */
  static createExpense(
    expenseData: Omit<ExpenseEntry, 'id' | 'voucherNo' | 'createdAt'>,
    currentUser: User
  ): ExpenseEntry {
    const expenses = this.getExpenses();
    const accounts = this.getAccounts();
    const suppliers = this.getSuppliers();
    const txns = this.getTransactions();

    const count = expenses.length + 1;
    const voucherNo = `EXP-2026-${String(count).padStart(5, '0')}`;
    const id = `exp-${Date.now()}`;
    const amount = Number(expenseData.amount) || 0;

    const newExpense: ExpenseEntry = {
      ...expenseData,
      id,
      voucherNo,
      amount,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // Deduct from account
    const accIndex = accounts.findIndex(a => a.id === expenseData.accountId);
    if (accIndex !== -1) {
      accounts[accIndex].currentBalance -= amount;
    }

    const account = accounts.find(a => a.id === expenseData.accountId);
    const supplier = suppliers.find(s => s.id === expenseData.supplierId);

    // Ledger record
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${String(txns.length + 1).padStart(5, '0')}`,
      date: expenseData.date,
      type: 'EXPENSE',
      category: expenseData.category,
      description: expenseData.description || `Office Expense: ${expenseData.category}`,
      amount,
      accountId: expenseData.accountId,
      accountName: account?.name || 'Main Account',
      paymentMethod: expenseData.paymentMethod,
      supplierId: expenseData.supplierId,
      supplierName: supplier?.name,
      reference: voucherNo,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveExpenses([newExpense, ...expenses]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'CREATE',
      'Expenses',
      `Recorded expense voucher ${voucherNo} [${expenseData.category}] - Amount: ৳${amount.toLocaleString()} from ${account?.name || 'Account'}`,
      voucherNo
    );

    return newExpense;
  }

  /**
   * Create an Income Entry with account addition
   */
  static createIncome(
    incomeData: Omit<IncomeEntry, 'id' | 'voucherNo' | 'createdAt'>,
    currentUser: User
  ): IncomeEntry {
    const incomes = this.getIncome();
    const accounts = this.getAccounts();
    const customers = this.getCustomers();
    const txns = this.getTransactions();

    const count = incomes.length + 1;
    const voucherNo = `INC-2026-${String(count).padStart(5, '0')}`;
    const id = `inc-${Date.now()}`;
    const amount = Number(incomeData.amount) || 0;

    const newIncome: IncomeEntry = {
      ...incomeData,
      id,
      voucherNo,
      amount,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // Add to account
    const accIndex = accounts.findIndex(a => a.id === incomeData.accountId);
    if (accIndex !== -1) {
      accounts[accIndex].currentBalance += amount;
    }

    const account = accounts.find(a => a.id === incomeData.accountId);
    const customer = customers.find(c => c.id === incomeData.customerId);

    // Ledger record
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${String(txns.length + 1).padStart(5, '0')}`,
      date: incomeData.date,
      type: 'INCOME',
      category: incomeData.category,
      description: incomeData.description || `Business Income: ${incomeData.category}`,
      amount,
      accountId: incomeData.accountId,
      accountName: account?.name || 'Main Account',
      paymentMethod: incomeData.paymentMethod,
      customerId: incomeData.customerId,
      customerName: customer?.name,
      reference: voucherNo,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveIncome([newIncome, ...incomes]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'CREATE',
      'Income',
      `Recorded income voucher ${voucherNo} [${incomeData.category}] - Amount: ৳${amount.toLocaleString()} to ${account?.name || 'Account'}`,
      voucherNo
    );

    return newIncome;
  }

  /**
   * Arif Vai / Owner Funding Injection or Withdrawal (Strict Equity Segregation)
   */
  static recordOwnerFund(
    fundData: Omit<OwnerFundEntry, 'id' | 'referenceNo' | 'createdAt'>,
    currentUser: User
  ): OwnerFundEntry {
    const funds = this.getOwnerFunds();
    const accounts = this.getAccounts();
    const txns = this.getTransactions();

    const count = funds.length + 1;
    const referenceNo = `AVF-2026-${String(count).padStart(5, '0')}`;
    const id = `avf-${Date.now()}`;
    const amount = Number(fundData.amount) || 0;
    const paymentMethod = fundData.paymentMethod || 'CASH';

    const account = accounts.find(a => a.id === fundData.accountId);
    const accountName = account?.name || 'Office Cash';

    const newFund: OwnerFundEntry = {
      ...fundData,
      id,
      referenceNo,
      amount,
      paymentMethod,
      accountName,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // Update account balance (Immediate reflection in Cash in Hand / selected account)
    const accIndex = accounts.findIndex(a => a.id === fundData.accountId);
    if (accIndex !== -1) {
      if (fundData.type === 'INJECTION') {
        accounts[accIndex].currentBalance += amount;
      } else {
        accounts[accIndex].currentBalance -= amount;
      }
    }

    // Ledger record (marked as OWNER_FUND_IN or OWNER_WITHDRAWAL)
    const isInflow = fundData.type === 'INJECTION';
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${String(txns.length + 1).padStart(5, '0')}`,
      date: fundData.date,
      type: isInflow ? 'OWNER_FUND_IN' : 'OWNER_WITHDRAWAL',
      category: 'Arif Vai Funding',
      description: isInflow
        ? `Arif Vai Funding (Received): ${fundData.notes || 'Capital Injection'}`
        : `Arif Vai Funding (Returned): ${fundData.notes || 'Capital Return / Repayment'}`,
      amount,
      accountId: fundData.accountId,
      accountName,
      paymentMethod,
      reference: referenceNo,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveOwnerFunds([newFund, ...funds]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      isInflow ? 'FUND_RECEIVED' : 'FUND_RETURNED',
      'Arif Vai Funding',
      `Arif Vai ${isInflow ? 'Fund Received (+)' : 'Fund Returned (-)'} ${referenceNo} - Amount: ৳${amount.toLocaleString()} ${isInflow ? 'deposited into' : 'withdrawn from'} [${accountName}]`,
      referenceNo
    );

    return newFund;
  }

  /**
   * Delete an Arif Vai Funding entry and reverse its account balance effect
   */
  static deleteOwnerFund(id: string, currentUser: User): boolean {
    const funds = this.getOwnerFunds();
    const accounts = this.getAccounts();
    const txns = this.getTransactions();

    const targetIndex = funds.findIndex(f => f.id === id);
    if (targetIndex === -1) return false;

    const target = funds[targetIndex];
    const amount = Number(target.amount) || 0;

    // Reverse balance in the account
    const accIndex = accounts.findIndex(a => a.id === target.accountId);
    if (accIndex !== -1) {
      if (target.type === 'INJECTION') {
        // Was added, so subtract
        accounts[accIndex].currentBalance -= amount;
      } else {
        // Was subtracted, so add back
        accounts[accIndex].currentBalance += amount;
      }
    }

    // Remove matching transaction from ledger
    const updatedTxns = txns.filter(t => t.reference !== target.referenceNo && t.id !== target.id);
    const updatedFunds = funds.filter(f => f.id !== id);

    this.saveOwnerFunds(updatedFunds);
    this.saveAccounts([...accounts]);
    this.saveTransactions(updatedTxns);

    this.logActivity(
      currentUser,
      'DELETE',
      'Arif Vai Funding',
      `Deleted Arif Vai Funding entry ${target.referenceNo} (৳${amount.toLocaleString()}) and reversed account balance for ${target.accountName || 'Account'}`,
      target.referenceNo
    );

    return true;
  }

  /**
   * Inter-Account Fund Transfer (Zero Net Effect on Company Balance)
   */
  static transferFunds(
    transferData: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      date: string;
      notes: string;
    },
    currentUser: User
  ): void {
    const accounts = this.getAccounts();
    const txns = this.getTransactions();
    const amount = Number(transferData.amount) || 0;

    const fromAccIndex = accounts.findIndex(a => a.id === transferData.fromAccountId);
    const toAccIndex = accounts.findIndex(a => a.id === transferData.toAccountId);

    if (fromAccIndex === -1 || toAccIndex === -1) {
      throw new Error('Invalid source or destination account');
    }

    accounts[fromAccIndex].currentBalance -= amount;
    accounts[toAccIndex].currentBalance += amount;

    const fromName = accounts[fromAccIndex].name;
    const toName = accounts[toAccIndex].name;

    const txnNumber = `TRF-2026-${String(txns.length + 1).padStart(5, '0')}`;
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber,
      date: transferData.date,
      type: 'TRANSFER',
      category: 'Transfer',
      description: `Inter-Account Transfer: ${fromName} ➔ ${toName} (${transferData.notes || 'Fund Transfer'})`,
      amount,
      accountId: transferData.fromAccountId,
      accountName: fromName,
      paymentMethod: 'BANK_TRANSFER',
      reference: txnNumber,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'TRANSFER',
      'Accounts',
      `Transferred ৳${amount.toLocaleString()} from [${fromName}] to [${toName}]`,
      txnNumber
    );
  }

  /**
   * Customer Due Payment Collection
   */
  static collectCustomerDue(
    paymentData: {
      customerId: string;
      amount: number;
      accountId: string;
      paymentMethod: any;
      date: string;
      notes?: string;
    },
    currentUser: User
  ): void {
    const customers = this.getCustomers();
    const accounts = this.getAccounts();
    const txns = this.getTransactions();
    const amount = Number(paymentData.amount) || 0;

    const custIndex = customers.findIndex(c => c.id === paymentData.customerId);
    if (custIndex === -1) throw new Error('Customer not found');

    customers[custIndex].totalPaid += amount;
    customers[custIndex].totalDue = Math.max(0, customers[custIndex].totalDue - amount);

    const accIndex = accounts.findIndex(a => a.id === paymentData.accountId);
    if (accIndex !== -1) {
      accounts[accIndex].currentBalance += amount;
    }

    const custName = customers[custIndex].name;
    const accName = accounts[accIndex]?.name || 'Account';
    const txnNumber = `REC-2026-${String(txns.length + 1).padStart(5, '0')}`;

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber,
      date: paymentData.date,
      type: 'CUSTOMER_PAYMENT',
      category: 'Customer Collection',
      description: `Customer Due Collection from ${custName} (${paymentData.notes || 'Due Paid'})`,
      amount,
      accountId: paymentData.accountId,
      accountName: accName,
      paymentMethod: paymentData.paymentMethod,
      customerId: paymentData.customerId,
      customerName: custName,
      reference: txnNumber,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveCustomers([...customers]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'PAYMENT',
      'Customers',
      `Collected ৳${amount.toLocaleString()} due payment from customer [${custName}] into [${accName}]`,
      txnNumber
    );
  }

  /**
   * Supplier Payable Disbursement
   */
  static paySupplier(
    paymentData: {
      supplierId: string;
      amount: number;
      accountId: string;
      paymentMethod: any;
      date: string;
      notes?: string;
    },
    currentUser: User
  ): void {
    const suppliers = this.getSuppliers();
    const accounts = this.getAccounts();
    const txns = this.getTransactions();
    const amount = Number(paymentData.amount) || 0;

    const supIndex = suppliers.findIndex(s => s.id === paymentData.supplierId);
    if (supIndex === -1) throw new Error('Supplier not found');

    suppliers[supIndex].totalPaid += amount;
    suppliers[supIndex].totalPayable = Math.max(0, suppliers[supIndex].totalPayable - amount);

    const accIndex = accounts.findIndex(a => a.id === paymentData.accountId);
    if (accIndex !== -1) {
      accounts[accIndex].currentBalance -= amount;
    }

    const supName = suppliers[supIndex].name;
    const accName = accounts[accIndex]?.name || 'Account';
    const txnNumber = `PAY-2026-${String(txns.length + 1).padStart(5, '0')}`;

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber,
      date: paymentData.date,
      type: 'SUPPLIER_PAYMENT',
      category: 'Supplier Disbursement',
      description: `Supplier Payable Settlement to ${supName} (${paymentData.notes || 'Settlement'})`,
      amount,
      accountId: paymentData.accountId,
      accountName: accName,
      paymentMethod: paymentData.paymentMethod,
      supplierId: paymentData.supplierId,
      supplierName: supName,
      reference: txnNumber,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.saveSuppliers([...suppliers]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'DISBURSEMENT',
      'Suppliers',
      `Paid ৳${amount.toLocaleString()} to supplier [${supName}] from [${accName}]`,
      txnNumber
    );
  }

  /**
   * Office Purchase & Inventory update
   */
  static createPurchase(
    purchaseData: Omit<Purchase, 'id' | 'purchaseId' | 'createdAt'>,
    currentUser: User
  ): Purchase {
    const purchases = this.getPurchases();
    const products = this.getProducts();
    const accounts = this.getAccounts();
    const suppliers = this.getSuppliers();
    const txns = this.getTransactions();

    const count = purchases.length + 1;
    const purchaseId = `PUR-2026-${String(count).padStart(5, '0')}`;
    const id = `pur-${Date.now()}`;
    const total = Number(purchaseData.total) || (Number(purchaseData.quantity) * Number(purchaseData.unitPrice));

    const newPurchase: Purchase = {
      ...purchaseData,
      id,
      purchaseId,
      total,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // 1. Increment product stock
    if (purchaseData.productId) {
      const prodIndex = products.findIndex(p => p.id === purchaseData.productId);
      if (prodIndex !== -1) {
        products[prodIndex].currentStock += Number(purchaseData.quantity);
      }
    }

    // 2. Deduct from account
    const accIndex = accounts.findIndex(a => a.id === purchaseData.accountId);
    if (accIndex !== -1) {
      accounts[accIndex].currentBalance -= total;
    }

    const account = accounts.find(a => a.id === purchaseData.accountId);
    const supplier = suppliers.find(s => s.id === purchaseData.supplierId);

    // 3. Ledger record
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${String(txns.length + 1).padStart(5, '0')}`,
      date: purchaseData.date,
      type: 'PURCHASE',
      category: 'Purchases',
      description: `Office Supply Purchase: ${purchaseData.productName} (${purchaseData.quantity} Qty)`,
      amount: total,
      accountId: purchaseData.accountId,
      accountName: account?.name || 'Main Account',
      paymentMethod: purchaseData.paymentMethod,
      supplierId: purchaseData.supplierId,
      supplierName: supplier?.name,
      reference: purchaseId,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.savePurchases([newPurchase, ...purchases]);
    this.saveProducts([...products]);
    this.saveAccounts([...accounts]);
    this.saveTransactions([newTxn, ...txns]);

    this.logActivity(
      currentUser,
      'CREATE',
      'Purchases',
      `Purchased ${purchaseData.quantity} of ${purchaseData.productName} (Total: ৳${total.toLocaleString()})`,
      purchaseId
    );

    return newPurchase;
  }

  /**
   * Reset to complete demo data
   */
  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialCompanySettings));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(initialSuppliers));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(initialTickets));
    localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(initialIncome));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.OWNER_FUNDS, JSON.stringify(initialOwnerFunds));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(initialPurchases));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(initialActivityLogs));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialUsers[0]));
  }

  /**
   * Full database JSON export
   */
  static exportFullBackupJSON(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      company: 'Captain Air International',
      version: '1.0.0',
      data: {
        settings: this.getSettings(),
        users: this.getUsers(),
        accounts: this.getAccounts(),
        customers: this.getCustomers(),
        suppliers: this.getSuppliers(),
        tickets: this.getTickets(),
        income: this.getIncome(),
        expenses: this.getExpenses(),
        ownerFunds: this.getOwnerFunds(),
        products: this.getProducts(),
        purchases: this.getPurchases(),
        transactions: this.getTransactions(),
        activityLogs: this.getActivityLogs(),
        notifications: this.getNotifications(),
      }
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Full database JSON import
   */
  static importFullBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) throw new Error('Invalid backup file format');
      const d = parsed.data;
      if (d.settings) this.saveSettings(d.settings);
      if (d.users) this.saveUsers(d.users);
      if (d.accounts) this.saveAccounts(d.accounts);
      if (d.customers) this.saveCustomers(d.customers);
      if (d.suppliers) this.saveSuppliers(d.suppliers);
      if (d.tickets) this.saveTickets(d.tickets);
      if (d.income) this.saveIncome(d.income);
      if (d.expenses) this.saveExpenses(d.expenses);
      if (d.ownerFunds) this.saveOwnerFunds(d.ownerFunds);
      if (d.products) this.saveProducts(d.products);
      if (d.purchases) this.savePurchases(d.purchases);
      if (d.transactions) this.saveTransactions(d.transactions);
      if (d.activityLogs) this.saveActivityLogs(d.activityLogs);
      if (d.notifications) this.saveNotifications(d.notifications);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }

  /**
   * Sync complete database to Cloud Firestore
   */
  static async syncAllToFirestore(): Promise<{ success: boolean; message: string }> {
    if (!db) {
      return { success: false, message: 'Firebase Firestore is not initialized. Please configure your Firebase credentials in Settings.' };
    }

    try {
      const collections = [
        { name: 'settings', data: [this.getSettings()] },
        { name: 'accounts', data: this.getAccounts() },
        { name: 'customers', data: this.getCustomers() },
        { name: 'suppliers', data: this.getSuppliers() },
        { name: 'tickets', data: this.getTickets() },
        { name: 'income', data: this.getIncome() },
        { name: 'expenses', data: this.getExpenses() },
        { name: 'ownerFunds', data: this.getOwnerFunds() },
        { name: 'products', data: this.getProducts() },
        { name: 'purchases', data: this.getPurchases() },
        { name: 'transactions', data: this.getTransactions() },
        { name: 'users', data: this.getUsers() },
      ];

      for (const col of collections) {
        for (const item of col.data) {
          const docId = (item as any).id || (item as any).companyName || 'doc';
          await setDoc(doc(db, col.name, docId), item);
        }
      }

      return { success: true, message: 'Successfully synced all accounting and ticket records to Cloud Firestore!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to sync with Firestore' };
    }
  }
}
