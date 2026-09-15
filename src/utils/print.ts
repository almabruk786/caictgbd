import { IncomeEntry, ExpenseEntry, OwnerFundEntry, CompanySettings } from '../types';

const formatBDTLocal = (amount: number) =>
  '৳' + amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDateLocal = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const letterhead = (company: CompanySettings) => `
  <div class="letterhead">
    <div class="company-logo">✈</div>
    <div class="company-info">
      <div class="company-name">${company.companyName}</div>
      <div class="company-tagline">${company.tagline}</div>
      <div class="company-details">
        <span>📍 ${company.address}</span> &nbsp;|&nbsp;
        <span>📞 ${company.phone}</span> &nbsp;|&nbsp;
        <span>✉ ${company.email}</span>
      </div>
    </div>
  </div>
`;

const printStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; background: white; color: #1e293b; font-size: 12px; }
  .page { padding: 28px 32px; max-width: 780px; margin: 0 auto; }

  /* Letterhead */
  .letterhead { display: flex; align-items: center; gap: 16px; padding-bottom: 14px; border-bottom: 3px solid #0f172a; margin-bottom: 20px; }
  .company-logo { width: 50px; height: 50px; background: linear-gradient(135deg, #1e40af, #0ea5e9); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; flex-shrink: 0; }
  .company-name { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
  .company-tagline { font-size: 11px; color: #64748b; font-weight: 500; margin: 2px 0; }
  .company-details { font-size: 10.5px; color: #475569; margin-top: 4px; }

  /* Voucher */
  .voucher-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .voucher-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
  .voucher-title.income { color: #059669; }
  .voucher-title.expense { color: #dc2626; }
  .voucher-meta { text-align: right; font-size: 11px; color: #64748b; }
  .voucher-meta strong { color: #1e293b; }

  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .detail-item label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px; }
  .detail-item .value { font-size: 13px; font-weight: 600; color: #1e293b; }

  .amount-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
  .amount-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
  .amount-value { font-size: 22px; font-weight: 900; }
  .amount-value.income { color: #059669; }
  .amount-value.expense { color: #dc2626; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 700; }
  .badge.income { background: #d1fae5; color: #065f46; }
  .badge.expense { background: #fee2e2; color: #991b1b; }

  /* Signatures */
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; padding-top: 14px; border-top: 1px dashed #cbd5e1; }
  .sig-line { border-top: 1px solid #1e293b; padding-top: 6px; font-size: 10px; color: #64748b; text-align: center; font-weight: 600; }

  .footer-note { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }

  /* Report Table */
  .report-header { margin-bottom: 20px; }
  .report-title { font-size: 18px; font-weight: 900; color: #0f172a; }
  .report-subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
  .report-period { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 10.5px; font-weight: 700; margin-top: 8px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead tr { background: #0f172a; color: white; }
  thead th { padding: 9px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  thead th:last-child { text-align: right; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:hover { background: #f1f5f9; }
  tbody td { padding: 8px 10px; font-size: 11px; color: #334155; border-bottom: 1px solid #f1f5f9; }
  tbody td:last-child { text-align: right; font-weight: 700; }
  tfoot tr { background: #1e293b; color: white; }
  tfoot td { padding: 10px 10px; font-size: 12px; font-weight: 800; }
  tfoot td:last-child { text-align: right; }

  .voucher-no { font-family: monospace; font-size: 10.5px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; }
  .cat-badge { display: inline-block; background: #f1f5f9; padding: 1px 7px; border-radius: 10px; font-size: 10px; color: #475569; font-weight: 600; }

  .summary-box { display: flex; gap: 12px; margin-bottom: 20px; }
  .summary-card { flex: 1; padding: 12px 16px; border-radius: 10px; }
  .summary-card.income { background: #d1fae5; }
  .summary-card.expense { background: #fee2e2; }
  .summary-card.net { background: #eff6ff; }
  .summary-card .s-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
  .summary-card .s-value { font-size: 16px; font-weight: 900; }
  .summary-card.income .s-value { color: #059669; }
  .summary-card.expense .s-value { color: #dc2626; }
  .summary-card.net .s-value { color: #1d4ed8; }
  .s-count { font-size: 10px; color: #64748b; margin-top: 2px; }

  @media print {
    body { margin: 0; }
    .page { padding: 16px 20px; }
    .no-print { display: none !important; }
  }
`;

const printButtonBar = (onPrint: string) => `
  <div class="no-print" style="position:fixed;top:0;left:0;right:0;background:#0f172a;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:999;">
    <span style="color:#94a3b8;font-size:13px;font-weight:600;">Captain Air International — Print Preview</span>
    <div style="display:flex;gap:10px;">
      <button onclick="${onPrint}" style="background:#3b82f6;color:white;border:none;padding:8px 20px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">🖨 Print</button>
      <button onclick="window.close()" style="background:#374151;color:white;border:none;padding:8px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">✕ Close</button>
    </div>
  </div>
  <div style="height:52px;"></div>
`;

// ─── PRINT SINGLE VOUCHER ───────────────────────────────────────────────────

export function printSingleVoucher(
  entry: IncomeEntry | ExpenseEntry,
  type: 'income' | 'expense',
  company: CompanySettings
) {
  const win = window.open('', '_blank', 'width=860,height=700');
  if (!win) { alert('Please allow popups to print.'); return; }

  const typeLabel = type === 'income' ? 'Income Voucher' : 'Expense Voucher';
  const colorClass = type === 'income' ? 'income' : 'expense';
  const sign = type === 'income' ? '+' : '-';

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${typeLabel} — ${entry.voucherNo}</title>
  <style>${printStyles}</style>
</head>
<body>
  ${printButtonBar('window.print()')}
  <div class="page">
    ${letterhead(company)}

    <div class="voucher-header">
      <div>
        <div class="voucher-title ${colorClass}">${typeLabel}</div>
        <div style="margin-top:6px;"><span class="badge ${colorClass}">${entry.category}</span></div>
      </div>
      <div class="voucher-meta">
        <div>Voucher No: <strong>${entry.voucherNo}</strong></div>
        <div style="margin-top:4px;">Date: <strong>${formatDateLocal(entry.date)}</strong></div>
        ${entry.reference ? `<div style="margin-top:4px;">Ref: <strong>${entry.reference}</strong></div>` : ''}
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <label>Description / Particulars</label>
        <div class="value">${entry.description}</div>
      </div>
      <div class="detail-item">
        <label>Payment Method</label>
        <div class="value">${entry.paymentMethod.replace(/_/g, ' ')}</div>
      </div>
      <div class="detail-item">
        <label>Prepared By</label>
        <div class="value">${entry.createdBy}</div>
      </div>
      <div class="detail-item">
        <label>Date of Entry</label>
        <div class="value">${formatDateLocal(entry.date)}</div>
      </div>
    </div>

    <div class="amount-box">
      <div>
        <div class="amount-label">Total Amount</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:2px;">BDT — Bangladeshi Taka</div>
      </div>
      <div class="amount-value ${colorClass}">${sign}${formatBDTLocal(entry.amount)}</div>
    </div>

    <div class="signatures">
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Prepared By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Checked By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Authorized By</div></div>
    </div>

    <div class="footer-note">${company.printFooter} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-GB')}</div>
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── PRINT REPORT (date range) ───────────────────────────────────────────────

export function printReport(
  entries: (IncomeEntry | ExpenseEntry)[],
  type: 'income' | 'expense' | 'combined',
  dateLabel: string,
  company: CompanySettings
) {
  const win = window.open('', '_blank', 'width=1000,height=750');
  if (!win) { alert('Please allow popups to print.'); return; }

  const title =
    type === 'income' ? 'Income Statement' :
    type === 'expense' ? 'Expense Statement' :
    'Income & Expense Report';

  const incomeEntries = type === 'expense' ? [] :
    (entries as any[]).filter(e => (e as IncomeEntry).voucherNo?.startsWith('INC') || type === 'income');
  const expenseEntries = type === 'income' ? [] :
    (entries as any[]).filter(e => (e as ExpenseEntry).voucherNo?.startsWith('EXP') || type === 'expense');

  const displayEntries = type === 'income' ? entries as IncomeEntry[] :
    type === 'expense' ? entries as ExpenseEntry[] :
    entries;

  const total = entries.reduce((s, e) => s + e.amount, 0);

  const tableRows = displayEntries.map(e => `
    <tr>
      <td><span class="voucher-no">${e.voucherNo}</span></td>
      <td>${formatDateLocal(e.date)}</td>
      <td><span class="cat-badge">${e.category}</span></td>
      <td>${e.description}</td>
      <td>${(e as any).paymentMethod?.replace(/_/g, ' ') || ''}</td>
      ${(e as any).reference ? `<td>${(e as any).reference}</td>` : '<td>—</td>'}
      <td>${formatBDTLocal(e.amount)}</td>
    </tr>
  `).join('');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} — ${dateLabel}</title>
  <style>${printStyles}</style>
</head>
<body>
  ${printButtonBar('window.print()')}
  <div class="page">
    ${letterhead(company)}

    <div class="report-header">
      <div class="report-title">${title}</div>
      <div class="report-subtitle">Detailed ledger for selected period</div>
      <div class="report-period">📅 ${dateLabel}</div>
    </div>

    <div class="summary-box">
      <div class="summary-card ${type === 'expense' ? 'expense' : 'income'}">
        <div class="s-label">Total ${type === 'expense' ? 'Expenses' : 'Income'}</div>
        <div class="s-value">${formatBDTLocal(total)}</div>
        <div class="s-count">${entries.length} entries</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Voucher No</th>
          <th>Date</th>
          <th>Category</th>
          <th>Description / Particulars</th>
          <th>Method</th>
          <th>Reference</th>
          <th style="text-align:right;">Amount (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No records found</td></tr>'}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="6">TOTAL — ${entries.length} entries | ${dateLabel}</td>
          <td>${formatBDTLocal(total)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="signatures" style="margin-top:20px;">
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Prepared By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Checked By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Authorized Signatory</div></div>
    </div>

    <div class="footer-note">${company.printFooter} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-GB')}</div>
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── PRINT ARIF VAI FUNDING VOUCHER ─────────────────────────────────────────

export function printFundingVoucher(
  entry: OwnerFundEntry,
  company: CompanySettings
) {
  const win = window.open('', '_blank', 'width=860,height=700');
  if (!win) { alert('Please allow popups to print.'); return; }

  const isInflow = entry.type === 'INJECTION';
  const typeLabel = isInflow ? 'Arif Vai Funding — Money Received' : 'Arif Vai Funding — Money Returned / Repaid';
  const colorClass = isInflow ? 'income' : 'expense';
  const sign = isInflow ? '+' : '-';

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${typeLabel} — ${entry.referenceNo}</title>
  <style>${printStyles}</style>
</head>
<body>
  ${printButtonBar('window.print()')}
  <div class="page">
    ${letterhead(company)}

    <div class="voucher-header">
      <div>
        <div class="voucher-title ${colorClass}">${typeLabel}</div>
        <div style="margin-top:6px;"><span class="badge ${colorClass}">Arif Vai Funding</span></div>
      </div>
      <div class="voucher-meta">
        <div>Voucher No: <strong>${entry.referenceNo}</strong></div>
        <div style="margin-top:4px;">Date: <strong>${formatDateLocal(entry.date)}</strong></div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <label>Transaction Type</label>
        <div class="value" style="color: ${isInflow ? '#059669' : '#dc2626'};">
          ${isInflow ? 'Fund Received (Cash Inflow +)' : 'Fund Returned / Paid Out (-)'}
        </div>
      </div>
      <div class="detail-item">
        <label>Linked Account</label>
        <div class="value">${entry.accountName || 'Office Cash'}</div>
      </div>
      <div class="detail-item">
        <label>Payment Method</label>
        <div class="value">${(entry.paymentMethod || 'CASH').replace(/_/g, ' ')}</div>
      </div>
      <div class="detail-item">
        <label>Recorded By</label>
        <div class="value">${entry.createdBy}</div>
      </div>
      <div class="detail-item" style="grid-column: span 2;">
        <label>Particulars / Purpose / Notes</label>
        <div class="value">${entry.notes || 'Arif Vai Funding Transaction'}</div>
      </div>
    </div>

    <div class="amount-box">
      <div>
        <div class="amount-label">Funding Amount</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:2px;">BDT — Bangladeshi Taka</div>
      </div>
      <div class="amount-value ${colorClass}">${sign}${formatBDTLocal(entry.amount)}</div>
    </div>

    <div class="signatures">
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Prepared By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Arif Vai / Investor</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Authorized Signatory</div></div>
    </div>

    <div class="footer-note">${company.printFooter} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-GB')}</div>
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── PRINT ARIF VAI FUNDING STATEMENT ───────────────────────────────────────

export function printFundingStatement(
  entries: OwnerFundEntry[],
  dateLabel: string,
  company: CompanySettings
) {
  const win = window.open('', '_blank', 'width=1000,height=750');
  if (!win) { alert('Please allow popups to print.'); return; }

  const totalReceived = entries.filter(e => e.type === 'INJECTION').reduce((s, e) => s + e.amount, 0);
  const totalReturned = entries.filter(e => e.type === 'WITHDRAWAL').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalReceived - totalReturned;

  const tableRows = entries.map(e => {
    const isInflow = e.type === 'INJECTION';
    return `
      <tr>
        <td><span class="voucher-no">${e.referenceNo}</span></td>
        <td>${formatDateLocal(e.date)}</td>
        <td>
          <span class="badge ${isInflow ? 'income' : 'expense'}">
            ${isInflow ? 'Fund Received (+)' : 'Fund Returned (-)'}
          </span>
        </td>
        <td>${e.accountName || 'Office Cash'}</td>
        <td>${(e.paymentMethod || 'CASH').replace(/_/g, ' ')}</td>
        <td>${e.notes || '—'}</td>
        <td style="color:${isInflow ? '#059669' : '#dc2626'}; font-weight:700;">
          ${isInflow ? '+' : '-'}${formatBDTLocal(e.amount)}
        </td>
      </tr>
    `;
  }).join('');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Arif Vai Funding Statement — ${dateLabel}</title>
  <style>${printStyles}</style>
</head>
<body>
  ${printButtonBar('window.print()')}
  <div class="page">
    ${letterhead(company)}

    <div class="report-header">
      <div class="report-title">Arif Vai Funding Account Statement</div>
      <div class="report-subtitle">Complete ledger of capital received, returned, and net active balance</div>
      <div class="report-period">📅 ${dateLabel}</div>
    </div>

    <div class="summary-box">
      <div class="summary-card income">
        <div class="s-label">Total Received from Arif Vai</div>
        <div class="s-value">${formatBDTLocal(totalReceived)}</div>
        <div class="s-count">${entries.filter(e => e.type === 'INJECTION').length} entries</div>
      </div>
      <div class="summary-card expense">
        <div class="s-label">Total Returned to Arif Vai</div>
        <div class="s-value">${formatBDTLocal(totalReturned)}</div>
        <div class="s-count">${entries.filter(e => e.type === 'WITHDRAWAL').length} entries</div>
      </div>
      <div class="summary-card net">
        <div class="s-label">Net Active Funding Balance</div>
        <div class="s-value">${formatBDTLocal(netBalance)}</div>
        <div class="s-count">Outstanding / Capital</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Ref No</th>
          <th>Date</th>
          <th>Type</th>
          <th>Account</th>
          <th>Method</th>
          <th>Particulars / Notes</th>
          <th style="text-align:right;">Amount (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No funding records found</td></tr>'}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="6">NET ACTIVE BALANCE — ${entries.length} records</td>
          <td>${formatBDTLocal(netBalance)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="signatures" style="margin-top:20px;">
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Prepared By</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Arif Vai / Investor</div></div>
      <div><div style="margin-bottom:36px;"></div><div class="sig-line">Authorized Signatory</div></div>
    </div>

    <div class="footer-note">${company.printFooter} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-GB')}</div>
  </div>
</body>
</html>`);
  win.document.close();
}
