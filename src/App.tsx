import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { TicketsPage } from './pages/Tickets/TicketsPage';
import { IncomePage } from './pages/Income/IncomePage';
import { ExpensesPage } from './pages/Expenses/ExpensesPage';
import { FundingPage } from './pages/Funding/FundingPage';
import { AccountsPage } from './pages/Accounts/AccountsPage';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { SuppliersPage } from './pages/Suppliers/SuppliersPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If user is not logged in, render the executive cockpit login panel
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (module: string) => {
    setActiveModule(module);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'tickets':
        return <TicketsPage />;
      case 'income':
        return <IncomePage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'funding':
        return <FundingPage onNavigate={handleNavigate} />;
      case 'accounts':
        return <AccountsPage onNavigate={handleNavigate} />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        activeModule={activeModule}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeModule={activeModule}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Page Container with padding-bottom for mobile bottom navigation */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-fade-in">
          {renderActiveModule()}
        </main>

        {/* Floating Thumb-Friendly Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          activeModule={activeModule}
          onNavigate={handleNavigate}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppDataProvider>
          <AppContent />
        </AppDataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
