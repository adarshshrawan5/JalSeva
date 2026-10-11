import React, { useState } from 'react';
import { CitizenUser, Driver, AdminUser, TankerBooking, Complaint } from '../../types';
import { storageService } from '../../services/storageService';
import {
  User,
  Shield,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  Building,
  Key,
  Award,
  Droplets,
  FileText,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { WaterConsumptionDashboard } from '../citizen/WaterConsumptionDashboard';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'citizen' | 'driver' | 'admin';
  citizenUser?: CitizenUser | null;
  onUpdateCitizen?: (updated: CitizenUser) => void;
  driverUser?: Driver | null;
  adminUser?: AdminUser | null;
  bookings?: TankerBooking[];
  complaints?: Complaint[];
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  role,
  citizenUser,
  onUpdateCitizen,
  driverUser,
  adminUser,
  bookings = [],
  complaints = [],
  onLogout,
}) => {
  if (!isOpen) return null;

  // Editing state for citizen
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(citizenUser?.name || '');
  const [editPhone, setEditPhone] = useState(citizenUser?.phone || '');
  const [editAddress, setEditAddress] = useState(citizenUser?.address || '');
  const [editArea, setEditArea] = useState(citizenUser?.areaName || '');

  const handleSaveCitizen = () => {
    if (!citizenUser || !onUpdateCitizen) return;
    const updated: CitizenUser = {
      ...citizenUser,
      name: editName.trim() || citizenUser.name,
      phone: editPhone.trim() || citizenUser.phone,
      address: editAddress.trim(),
      areaName: editArea.trim(),
    };
    storageService.saveCitizenProfile(updated);
    onUpdateCitizen(updated);
    setIsEditing(false);
  };

  // Get citizen specific activity
  const myBookings = citizenUser?.phone
    ? bookings.filter((b) => b.phone.includes(citizenUser.phone.slice(-10)))
    : [];
  const myComplaints = citizenUser?.phone
    ? complaints.filter((c) => c.phone.includes(citizenUser.phone.slice(-10)))
    : [];

  // Citizen tabs: Account vs Water Consumption Analytics
  const [citizenSubTab, setCitizenSubTab] = useState<'account' | 'consumption'>('account');
  const meterLogs = storageService.getMeterReadings();
  const latestMeterLog = meterLogs[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl ${
          role === 'citizen' && citizenSubTab === 'consumption' ? 'max-w-4xl' : 'max-w-xl'
        } w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative my-8 animate-in fade-in zoom-in-95 transition-all duration-200`}
      >
        {/* Header Ribbon */}
        <div
          className={`p-6 text-white ${
            role === 'admin'
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
              : role === 'driver'
              ? 'bg-gradient-to-r from-[#ea580c] via-amber-700 to-[#c2410c]'
              : 'bg-gradient-to-r from-blue-700 via-sky-700 to-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
                {role === 'admin' ? '🛡️' : role === 'driver' ? '🚚' : '👤'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/25">
                  {role === 'admin'
                    ? 'Municipal Water Administration'
                    : role === 'driver'
                    ? 'Authorized Tanker Fleet Driver'
                    : 'Registered Resident Profile'}
                </span>
                <h3 className="text-xl font-black mt-1">
                  {role === 'admin'
                    ? adminUser?.name || 'Adarsh Yadav'
                    : role === 'driver'
                    ? driverUser?.name || 'Rahul'
                    : citizenUser?.name || 'Citizen Resident'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* ROLE 1: CITIZEN PROFILE */}
          {role === 'citizen' && (
            <div className="space-y-4">
              {/* Profile Sub-tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCitizenSubTab('account')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    citizenSubTab === 'account'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Resident Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCitizenSubTab('consumption')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    citizenSubTab === 'consumption'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Water Usage &amp; Analytics</span>
                </button>
              </div>

              {citizenSubTab === 'consumption' ? (
                <div className="pt-2">
                  <WaterConsumptionDashboard compact={true} onNavigateToMeterReader={onClose} />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      Resident Account Information
                    </span>
                    {!isEditing ? (
                      <button
                        onClick={() => {
                          setEditName(citizenUser?.name || '');
                          setEditPhone(citizenUser?.phone || '');
                          setEditAddress(citizenUser?.address || '');
                          setEditArea(citizenUser?.areaName || '');
                          setIsEditing(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveCitizen}
                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                          Resident Full Name
                        </span>
                        <strong className="text-sm text-slate-900 dark:text-white block">
                          {citizenUser?.name || 'Resident Citizen'}
                        </strong>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                          Registered Mobile
                        </span>
                        <strong className="text-sm text-slate-900 dark:text-white block font-mono">
                          +91 {citizenUser?.phone || 'Not Specified'}
                        </strong>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                          Saved Residence / Delivery Address
                        </span>
                        <span className="text-xs text-slate-800 dark:text-slate-200 block">
                          {citizenUser?.address || citizenUser?.areaName
                            ? `${citizenUser?.address ? citizenUser.address + ', ' : ''}${citizenUser?.areaName || 'Mira-Bhayandar'}`
                            : 'No default address saved. Click edit to set default delivery address.'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Sub-Area / Locality
                        </label>
                        <input
                          type="text"
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                          placeholder="e.g. Jesal Park, Bhayandar East"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Complete Building Address
                        </label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Flat/House, Society, Street"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Citizen Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900">
                      <span className="text-[10px] text-blue-600 font-bold block">Tankers Booked</span>
                      <strong className="text-lg text-slate-900 dark:text-white font-mono">
                        {myBookings.length}
                      </strong>
                    </div>
                    <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900">
                      <span className="text-[10px] text-[#ea580c] font-bold block">Complaints Filed</span>
                      <strong className="text-lg text-slate-900 dark:text-white font-mono">
                        {myComplaints.length}
                      </strong>
                    </div>
                    <div
                      onClick={() => setCitizenSubTab('consumption')}
                      className="p-3 bg-cyan-50/70 dark:bg-cyan-950/40 rounded-2xl border border-cyan-100 dark:border-cyan-900 cursor-pointer hover:bg-cyan-100/70 transition"
                    >
                      <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold block flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3" />
                        Meter Logs
                      </span>
                      <strong className="text-lg text-slate-900 dark:text-white font-mono">
                        {meterLogs.length}
                      </strong>
                    </div>
                    <div
                      onClick={() => setCitizenSubTab('consumption')}
                      className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 cursor-pointer hover:bg-emerald-100/70 transition"
                    >
                      <span className="text-[10px] text-emerald-600 font-bold block">Water Usage</span>
                      <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-bold block mt-1 font-mono">
                        {latestMeterLog ? `${latestMeterLog.consumptionKl} kL` : 'Active'}
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ROLE 2: DRIVER RAHUL PROFILE */}
          {role === 'driver' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Driver Credentials & Fleet Details
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold text-[10px]">
                  ● Active On Duty
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Fleet Driver Name
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white block">
                    {driverUser?.name || 'Rahul'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Driver Direct Phone
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white block font-mono">
                    {driverUser?.phone || '+91 98204 88312'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Assigned Tanker Vehicle
                  </span>
                  <strong className="text-sm text-[#ea580c] block font-mono">
                    {driverUser?.vehicleNumber || 'MH-04-RH-8821'}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Capacity: {driverUser?.capacity?.toLocaleString() || '10,000'} Liters
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Commercial Heavy License
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white block font-mono">
                    {driverUser?.licenseNumber || 'MH0420190088214'}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold">Valid till 2031</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Base Operational Depot
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white block">
                    Kharigaon Central Water Depot (Survey No. 42, Bhayandar East)
                  </strong>
                  <span className="text-[10px] text-slate-500">
                    Depot Incharge: S. K. Shinde • +91 22 2819 4401
                  </span>
                </div>
              </div>

              {/* Driver Stats */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-3 bg-orange-50/70 dark:bg-orange-950/40 rounded-2xl border border-orange-100 dark:border-orange-900">
                  <span className="text-[10px] text-[#ea580c] font-bold block">Deliveries Today</span>
                  <strong className="text-lg text-slate-900 dark:text-white font-mono">
                    {driverUser?.deliveriesToday || 4}
                  </strong>
                </div>
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900">
                  <span className="text-[10px] text-amber-600 font-bold block">Citizen Rating</span>
                  <strong className="text-lg text-amber-500 font-mono">
                    ⭐ {driverUser?.rating || 4.9}
                  </strong>
                </div>
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900">
                  <span className="text-[10px] text-blue-600 font-bold block">OTP Verification</span>
                  <strong className="text-xs text-blue-700 dark:text-blue-300 font-bold block mt-1">
                    100% Handover
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* ROLE 3: ADMIN ADARSH YADAV PROFILE */}
          {role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Municipal Authority Credentials
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 font-bold text-[10px]">
                  🛡️ Security Clearance: Level 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Administrative Officer
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white block">
                    {adminUser?.name || 'Adarsh Yadav'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Officer Mobile Helpline
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white block font-mono">
                    {adminUser?.phone || '7715804452'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Municipal Email ID
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white block font-mono">
                    {adminUser?.email || 'adarsh.yadav@mbmc.gov.in'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Officer Designation
                  </span>
                  <strong className="text-xs text-purple-700 dark:text-purple-300 block font-bold">
                    Chief Water Supply Engineer & Super Admin
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {adminUser?.employeeId || 'MBMC-WTR-001'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Department & Municipal HQ
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white block">
                    Mira-Bhayandar Municipal Corporation (MBMC) Water Supply Department
                  </strong>
                  <span className="text-[10px] text-slate-500">
                    Jurisdiction: Zone 1 (Bhayandar E), Zone 2 (Bhayandar W), Zone 3 (Mira Rd E), Zone 4 (Uttan)
                  </span>
                </div>
              </div>

              {/* Admin Privileges */}
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">
                  Authorized Municipal Capabilities
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Citywide Outage Broadcast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Zone Water Schedule Management</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Tanker Approval & Driver Dispatch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Official Delivery OTP Audit Reports</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {onLogout ? (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900 dark:text-rose-300 rounded-xl font-bold text-xs transition"
              >
                Sign Out
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
