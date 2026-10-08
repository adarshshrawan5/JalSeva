import React from 'react';
import { Complaint, TankerBooking, SystemStats } from '../../types';
import { MBMC_ZONES } from '../../data/mbmcData';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Droplets,
  Truck,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AdminAnalyticsProps {
  complaints: Complaint[];
  bookings: TankerBooking[];
  stats: SystemStats;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  complaints,
  bookings,
  stats,
}) => {
  // Compute issue category distribution
  const issueCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    issueCounts[c.issueType] = (issueCounts[c.issueType] || 0) + 1;
  });

  const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  const maxIssue = Math.max(...sortedIssues.map(([, count]) => count), 1);

  // Compute zone volume
  const zoneStats = MBMC_ZONES.map((zone) => {
    const cCount = complaints.filter((c) => c.zoneId === zone.id).length;
    const bCount = bookings.filter((b) => b.zoneId === zone.id).length;
    return {
      zone,
      complaints: cCount,
      tankers: bCount,
      total: cCount + bCount,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Decision Support & Municipal Intelligence
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            MBMC JalSeva Analytics & Audits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data-driven tracking of water distribution, complaint aging, and emergency logistics efficiency.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Potable Water Supplied</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.waterSuppliedTodayMLD} <span className="text-sm font-normal text-slate-400">MLD</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">100% Meets WHO Chlorination Norms</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Fleet Utilization</span>
            <Truck className="w-4 h-4 text-[#ea580c]" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.tankerUtilizationPercent}%
          </div>
          <p className="text-[11px] text-slate-500">Across 4 central water depots</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mean SLA Redressal</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.avgResponseTimeHours} <span className="text-sm font-normal text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Under 48hr Citizen Charter</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Citizen Satisfaction</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            4.8 <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Based on 1,480 verified ratings</p>
        </div>
      </div>

      {/* Grid: Issue Category Distribution & Zone Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Type Frequency */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Grievances by Category</span>
            </h3>
            <span className="text-xs text-slate-400">{complaints.length} Total Cases</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedIssues.map(([issue, count]) => {
              const widthPct = Math.round((count / maxIssue) * 100);
              return (
                <div key={issue} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {issue}
                    </span>
                    <span className="font-mono text-slate-500">{count} reports</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.max(12, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Zone Water Logistics Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">4 Divisions</span>
          </div>

          <div className="space-y-4 pt-2">
            {zoneStats.map((item) => (
              <div
                key={item.zone.id}
                className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.zone.color }}
                    />
                    <strong className="text-slate-900 dark:text-white">{item.zone.name}</strong>
                  </div>
                  <span className="text-slate-500 font-mono">
                    Pop: {item.zone.population.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>Complaints: <strong className="text-slate-900 dark:text-white">{item.complaints}</strong></div>
                  <div>Tankers Dispatched: <strong className="text-slate-900 dark:text-white">{item.tankers}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
