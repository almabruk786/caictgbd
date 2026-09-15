import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IncomeEntry, ExpenseEntry, OwnerFundEntry, CompanySettings } from '../types';

const formatBDT = (val: number): string => {
  return 'BDT ' + Number(val || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Generate and download an ultra-modern single voucher PDF (Income or Expense)
 */
export function downloadVoucherPDF(
  entry: IncomeEntry | ExpenseEntry,
  type: 'income' | 'expense',
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isIncome = type === 'income';
  const primaryColor = isIncome ? [5, 150, 105] : [220, 38, 38]; // Emerald vs Rose
  const darkBg = [15, 23, 42]; // Slate-900

  // 1. Top Decorative Brand Bar
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Accent Line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 32, 210, 3, 'F');

  // Company Name & Tagline in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(company.companyName.toUpperCase(), 15, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(company.tagline || 'Your Trusted Flight & Travel Partner', 15, 20);

  // Address & Contacts (right aligned)
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(company.address, 195, 11, { align: 'right' });
  doc.text(`Mobile: ${company.phone}`, 195, 16, { align: 'right' });
  doc.text(`Email: ${company.email}`, 195, 21, { align: 'right' });

  // 2. Voucher Title & Badge
  const titleY = 48;
  doc.setFillColor(isIncome ? 240 : 254, isIncome ? 253 : 242, isIncome ? 244 : 242);
  doc.roundedRect(15, titleY - 6, 180, 16, 3, 3, 'F');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const voucherTitle = isIncome ? 'OFFICIAL INCOME VOUCHER' : 'OFFICIAL EXPENSE VOUCHER';
  doc.text(voucherTitle, 20, titleY + 4);

  // Voucher Number Badge
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.roundedRect(140, titleY - 3, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`VOUCHER: ${entry.voucherNo}`, 165, titleY + 3.5, { align: 'center' });

  // 3. Metadata Grid
  const metaY = 72;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, metaY, 180, 32, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text('DATE OF RECORD', 22, metaY + 9);
  doc.text('CATEGORY / HEAD', 80, metaY + 9);
  doc.text('PAYMENT METHOD', 140, metaY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  doc.text(formatDate(entry.date), 22, metaY + 17);
  doc.text(entry.category, 80, metaY + 17);
  doc.text((entry.paymentMethod || 'CASH').replace(/_/g, ' '), 140, metaY + 17);

  // Row 2 of metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PREPARED BY', 22, metaY + 25);
  doc.text('REFERENCE / BILL NO', 80, metaY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(entry.createdBy || 'Captain Boss (Owner)', 22, metaY + 30);
  doc.text(entry.reference || 'N/A', 80, metaY + 30);

  // 4. Particulars / Description Table
  const tableY = 112;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 15, right: 15 },
    head: [['SL', 'PARTICULARS / DESCRIPTION', 'CATEGORY', 'AMOUNT (BDT)']],
    body: [
      [
        '01',
        entry.description + (entry.reference ? ` (Ref: ${entry.reference})` : ''),
        entry.category,
        formatBDT(entry.amount),
      ],
    ],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 35 },
      3: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
  });

  // 5. Total Amount Highlight Box
  const amountY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(isIncome ? 236 : 254, isIncome ? 253 : 242, isIncome ? 245 : 242);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(100, amountY, 95, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT', 106, amountY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text((isIncome ? '+' : '-') + formatBDT(entry.amount), 190, amountY + 16, { align: 'right' });

  // 6. Security Note / Stamp Area
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated voucher issued by Captain Air International ERP System.', 15, amountY + 12);
  doc.text('Status: APPROVED & POSTED TO CASH LEDGER', 15, amountY + 18);

  // 7. Signature Strip
  const sigY = 230;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, sigY, 65, sigY);
  doc.line(85, sigY, 130, sigY);
  doc.line(150, sigY, 195, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Prepared By', 42.5, sigY + 5, { align: 'center' });
  doc.text('Checked By', 107.5, sigY + 5, { align: 'center' });
  doc.text('Authorized Signatory', 172.5, sigY + 5, { align: 'center' });

  // 8. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-GB')} | ${company.companyName} | Chittagong, Bangladesh`,
    105,
    285,
    { align: 'center' }
  );

  // Save PDF
  doc.save(`Captain_Air_${entry.voucherNo}.pdf`);
}

/**
 * Generate and download a multi-row Financial Statement PDF
 */
export function downloadStatementPDF(
  entries: (IncomeEntry | ExpenseEntry)[],
  type: 'income' | 'expense' | 'combined',
  dateLabel: string,
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const title =
    type === 'income'
      ? 'INCOME STATEMENT & LEDGER'
      : type === 'expense'
      ? 'EXPENSE STATEMENT & LEDGER'
      : 'COMPREHENSIVE FINANCIAL STATEMENT';

  const themeColor =
    type === 'income' ? [5, 150, 105] : type === 'expense' ? [220, 38, 38] : [30, 64, 175];

  // 1. Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.rect(0, 30, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(company.address + ' | Tel: ' + company.phone, 14, 18);
  doc.text('Email: ' + company.email, 14, 23);

  // Report Period Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(dateLabel.toUpperCase(), 196, 18, { align: 'right' });

  // 2. Statement Title & KPI Summary Box
  const summaryY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, summaryY + 5);

  // KPI card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, summaryY + 8, 182, 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`TOTAL ENTRIES: ${entries.length}`, 20, summaryY + 17);
  doc.text(`PERIOD: ${dateLabel}`, 80, summaryY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text(`GRAND TOTAL: ${formatBDT(totalAmount)}`, 190, summaryY + 17, { align: 'right' });

  // 3. Table Rows
  const tableData = entries.map((item, idx) => [
    String(idx + 1).padStart(2, '0'),
    item.voucherNo,
    formatDate(item.date),
    item.category,
    item.description + (item.reference ? ` [Ref: ${item.reference}]` : ''),
    (item.paymentMethod || 'CASH').replace(/_/g, ' '),
    formatBDT(item.amount),
  ]);

  autoTable(doc, {
    startY: summaryY + 26,
    margin: { left: 14, right: 14 },
    head: [['#', 'VOUCHER', 'DATE', 'CATEGORY', 'DESCRIPTION', 'METHOD', 'AMOUNT']],
    body: tableData,
    foot: [['', '', '', '', `TOTAL (${entries.length} RECORDS)`, '', formatBDT(totalAmount)]],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 28 },
      4: { cellWidth: 58 },
      5: { cellWidth: 16 },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'striped',
    didDrawPage: (data) => {
      // Footer page number
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${(doc as any).internal.getNumberOfPages()} | ${company.companyName} | Confidential`,
        105,
        290,
        { align: 'center' }
      );
    },
  });

  // Save PDF file
  const filenameSafe = dateLabel.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Captain_Air_${type}_Statement_${filenameSafe}.pdf`);
}

/**
 * Generate and download an ultra-modern single Arif Vai Funding voucher PDF
 */
export function downloadFundingPDF(
  entry: OwnerFundEntry,
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isInflow = entry.type === 'INJECTION';
  const primaryColor = isInflow ? [5, 150, 105] : [220, 38, 38]; // Emerald vs Rose
  const darkBg = [15, 23, 42]; // Slate-900

  // 1. Top Decorative Brand Bar
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Accent Line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 32, 210, 3, 'F');

  // Company Name & Tagline in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(company.companyName.toUpperCase(), 15, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(company.tagline || 'Your Trusted Flight & Travel Partner', 15, 20);

  // Address & Contacts (right aligned)
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(company.address, 195, 11, { align: 'right' });
  doc.text(`Mobile: ${company.phone}`, 195, 16, { align: 'right' });
  doc.text(`Email: ${company.email}`, 195, 21, { align: 'right' });

  // 2. Voucher Title & Badge
  const titleY = 48;
  doc.setFillColor(isInflow ? 240 : 254, isInflow ? 253 : 242, isInflow ? 244 : 242);
  doc.roundedRect(15, titleY - 6, 180, 16, 3, 3, 'F');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const voucherTitle = isInflow
    ? 'ARIF VAI FUNDING — MONEY RECEIVED'
    : 'ARIF VAI FUNDING — MONEY RETURNED';
  doc.text(voucherTitle, 20, titleY + 4);

  // Voucher Number Badge
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.roundedRect(135, titleY - 3, 55, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(`REF: ${entry.referenceNo}`, 162.5, titleY + 3.5, { align: 'center' });

  // 3. Metadata Grid
  const metaY = 72;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, metaY, 180, 32, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text('TRANSACTION DATE', 22, metaY + 9);
  doc.text('LINKED ACCOUNT', 80, metaY + 9);
  doc.text('PAYMENT METHOD', 140, metaY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  doc.text(formatDate(entry.date), 22, metaY + 17);
  doc.text(entry.accountName || 'Office Cash', 80, metaY + 17);
  doc.text((entry.paymentMethod || 'CASH').replace(/_/g, ' '), 140, metaY + 17);

  // Row 2 of metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text('RECORDED BY', 22, metaY + 25);
  doc.text('TYPE', 80, metaY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(entry.createdBy || 'Admin', 22, metaY + 30);
  doc.text(isInflow ? 'Cash Inflow (+)' : 'Cash Outflow (-)', 80, metaY + 30);

  // 4. Description Box
  const descY = 112;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, descY, 180, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PARTICULARS / PURPOSE / NOTES', 22, descY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const splitNotes = doc.splitTextToSize(entry.notes || 'Arif Vai Funding Record', 165);
  doc.text(splitNotes, 22, descY + 16);

  // 5. Grand Amount Highlight Card
  const amountY = 148;
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.roundedRect(15, amountY, 180, 32, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('TOTAL FUNDING AMOUNT (BDT)', 25, amountY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const sign = isInflow ? '+' : '-';
  doc.text(`${sign}${formatBDT(entry.amount)}`, 25, amountY + 23);

  // 6. Signature Block
  const sigY = 225;
  doc.setDrawColor(203, 213, 225);
  doc.line(22, sigY, 65, sigY);
  doc.line(85, sigY, 128, sigY);
  doc.line(148, sigY, 190, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PREPARED BY', 43.5, sigY + 5, { align: 'center' });
  doc.text('ARIF VAI / INVESTOR', 106.5, sigY + 5, { align: 'center' });
  doc.text('AUTHORIZED SIGNATORY', 169, sigY + 5, { align: 'center' });

  // 7. Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${company.printFooter} | System Generated Funding Voucher | ${formatDate(new Date().toISOString())}`,
    105,
    285,
    { align: 'center' }
  );

  // Download PDF
  doc.save(`Arif_Vai_Funding_${entry.referenceNo}.pdf`);
}

/**
 * Generate and download multi-row Arif Vai Funding Statement PDF
 */
export function downloadFundingStatementPDF(
  entries: OwnerFundEntry[],
  dateLabel: string,
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const darkBg = [15, 23, 42];
  const totalReceived = entries.filter(e => e.type === 'INJECTION').reduce((s, e) => s + e.amount, 0);
  const totalReturned = entries.filter(e => e.type === 'WITHDRAWAL').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalReceived - totalReturned;

  // Header Banner
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 28, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(company.address, 14, 18);
  doc.text(`Phone: ${company.phone} | Email: ${company.email}`, 14, 23);

  // Summary box
  const summaryY = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('ARIF VAI FUNDING ACCOUNT STATEMENT', 14, summaryY + 4);

  // 3-KPI sub cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, summaryY + 8, 182, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`TOTAL RECEIVED: ${formatBDT(totalReceived)}`, 18, summaryY + 18);
  doc.text(`TOTAL RETURNED: ${formatBDT(totalReturned)}`, 80, summaryY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(99, 102, 241);
  doc.text(`NET ACTIVE: ${formatBDT(netBalance)}`, 190, summaryY + 18, { align: 'right' });

  // Table
  const tableData = entries.map((item, idx) => {
    const isInflow = item.type === 'INJECTION';
    return [
      String(idx + 1).padStart(2, '0'),
      item.referenceNo,
      formatDate(item.date),
      isInflow ? 'Received (+)' : 'Returned (-)',
      item.accountName || 'Office Cash',
      item.notes || '—',
      (item.paymentMethod || 'CASH').replace(/_/g, ' '),
      (isInflow ? '+' : '-') + formatBDT(item.amount),
    ];
  });

  autoTable(doc, {
    startY: summaryY + 28,
    margin: { left: 14, right: 14 },
    head: [['#', 'REF NO', 'DATE', 'TYPE', 'ACCOUNT', 'PURPOSE / NOTES', 'METHOD', 'AMOUNT']],
    body: tableData,
    foot: [['', '', '', '', '', `NET BALANCE (${entries.length} ENTRIES)`, '', formatBDT(netBalance)]],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 18 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 45 },
      6: { cellWidth: 18 },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'striped',
    didDrawPage: () => {
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${(doc as any).internal.getNumberOfPages()} | ${company.companyName} | Arif Vai Funding Audit Statement`,
        105,
        290,
        { align: 'center' }
      );
    },
  });

  const filenameSafe = dateLabel.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Arif_Vai_Funding_Statement_${filenameSafe}.pdf`);
}
