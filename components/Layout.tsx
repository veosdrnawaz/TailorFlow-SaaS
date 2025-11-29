import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Scissors, Users, Bot, Menu, X, LogOut } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => { onNavigate(view); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-4">
        <div className="flex items-center gap-3 px-4 py-4 mb-6">
          <div className="bg-brand-600 text-white p-2 rounded-lg">
            <Scissors size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">TailorFlow</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="ORDERS" icon={Scissors} label="Orders" />
          <NavItem view="CUSTOMERS" icon={Users} label="Customers" />
          <NavItem view="AI_ASSISTANT" icon={Bot} label="AI Assistant" />
        </nav>

        <div className="pt-4 mt-auto border-t border-slate-100">
           <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors w-full">
             <LogOut size={20} />
             <span className="font-medium">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <div className="bg-brand-600 text-white p-1.5 rounded-lg">
            <Scissors size={20} />
          </div>
          <h1 className="text-lg font-bold text-slate-800">TailorFlow</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-30 pt-20 px-4 space-y-2">
           <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
           <NavItem view="ORDERS" icon={Scissors} label="Orders" />
           <NavItem view="CUSTOMERS" icon={Users} label="Customers" />
           <NavItem view="AI_ASSISTANT" icon={Bot} label="AI Assistant" />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};