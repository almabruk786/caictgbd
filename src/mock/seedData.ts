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
    currentBalance: -6365,
    status: 'ACTIVE',
    notes: 'Main office cash drawer account',
  },
];

// Clean empty arrays
export const initialCustomers: Customer[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialTickets: TicketSale[] = [];
export const initialProducts: Product[] = [];
export const initialPurchases: Purchase[] = [];
export const initialActivityLogs: ActivityLog[] = [];
export const initialNotifications: AppNotification[] = [];

// Arif Vai Initial Funding (Invested all August 2026 setup expenses: ৳2,45,800)
export const initialOwnerFunds: OwnerFundEntry[] = [
  {
    id: 'fnd-init-1',
    referenceNo: 'FND-2026-00001',
    date: '2026-08-01',
    type: 'INJECTION',
    amount: 245800,
    accountId: 'acc-cash',
    accountName: 'Office Cash',
    paymentMethod: 'CASH',
    notes: 'Initial Capital & Office Setup Investment (August 2026 Expenses Funded by Arif Vai)',
    createdBy: 'Arif Vai (Owner/Investor)',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

// Initial Income (from backup)
export const initialIncome: IncomeEntry[] = [
  {
    id: 'inc-1789452484509',
    voucherNo: 'INC-2026-00001',
    date: '2026-09-13',
    category: 'Ticket Commission',
    description: 'Date Change Profit (DAC - KUL)',
    amount: 1160,
    paymentMethod: 'CASH',
    reference: 'PNR - HQQEHD',
    notes: '',
    accountId: 'acc-cash',
    createdBy: 'Admin',
    createdAt: '2026-09-15T06:08:04.509Z',
  },
];

// All 19 Expenses (17 August setup funded by Arif Vai + 2 September active, total ৳253,325.00)
export const initialExpenses: ExpenseEntry[] = [
  { id: 'exp-1789456579324', voucherNo: 'EXP-2026-00019', date: '2026-09-15', category: 'Internet',        description: 'Sep 2026 Bill paid',                 amount: 525,   accountId: 'acc-cash', paymentMethod: 'BKASH', supplierId: '', reference: 'From Rocket (01822858585)', notes: '', createdBy: 'Admin', createdAt: '2026-09-15T07:16:19.324Z' },
  { id: 'exp-1789452390549', voucherNo: 'EXP-2026-00018', date: '2026-09-15', category: 'Office Rent',     description: 'Salam 1520+Younus Uncle 5500',       amount: 7000,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: '', createdBy: 'Admin', createdAt: '2026-09-15T06:06:30.549Z' },
  { id: 'exp-init-1',        voucherNo: 'EXP-2026-00001', date: '2026-08-01', category: 'Office Rent',     description: 'Office Advance Payment',            amount: 80000, accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-2',        voucherNo: 'EXP-2026-00002', date: '2026-08-01', category: 'Office Supplies', description: 'Previous Office Furniture Purchase', amount: 55000, accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-3',        voucherNo: 'EXP-2026-00003', date: '2026-08-01', category: 'Maintenance',     description: 'Office Paint Work',                 amount: 4700,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'exp-init-4',        voucherNo: 'EXP-2026-00004', date: '2026-08-05', category: 'Electricity',     description: 'Electricity Bill',                  amount: 2000,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-05T00:00:00.000Z' },
  { id: 'exp-init-5',        voucherNo: 'EXP-2026-00005', date: '2026-08-06', category: 'Maintenance',     description: 'Office Furniture Repair',           amount: 6000,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-06T00:00:00.000Z' },
  { id: 'exp-init-6',        voucherNo: 'EXP-2026-00006', date: '2026-08-15', category: 'Office Supplies', description: 'Rapoo Keyboard',                    amount: 1900,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-7',        voucherNo: 'EXP-2026-00007', date: '2026-08-15', category: 'Office Supplies', description: 'Office Desktop Computer',            amount: 15000, accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-8',        voucherNo: 'EXP-2026-00008', date: '2026-08-15', category: 'Office Supplies', description: 'Tenda Wifi Dongle',                 amount: 600,   accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-9',        voucherNo: 'EXP-2026-00009', date: '2026-08-15', category: 'Maintenance',     description: 'Office Decoration',                 amount: 7500,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-10',       voucherNo: 'EXP-2026-00010', date: '2026-08-15', category: 'Maintenance',     description: 'Thai Glass Repair',                 amount: 3500,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-11',       voucherNo: 'EXP-2026-00011', date: '2026-08-15', category: 'Office Supplies', description: 'Table Glass and Lock',              amount: 5500,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'exp-init-12',       voucherNo: 'EXP-2026-00012', date: '2026-08-16', category: 'Other',           description: 'Office Trade License',              amount: 5500,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-16T00:00:00.000Z' },
  { id: 'exp-init-13',       voucherNo: 'EXP-2026-00013', date: '2026-08-23', category: 'Office Supplies', description: 'Walton Multiplug',                  amount: 600,   accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'exp-init-14',       voucherNo: 'EXP-2026-00014', date: '2026-08-23', category: 'Office Supplies', description: 'Camera DVR',                        amount: 1800,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'exp-init-15',       voucherNo: 'EXP-2026-00015', date: '2026-08-24', category: 'Office Supplies', description: 'Printer & Brand Multiplug (Ryans)', amount: 18600, accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: 'B-3633965',                  notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'exp-init-16',       voucherNo: 'EXP-2026-00016', date: '2026-08-25', category: 'Office Supplies', description: 'Power Guard UPS 650VA (Ryans)',     amount: 3600,  accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: 'B-3636990',                  notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-25T00:00:00.000Z' },
  { id: 'exp-init-17',       voucherNo: 'EXP-2026-00017', date: '2026-08-28', category: 'Office Supplies', description: 'Dell Laptop',                       amount: 34000, accountId: 'acc-cash', paymentMethod: 'CASH',  supplierId: '', reference: '',                           notes: 'Funded by Arif Vai', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-28T00:00:00.000Z' },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'txn-fnd-init-1',
    txnNumber: 'TXN-2026-00000',
    date: '2026-08-01',
    type: 'OWNER_FUND_IN',
    category: 'Owner Investment',
    description: 'Arif Vai Initial Setup Investment: August 2026 Expenses Funding',
    amount: 245800,
    accountId: 'acc-cash',
    accountName: 'Office Cash',
    paymentMethod: 'CASH',
    reference: 'FND-2026-00001',
    createdBy: 'Arif Vai (Owner/Investor)',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'txn-1789456579324',
    txnNumber: 'TXN-2026-00020',
    date: '2026-09-15',
    type: 'EXPENSE',
    category: 'Internet',
    description: 'Sep 2026 Bill paid',
    amount: 525,
    accountId: 'acc-cash',
    accountName: 'Office Cash',
    paymentMethod: 'BKASH',
    reference: 'EXP-2026-00019',
    createdBy: 'Admin',
    createdAt: '2026-09-15T07:16:19.324Z',
  },
  {
    id: 'txn-1789452484510',
    txnNumber: 'TXN-2026-00019',
    date: '2026-09-13',
    type: 'INCOME',
    category: 'Ticket Commission',
    description: 'Date Change Profit (DAC - KUL)',
    amount: 1160,
    accountId: 'acc-cash',
    accountName: 'Office Cash',
    paymentMethod: 'CASH',
    reference: 'INC-2026-00001',
    createdBy: 'Admin',
    createdAt: '2026-09-15T06:08:04.510Z',
  },
  {
    id: 'txn-1789452390549',
    txnNumber: 'TXN-2026-00018',
    date: '2026-09-15',
    type: 'EXPENSE',
    category: 'Office Rent',
    description: 'Salam 1520+Younus Uncle 5500',
    amount: 7000,
    accountId: 'acc-cash',
    accountName: 'Office Cash',
    paymentMethod: 'CASH',
    reference: 'EXP-2026-00018',
    createdBy: 'Admin',
    createdAt: '2026-09-15T06:06:30.549Z',
  },
  { id: 'txn-init-1',  txnNumber: 'TXN-2026-00001', date: '2026-08-01', type: 'EXPENSE', category: 'Office Rent',     description: 'Office Advance Payment',            amount: 80000, accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00001', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'txn-init-2',  txnNumber: 'TXN-2026-00002', date: '2026-08-01', type: 'EXPENSE', category: 'Office Supplies', description: 'Previous Office Furniture Purchase', amount: 55000, accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00002', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'txn-init-3',  txnNumber: 'TXN-2026-00003', date: '2026-08-01', type: 'EXPENSE', category: 'Maintenance',     description: 'Office Paint Work',                 amount: 4700,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00003', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'txn-init-4',  txnNumber: 'TXN-2026-00004', date: '2026-08-05', type: 'EXPENSE', category: 'Electricity',     description: 'Electricity Bill',                  amount: 2000,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00004', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-05T00:00:00.000Z' },
  { id: 'txn-init-5',  txnNumber: 'TXN-2026-00005', date: '2026-08-06', type: 'EXPENSE', category: 'Maintenance',     description: 'Office Furniture Repair',           amount: 6000,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00005', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-06T00:00:00.000Z' },
  { id: 'txn-init-6',  txnNumber: 'TXN-2026-00006', date: '2026-08-15', type: 'EXPENSE', category: 'Office Supplies', description: 'Rapoo Keyboard',                    amount: 1900,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00006', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-7',  txnNumber: 'TXN-2026-00007', date: '2026-08-15', type: 'EXPENSE', category: 'Office Supplies', description: 'Office Desktop Computer',            amount: 15000, accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00007', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-8',  txnNumber: 'TXN-2026-00008', date: '2026-08-15', type: 'EXPENSE', category: 'Office Supplies', description: 'Tenda Wifi Dongle',                 amount: 600,   accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00008', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-9',  txnNumber: 'TXN-2026-00009', date: '2026-08-15', type: 'EXPENSE', category: 'Maintenance',     description: 'Office Decoration',                 amount: 7500,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00009', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-10', txnNumber: 'TXN-2026-00010', date: '2026-08-15', type: 'EXPENSE', category: 'Maintenance',     description: 'Thai Glass Repair',                 amount: 3500,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00010', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-11', txnNumber: 'TXN-2026-00011', date: '2026-08-15', type: 'EXPENSE', category: 'Office Supplies', description: 'Table Glass and Lock',              amount: 5500,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00011', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-15T00:00:00.000Z' },
  { id: 'txn-init-12', txnNumber: 'TXN-2026-00012', date: '2026-08-16', type: 'EXPENSE', category: 'Other',           description: 'Office Trade License',              amount: 5500,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00012', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-16T00:00:00.000Z' },
  { id: 'txn-init-13', txnNumber: 'TXN-2026-00013', date: '2026-08-23', type: 'EXPENSE', category: 'Office Supplies', description: 'Walton Multiplug',                  amount: 600,   accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00013', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'txn-init-14', txnNumber: 'TXN-2026-00014', date: '2026-08-23', type: 'EXPENSE', category: 'Office Supplies', description: 'Camera DVR',                        amount: 1800,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00014', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-23T00:00:00.000Z' },
  { id: 'txn-init-15', txnNumber: 'TXN-2026-00015', date: '2026-08-24', type: 'EXPENSE', category: 'Office Supplies', description: 'Printer & Brand Multiplug (Ryans)', amount: 18600, accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00015', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'txn-init-16', txnNumber: 'TXN-2026-00016', date: '2026-08-25', type: 'EXPENSE', category: 'Office Supplies', description: 'Power Guard UPS 650VA (Ryans)',     amount: 3600,  accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00016', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-25T00:00:00.000Z' },
  { id: 'txn-init-17', txnNumber: 'TXN-2026-00017', date: '2026-08-28', type: 'EXPENSE', category: 'Office Supplies', description: 'Dell Laptop',                       amount: 34000, accountId: 'acc-cash', accountName: 'Office Cash', paymentMethod: 'CASH', reference: 'EXP-2026-00017', createdBy: 'Captain Boss (Owner)', createdAt: '2026-08-28T00:00:00.000Z' },
];
