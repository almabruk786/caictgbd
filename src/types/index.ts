export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ACCOUNTANT' | 'TICKET_STAFF' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type AccountType = 'OFFICE_CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'CREDIT_CARD' | 'PETTY_CASH' | 'OTHER';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  bankName?: string;
  openingBalance: number;
  currentBalance: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | 'CARD' | 'CHEQUE' | 'OTHER';

export type TransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TICKET_SALE'
  | 'PURCHASE'
  | 'OWNER_FUND_IN'
  | 'OWNER_WITHDRAWAL'
  | 'TRANSFER'
  | 'CUSTOMER_PAYMENT'
  | 'CUSTOMER_REFUND'
  | 'SUPPLIER_PAYMENT'
  | 'SUPPLIER_REFUND';

export interface Transaction {
  id: string;
  txnNumber: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  accountId: string;
  accountName?: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  reference?: string;
  attachment?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type IncomeCategory =
  | 'Owner Capital / Deposit'
  | 'Ticket Commission'
  | 'Service Charge'
  | 'Visa Processing'
  | 'Travel Package'
  | 'Hotel Commission'
  | 'Insurance'
  | 'Other';

export interface IncomeEntry {
  id: string;
  voucherNo: string;
  date: string;
  category: IncomeCategory;
  description: string;
  amount: number;
  accountId: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  reference?: string;
  notes?: string;
  attachment?: string;
  createdBy: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Owner Withdrawal'
  | 'Bank Deposit / Transfer'
  | 'Office Rent'
  | 'Salary'
  | 'Electricity'
  | 'Internet'
  | 'Office Supplies'
  | 'Printer Ink'
  | 'Marketing'
  | 'Transport'
  | 'Food/Refreshment'
  | 'Maintenance'
  | 'Software'
  | 'Bank Charges'
  | 'Other';

export interface ExpenseEntry {
  id: string;
  voucherNo: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  accountId: string;
  paymentMethod: PaymentMethod;
  supplierId?: string;
  reference?: string;
  notes?: string;
  receiptAttachment?: string;
  createdBy: string;
  createdAt: string;
}

export interface OwnerFundEntry {
  id: string;
  referenceNo: string;
  date: string;
  type: 'INJECTION' | 'WITHDRAWAL';
  amount: number;
  accountId: string;
  accountName?: string;
  paymentMethod: PaymentMethod;
  notes: string;
  receiptAttachment?: string;
  createdBy: string;
  createdAt: string;
}

export type TicketStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | 'REISSUED';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface TicketSale {
  id: string;
  ticketId: string; // TKT-2026-00001
  saleDate: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  pnr: string;
  airline: string;
  ticketNumber: string;
  route: string;
  departure: string;
  destination: string;
  travelDate: string;
  travelTime?: string;
  cabinClass: CabinClass;
  numPassengers: number;
  supplierId: string;
  supplierName?: string;
  customerId?: string;
  customerName?: string;
  
  // Financial breakdown
  purchaseCost: number;
  sellingPrice: number;
  discount: number;
  commission: number;
  serviceCharge: number;
  netProfit: number; // dynamically calculated
  
  // Payment status
  customerPaid: number;
  customerDue: number;
  supplierPaid: number;
  supplierDue: number;
  
  paymentMethod: PaymentMethod;
  accountId: string;
  status: TicketStatus;
  notes?: string;
  attachment?: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerId: string; // CUST-0001
  name: string;
  phone: string;
  email?: string;
  address?: string;
  passportNumber?: string;
  nid?: string;
  dateOfBirth?: string;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  totalRefunded: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierId: string; // SUP-0001
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalPaid: number;
  totalPayable: number;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  productId: string; // PRD-0001
  name: string;
  category: string;
  sku: string;
  unit: string; // Pack, Pcs, Box, Roll
  purchasePrice: number;
  sellingPrice?: number;
  currentStock: number;
  minStock: number;
  supplierId?: string;
  description?: string;
}

export interface Purchase {
  id: string;
  purchaseId: string; // PUR-2026-00001
  date: string;
  supplierId: string;
  supplierName?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  accountId: string;
  paymentMethod: PaymentMethod;
  invoiceNumber?: string;
  notes?: string;
  attachment?: string;
  createdBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: string;
  recordId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type NotificationType = 'INFO' | 'WARNING' | 'DUE_ALERT' | 'STOCK_ALERT' | 'TICKET_ALERT';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tradeLicense: string;
  currency: string;
  currencySymbol: string;
  financialYear: string;
  defaultAccountId: string;
  defaultPaymentMethod: PaymentMethod;
  defaultServiceCharge: number;
  defaultCommission: number;
  invoicePrefix: string;
  receiptPrefix: string;
  printFooter: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export type PrintDocumentType =
  | 'MONEY_RECEIPT'
  | 'INCOME_VOUCHER'
  | 'EXPENSE_VOUCHER'
  | 'TICKET_INVOICE'
  | 'TICKET_RECEIPT'
  | 'PURCHASE_INVOICE'
  | 'CUSTOMER_STATEMENT'
  | 'SUPPLIER_STATEMENT'
  | 'ACCOUNT_STATEMENT'
  | 'DAILY_CASH_REPORT'
  | 'MONTHLY_FINANCIAL_REPORT'
  | 'PROFIT_LOSS_REPORT';

export type PrintSize = 'A4' | 'A5' | 'THERMAL';
