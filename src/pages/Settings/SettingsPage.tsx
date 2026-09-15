import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { CompanySettings } from '../../types';
import {
  Settings,
  Building,
  Printer,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileCode,
  Shield,
  Plane,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, exportDatabaseJSON, importDatabaseJSON } = useAppData();

  const [formData, setFormData] = useState<CompanySettings>({
    companyName: settings?.companyName || 'Captain Air International',
    tagline: settings?.tagline || 'Your Trusted Flight & Travel Partner',
    logoUrl: settings?.logoUrl || '',
    address: settings?.address || '86/72 Sheikh Farid Market, 2 No Gate, Chittagong',
    phone: settings?.phone || '01822858585, 01960062775',
    email: settings?.email || 'caictgbd@gmail.com',
    website: settings?.website || 'https://captainairbd.com',
    tradeLicense: settings?.tradeLicense || 'TRAD/DSCC/029845/2024',
    currency: settings?.currency || 'BDT',
    currencySymbol: settings?.currencySymbol || '৳',
    financialYear: settings?.financialYear || '2026-2027',
    defaultAccountId: settings?.defaultAccountId || 'acc-cash',
    defaultPaymentMethod: settings?.defaultPaymentMethod || 'CASH',
    defaultServiceCharge: settings?.defaultServiceCharge || 0,
    defaultCommission: settings?.defaultCommission || 0,
    invoicePrefix: settings?.invoicePrefix || 'CAI-INV-2026-',
    receiptPrefix: settings?.receiptPrefix || 'CAI-MR-2026-',
    printFooter: settings?.printFooter || 'Thank you for choosing Captain Air International.',
  });

  const [restoreJson, setRestoreJson] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md text-white">
            <Settings className="w-5 h-5" />
          </div>
          Agency Settings & System Control
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure agency letterhead details, invoice templates, and perform full JSON database backups
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Company Branding & Letterhead
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Agency Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Agency Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Office Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Phone Numbers *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Trade License No
              </label>
              <input
                type="text"
                value={formData.tradeLicense}
                onChange={e => setFormData({ ...formData, tradeLicense: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoicing & Print Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Printer className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Invoice & Receipt Print Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Money Receipt Prefix
              </label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={e => setFormData({ ...formData, receiptPrefix: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Print Footer Note
            </label>
            <input
              type="text"
              value={formData.printFooter}
              onChange={e => setFormData({ ...formData, printFooter: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/25 transition-all hover:scale-105"
            >
              Save Agency Settings
            </button>
          </div>
        </div>
      </form>

      {/* Database Backup & Disaster Recovery */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Database Backup & Restore (JSON)
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Download a complete backup of all tickets, customers, accounts, vouchers, and transactions. You can restore this file anytime.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={exportDatabaseJSON}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download Complete Backup JSON</span>
          </button>

          <label className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore from Backup File</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
