import React from 'react';
import {
  AdminUser,
  SystemStats,
  Complaint,
  TankerBooking,
  OutageAlert,
} from '../../types';
import { MBMC_ZONES } from '../../data/mbmcData';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Users,
  Activity,
  ArrowUpRight,
  PlusCircle,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardHomeProps {
  adminUser: AdminUser;
  stats: SystemStats;
  complaints: Complaint[];
  bookings: TankerBooking[];
  alerts: OutageAlert[];
  onNavigate: (tab: any) => void;
  onQuickApproveTankers: () => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  adminUser,
  stats,
  complaints,
  bookings,
  alerts,
  onNavigate,
  onQuickApproveTankers,
}) => {
  const pendingComplaints = complaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Assigned'
  );
  const pendingTankers = bookings.filter((b) => b.status === 'Pending');
  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  // Zone complaints breakdown
  const zoneCounts = MBMC_ZONES.map((z) => {
    const cCount = complaints.filter((c) => c.zoneId === z.id).length;
    const bCount = bookings.filter((b) => b.zoneId === z.id).length;
    return {
      zone: z,
      complaints: cCount,
      bookings: bCount,
      total: cCount + bCount,
    };
  });

  const maxActivity = Math.max(...zoneCounts.map((z) => z.total), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>MBMC JalSeva Operations Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Welcome, {adminUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Role: <strong className="text-emerald-400">{adminUser.role}</strong> • Municipal Water Grid Status: <strong className="text-emerald-400">Optimal (142.5 MLD)</strong>
          </p>
        </div>

        {/* Quick Actions Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('broadcast')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Publish Outage Notice</span>
          </button>

          {pendingTankers.length > 0 && (
            <button
              onClick={onQuickApproveTankers}
              className="px-4 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 animate-pulse"
            >
              <Truck className="w-4 h-4" />
              <span>Approve {pendingTankers.length} Tankers</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('complaints')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Review Complaints</span>
          </button>
        </div>
      </div>

      {/* Primary 6 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Total Complaints */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Grievances</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {complaints.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            ↑ +12% from last week
          </span>
        </div>

        {/* Metric 2: Pending Complaints */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <span>Pending Redressal</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {pendingComplaints.length}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
            Requires field inspection
          </span>
        </div>

        {/* Metric 3: Tanker Bookings */}
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#ea580c] dark:text-amber-300 text-xs font-semibold">
            <span>Tanker Requests</span>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-[#ea580c] dark:text-amber-300">
            {bookings.length}
          </div>
          <span className="text-[10px] text-[#ea580c] font-bold block">
            {pendingTankers.length} pending approval
          </span>
        </div>

        {/* Metric 4: Active Alerts */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <span>Active Outages</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
            {activeAlerts.length}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold block">
            Broadcast live on ticker
          </span>
        </div>

        {/* Metric 5: Avg Response Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Avg Redressal</span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgResponseTimeHours} <span className="text-xs font-normal">hrs</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Target &lt; 4.0 hrs SLA
          </span>
        </div>

        {/* Metric 6: Tanker Utilization */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span>Fleet Utilization</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {stats.tankerUtilizationPercent}%
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            65 municipal tankers active
          </span>
        </div>
      </div>

      {/* Grid: Zone-wise Demand & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Zone Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Zone-Wise Grievance & Tanker Volume
              </h3>
              <p className="text-xs text-slate-500">
                Comparative load distribution across the 4 municipal divisions
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {zoneCounts.map((item) => {
              const percent = Math.round((item.total / maxActivity) * 100);
              return (
                <div key={item.zone.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.zone.color }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.zone.name}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {item.complaints} complaints • {item.bookings} tankers
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(10, percent)}%`,
                        backgroundColor: item.zone.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Surya Project Primary Feeder: Pressurized (7.5 bar)</span>
            <span className="text-emerald-600 font-bold">● Live Flow Active</span>
          </div>
        </div>

        {/* Right: Live Stream of Recent Activities */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Live Field Activity Feed
              </h3>
              <p className="text-xs text-slate-500">
                Incoming citizen bookings, reports, and dispatch updates
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {complaints.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-rose-500">●</span>
                    <span>New Complaint {c.id}: {c.issueType}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {c.citizenName} in {c.areaName} ({c.status})
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {bookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/40 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-[#ea580c]">🚚</span>
                    <span>Tanker Request {b.id}: {b.capacity.toLocaleString()}L</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {b.areaName} ({b.bookingDate} {b.timeSlot})
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
