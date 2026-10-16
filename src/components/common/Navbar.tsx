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
  LogIn,
  UserPlus,
  LogOut,
  Wrench,
  ChevronRight,
} from 'lucide-react';

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
  onOpenWorker?: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  isDriverLoggedIn?: boolean;
  isWorkerLoggedIn?: boolean;
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
  onOpenWorker,
  onOpenAdmin,
  isAdminLoggedIn,
  isDriverLoggedIn,
  isWorkerLoggedIn,
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

  // Lock body scroll when big mobile navigation is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
          <nav className="hidden 2xl:flex items-center gap-1.5 shrink-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : item.highlight
                      ? 'text-[#ea580c] dark:text-amber-400 bg-orange-50/80 dark:bg-amber-950/40 hover:bg-orange-100 border border-orange-200/60 dark:border-orange-800/60 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark & Light Theme Switcher - Always Visible */}
            <ThemeToggle />

            {/* Multilingual Selector: EN | मराठी | हिंदी */}
            <div className="hidden 2xl:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
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
                className="hidden xl:flex p-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition shrink-0"
                title="Replay JalSeva Startup Initializer Animation"
              >
                <Droplets className="w-4 h-4 animate-pulse" />
              </button>
            )}

            {/* 24x7 Helpline Pill */}
            <a
              href="tel:1800222026"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition shrink-0 whitespace-nowrap"
              title="24x7 JalSeva Water Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#fd7e14] animate-bounce shrink-0" />
              <span>1800-22-2026</span>
            </a>


            {/* Modules Dropdown (Driver & Admin) for Clean Header Decluttering */}
            <div className="relative hidden md:block shrink-0" ref={portalsRef}>
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 transition shadow-sm whitespace-nowrap cursor-pointer"
                title="Switch Portals (Driver & Admin)"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition text-left cursor-pointer"
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Driver Portal {isDriverLoggedIn && '(Active)'}</span>
                  </button>
                  {onOpenWorker && (
                    <button
                      onClick={() => {
                        onOpenWorker();
                        setPortalsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition text-left border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 shrink-0" />
                      <span>Worker / Plumber Portal {isWorkerLoggedIn && '(Active)'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition text-left border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Admin Desk {isAdminLoggedIn && '(Online)'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Citizen Authentication & Account Gateway: Single unified Sign In / Sign Up button */}
            {!citizenUser ? (
              <button
                onClick={onOpenSignIn || onOpenSignUp}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-95 transition shadow-xs shadow-blue-500/20 cursor-pointer shrink-0 whitespace-nowrap"
                title="Sign In or Register new Citizen account"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">{t.signInOrSignUp}</span>
                <span className="lg:hidden whitespace-nowrap">Sign In</span>
              </button>
            ) : (
              /* Authenticated Resident User Dropdown */
              <div className="relative shrink-0" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition shadow-xs cursor-pointer whitespace-nowrap"
                  title={`Logged in as ${citizenUser.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {citizenUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[70px] sm:max-w-[110px] truncate text-xs whitespace-nowrap">
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
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
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
                        <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.signOut}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger / Three Row Menu Button - Always Visible on Mobile, Tablet, and Laptop */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer shadow-xs"
              aria-label="Open navigation menu"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />}
            </button>
          </div>
        </div>
      </div>

      {/* Big Full-Screen Mobile Navigation Menu (Takeover Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden h-[100dvh] w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Mobile Menu Top App Bar */}
          <div className="h-20 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
            <div
              onClick={() => {
                onOpenLanding();
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer"
            >
              <JalSevaLogo size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center transition cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable Big Content Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 pb-36 overscroll-contain">
            {/* 1. Large Language Switcher */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>भाषा निवडा / Select Language:</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">
                  MBMC Multilingual
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { code: 'en', label: 'English', sub: 'English' },
                  { code: 'mr', label: 'मराठी', sub: 'Marathi' },
                  { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
                ] as const).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`py-2 px-3 rounded-xl text-center font-bold text-xs transition cursor-pointer ${
                      language === lang.code
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-sm">{lang.label}</div>
                    <div className="text-[9px] opacity-80">{lang.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Citizen Resident Status Card */}
            {!citizenUser ? (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-200" />
                    <span className="font-bold text-xs uppercase tracking-wider text-blue-100">
                      Citizen Resident Mode
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Guest Active
                  </span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Sign in with your 10-digit mobile number for 1-tap tanker booking, instant grievance updates, and meter tariffs.
                </p>
                <button
                  onClick={() => {
                    (onOpenSignIn || onOpenSignUp)?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>{t.signInOrSignUp} (Mobile Login)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                      {citizenUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {citizenUser.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        +91 {citizenUser.phone} {citizenUser.areaName ? `• ${citizenUser.areaName}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onOpenCitizenProfile && (
                    <button
                      onClick={() => {
                        onOpenCitizenProfile();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5"
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
                      className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Big Primary Civic Services Navigation */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Citizen Civic Services • नागरी सेवा
              </div>

              {/* Book Tanker Big Card */}
              <button
                onClick={() => {
                  setActiveTab('tanker-book');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'tanker-book'
                    ? 'bg-orange-500 text-white shadow-lg border-orange-500'
                    : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'tanker-book' ? 'bg-white/20 text-white' : 'bg-orange-500 text-white shadow-md'
                  }`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'tanker-book' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navBookTanker} (Emergency)
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'tanker-book' ? 'text-orange-100' : 'text-slate-500'
                    }`}>
                      2,000L - 10,000L with live GPS tracking
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 shrink-0 ${
                  activeTab === 'tanker-book' ? 'text-white' : 'text-orange-500'
                }`} />
              </button>

              {/* Report Grievance Big Card */}
              <button
                onClick={() => {
                  setActiveTab('complaint-file');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'complaint-file'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'complaint-file' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  }`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'complaint-file' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navReportGrievance}
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'complaint-file' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Water leaks, dirty water, low pressure
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* Track Status Big Card */}
              <button
                onClick={() => {
                  setActiveTab('tracker');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'tracker'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'tracker' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  }`}>
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'tracker' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navTrackStatus}
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'tracker' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Live technician ETA, analysis &amp; payment
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* Water Schedule Big Card */}
              <button
                onClick={() => {
                  setActiveTab('schedule');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'schedule' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'schedule' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navSchedule}
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'schedule' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Mira-Bhayandar ward timings &amp; pressure
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* Meter Reading Big Card */}
              <button
                onClick={() => {
                  setActiveTab('meter-reading');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'meter-reading'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'meter-reading' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                  }`}>
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'meter-reading' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navMeterReading}
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'meter-reading' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Submit meter photo &amp; verify consumption
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* Ward Directory & Support */}
              <button
                onClick={() => {
                  setActiveTab('support');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeTab === 'support' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className={`block text-sm font-black leading-snug ${
                      activeTab === 'support' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.navWardDirectory} &amp; Support
                    </strong>
                    <span className={`text-xs block leading-relaxed ${
                      activeTab === 'support' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Ward executive engineers &amp; emergency helplines
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* 4. Multi-Role Portals & Operations Switcher */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                MBMC Municipal Portals • कर्मचारी विभाग
              </div>

              {/* Field Worker & Plumber Desk */}
              {onOpenWorker && (
                <button
                  onClick={() => {
                    onOpenWorker();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-100 transition shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="block text-sm font-black text-slate-900 dark:text-white leading-snug">
                          Field Worker &amp; Plumber Desk
                        </strong>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shrink-0">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block leading-relaxed mt-0.5">
                        Accept assigned tasks, submit diagnostics &amp; track fees
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600 shrink-0" />
                </button>
              )}

              {/* Tanker Driver Portal */}
              <button
                onClick={() => {
                  onOpenDriver();
                  setMobileMenuOpen(false);
                }}
                className="w-full p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/80 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-100 transition shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-black text-slate-900 dark:text-white leading-snug">
                      Tanker Driver Fleet Portal
                    </strong>
                    <span className="text-xs text-slate-500 block leading-relaxed mt-0.5">
                      GPS turn-by-turn routing &amp; delivery verification
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-600 shrink-0" />
              </button>

              {/* MBMC Admin Desk */}
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800 transition shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                    <Shield className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-black leading-snug">
                      MBMC Admin Operations Center
                    </strong>
                    <span className="text-xs text-slate-300 block leading-relaxed mt-0.5">
                      Worker assignment, grievance triage &amp; analytics
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
              </button>

              {/* Public Welcome Landing Page */}
              <button
                onClick={() => {
                  onOpenLanding();
                  setMobileMenuOpen(false);
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ← Back to Welcome Landing Hub
              </button>
            </div>

            {/* 5. 24x7 Emergency Water Helpline Call Card */}
            <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    24x7 Water Emergency Helpline
                  </span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                    1800-22-2026 / 022-28192828
                  </strong>
                </div>
              </div>

              <a
                href="tel:1800222026"
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-sm"
              >
                Call Now
              </a>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
