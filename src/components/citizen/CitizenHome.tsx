import React from 'react';
import { ActiveTab } from '../common/Navbar';
import { OutageAlert, SystemStats } from '../../types';
import {
  Calendar,
  AlertCircle,
  Search,
  Droplets,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  HeartHandshake,
  Building2,
  MapPin,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface CitizenHomeProps {
  setActiveTab: (tab: ActiveTab) => void;
  stats: SystemStats;
  alerts: OutageAlert[];
  onSelectAlert: (alert: OutageAlert) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  setActiveTab,
  stats,
  alerts,
  onSelectAlert,
}) => {
  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section with JalSeva Branding */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fd7e14]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
            <HeartHandshake className="w-4 h-4 text-[#fd7e14]" />
            <span className="font-semibold">MBMC JalSeva (जलसेवा)</span>
            <span className="text-white/40">•</span>
            <span className="text-amber-200 font-hindi">आपका पानी, आपकी सेवा</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            JalSeva: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-[#fd7e14]">हर बूंद मायने रखती है</span>
          </h1>

          <p className="text-sm sm:text-base text-amber-200/90 font-medium font-hindi">
            &ldquo;आपका पानी, आपकी सेवा - हर बूंद मायने रखती है&rdquo;
          </p>

          <p className="text-sm sm:text-lg text-sky-100 font-medium leading-relaxed">
            Digital Water Supply Management Portal bridging 809,378 citizens with Mira-Bhayandar Municipal Corporation (MBMC). Check daily supply timings, view unplanned outage alerts, and report pipeline leaks directly to municipal engineers.
          </p>

          {/* Value Props Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200 pt-1">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Smart Water, Smart City
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Water at Your Fingertips
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Under 48hr Grievance Redressal
            </span>
          </div>

          {/* Primary Quick CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-6 py-3.5 bg-white text-blue-700 hover:bg-sky-50 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Check Area Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('complaint-file')}
              className="px-6 py-3.5 bg-gradient-to-r from-[#ea580c] to-[#fd7e14] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-2xl font-bold text-sm shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-white" />
              <span>Report Leak / Grievance</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-sky-200" />
              <span>Track Docket Status</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Prominent Quick Access Cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Citizen Core Modules</span>
              <span className="text-xs font-bold text-[#ea580c] dark:text-amber-400 bg-orange-100 dark:bg-orange-950/50 px-2.5 py-0.5 rounded-full">
                जलसेवा
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Access official municipal water services in under 3 clicks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: View Schedule */}
          <div
            onClick={() => setActiveTab('schedule')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Water Schedule</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Find morning & evening water supply timings, pressure ratings, and weekly timetable for all 4 MBMC zones.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span>View 79 Localities</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Report Grievance */}
          <div
            onClick={() => setActiveTab('complaint-file')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-500 dark:hover:border-rose-500 transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Report Grievance</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Report contaminated water, pipeline leaks, low pressure, or meter errors with photo upload & direct worker dispatch.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span>48h SLA Resolution</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Track Status */}
          <div
            onClick={() => setActiveTab('tracker')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Track Redressal</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time visual journey for your complaints from Registration → Plumber Assigned → In Progress → Tested & Resolved.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>Search by Docket / Phone</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 4: Ward Directory */}
          <div
            onClick={() => setActiveTab('support')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Ward Directory</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Contact executive water engineers, view zonal ward office addresses, FAQ guides, and 24x7 control room direct hotlines.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>All 4 Ward Offices</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Water Statistics Dashboard */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparency Metrics
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              MBMC JalSeva Distribution Statistics Today
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Telemetry updated every 5 minutes</span>
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
            <p className="text-[11px] text-slate-500 mt-1">Surya Dam Gravity & MIDC Jambhul Line</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold">Chlorination Standard</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              100% <span className="text-sm font-medium text-slate-500">Tested</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Certified Potable Drinking Water</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-semibold">Active Grievances</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.activeComplaintsCount}{' '}
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                (96.8% Resolved)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Average redressal in {stats.avgResponseTimeHours} hrs</p>
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

      {/* Active Outage Highlights Section (if any) */}
      {activeAlerts.length > 0 && (
        <section className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-6 rounded-3xl">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm mb-3">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span>ACTIVE WATER SUPPLY NOTICES & REPAIRS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {alert.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      ID: {alert.id}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 line-clamp-1">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {alert.reason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Areas: {alert.affectedAreas.slice(0, 2).join(', ')}
                    {alert.affectedAreas.length > 2 ? ` +${alert.affectedAreas.length - 2} more` : ''}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    View Impact Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Emergency Helplines & Ward Offices Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-[#ea580c] dark:text-amber-400 flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">24x7 Control Room</h4>
          <p className="text-xs text-slate-500">
            Direct municipal helpline for emergency pipe burst or total water stoppage.
          </p>
          <div className="pt-2">
            <a
              href="tel:1800222026"
              className="text-base font-black text-[#ea580c] dark:text-amber-400 hover:underline block"
            >
              1800-22-2026 (Toll-Free)
            </a>
            <div className="text-xs text-slate-500">022-2819 2828 / 022-2818 4040</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Water Reservoirs & Treatment</h4>
          <p className="text-xs text-slate-500">
            Surya Project gravity conduit, Jambhul WTP, Pali Reservoir, and Morva elevated master balancing tanks.
          </p>
          <div className="pt-2 text-xs text-blue-600 dark:text-blue-400 font-bold">
            <span>Primary Feeder Pressure: 7.5 Bar</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Citizen Guarantee</h4>
          <p className="text-xs text-slate-500">
            Strict resolution timeframe: Pipeline leaks inspected within 2 hours. Maximum redressal turnaround: 48 hours.
          </p>
          <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span>MBMC Public Service Charter 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};
