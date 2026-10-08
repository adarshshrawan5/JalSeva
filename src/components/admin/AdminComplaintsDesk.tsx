import React, { useState, useMemo } from 'react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  FieldWorker,
  WaterZoneId,
} from '../../types';
import { MBMC_ZONES, MBMC_WORKERS } from '../../data/mbmcData';
import { storageService } from '../../services/storageService';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertCircle,
  Phone,
  Download,
  Eye,
  X,
  Star,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface AdminComplaintsDeskProps {
  complaints: Complaint[];
  adminName: string;
}

export const AdminComplaintsDesk: React.FC<AdminComplaintsDeskProps> = ({
  complaints,
  adminName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Resolution Modal State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(MBMC_WORKERS[0].id);

  // Filtered complaints
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.areaName.toLowerCase().includes(q) ||
        c.issueType.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      const matchZone = zoneFilter === 'All' || c.zoneId === zoneFilter;

      return matchSearch && matchStatus && matchPriority && matchZone;
    });
  }, [complaints, searchQuery, statusFilter, priorityFilter, zoneFilter]);

  // Handle Assign Worker
  const handleAssignWorker = () => {
    if (!selectedComplaint) return;
    const worker = MBMC_WORKERS.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    storageService.assignComplaintWorker(
      selectedComplaint.id,
      {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        designation: worker.specialization,
      },
      adminName
    );

    setShowAssignModal(false);
    setSelectedComplaint((prev) =>
      prev
        ? {
            ...prev,
            status: 'Assigned',
            assignedWorker: {
              id: worker.id,
              name: worker.name,
              phone: worker.phone,
              designation: worker.specialization,
            },
          }
        : null
    );
  };

  // Handle Mark In Progress
  const handleSetInProgress = (complaintId: string) => {
    storageService.updateComplaintStatus(
      complaintId,
      'In Progress',
      'Field inspector is on-site investigating pipeline pressure.',
      adminName
    );
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: 'In Progress' } : null));
    }
  };

  // Handle Mark Resolved
  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !resolutionNotes.trim()) return;

    storageService.updateComplaintStatus(
      selectedComplaint.id,
      'Resolved',
      resolutionNotes,
      adminName
    );

    setShowResolveModal(false);
    setResolutionNotes('');
    setSelectedComplaint((prev) =>
      prev ? { ...prev, status: 'Resolved', resolutionNotes } : null
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Citizen', 'Phone', 'Zone', 'Area', 'Issue', 'Priority', 'Status', 'Date'];
    const rows = filtered.map((c) => [
      c.id,
      c.citizenName,
      c.phone,
      c.zoneId,
      c.areaName,
      c.issueType,
      c.priority,
      c.status,
      c.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mbmc_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            MBMC Public Grievance Desk
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Complaint Resolution Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch plumbers, inspect water quality, and monitor resolution timelines across Mira-Bhayandar.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border border-slate-200 dark:border-slate-700"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, citizen name, phone, area, issue..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Zone:</span>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
          >
            <option value="All">All Zones</option>
            {MBMC_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Docket ID</th>
                <th className="py-3 px-4">Citizen & Contact</th>
                <th className="py-3 px-4">Zone & Area</th>
                <th className="py-3 px-4">Issue Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {c.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 dark:text-white block">{c.citizenName}</strong>
                    <a
                      href={`tel:${c.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-blue-600 text-[11px] font-mono"
                    >
                      +91 {c.phone}
                    </a>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold block">{c.areaName}</span>
                    <span className="text-[10px] text-slate-400">
                      {MBMC_ZONES.find((z) => z.id === c.zoneId)?.name.split(':')[0]}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {c.issueType}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : c.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'Assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ● {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {c.assignedWorker ? (
                      <span className="font-medium text-slate-900 dark:text-white">
                        {c.assignedWorker.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(c);
                      }}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-lg text-xs font-bold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedComplaint.id}
                </span>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">
                  {selectedComplaint.issueType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border">
                <div>
                  <span className="text-slate-500 block">Citizen Complainant:</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedComplaint.citizenName}
                  </strong>
                  <span className="text-slate-600 dark:text-slate-400 block mt-0.5">
                    +91 {selectedComplaint.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedComplaint.areaName} ({selectedComplaint.locality})
                  </strong>
                  <span className="text-slate-500 block truncate">{selectedComplaint.address}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px] mb-1">
                  Citizen Reported Description:
                </span>
                <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border text-slate-800 dark:text-slate-200 italic">
                  &ldquo;{selectedComplaint.description}&rdquo;
                </p>
              </div>

              {selectedComplaint.photoUrl && (
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px] mb-1">
                    Photo Attachment:
                  </span>
                  <img
                    src={selectedComplaint.photoUrl}
                    alt="Inspection evidence"
                    className="w-36 h-36 rounded-xl object-cover border"
                  />
                </div>
              )}

              {/* Assigned Worker / Action bar */}
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">
                    Field Inspector Assignment:
                  </span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedComplaint.assignedWorker
                      ? `${selectedComplaint.assignedWorker.name} (${selectedComplaint.assignedWorker.designation})`
                      : 'None Assigned Yet'}
                  </strong>
                </div>

                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {selectedComplaint.assignedWorker ? 'Reassign Worker' : 'Assign Field Plumber'}
                </button>
              </div>

              {/* Status Update Action Buttons */}
              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Current Status: <strong>{selectedComplaint.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {selectedComplaint.status !== 'In Progress' && selectedComplaint.status !== 'Resolved' && (
                    <button
                      onClick={() => handleSetInProgress(selectedComplaint.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {selectedComplaint.status !== 'Resolved' && (
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Assignment Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Assign Field Plumber to {selectedComplaint.id}
            </h4>
            <p className="text-xs text-slate-500">
              System auto-lists certified MBMC pipeline and quality engineers for this zone.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {MBMC_WORKERS.map((worker) => (
                <label
                  key={worker.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs ${
                    selectedWorkerId === worker.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 font-bold'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="worker"
                      checked={selectedWorkerId === worker.id}
                      onChange={() => setSelectedWorkerId(worker.id)}
                    />
                    <div>
                      <strong className="block">{worker.name}</strong>
                      <span className="text-[10px] text-slate-500">{worker.specialization}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Load: {worker.activeComplaints}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
              >
                Assign & Dispatch SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Notes Modal */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Confirm Resolution for {selectedComplaint.id}
            </h4>
            <p className="text-xs text-slate-500">
              Provide resolution notes (mandatory under municipal quality audit norms).
            </p>

            <form onSubmit={handleResolveComplaint} className="space-y-4 text-xs">
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Replaced 110mm cracked joint sleeve. Pressure normalized to 5.2 bar. Sample tested clean."
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Complete & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
