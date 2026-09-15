import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { TicketSale, CabinClass, TicketStatus, PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import {
  Plane,
  PlusCircle,
  Search,
  Download,
  Printer,
  FileDown,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Users,
  Building2,
  ChevronRight,
  Filter,
} from 'lucide-react';

const AIRLINES = [
  'Biman Bangladesh',
  'US-Bangla Airlines',
  'Novoair',
  'Air Astra',
  'Emirates',
  'FlyDubai',
  'Saudia',
  'Qatar Airways',
  'Air Arabia',
  'Jazeera Airways',
  'Gulf Air',
  'Kuwait Airways',
  'Oman Air',
  'Singapore Airlines',
  'Malaysia Airlines',
  'Thai Airways',
  'IndiGo',
  'Air India',
  'Turkish Airlines',
  'Other',
];

const CABIN_CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy Class' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business Class' },
  { value: 'FIRST', label: 'First Class' },
];

const defaultTicketForm = () => ({
  saleDate: new Date().toISOString().split('T')[0],
  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',
  pnr: '',
  airline: 'Biman Bangladesh',
  ticketNumber: '',
  route: 'DAC - CGP',
  departure: 'Dhaka (DAC)',
  destination: 'Chittagong (CGP)',
  travelDate: new Date().toISOString().split('T')[0],
  travelTime: '10:00 AM',
  cabinClass: 'ECONOMY' as CabinClass,
  numPassengers: 1,
  supplierId: '',
  supplierName: '',
  customerId: '',
  customerName: '',
  purchaseCost: '' as number | '',
  sellingPrice: '' as number | '',
  discount: 0,
  commission: 0,
  serviceCharge: 0,
  customerPaid: '' as number | '',
  supplierPaid: '' as number | '',
  paymentMethod: 'CASH' as PaymentMethod,
  accountId: 'acc-cash',
  status: 'CONFIRMED' as TicketStatus,
  notes: '',
});

export const TicketsPage: React.FC = () => {
  const { tickets, accounts, customers, suppliers, addTicket, collectCustomerDue, settings } = useAppData();

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [selectedTicketForDue, setSelectedTicketForDue] = useState<TicketSale | null>(null);
  const [duePaymentAmount, setDuePaymentAmount] = useState<string>('');
  const [duePaymentMethod, setDuePaymentMethod] = useState<PaymentMethod>('CASH');
  const [duePaymentAccountId, setDuePaymentAccountId] = useState<string>(accounts[0]?.id || 'acc-cash');

  // Form State
  const [formData, setFormData] = useState(defaultTicketForm());

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterAirline, setFilterAirline] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Live calculation for form
  const selling = Number(formData.sellingPrice) || 0;
  const cost = Number(formData.purchaseCost) || 0;
  const paid = Number(formData.customerPaid) || 0;
  const formProfit = Math.max(0, selling - cost - (Number(formData.discount) || 0) + (Number(formData.serviceCharge) || 0));
  const formCustomerDue = Math.max(0, selling - paid);

  // Metrics
  const totalSales = useMemo(() => tickets.reduce((s, t) => s + t.sellingPrice, 0), [tickets]);
  const totalProfit = useMemo(() => tickets.reduce((s, t) => s + t.netProfit, 0), [tickets]);
  const totalCustomerDue = useMemo(() => tickets.reduce((s, t) => s + t.customerDue, 0), [tickets]);
  const totalSupplierDue = useMemo(() => tickets.reduce((s, t) => s + t.supplierDue, 0), [tickets]);

  // Filtered tickets
  const filtered = useMemo(() => {
    let list = [...tickets].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        t =>
          t.passengerName.toLowerCase().includes(q) ||
          t.pnr.toLowerCase().includes(q) ||
          t.ticketId.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.airline.toLowerCase().includes(q) ||
          t.route.toLowerCase().includes(q) ||
          t.passengerPhone.includes(q)
      );
    }

    if (filterAirline !== 'ALL') list = list.filter(t => t.airline === filterAirline);
    if (filterStatus !== 'ALL') list = list.filter(t => t.status === filterStatus);
    if (filterDueOnly) list = list.filter(t => t.customerDue > 0);

    return list;
  }, [tickets, search, filterAirline, filterStatus, filterDueOnly]);

  const handleSubmitNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passengerName || !formData.sellingPrice || !formData.pnr) return;

    addTicket({
      ...formData,
      sellingPrice: Number(formData.sellingPrice),
      purchaseCost: Number(formData.purchaseCost) || 0,
      customerPaid: Number(formData.customerPaid) || 0,
      supplierPaid: Number(formData.supplierPaid) || 0,
      discount: Number(formData.discount) || 0,
      commission: Number(formData.commission) || 0,
      serviceCharge: Number(formData.serviceCharge) || 0,
      accountId: formData.accountId || accounts[0]?.id || 'acc-cash',
    });

    setIsNewModalOpen(false);
    setFormData(defaultTicketForm());
  };

  const handleOpenDueModal = (ticket: TicketSale) => {
    setSelectedTicketForDue(ticket);
    setDuePaymentAmount(String(ticket.customerDue));
    setIsDueModalOpen(true);
  };

  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForDue) return;
    const amt = Number(duePaymentAmount) || 0;
    if (amt <= 0) return;

    collectCustomerDue({
      customerId: selectedTicketForDue.customerId || `temp-${selectedTicketForDue.id}`,
      amount: amt,
      accountId: duePaymentAccountId,
      paymentMethod: duePaymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: `Ticket Due payment for ${selectedTicketForDue.ticketId} (PNR: ${selectedTicketForDue.pnr})`,
    });

    setIsDueModalOpen(false);
  };

  const printTicketReceipt = (ticket: TicketSale) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket Receipt — ${ticket.ticketId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #0f172a; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .title { font-size: 20px; font-weight: 900; color: #0369a1; }
          .tagline { font-size: 11px; color: #64748b; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 12px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
          .table th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; }
          .table td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; }
          .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: right; }
          .amount { font-size: 20px; font-weight: 900; color: #15803d; }
          .due { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">✈ ${settings?.companyName || 'Captain Air International'}</div>
            <div class="tagline">${settings?.tagline || 'Your Trusted Flight & Travel Partner'}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${settings?.address} | Phone: ${settings?.phone}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 800;">FLIGHT TICKET INVOICE</div>
            <div style="font-size: 11px; color: #64748b;">${ticket.ticketId}</div>
            <div style="font-size: 10px; color: #64748b;">Date: ${ticket.saleDate}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <strong>Passenger Details:</strong><br/>
            Name: <b>${ticket.passengerName}</b><br/>
            Phone: ${ticket.passengerPhone}<br/>
            PNR: <b style="font-family: monospace; color: #0369a1;">${ticket.pnr}</b><br/>
            Ticket No: ${ticket.ticketNumber || 'N/A'}
          </div>
          <div class="box">
            <strong>Flight Details:</strong><br/>
            Airline: <b>${ticket.airline}</b><br/>
            Route: ${ticket.route}<br/>
            Travel Date: <b>${ticket.travelDate}</b> (${ticket.travelTime || 'TBD'})<br/>
            Cabin Class: ${ticket.cabinClass}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Flight Fare & Taxes (${ticket.airline} - ${ticket.route})</td>
              <td style="text-align: right; font-weight: bold;">${ticket.sellingPrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Customer Paid Amount</td>
              <td style="text-align: right; color: #15803d; font-weight: bold;">-${ticket.customerPaid.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="amount-box">
          <div>Total Selling Price: <b>৳${ticket.sellingPrice.toLocaleString()}</b></div>
          <div>Amount Paid: <b style="color: #15803d;">৳${ticket.customerPaid.toLocaleString()}</b></div>
          <div style="margin-top: 8px; font-size: 14px;">
            ${ticket.customerDue > 0 ? `<span class="due">Balance Due: ৳${ticket.customerDue.toLocaleString()}</span>` : `<span style="color: #15803d; font-weight: 800;">● FULLY PAID</span>`}
          </div>
        </div>

        <div class="footer">
          Thank you for choosing ${settings?.companyName || 'Captain Air International'}. Have a safe journey!
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
  };

  const exportCSV = () => {
    const rows = [
      ['Ticket ID', 'Date', 'PNR', 'Airline', 'Passenger', 'Phone', 'Route', 'Travel Date', 'Selling', 'Cost', 'Profit', 'Customer Due'],
      ...filtered.map(t => [
        t.ticketId,
        t.saleDate,
        t.pnr,
        t.airline,
        `"${t.passengerName}"`,
        t.passengerPhone,
        `"${t.route}"`,
        t.travelDate,
        t.sellingPrice,
        t.purchaseCost,
        t.netProfit,
        t.customerDue,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Captain_Air_Tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/30 text-white">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            Flight Ticketing & Sales Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue flight tickets, calculate live net profit, track customer dues, and print invoices
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Ticket</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Ticket Sales
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatBDT(totalSales)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-brand-600">{tickets.length} Tickets Issued</span>
            <span className="text-[10px] text-slate-400 font-mono">Gross Volume</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Net Agency Profit
          </span>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{formatBDT(totalProfit)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-emerald-600">Earnings after airline cost</span>
            <span className="text-[10px] text-slate-400 font-mono">Net Profit</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Passenger Due Receivables
          </span>
          <div className="text-2xl font-black text-amber-600 tracking-tight">{formatBDT(totalCustomerDue)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-amber-600">
              {tickets.filter(t => t.customerDue > 0).length} Unsettled Tickets
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Customer Due</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Airline Supplier Payables
          </span>
          <div className="text-2xl font-black text-rose-600 tracking-tight">{formatBDT(totalSupplierDue)}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-[11px] font-semibold text-rose-600">Wholesaler Balance</span>
            <span className="text-[10px] text-slate-400 font-mono">Supplier Due</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Passenger, PNR, Ticket No, Phone, Route, Airline..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={filterAirline}
              onChange={e => setFilterAirline(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none"
            >
              <option value="ALL">All Airlines</option>
              {AIRLINES.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFilterDueOnly(!filterDueOnly)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                filterDueOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Due Only ({tickets.filter(t => t.customerDue > 0).length})
            </button>

            <button
              onClick={exportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="text-left px-4 py-3.5">Ticket ID / PNR</th>
                <th className="text-left px-4 py-3.5">Passenger</th>
                <th className="text-left px-4 py-3.5">Airline & Route</th>
                <th className="text-left px-4 py-3.5">Travel Date</th>
                <th className="text-right px-4 py-3.5">Selling Price</th>
                <th className="text-right px-4 py-3.5">Net Profit</th>
                <th className="text-right px-4 py-3.5">Customer Due</th>
                <th className="text-center px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Plane className="w-12 h-12 mx-auto mb-2 text-slate-200 transform -rotate-45" />
                    <p className="font-bold text-sm text-slate-600">No flight tickets recorded</p>
                    <p className="text-xs text-slate-400 mt-1">Issue your first ticket to track sales and profits</p>
                    <button
                      onClick={() => setIsNewModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/25 transition-all"
                    >
                      Issue First Flight Ticket →
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-brand-700">{t.ticketId}</div>
                      <div className="font-mono text-[10.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        PNR: {t.pnr}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{t.passengerName}</div>
                      <div className="text-[10px] text-slate-400">{t.passengerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{t.airline}</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">{t.route}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                      {formatDateDisplay(t.travelDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatBDT(t.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600 whitespace-nowrap">
                      +{formatBDT(t.netProfit)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {t.customerDue > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          {formatBDT(t.customerDue)} Due
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold text-emerald-600">● Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {t.customerDue > 0 && (
                          <button
                            onClick={() => handleOpenDueModal(t)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[10.5px] transition-colors border border-amber-200"
                            title="Collect Due"
                          >
                            Collect Due
                          </button>
                        )}
                        <button
                          onClick={() => printTicketReceipt(t)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Print Ticket Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Issue New Flight Ticket */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-fade-in border border-slate-100 my-8 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                  <Plane className="w-5 h-5 transform -rotate-45" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Issue Flight Ticket</h2>
                  <p className="text-xs text-slate-500">Record passenger booking & auto calculate profit</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTicket} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Flight Info */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flight & Booking</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Airline *</label>
                  <select
                    value={formData.airline}
                    onChange={e => setFormData({ ...formData, airline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {AIRLINES.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">PNR *</label>
                  <input
                    type="text"
                    required
                    value={formData.pnr}
                    onChange={e => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                    placeholder="e.g. 6XYZ8Q"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Ticket Number</label>
                  <input
                    type="text"
                    value={formData.ticketNumber}
                    onChange={e => setFormData({ ...formData, ticketNumber: e.target.value })}
                    placeholder="e.g. 098-2451234567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Route *</label>
                  <input
                    type="text"
                    required
                    value={formData.route}
                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                    placeholder="e.g. DAC - DXB - DAC"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Travel Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.travelDate}
                    onChange={e => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Cabin Class</label>
                  <select
                    value={formData.cabinClass}
                    onChange={e => setFormData({ ...formData, cabinClass: e.target.value as CabinClass })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {CABIN_CLASSES.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                Passenger Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Passenger Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.passengerName}
                    onChange={e => setFormData({ ...formData, passengerName: e.target.value })}
                    placeholder="e.g. Mohammad Rahim"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Passenger Mobile *</label>
                  <input
                    type="text"
                    required
                    value={formData.passengerPhone}
                    onChange={e => setFormData({ ...formData, passengerPhone: e.target.value })}
                    placeholder="e.g. 01812345678"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Profit Calculation */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                Financial Breakdown & Live Profit
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Selling Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Airline Cost (৳)</label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={e => setFormData({ ...formData, purchaseCost: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Customer Paid (৳)</label>
                  <input
                    type="number"
                    value={formData.customerPaid}
                    onChange={e => setFormData({ ...formData, customerPaid: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Deposit Account</label>
                  <select
                    value={formData.accountId}
                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Profit & Due preview banner */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Profit</span>
                  <div className="text-xl font-black text-emerald-400">+{formatBDT(formProfit)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Due</span>
                  <div className={`text-xl font-black ${formCustomerDue > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {formatBDT(formCustomerDue)}
                  </div>
                </div>
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
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-600/25 transition-all hover:scale-105"
                >
                  Issue Ticket & Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Collect Due */}
      {isDueModalOpen && selectedTicketForDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Collect Due Payment</h2>
                  <p className="text-xs text-slate-500">{selectedTicketForDue.passengerName} ({selectedTicketForDue.ticketId})</p>
                </div>
              </div>
              <button
                onClick={() => setIsDueModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectDue} className="p-6 space-y-4">
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                <span className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider block">Current Due</span>
                <div className="text-2xl font-black text-amber-900">{formatBDT(selectedTicketForDue.customerDue)}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Collection Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  max={selectedTicketForDue.customerDue}
                  value={duePaymentAmount}
                  onChange={e => setDuePaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Deposit To</label>
                  <select
                    value={duePaymentAccountId}
                    onChange={e => setDuePaymentAccountId(e.target.value)}
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
                    value={duePaymentMethod}
                    onChange={e => setDuePaymentMethod(e.target.value as PaymentMethod)}
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
                  Record Due Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
