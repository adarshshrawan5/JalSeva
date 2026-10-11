import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { JalSevaLogo } from './JalSevaLogo';
import { CitizenUser } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Truck,
  AlertCircle,
  Search,
  Building2,
  Shield,
  Menu,
  X,
  PhoneCall,
  Home,
  User,
  Gauge,
  Droplets,
  ChevronDown,
  Layers,
  Bell,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { NotificationsDrawer } from './NotificationsDrawer';

export type ActiveTab =
  | 'home'
  | 'schedule'
  | 'tanker-book'
  | 'complaint-file'
  | 'tracker'
  | 'meter-reading'
  | 'support';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLanding: () => void;
  onOpenDriver: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  isDriverLoggedIn?: boolean;
  citizenUser?: CitizenUser | null;
  onOpenCitizenProfile?: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onLogoutCitizen?: () => void;
  onReplayInitializer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLanding,
  onOpenDriver,
  onOpenAdmin,
  isAdminLoggedIn,
  isDriverLoggedIn,
  citizenUser,
  onOpenCitizenProfile,
  onOpenSignIn,
  onOpenSignUp,
  onLogoutCitizen,
  onReplayInitializer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const moreRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(event.target as Node)) {
        setPortalsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { id: 'home' as ActiveTab, label: t.navHome, icon: Home },
    { id: 'tanker-book' as ActiveTab, label: t.navBookTanker, icon: Truck, highlight: true },
    { id: 'schedule' as ActiveTab, label: t.navSchedule, icon: Calendar },
  ];

  const secondaryNavItems = [
    { id: 'meter-reading' as ActiveTab, label: t.navMeterReading, icon: Gauge },
    { id: 'complaint-file' as ActiveTab, label: t.navReportGrievance, icon: AlertCircle },
    { id: 'tracker' as ActiveTab, label: t.navTrackStatus, icon: Search },
    { id: 'support' as ActiveTab, label: t.navWardDirectory, icon: Building2 },
  ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & MBMC Branding: JalSeva */}
          <div
            onClick={onOpenLanding}
            className="cursor-pointer flex-shrink-0"
            title="Click to visit JalSeva Landing Page"
          >
            <div className="hidden sm:block">
              <JalSevaLogo size="md" />
            </div>
            <div className="sm:hidden">
              <JalSevaLogo size="sm" showSubtitle={false} />
            </div>
          </div>

          {/* Desktop Navigation Links (Primary + More Dropdown) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {primaryNavItems.map((item) => {
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
                      ? 'text-[#ea580c] dark:text-amber-400 bg-orange-50/80 dark:bg-amber-950/40 hover:bg-orange-100 border border-orange-200/60 dark:border-orange-800/60 font-bold'
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

            {/* Secondary "More" Dropdown Menu */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSecondaryActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>More Services</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Citizen Services
                  </div>
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-left transition ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Utilities & Module Gateways */}
          <div className="flex items-center gap-2">
            {/* Multilingual Selector: EN | मराठी | हिंदी */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition text-[11px] ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 rounded-lg transition text-[11px] font-hindi ${
                  language === 'mr'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="मराठी (Marathi)"
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-lg transition text-[11px] font-hindi ${
                  language === 'hi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="हिंदी (Hindi)"
              >
                हिंदी
              </button>
            </div>

            {/* Replay Initializer / Telemetry Button */}
            {onReplayInitializer && (
              <button
                onClick={onReplayInitializer}
                className="hidden xl:flex p-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                title="Replay JalSeva Startup Initializer Animation"
              >
                <Droplets className="w-4 h-4 animate-pulse" />
              </button>
            )}

            {/* 24x7 Helpline Pill */}
            <a
              href="tel:1800222026"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition"
              title="24x7 JalSeva Water Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#fd7e14] animate-bounce" />
              <span>1800-22-2026</span>
            </a>

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/adarshshrawan5/jalseva-mbmc"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
              title="View JalSeva on GitHub (adarshshrawan5/jalseva-mbmc)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            {/* Automated Alerts & Push Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="View Water Supply & Tanker Notifications"
              aria-label="Alerts and Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>

            {/* Modules Dropdown (Driver & Admin) for Clean Header Decluttering */}
            <div className="relative hidden md:block" ref={portalsRef}>
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 transition shadow-sm"
                title="Switch Portals (Driver & Admin)"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Portals</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Official Modules
                  </div>
                  <button
                    onClick={() => {
                      onOpenDriver();
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition text-left"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Driver Portal {isDriverLoggedIn && '(Active)'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition text-left border-t border-slate-100 dark:border-slate-800"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Desk {isAdminLoggedIn && '(Online)'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Citizen Authentication & Account Gateway: Single unified Sign In / Sign Up button */}
            {!citizenUser ? (
              <button
                onClick={onOpenSignIn || onOpenSignUp}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-95 transition shadow-xs shadow-blue-500/20 cursor-pointer shrink-0"
                title="Sign In or Register new Citizen account"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline whitespace-nowrap">{t.signInOrSignUp}</span>
                <span className="xs:hidden whitespace-nowrap">Sign In</span>
              </button>
            ) : (
              /* Authenticated Resident User Dropdown */
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition shadow-xs cursor-pointer"
                  title={`Logged in as ${citizenUser.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {citizenUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
                    {citizenUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                          {citizenUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {citizenUser.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            +91 {citizenUser.phone} {citizenUser.areaName ? `• ${citizenUser.areaName}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5">
                      {onOpenCitizenProfile && (
                        <button
                          onClick={() => {
                            onOpenCitizenProfile();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{t.myProfile}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveTab('tracker');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-amber-500" />
                        <span>My Bookings &amp; Grievances</span>
                      </button>

                      {onLogoutCitizen && (
                        <button
                          onClick={() => {
                            onLogoutCitizen();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t.signOut}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dark & Light Theme Switcher */}
            <ThemeToggle />

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu: Fixed full height overlay with smooth scrolling */}
      {mobileMenuOpen && (
        <div className="fixed lg:hidden inset-x-0 top-20 bottom-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-24 space-y-2.5 shadow-2xl z-50 overflow-y-auto animate-in fade-in">
          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">भाषा / Language:</span>
            <div className="flex items-center gap-1">
              {(['en', 'mr', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    language === lang
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 px-1 uppercase tracking-wider flex items-center justify-between">
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

          {[...primaryNavItems, ...secondaryNavItems].map((item) => {
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
                    : item.id === 'tanker-book'
                    ? 'bg-orange-50 dark:bg-orange-950/50 text-[#ea580c] font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Citizen Account Management in Mobile Menu */}
            {!citizenUser ? (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>{t.citizenAccount} • नागरिक</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md font-semibold">
                    GPS Ready
                  </span>
                </div>
                <button
                  onClick={() => {
                    (onOpenSignIn || onOpenSignUp)?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/25"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.signInOrSignUp}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {citizenUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {citizenUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">+91 {citizenUser.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onOpenCitizenProfile && (
                    <button
                      onClick={() => {
                        onOpenCitizenProfile();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t.myProfile}</span>
                    </button>
                  )}
                  {onLogoutCitizen && (
                    <button
                      onClick={() => {
                        onLogoutCitizen();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onOpenDriver();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#ea580c] dark:text-amber-300 font-bold text-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Login as Tanker Driver</span>
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

            <button
              onClick={() => {
                setNotificationsOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Live Water Supply & Tanker Alerts</span>
            </button>

            <a
              href="https://github.com/adarshshrawan5/jalseva-mbmc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>View Source on GitHub (adarshshrawan5/jalseva-mbmc)</span>
            </a>
          </div>
        </div>
      )}

      {/* Automated SMS & FCM Push Notification Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectBooking={() => {
          setActiveTab('tracker');
        }}
      />
    </header>
  );
};
