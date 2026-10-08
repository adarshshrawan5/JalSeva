import React from 'react';
import { AdminUser } from '../../types';
import { JalSevaLogo } from '../common/JalSevaLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  LayoutDashboard,
  Radio,
  Calendar,
  CheckCircle2,
  Truck,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export type AdminTab =
  | 'dashboard'
  | 'broadcast'
  | 'schedule'
  | 'complaints'
  | 'tankers'
  | 'analytics'
  | 'staff';

interface AdminLayoutProps {
  adminUser: AdminUser;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onSwitchToCitizen: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  adminUser,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchToCitizen,
  children,
}) => {
  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'broadcast' as AdminTab, label: 'Broadcast & Outages', icon: Radio },
    { id: 'schedule' as AdminTab, label: 'Schedule Manager', icon: Calendar },
    { id: 'complaints' as AdminTab, label: 'Complaints Desk', icon: CheckCircle2 },
    { id: 'tankers' as AdminTab, label: 'Tanker Dispatch', icon: Truck },
    { id: 'analytics' as AdminTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'staff' as AdminTab, label: 'Staff & Drivers', icon: Users },
  ];

  const handleResetData = () => {
    if (confirm('Reset all demo data (complaints, tankers, schedules) to default sample state?')) {
      storageService.resetAllData();
      alert('Sample database reset successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center gap-4">
              <JalSevaLogo size="sm" />
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-slate-800 border border-slate-700">
                Staff Control Desk
              </span>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToCitizen}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition border border-blue-200 dark:border-blue-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Citizen Portal</span>
              </button>

              <button
                onClick={handleResetData}
                title="Reset sample data"
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <ThemeToggle />

              {/* Admin Profile pill */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {adminUser.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <strong className="block text-slate-900 dark:text-white leading-tight">
                    {adminUser.name}
                  </strong>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {adminUser.role}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-xl transition"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 space-y-1">
              <span className="block px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Management Modules
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onSwitchToCitizen}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <span>Public Citizen View</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Module Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
