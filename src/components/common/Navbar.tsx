import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { JalSevaLogo } from './JalSevaLogo';
import {
  Calendar,
  AlertCircle,
  Search,
  Building2,
  Shield,
  Menu,
  X,
  PhoneCall,
  Home,
  Wrench,
} from 'lucide-react';

export type ActiveTab =
  | 'home'
  | 'schedule'
  | 'complaint-file'
  | 'tracker'
  | 'support';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLanding: () => void;
  onOpenStaff: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  isStaffLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLanding,
  onOpenStaff,
  onOpenAdmin,
  isAdminLoggedIn,
  isStaffLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Portal Home', icon: Home },
    { id: 'schedule' as ActiveTab, label: 'Schedule & Outages', icon: Calendar },
    { id: 'complaint-file' as ActiveTab, label: 'Report Grievance', icon: AlertCircle, highlight: true },
    { id: 'tracker' as ActiveTab, label: 'Track Redressal', icon: Search },
    { id: 'support' as ActiveTab, label: 'Ward Directory', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & MBMC Branding: JalSeva */}
          <div
            onClick={onOpenLanding}
            className="cursor-pointer"
            title="Click to visit JalSeva Landing Page"
          >
            <JalSevaLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : item.highlight
                      ? 'text-[#ea580c] dark:text-amber-400 hover:bg-orange-50 dark:hover:bg-amber-950/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#fd7e14]'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Role Gateways */}
          <div className="flex items-center gap-2">
            {/* 24x7 Helpline Pill */}
            <a
              href="tel:1800222026"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition"
              title="24x7 JalSeva Water Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#fd7e14] animate-bounce" />
              <span>1800-22-2026</span>
            </a>

            {/* Field Staff Portal Button */}
            <button
              onClick={onOpenStaff}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
                isStaffLoggedIn
                  ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-orange-500'
                  : 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 text-[#ea580c] dark:text-amber-300 border-orange-200 dark:border-orange-800'
              }`}
              title="Login as Municipal Field Plumber / Inspector"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Field Staff</span>
            </button>

            {/* Admin Portal Gateway Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-700'
              }`}
              title="Open Official MBMC Administration Control Panel"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Admin Desk</span>
              {isAdminLoggedIn && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Dark & Light Theme Switcher */}
            <ThemeToggle />

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in">
          <div className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider flex items-center justify-between">
            <span>Citizen Navigation • जलसेवा</span>
            <button
              onClick={() => {
                onOpenLanding();
                setMobileMenuOpen(false);
              }}
              className="text-blue-600 font-bold text-xs"
            >
              Landing Page
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                onOpenStaff();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#ea580c] dark:text-amber-300 font-bold text-xs"
            >
              <Wrench className="w-4 h-4" />
              <span>Login as Field Staff / Plumber</span>
            </button>

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Switch to MBMC Admin Desk</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
