import React, { useState, useMemo, useEffect } from 'react';
import { Complaint, FieldWorker, WaterZoneId } from '../../types';
import { storageService } from '../../services/storageService';
import { MBMC_ZONES } from '../../data/mbmcData';
import {
  Wrench,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  DollarSign,
  Droplets,
} from 'lucide-react';

interface AdminWorkerAssignmentDashboardProps {
  complaints: Complaint[];
  adminName: string;
}

export const AdminWorkerAssignmentDashboard: React.FC<AdminWorkerAssignmentDashboardProps> = ({
  complaints: initialComplaints,
  adminName,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [workers, setWorkers] = useState<FieldWorker[]>(() => storageService.getWorkers());
  const [selectedIssueFilter, setSelectedIssueFilter] = useState<string>('All');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('All');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'All' | 'Unassigned' | 'Assigned'>('Unassigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [assigningSuccess, setAssigningSuccess] = useState<string | null>(null);

  // Sync with storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setComplaints(storageService.getComplaints());
      setWorkers(storageService.getWorkers());
    };
    window.addEventListener('aqua_connect_storage_update', handleUpdate);
    return () => window.removeEventListener('aqua_connect_storage_update', handleUpdate);
  }, []);

  // Compute recommended specialization based on issue type
  const getRecommendedSpecialization = (issueType: string): string => {
    const lower = issueType.toLowerCase();
    if (lower.includes('leak') || lower.includes('pipe') || lower.includes('burst')) {
      return 'Pipeline & Valve';
    }
    if (lower.includes('dirty') || lower.includes('contamin') || lower.includes('odor') || lower.includes('smell') || lower.includes('quality')) {
      return 'Water Quality & Chemical';
    }
    if (lower.includes('pressure') || lower.includes('motor') || lower.includes('pump')) {
      return 'Motor & Pump';
    }
    return 'General Plumber';
  };

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Assignment status
      if (assignmentStatusFilter === 'Unassigned') {
        if (c.status !== 'Pending' && c.assignedWorker) return false;
      } else if (assignmentStatusFilter === 'Assigned') {
        if (!c.assignedWorker && c.status === 'Pending') return false;
      }

      // Issue type
      if (selectedIssueFilter !== 'All') {
        if (c.issueType !== selectedIssueFilter) return false;
      }

      // Zone filter
      if (selectedZoneFilter !== 'All') {
        if (c.zoneId !== selectedZoneFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          c.id.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.areaName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.issueType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [complaints, assignmentStatusFilter, selectedIssueFilter, selectedZoneFilter, searchQuery]);

  // Counts
  const unassignedCount = useMemo(
    () => complaints.filter((c) => c.status === 'Pending' && !c.assignedWorker).length,
    [complaints]
  );
  const activeAssignedCount = useMemo(
    () => complaints.filter((c) => (c.status === 'Assigned' || c.status === 'In Progress') && c.assignedWorker).length,
    [complaints]
  );
  const resolvedCount = useMemo(
    () => complaints.filter((c) => c.status === 'Resolved').length,
    [complaints]
  );

  // Handle assigning worker
  const handleConfirmAssignment = (complaint: Complaint, worker: FieldWorker) => {
    storageService.assignComplaintWorker(
      complaint.id,
      {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        designation: worker.specialization,
        avatar: worker.avatar,
        rating: worker.rating,
        specialization: worker.specialization,
      },
      adminName
    );

    setAssigningSuccess(`Assigned ${worker.name} (${worker.specialization}) to docket #${complaint.id}`);
    setSelectedComplaint(null);
    setSelectedWorkerId('');

    setTimeout(() => {
      setAssigningSuccess(null);
    }, 4000);
  };

  const uniqueIssueTypes = useMemo(() => {
    const set = new Set(complaints.map((c) => c.issueType));
    return Array.from(set);
  }, [complaints]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
            <Wrench className="w-3.5 h-3.5 text-blue-300" />
            <span>MBMC Public Grievance Dispatch &amp; Field Roster</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Worker Assignment &amp; Field Dispatch Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                Triage incoming citizen reports (water leaking, dirty water, low pressure, valve damage) and assign specialized municipal plumbers and water quality technicians with automatic skill matching.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200">
                {workers.filter((w) => w.currentStatus === 'Available').length} Plumbers Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {assigningSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{assigningSuccess}</span>
          </div>
          <button
            onClick={() => setAssigningSuccess(null)}
            className="text-white/80 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setAssignmentStatusFilter('Unassigned')}
          className={`p-5 rounded-2xl border transition-all text-left cursor-pointer ${
            assignmentStatusFilter === 'Unassigned'
              ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Awaiting Plumber</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {unassignedCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Needs urgent assignment</span>
        </button>

        <button
          onClick={() => setAssignmentStatusFilter('Assigned')}
          className={`p-5 rounded-2xl border transition-all text-left cursor-pointer ${
            assignmentStatusFilter === 'Assigned'
              ? 'bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Field Jobs</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {activeAssignedCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Technicians on site / en route</span>
        </button>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Redressed &amp; Tested</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">With work analysis submitted</span>
        </div>

        <button
          onClick={() => setAssignmentStatusFilter('All')}
          className={`p-5 rounded-2xl border transition-all text-left cursor-pointer ${
            assignmentStatusFilter === 'All'
              ? 'bg-slate-500/10 border-slate-500 shadow-md ring-2 ring-slate-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Grievances</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {complaints.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Show all complaints</span>
        </button>
      </div>

      {/* Field Technicians Availability Roster */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>MBMC Field Plumbers &amp; Inspectors Roster ({workers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Assigned specialists deploy directly to citizen premises upon admin dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
              ● Available: {workers.filter((w) => w.currentStatus === 'Available').length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
              ● On Job: {workers.filter((w) => w.currentStatus === 'On Job').length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {workers.map((worker) => {
            const activeJobs = complaints.filter(
              (c) => c.assignedWorker?.id === worker.id && c.status !== 'Resolved'
            );
            return (
              <div
                key={worker.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <strong className="font-bold text-sm text-slate-900 dark:text-white block">
                        {worker.name}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        ID: {worker.id} &bull; {worker.zoneId.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      worker.currentStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    ● {worker.currentStatus || 'Available'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Specialty:</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">{worker.specialization}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Load:</span>
                    <strong className={activeJobs.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {activeJobs.length} {activeJobs.length === 1 ? 'task' : 'tasks'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Completed Jobs:</span>
                    <strong className="text-slate-900 dark:text-white">{worker.completedTotal}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-slate-500">Rating:</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {worker.rating} / 5.0
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${worker.phone}`}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{worker.phone}</span>
                  </a>

                  {activeJobs.length > 0 && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                      Working on {activeJobs[0].id}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Assignment Section: Filter Controls & Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Citizen Grievance Triage &amp; Assignment Queue
              </h3>
              <p className="text-xs text-slate-500">
                Match incoming complaints with qualified plumbers based on reported issue type.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, docket, locality..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            {/* Issue Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">Issue Type:</span>
              <select
                value={selectedIssueFilter}
                onChange={(e) => setSelectedIssueFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Issues ({complaints.length})</option>
                {uniqueIssueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">Water Zone:</span>
              <select
                value={selectedZoneFilter}
                onChange={(e) => setSelectedZoneFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Zones</option>
                {MBMC_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter buttons */}
            <div className="flex items-center gap-1 ml-auto">
              {(['Unassigned', 'Assigned', 'All'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setAssignmentStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    assignmentStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Docket ID &amp; Time</th>
                <th className="py-3.5 px-4">Citizen &amp; Contact</th>
                <th className="py-3.5 px-4">Issue Description</th>
                <th className="py-3.5 px-4">Area &amp; Zone</th>
                <th className="py-3.5 px-4">Smart Specialist Match</th>
                <th className="py-3.5 px-4">Assigned Worker</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      No complaints matching criteria
                    </p>
                    <p className="text-xs text-slate-500">
                      All citizen issues in this queue have been dispatched or filtered out.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const recommendedSpec = getRecommendedSpecialization(c.issueType);
                  const isAssigned = !!c.assignedWorker;
                  const matchingWorkers = workers.filter((w) => w.specialization === recommendedSpec);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Docket ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                            {c.id}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {c.priority === 'High' && (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[9px]">
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <strong className="text-slate-900 dark:text-white font-bold block">
                            {c.citizenName}
                          </strong>
                          <a
                            href={`tel:${c.phone}`}
                            className="text-slate-500 hover:text-blue-600 text-[11px] block"
                          >
                            +91 {c.phone}
                          </a>
                        </div>
                      </td>

                      {/* Issue */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              c.issueType === 'Pipeline Leak'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : c.issueType === 'Contaminated Water' || c.issueType === 'Dirty Water'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            }`}
                          >
                            {c.issueType}
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px]">
                            {c.description}
                          </p>
                        </div>
                      </td>

                      {/* Area & Zone */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {c.areaName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {c.locality} ({c.zoneId.toUpperCase()})
                          </span>
                        </div>
                      </td>

                      {/* Smart Match */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>{recommendedSpec}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {matchingWorkers.length} qualified specialists
                          </span>
                        </div>
                      </td>

                      {/* Assigned Worker */}
                      <td className="py-4 px-4">
                        {isAssigned && c.assignedWorker ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                c.assignedWorker.avatar ||
                                'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={c.assignedWorker.name}
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <strong className="text-slate-900 dark:text-white font-bold block text-xs">
                                {c.assignedWorker.name}
                              </strong>
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                                {c.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            // Preselect best matching worker if available
                            const bestMatch = workers.find(
                              (w) => w.specialization === recommendedSpec && w.currentStatus === 'Available'
                            ) || workers.find((w) => w.specialization === recommendedSpec) || workers[0];
                            setSelectedWorkerId(bestMatch?.id || '');
                          }}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isAssigned
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{isAssigned ? 'Reassign' : 'Assign Worker'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">
                    Assign Field Worker / Plumber
                  </h4>
                  <p className="text-xs text-slate-500">
                    Docket ID: <span className="font-mono font-bold text-blue-600">{selectedComplaint.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Complaint Summary Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Citizen: {selectedComplaint.citizenName} (+91 {selectedComplaint.phone})
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedComplaint.issueType}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic">
                &ldquo;{selectedComplaint.description}&rdquo;
              </p>
              <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{selectedComplaint.address}, {selectedComplaint.locality} ({selectedComplaint.areaName})</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Required Trade Specialization:</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  ★ {getRecommendedSpecialization(selectedComplaint.issueType)}
                </span>
              </div>
            </div>

            {/* Select Worker List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose Qualified Municipal Technician:
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {workers.map((worker) => {
                  const isRecommended = worker.specialization === getRecommendedSpecialization(selectedComplaint.issueType);
                  const isSelected = selectedWorkerId === worker.id;

                  return (
                    <div
                      key={worker.id}
                      onClick={() => setSelectedWorkerId(worker.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-slate-900 dark:text-white">
                              {worker.name}
                            </strong>
                            {isRecommended && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                Best Match
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {worker.specialization} &bull; {worker.zoneId.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs justify-end">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{worker.rating}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            worker.currentStatus === 'Available'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          ● {worker.currentStatus || 'Available'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedComplaint) {
                    storageService.broadcastComplaint(selectedComplaint.id, adminName);
                    setAssigningSuccess(`Broadcasted docket #${selectedComplaint.id} to open plumber pool for 1st-claim!`);
                    setSelectedComplaint(null);
                    setTimeout(() => setAssigningSuccess(null), 4000);
                  }
                }}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                title="Broadcast open job offer to all qualified plumbers for first-come, first-served claim"
              >
                <Zap className="w-4 h-4" />
                <span>Broadcast (1st-Claim Pool)</span>
              </button>

              <button
                type="button"
                disabled={!selectedWorkerId}
                onClick={() => {
                  const chosen = workers.find((w) => w.id === selectedWorkerId);
                  if (chosen && selectedComplaint) {
                    handleConfirmAssignment(selectedComplaint, chosen);
                  }
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Direct Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
