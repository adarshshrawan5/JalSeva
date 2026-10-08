import React, { useState } from 'react';
import { JalSevaLogo } from './JalSevaLogo';
import { ThemeToggle } from './ThemeToggle';
import { OutageAlert, SystemStats, WaterZone } from '../../types';
import { MBMC_ZONES, MBMC_AREAS } from '../../data/mbmcData';
import {
  Users,
  Truck,
  Shield,
  ArrowRight,
  PhoneCall,
  Calendar,
  AlertCircle,
  Search,
  Droplets,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface MainLandingPageProps {
  stats: SystemStats;
  alerts: OutageAlert[];
  zones: WaterZone[];
  onSelectRole: (role: 'citizen' | 'driver' | 'admin') => void;
  onOpenQuickSchedule: () => void;
  onOpenQuickTanker: () => void;
  onOpenQuickComplaint: () => void;
  onSelectAlert: (alert: OutageAlert) => void;
}

export const MainLandingPage: React.FC<MainLandingPageProps> = ({
  stats,
  alerts,
  zones,
  onSelectRole,
  onOpenQuickSchedule,
  onOpenQuickTanker,
  onOpenQuickComplaint,
  onSelectAlert,
}) => {
  const [quickZoneId, setQuickZoneId] = useState('zone-1');
  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const selectedZone = zones.find((z) => z.id === quickZoneId) || zones[0];

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Showcase with 3 Portal Gateways */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-950 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#fd7e14]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
            <HeartHandshake className="w-4 h-4 text-[#fd7e14]" />
            <span>MBMC Digital Water Supply Portal • जलसेवा</span>
            <span className="text-white/40">•</span>
            <span className="text-amber-200 font-hindi">आपका पानी, आपकी सेवा</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            JalSeva: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-[#fd7e14]">हर बूंद मायने रखती है</span>
          </h1>

          <p className="text-base sm:text-xl text-amber-200 font-hindi font-medium">
            &ldquo;आपका पानी, आपकी सेवा - हर बूंद मायने रखती है&rdquo;
          </p>

          <p className="text-sm sm:text-lg text-sky-100 max-w-2xl leading-relaxed">
            Welcome to the official municipal water management portal of Mira-Bhayandar Municipal Corporation (MBMC). Choose your role below to access your dedicated dashboard.
          </p>

          {/* Quick Access Pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-sky-200 pt-1">
            <span className="bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
              ✓ 809,378 Citizens Served
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
              ✓ Strict Today/Tomorrow Tankers
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
              ✓ 4 Zones & 79 Localities
            </span>
          </div>
        </div>
      </section>

      {/* 3 DEDICATED ROLE PORTAL LOGIN CARDS (CITIZEN, DRIVER, ADMIN) */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] dark:text-amber-400 bg-orange-100 dark:bg-orange-950/60 px-3 py-1 rounded-full">
            Choose Your Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Log In to Your JalSeva Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated interfaces tailored for residents, municipal tanker drivers, and administrative engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* PORTAL 1: CITIZEN */}
          <div
            onClick={() => onSelectRole('citizen')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:border-blue-600 dark:hover:border-blue-500 transition-all transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-sm">
                👤
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
                  Public Resident Gateway
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Citizen Dashboard
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Check area water supply schedules, book emergency tankers strictly for Today or Tomorrow, report pipeline leaks, and track redressal live.
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>79 Sub-Areas Daily & Weekly Timetables</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>5,000L - 15,000L Emergency Tankers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>GPS Auto-Locate & Live Moving Tanker Map</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 group-hover:shadow-blue-500/25"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* PORTAL 2: DRIVER */}
          <div
            onClick={() => onSelectRole('driver')}
            className="group cursor-pointer bg-gradient-to-b from-orange-50/40 via-white to-white dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900 p-8 rounded-3xl border-2 border-orange-200 dark:border-orange-800/60 shadow-lg hover:shadow-2xl hover:border-[#ea580c] transition-all transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-[#ea580c] dark:text-amber-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🚚
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#ea580c] dark:text-amber-400 block">
                  Municipal Fleet Operators
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Tanker Driver Dashboard
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                For MBMC authorized tanker drivers. View assigned delivery trips today, navigate with live GPS routes, start transit, and record delivered water.
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#ea580c]">✓</span>
                  <span>Assigned Deliveries & Trip Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ea580c]">✓</span>
                  <span>Turn-by-turn Route Map to Citizen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ea580c]">✓</span>
                  <span>1-Tap &quot;In Transit&quot; &amp; &quot;Delivered&quot; Status</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-3.5 bg-gradient-to-r from-[#ea580c] to-[#fd7e14] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 group-hover:shadow-orange-500/25"
              >
                <span>Enter Driver Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* PORTAL 3: ADMIN */}
          <div
            onClick={() => onSelectRole('admin')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:border-slate-900 dark:hover:border-slate-400 transition-all transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🛡️
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Municipal Authority & Staff
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  MBMC Admin Console
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full-featured control center: publish emergency outage notices, manage water timetable grids, resolve grievances, and dispatch tankers on Kanban.
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Outage Broadcast & SMS Push Blasts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Batch Schedule Grid Update & Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Grievance Desk & Tanker Kanban Dispatch</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Water Telemetry Stats */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparency Metrics
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              MBMC JalSeva City Water Distribution Today
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated live from Surya & MIDC Telemetry</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-xs font-semibold">Supplied Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.waterSuppliedTodayMLD} <span className="text-sm font-medium text-slate-500">MLD</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Surya Dam Gravity & Jambhul Line</p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center gap-2 text-[#ea580c] dark:text-amber-400 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-xs font-semibold">Tankers Dispatched</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.tankersDispatchedToday} <span className="text-sm font-medium text-slate-500">Trips</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Average arrival within 22 minutes</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-semibold">Active Grievances</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.activeComplaintsCount}{' '}
              <span className="text-xs font-medium text-emerald-600">
                (96.8% Resolved)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">SLA turnaround in {stats.avgResponseTimeHours} hrs</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold">Citizens Covered</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.citizensServedTotal.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across 16 Wards & 79 Localities</p>
          </div>
        </div>
      </section>

      {/* Quick Schedule Preview Section */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Zone Water Timetable
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Quick Supply Schedule Lookup
            </h3>
            <p className="text-xs text-slate-500">
              Select your municipal zone to view current pressurized supply hours.
            </p>
          </div>

          <button
            onClick={onOpenQuickSchedule}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View Full 79 Localities Schedule</span>
            <span>→</span>
          </button>
        </div>

        {/* 4 Zones Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setQuickZoneId(z.id)}
              className={`p-4 rounded-2xl border text-left transition ${
                quickZoneId === z.id
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mb-1"
                style={{ backgroundColor: z.color }}
              />
              <strong className="block text-xs text-slate-900 dark:text-white line-clamp-1">
                {z.name}
              </strong>
              <span className="text-[10px] text-slate-500">{z.wards}</span>
            </button>
          ))}
        </div>

        {/* Selected Zone Supply Hours Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60">
            <span className="text-xs uppercase font-bold text-sky-800 dark:text-sky-300 block mb-1">
              Morning Supply Window
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {selectedZone.supplyWindows.morning.start} to {selectedZone.supplyWindows.morning.end}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Pressure: {selectedZone.supplyWindows.pressure}</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
            <span className="text-xs uppercase font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
              Evening Supply Window
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {selectedZone.supplyWindows.evening.start} to {selectedZone.supplyWindows.evening.end}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Frequency: {selectedZone.supplyWindows.frequency}</span>
          </div>
        </div>
      </section>

      {/* 24x7 Helplines & MBMC Emergency Contacts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#ea580c] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">24x7 Emergency Water Desk</h4>
          <p className="text-xs text-slate-500">
            Direct helpline for pipeline bursts, contamination, or sudden supply disruption.
          </p>
          <a
            href="tel:1800222026"
            className="text-base font-black text-[#ea580c] hover:underline block"
          >
            1800-22-2026 (Toll-Free)
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">4 Water Tanker Depots</h4>
          <p className="text-xs text-slate-500">
            Kharigaon Central, Sector 4 Mira Rd, Subhash Nagar, and Uttan Coastal Depots.
          </p>
          <button
            onClick={onOpenQuickTanker}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Book Tanker (Today/Tomorrow) →
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Citizen Redressal SLA</h4>
          <p className="text-xs text-slate-500">
            Pipeline leaks inspected within 2 hours. Maximum redressal turnaround: 48 hours.
          </p>
          <button
            onClick={onOpenQuickComplaint}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Report Pipeline Leak / Issue →
          </button>
        </div>
      </section>
    </div>
  );
};
