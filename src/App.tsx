import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import {
  WaterZone,
  OutageAlert,
  Complaint,
  TankerBooking,
  SystemStats,
  AdminUser,
  Driver,
  SubArea,
} from './types';
import { storageService } from './services/storageService';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AlertTicker } from './components/common/AlertTicker';
import { Modal } from './components/common/Modal';
import { MainLandingPage } from './components/common/MainLandingPage';
import { CitizenLogin } from './components/citizen/CitizenLogin';
import { CitizenHome } from './components/citizen/CitizenHome';
import { ScheduleTracker } from './components/citizen/ScheduleTracker';
import { ComplaintForm } from './components/citizen/ComplaintForm';
import { ComplaintTracker } from './components/citizen/ComplaintTracker';
import { TankerBookingForm } from './components/citizen/TankerBookingForm';
import { TankerTracker } from './components/citizen/TankerTracker';
import { SupportSection } from './components/citizen/SupportSection';
import { DriverLogin } from './components/driver/DriverLogin';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboardHome } from './components/admin/AdminDashboardHome';
import { AdminBroadcastManager } from './components/admin/AdminBroadcastManager';
import { AdminScheduleManager } from './components/admin/AdminScheduleManager';
import { AdminComplaintsDesk } from './components/admin/AdminComplaintsDesk';
import { AdminTankerManager } from './components/admin/AdminTankerManager';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminStaffManager } from './components/admin/AdminStaffManager';
import {
  AlertTriangle,
  Clock,
  Search,
  Truck,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

export type AppView = 'landing' | 'citizen-login' | 'citizen' | 'driver-login' | 'driver' | 'admin-login' | 'admin';

export default function App() {
  // Navigation View: Default to 'landing' as requested!
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeCitizenTab, setActiveCitizenTab] = useState<ActiveTab>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Authenticated sessions
  const [citizenSession, setCitizenSession] = useState<{ phone: string; name: string } | null>(null);
  const [driverUser, setDriverUser] = useState<Driver | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Storage / Reactive Database State
  const [zones, setZones] = useState<WaterZone[]>(() => storageService.getZones());
  const [alerts, setAlerts] = useState<OutageAlert[]>(() => storageService.getAlerts());
  const [complaints, setComplaints] = useState<Complaint[]>(() => storageService.getComplaints());
  const [bookings, setBookings] = useState<TankerBooking[]>(() => storageService.getBookings());
  const [stats, setStats] = useState<SystemStats>(() => storageService.getStats());

  // Inter-component Navigation parameters
  const [tankerInitialArea, setTankerInitialArea] = useState<string | undefined>(undefined);
  const [trackingInitialComplaintId, setTrackingInitialComplaintId] = useState<string | undefined>(undefined);
  const [trackingInitialBookingId, setTrackingInitialBookingId] = useState<string | undefined>(undefined);
  const [trackerMode, setTrackerMode] = useState<'complaint' | 'tanker'>('complaint');

  // Selected Outage for Modal
  const [selectedAlertModal, setSelectedAlertModal] = useState<OutageAlert | null>(null);

  // Reactive updates on storage changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      setZones(storageService.getZones());
      setAlerts(storageService.getAlerts());
      setComplaints(storageService.getComplaints());
      setBookings(storageService.getBookings());
      setStats(storageService.getStats());
    };

    window.addEventListener('aqua_connect_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('aqua_connect_storage_update', handleStorageUpdate);
  }, []);

  // Quick Action Handlers
  const handleOpenQuickSchedule = () => {
    setActiveCitizenTab('schedule');
    setCurrentView('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickTanker = () => {
    setActiveCitizenTab('tanker-book');
    setCurrentView('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickComplaint = () => {
    setActiveCitizenTab('complaint-file');
    setCurrentView('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookTankerForArea = (area: SubArea) => {
    setTankerInitialArea(area.name);
    setActiveCitizenTab('tanker-book');
    setCurrentView('citizen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSuccess = (newComplaint: Complaint) => {
    setTrackingInitialComplaintId(newComplaint.id);
    setTrackerMode('complaint');
    setActiveCitizenTab('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTankerCreated = (newBooking: TankerBooking) => {
    setTrackingInitialBookingId(newBooking.id);
    setTrackerMode('tanker');
    setActiveCitizenTab('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickApprovePendingTankers = () => {
    const pending = bookings.filter((b) => b.status === 'Pending');
    pending.forEach((b) => {
      storageService.updateBookingStatus(
        b.id,
        'Approved',
        undefined,
        undefined,
        adminUser?.name || 'Admin'
      );
    });
    setActiveAdminTab('tankers');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
        {/* VIEW 1: DRIVER DASHBOARD & LOGIN */}
        {currentView === 'driver-login' && (
          <DriverLogin
            onLoginSuccess={(driver) => {
              setDriverUser(driver);
              setCurrentView('driver');
            }}
            onBackToHome={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'driver' && driverUser && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DriverDashboard
              driver={driverUser}
              bookings={bookings}
              onLogout={() => {
                setDriverUser(null);
                setCurrentView('landing');
              }}
              onSwitchToHome={() => setCurrentView('landing')}
            />
          </div>
        )}

        {/* VIEW 2: ADMIN DASHBOARD & LOGIN */}
        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={(user) => {
              setAdminUser(user);
              setCurrentView('admin');
              setActiveAdminTab('dashboard');
            }}
            onBackToCitizen={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'admin' && adminUser && (
          <AdminLayout
            adminUser={adminUser}
            activeTab={activeAdminTab}
            setActiveTab={setActiveAdminTab}
            onLogout={() => {
              setAdminUser(null);
              setCurrentView('landing');
            }}
            onSwitchToCitizen={() => setCurrentView('landing')}
          >
            {activeAdminTab === 'dashboard' && (
              <AdminDashboardHome
                adminUser={adminUser}
                stats={stats}
                complaints={complaints}
                bookings={bookings}
                alerts={alerts}
                onNavigate={(tab) => setActiveAdminTab(tab)}
                onQuickApproveTankers={handleQuickApprovePendingTankers}
              />
            )}

            {activeAdminTab === 'broadcast' && (
              <AdminBroadcastManager alerts={alerts} adminName={adminUser.name} />
            )}

            {activeAdminTab === 'schedule' && (
              <AdminScheduleManager zones={zones} adminName={adminUser.name} />
            )}

            {activeAdminTab === 'complaints' && (
              <AdminComplaintsDesk complaints={complaints} adminName={adminUser.name} />
            )}

            {activeAdminTab === 'tankers' && (
              <AdminTankerManager bookings={bookings} adminName={adminUser.name} />
            )}

            {activeAdminTab === 'analytics' && (
              <AdminAnalytics complaints={complaints} bookings={bookings} stats={stats} />
            )}

            {activeAdminTab === 'staff' && <AdminStaffManager />}
          </AdminLayout>
        )}

        {/* VIEW 3: CITIZEN LOGIN */}
        {currentView === 'citizen-login' && (
          <CitizenLogin
            onLoginSuccess={(phone, name) => {
              setCitizenSession({ phone, name });
              setCurrentView('citizen');
              setActiveCitizenTab('home');
            }}
            onContinueAsGuest={() => {
              setCurrentView('citizen');
              setActiveCitizenTab('home');
            }}
            onBackToHome={() => setCurrentView('landing')}
          />
        )}

        {/* VIEW 4: PUBLIC LANDING PAGE & CITIZEN PORTAL */}
        {(currentView === 'landing' || currentView === 'citizen') && (
          <>
            {/* Top Navigation Bar */}
            <Navbar
              activeTab={activeCitizenTab}
              setActiveTab={(tab) => {
                setActiveCitizenTab(tab);
                setCurrentView('citizen');
              }}
              onOpenLanding={() => setCurrentView('landing')}
              onOpenDriver={() => {
                if (driverUser) {
                  setCurrentView('driver');
                } else {
                  setCurrentView('driver-login');
                }
              }}
              onOpenAdmin={() => {
                if (adminUser) {
                  setCurrentView('admin');
                } else {
                  setCurrentView('admin-login');
                }
              }}
              isAdminLoggedIn={!!adminUser}
              isDriverLoggedIn={!!driverUser}
            />

            {/* Live Emergency Outage Ticker Marquee */}
            <AlertTicker
              alerts={alerts}
              onSelectAlert={(alert) => setSelectedAlertModal(alert)}
            />

            {/* Main Body */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              {currentView === 'landing' ? (
                /* The Welcome Landing Page with 3 Role Gateways */
                <MainLandingPage
                  stats={stats}
                  alerts={alerts}
                  zones={zones}
                  onSelectRole={(role) => {
                    if (role === 'citizen') {
                      setCurrentView('citizen');
                      setActiveCitizenTab('home');
                    } else if (role === 'driver') {
                      if (driverUser) {
                        setCurrentView('driver');
                      } else {
                        setCurrentView('driver-login');
                      }
                    } else if (role === 'admin') {
                      if (adminUser) {
                        setCurrentView('admin');
                      } else {
                        setCurrentView('admin-login');
                      }
                    }
                  }}
                  onOpenQuickSchedule={handleOpenQuickSchedule}
                  onOpenQuickTanker={handleOpenQuickTanker}
                  onOpenQuickComplaint={handleOpenQuickComplaint}
                  onSelectAlert={(alert) => setSelectedAlertModal(alert)}
                />
              ) : (
                /* Citizen Portal Sections */
                <div className="space-y-6">
                  {/* Citizen Header bar with logged in resident chip */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        Citizen Portal:
                      </span>
                      {citizenSession ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {citizenSession.name} (+91 {citizenSession.phone})
                        </span>
                      ) : (
                        <span className="text-slate-500">Guest Resident Mode</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!citizenSession ? (
                        <button
                          onClick={() => setCurrentView('citizen-login')}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Sign In with Mobile
                        </button>
                      ) : (
                        <button
                          onClick={() => setCitizenSession(null)}
                          className="text-slate-400 hover:text-slate-600 font-medium"
                        >
                          Switch User
                        </button>
                      )}

                      <button
                        onClick={() => setCurrentView('landing')}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      >
                        Landing Page
                      </button>
                    </div>
                  </div>

                  {activeCitizenTab === 'home' && (
                    <CitizenHome
                      setActiveTab={setActiveCitizenTab}
                      stats={stats}
                      alerts={alerts}
                      onSelectAlert={(alert) => setSelectedAlertModal(alert)}
                    />
                  )}

                  {activeCitizenTab === 'schedule' && (
                    <ScheduleTracker
                      zones={zones}
                      alerts={alerts}
                      onSelectAlert={(alert) => setSelectedAlertModal(alert)}
                      onBookTankerForArea={handleBookTankerForArea}
                    />
                  )}

                  {activeCitizenTab === 'tanker-book' && (
                    <TankerBookingForm
                      initialArea={tankerInitialArea}
                      onBookingConfirmed={handleTankerCreated}
                      onTrackBooking={(id) => {
                        setTrackingInitialBookingId(id);
                        setTrackerMode('tanker');
                        setActiveCitizenTab('tracker');
                      }}
                    />
                  )}

                  {activeCitizenTab === 'complaint-file' && (
                    <ComplaintForm
                      onSuccess={handleComplaintSuccess}
                      onCancel={() => setActiveCitizenTab('home')}
                    />
                  )}

                  {activeCitizenTab === 'tracker' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => setTrackerMode('complaint')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition ${
                              trackerMode === 'complaint'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                          >
                            <Search className="w-4 h-4" />
                            <span>Track Complaints</span>
                          </button>

                          <button
                            onClick={() => setTrackerMode('tanker')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition ${
                              trackerMode === 'tanker'
                                ? 'bg-[#ea580c] text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                            <span>Track Emergency Tankers (Live GPS)</span>
                          </button>
                        </div>
                      </div>

                      {trackerMode === 'complaint' ? (
                        <ComplaintTracker
                          initialSearchId={trackingInitialComplaintId}
                          onFileNewComplaint={() => setActiveCitizenTab('complaint-file')}
                        />
                      ) : (
                        <TankerTracker
                          initialBookingId={trackingInitialBookingId}
                          onBookAnother={() => setActiveCitizenTab('tanker-book')}
                        />
                      )}
                    </div>
                  )}

                  {activeCitizenTab === 'support' && <SupportSection />}
                </div>
              )}
            </main>

            {/* Outage Detail Modal */}
            <Modal
              isOpen={!!selectedAlertModal}
              onClose={() => setSelectedAlertModal(null)}
              title={
                <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Public Water Notice Details</span>
                </span>
              }
            >
              {selectedAlertModal && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500 font-bold">{selectedAlertModal.id}</span>
                      <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800">
                        {selectedAlertModal.type} ({selectedAlertModal.priority} Priority)
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedAlertModal.title}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      {selectedAlertModal.reason}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <span className="text-slate-500 block uppercase text-[10px] font-bold">Start Time</span>
                      <strong>{new Date(selectedAlertModal.startTime).toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <span className="text-slate-500 block uppercase text-[10px] font-bold">Estimated Restoration</span>
                      <strong>{new Date(selectedAlertModal.endTime).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Affected Localities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAlertModal.affectedAreas.map((area) => (
                        <span key={area} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold">
                          📍 {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-emerald-900 dark:text-emerald-200">
                    <strong className="block text-emerald-800 dark:text-emerald-300">Alternative Arrangements:</strong>
                    <span>{selectedAlertModal.alternativeArrangement}</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Published by: {selectedAlertModal.publishedBy}</span>
                    <button
                      onClick={() => {
                        setSelectedAlertModal(null);
                        setActiveCitizenTab('tanker-book');
                        setCurrentView('citizen');
                      }}
                      className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold"
                    >
                      Request Tanker Instead →
                    </button>
                  </div>
                </div>
              )}
            </Modal>

            {/* Municipal Footer */}
            <Footer
              setActiveTab={(tab) => {
                setActiveCitizenTab(tab);
                setCurrentView('citizen');
              }}
              onOpenAdmin={() => {
                if (adminUser) {
                  setCurrentView('admin');
                } else {
                  setCurrentView('admin-login');
                }
              }}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
