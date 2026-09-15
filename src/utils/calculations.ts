import { 
  TicketSale, 
  IncomeEntry, 
  ExpenseEntry, 
  OwnerFundEntry, 
  Purchase, 
  Account, 
  Transaction,
  Customer,
  Supplier
} from '../types';

/**
 * Calculates net profit for a single flight ticket sale
 * Formula: Selling Price - Purchase Cost - Discount + Service Charge + Commission
 */
export function calculateTicketProfit(ticket: {
  sellingPrice: number;
  purchaseCost: number;
  discount?: number;
  serviceCharge?: number;
  commission?: number;
}): number {
  const selling = Number(ticket.sellingPrice) || 0;
  const cost = Number(ticket.purchaseCost) || 0;
  const disc = Number(ticket.discount) || 0;
  const svc = Number(ticket.serviceCharge) || 0;
  const comm = Number(ticket.commission) || 0;
  
  return (selling - cost - disc + svc + comm);
}

/**
 * Dashboard & Financial Aggregator
 * Accurately separates:
 * 1. Business Operating Income
 * 2. Operating Expenses
 * 3. Flight Ticket Sales & Profit
 * 4. Owner/Boss Fund (Equity)
 * 5. Net Business Profit
 */
export interface DashboardMetrics {
  totalCashAndBankBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTicketSalesRevenue: number;
  totalTicketCost: number;
  totalTicketProfit: number;
  ticketCount: number;
  netBusinessProfit: number;
  totalCustomerReceivable: number;
  totalSupplierPayable: number;
  totalOwnerFundBalance: number;
  totalOwnerInjections: number;
  totalOwnerWithdrawals: number;
}

export function computeDashboardMetrics(data: {
  accounts: Account[];
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  purchases: Purchase[];
  tickets: TicketSale[];
  ownerFunds: OwnerFundEntry[];
  customers: Customer[];
  suppliers: Supplier[];
}): DashboardMetrics {
  const { accounts, income, expenses, purchases, tickets, ownerFunds, customers, suppliers } = data;
  
  // 1. Total Balance across all active accounts
  const totalCashAndBankBalance = accounts
    .filter(a => a.status === 'ACTIVE')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
  
  // 2. Direct Business Income (Visa, Commissions, Service Charges, etc.)
  const directIncome = income.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  // 3. Operating Expenses + Purchases
  const directExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const purchaseExpenses = purchases.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalExpense = directExpenses + purchaseExpenses;
  
  // 4. Ticket metrics (Confirmed & Reissued tickets count towards revenue/profit)
  const validTickets = tickets.filter(t => t.status === 'CONFIRMED' || t.status === 'REISSUED');
  const totalTicketSalesRevenue = validTickets.reduce((sum, t) => sum + (Number(t.sellingPrice) || 0), 0);
  const totalTicketCost = validTickets.reduce((sum, t) => sum + (Number(t.purchaseCost) || 0), 0);
  const totalTicketProfit = validTickets.reduce((sum, t) => sum + (Number(t.netProfit) || calculateTicketProfit(t)), 0);
  const ticketCount = validTickets.length;
  
  // Total Revenue for display
  const totalIncome = directIncome + totalTicketSalesRevenue;
  
  // 5. Net Business Profit: Ticket Profit + Direct Business Income - Total Operating Expenses
  const netBusinessProfit = (totalTicketProfit + directIncome) - totalExpense;
  
  // 6. Receivables & Payables
  const totalCustomerReceivable = customers.reduce((sum, c) => sum + (Number(c.totalDue) || 0), 0);
  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + (Number(s.totalPayable) || 0), 0);
  
  // 7. Owner Fund segregation (Equity)
  const totalOwnerInjections = ownerFunds
    .filter(f => f.type === 'INJECTION')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalOwnerWithdrawals = ownerFunds
    .filter(f => f.type === 'WITHDRAWAL')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalOwnerFundBalance = totalOwnerInjections - totalOwnerWithdrawals;
  
  return {
    totalCashAndBankBalance,
    totalIncome,
    totalExpense,
    totalTicketSalesRevenue,
    totalTicketCost,
    totalTicketProfit,
    ticketCount,
    netBusinessProfit,
    totalCustomerReceivable,
    totalSupplierPayable,
    totalOwnerFundBalance,
    totalOwnerInjections,
    totalOwnerWithdrawals,
  };
}
