import { 
  User, 
  Account, 
  Customer, 
  Supplier, 
  TicketSale, 
  IncomeEntry, 
  ExpenseEntry, 
  OwnerFundEntry, 
  Product, 
  Purchase, 
  Transaction, 
  ActivityLog, 
  AppNotification, 
  CompanySettings 
} from '../types';

export const initialCompanySettings: CompanySettings = {
  companyName: 'Captain Air International',
  tagline: 'Your Trusted Flight & Travel Partner',
  logoUrl: '',
  address: '86/72 Sheikh Farid Market, 2 No Gate, Chittagong',
  phone: '01822858585, 01960062775',
  email: 'caictgbd@gmail.com',
  website: 'https://captainairbd.com',
  tradeLicense: 'TRAD/DSCC/029845/2024',
  currency: 'BDT',
  currencySymbol: '৳',
  financialYear: '2026-2027',
  defaultAccountId: 'acc-cash',
  defaultPaymentMethod: 'CASH',
  defaultServiceCharge: 0,
  defaultCommission: 0,
  invoicePrefix: 'CAI-INV-2026-',
  receiptPrefix: 'CAI-MR-2026-',
  printFooter: 'Thank you for choosing Captain Air International.',
};

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'Admin',
    email: 'admin',
    role: 'ADMIN',
    phone: '01822858585',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
];

export const initialAccounts: Account[] = [
  {
    id: 'acc-cash',
    name: 'Office Cash',
    type: 'OFFICE_CASH',
    openingBalance: 0,
    currentBalance: 0,
    status: 'ACTIVE',
    notes: 'Main office cash drawer account',
  },
];

// Clean empty arrays
export const initialCustomers: Customer[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialTickets: TicketSale[] = [];
export const initialIncome: IncomeEntry[] = [];
export const initialOwnerFunds: OwnerFundEntry[] = [];
export const initialProducts: Product[] = [];
export const initialPurchases: Purchase[] = [];
export const initialActivityLogs: ActivityLog[] = [];
export const initialNotifications: AppNotification[] = [];

// August 2026 Office Setup Expenses
export const initialExpenses: ExpenseEntry[] = [
  { id: 'exp-init-1',  voucherNo: 'EXP-2026-00001', date: '2026-08-01', category: 'Office Rent',     description: 'Office Advance Payment',            amount: 80000, accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-2',  voucherNo: 'EXP-2026-00002', date: '2026-08-01', category: 'Office Supplies', description: 'Previous Office Furniture Purchase', amount: 55000, accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-3',  voucherNo: 'EXP-2026-00003', date: '2026-08-01', category: 'Maintenance',     description: 'Office Paint Work',                 amount: 4700,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-4',  voucherNo: 'EXP-2026-00004', date: '2026-08-05', category: 'Electricity',     description: 'Electricity Bill',                  amount: 2000,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-05T00:00:00.000Z' },
  { id: 'exp-init-5',  voucherNo: 'EXP-2026-00005', date: '2026-08-06', category: 'Maintenance',     description: 'Office Furniture Repair',           amount: 6000,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-06T00:00:00.000Z' },
  { id: 'exp-init-6',  voucherNo: 'EXP-2026-00006', date: '2026-08-15', category: 'Office Supplies', description: 'Rapoo Keyboard',                    amount: 1900,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-7',  voucherNo: 'EXP-2026-00007', date: '2026-08-15', category: 'Office Supplies', description: 'Office Desktop Computer',            amount: 15000, accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-8',  voucherNo: 'EXP-2026-00008', date: '2026-08-15', category: 'Office Supplies', description: 'Tenda Wifi Dongle',                 amount: 600,   accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-9',  voucherNo: 'EXP-2026-00009', date: '2026-08-15', category: 'Maintenance',     description: 'Office Decoration',                 amount: 7500,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-10', voucherNo: 'EXP-2026-00010', date: '2026-08-15', category: 'Maintenance',     description: 'Thai Glass Repair',                 amount: 3500,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-11', voucherNo: 'EXP-2026-00011', date: '2026-08-15', category: 'Office Supplies', description: 'Table Glass and Lock',              amount: 5500,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-12', voucherNo: 'EXP-2026-00012', date: '2026-08-16', category: 'Other',           description: 'Office Trade License',              amount: 5500,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-16T00:00:00.000Z' },
  { id: 'exp-init-13', voucherNo: 'EXP-2026-00013', date: '2026-08-23', category: 'Office Supplies', description: 'Walton Multiplug',                  amount: 600,   accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'exp-init-14', voucherNo: 'EXP-2026-00014', date: '2026-08-23', category: 'Office Supplies', description: 'Camera DVR',                        amount: 1800,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'exp-init-15', voucherNo: 'EXP-2026-00015', date: '2026-08-24', category: 'Office Supplies', description: 'Printer & Brand Multiplug (Ryans)', amount: 18600, accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: 'B-3633965', notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'exp-init-16', voucherNo: 'EXP-2026-00016', date: '2026-08-25', category: 'Office Supplies', description: 'Power Guard UPS 650VA (Ryans)',     amount: 3600,  accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: 'B-3636990', notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-25T00:00:00.000Z' },
  { id: 'exp-init-17', voucherNo: 'EXP-2026-00017', date: '2026-08-28', category: 'Office Supplies', description: 'Dell Laptop',                       amount: 34000, accountId: 'acc-cash', paymentMethod: 'CASH', supplierId: '', reference: '',           notes: '', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-28T00:00:00.000Z' },
];

export const initialTransactions: Transaction[] = initialExpenses.map((e, i) => ({
  id: `txn-init-${i + 1}`,
  txnNumber: `TXN-2026-${String(i + 1).padStart(5, '0')}`,
  date: e.date,
  type: 'EXPENSE' as const,
  category: e.category,
  description: e.description,
  amount: e.amount,
  accountId: e.accountId,
  accountName: 'Office Cash',
  paymentMethod: e.paymentMethod,
  reference: e.voucherNo,
  createdBy: e.createdBy,
  createdAt: e.createdAt,
}));
