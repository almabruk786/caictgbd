# Captain Air International — Travel Agency Management & Accounting Web App

A modern, production-grade **Travel Agency Management + Accounting System** built specifically for **Captain Air International**.

Designed for real-world daily travel agency operations: flight ticket sales with live profit calculations, multi-channel accounts, strict Boss Fund equity segregation, customer dues & supplier payables tracking, office purchases, inventory management, comprehensive P&L financial reports, and a print center supporting A4, A5, and 80mm POS Thermal printers.

---

## Key Features

1. **Executive Dashboard**:
   - 5 Real-Time KPI Cards: Liquid Cash/Bank Balance, Total Business Income, Total Operating Expenses, Ticket Sales Revenue, and Net Operating Profit.
   - Interactive Area Charts for Income vs. Expense vs. Profit trajectory.
   - Donut charts for Income distribution and Expense category breakdown.
   - Quick Action drawers and recent transaction ledger feed.

2. **Flight Ticket Sales & Profit Engine**:
   - Passenger details, PNR, e-ticket number, route, departure, destination, travel dates, cabin class, and pax count.
   - **Dynamic Profit Math**: `Selling Price - Supplier Cost - Discount + Service Charge + Commission = Net Profit`.
   - Automatic customer due and supplier payable tracking.
   - Confirmed, Pending, Reissued, Cancelled, and Refunded status workflows.

3. **Strict Accounting Principles**:
   - **Boss / Owner Fund Isolation**: Owner capital injections (e.g. ৳200,000) increase Office Cash/Bank balances and Owner Equity without artificially inflating Business Operating Income or Net Profit.
   - **Inter-Account Fund Transfers**: Seamless transfers between Cash, City Bank, Dutch-Bangla Bank, bKash, and Nagad with zero net profit effect.
   - **Customer Due Collection & Supplier Disbursements**: Payment settlements update liquid accounts without double-counting revenues.

4. **Customers & Supplier CRM**:
   - Full client and vendor profiles with passport/NID, phone, address, all-time bookings, payments, and outstanding balances.
   - One-click account statement generation and due collection.

5. **Office Purchases & Inventory**:
   - Track ticket paper, HP LaserJet toners, ticket jackets, boarding rolls, and office assets.
   - Inward purchases automatically update stock levels and deduct payments.
   - Automated low-stock warning threshold alerts.

6. **Comprehensive Financial Reports**:
   - Profit & Loss (P&L) Statement with cost of sales and operational expenses.
   - Airline-wise flight sales & net margin analysis.
   - Route profitability analytics.
   - Customer Due Aging and Supplier Payable summaries.
   - Stock valuation and movement reports.
   - Multi-format exports: Printable A4/A5 layout, PDF, and CSV/Excel.

7. **Universal Print Center**:
   - Branded **Captain Air International** templates:
     - Flight Ticket Invoice & Boarding Itinerary
     - Customer Money Receipts (A4, A5, and 80mm POS Thermal)
     - Debit / Expense Payment Vouchers
     - Customer & Supplier Statements
     - Daily Cash Reports & P&L Statements

8. **Role-Based Access Control (RBAC)**:
   - Built-in roles: `Super Admin (Boss)`, `Admin`, `Accountant`, `Ticket Staff`, `Staff`.
   - Granular permission matrix for creating, viewing, editing, deleting, and printing records.
   - Live Role Switcher for instant testing.

9. **Audit Trail & System Security**:
   - Full compliance activity logs with timestamp, IP, user name, action, and record ID.
   - Automated notification center for low stock, due receivables, and pending tickets.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, date-fns, jsPDF
- **State & Database**:
  - **Local Offline / Embedded Mode**: Instant zero-config local persistence pre-seeded with realistic Captain Air International agency records.
  - **Cloud Firestore Mode**: Built-in Firebase Firestore sync for real-time cloud data across multiple devices.
- **Deployment**: Optimized for **Vercel** and **GitHub** (with `vercel.json` SPA rewrites).

---

## Quick Start (Running Locally)

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open your browser at http://localhost:3000
```

---

## Deploying to Vercel (Online Deployment)

1. Push this repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Captain Air International Web App"
   git remote add origin https://github.com/your-username/captain-air-international.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. (Optional) Add your Firebase environment variables under Project Settings -> Environment Variables.
6. Click **Deploy**! Your application is live worldwide.

---

## Connecting Google Firebase Firestore

1. Create a project on [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database** in test/production mode.
3. In Captain Air International web app, navigate to **Settings ➔ Firebase Firestore Cloud Configuration**.
4. Enter your `apiKey` and `projectId`, then click **"Sync Local Data to Firestore"** to push all records to the cloud with one click!

---

## Default Staff Credentials (Demo Testing)

| Staff Member | Role | Email |
|---|---|---|
| Captain Boss (Owner) | Super Admin | `boss@captainairbd.com` |
| Rafiqul Islam | Admin | `admin@captainairbd.com` |
| Kamrul Hasan | Accountant | `accounts@captainairbd.com` |
| Farhana Akter | Ticket Staff | `ticketing@captainairbd.com` |
| Tanvir Ahmed | Staff | `staff@captainairbd.com` |

---

© 2026 **Captain Air International**. All rights reserved.
Suite 402, Level 4, Aviation Tower, Motijheel C/A, Dhaka-1000, Bangladesh.
