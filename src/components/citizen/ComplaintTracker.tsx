import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintStatus } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Search,
  CheckCircle,
  Clock,
  UserCheck,
  Wrench,
  AlertCircle,
  Phone,
  Star,
  RefreshCw,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface ComplaintTrackerProps {
  initialSearchId?: string;
  onFileNewComplaint?: () => void;
}

export const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({
  initialSearchId = '',
  onFileNewComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchId);
  const [complaints, setComplaints] = useState<Complaint[]>(() => storageService.getComplaints());
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(
    initialSearchId || (complaints[0]?.id ?? '')
  );
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Storage listener to refresh when admin updates complaints
  React.useEffect(() => {
    const handleUpdate = () => {
      setComplaints(storageService.getComplaints());
    };
    window.addEventListener('aqua_connect_storage_update', handleUpdate);
    return () => window.removeEventListener('aqua_connect_storage_update', handleUpdate);
  }, []);

  // Filter complaints matching query
  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) return complaints;
    const q = searchQuery.toLowerCase().trim();
    return complaints.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.areaName.toLowerCase().includes(q)
    );
  }, [complaints, searchQuery]);

  const activeComplaint = useMemo(() => {
    return (
      complaints.find((c) => c.id === selectedComplaintId) ||
      filteredComplaints[0] ||
      complaints[0]
    );
  }, [complaints, selectedComplaintId, filteredComplaints]);

  const handleRate = (rating: number) => {
    if (!activeComplaint) return;
    setUserRating(rating);
    storageService.rateComplaint(activeComplaint.id, rating, 'Citizen feedback recorded.');
  };

  const handleReopen = () => {
    if (!activeComplaint || !reopenReason.trim()) return;
    storageService.reopenComplaint(activeComplaint.id, reopenReason);
    setShowReopenModal(false);
    setReopenReason('');
  };

  // Helper for timeline steps
  const steps: { status: ComplaintStatus; label: string; icon: any }[] = [
    { status: 'Pending', label: 'Registered', icon: Clock },
    { status: 'Assigned', label: 'Officer Assigned', icon: UserCheck },
    { status: 'In Progress', label: 'Work In Progress', icon: Wrench },
    { status: 'Resolved', label: 'Resolved & Tested', icon: CheckCircle },
  ];

  const getStepState = (stepStatus: ComplaintStatus, currentStatus: ComplaintStatus) => {
    const order: ComplaintStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    const stepIndex = order.indexOf(stepStatus);
    const currentIndex = order.indexOf(currentStatus === 'Reopened' ? 'In Progress' : currentStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            MBMC Public Grievance Tracking
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Track Water Supply Complaints
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search by Docket ID (e.g. CMP2026100701) or Registered 10-Digit Mobile Number.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Complaint ID or Phone Number..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {onFileNewComplaint && (
            <button
              onClick={onFileNewComplaint}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition shrink-0"
            >
              + File New Complaint
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Complaint List & Detailed Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Found Complaints ({filteredComplaints.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                No complaints found matching &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredComplaints.map((c) => {
                const isSelected = activeComplaint?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComplaintId(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      {c.issueType}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {c.areaName} • {c.citizenName}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Selected Complaint Status Detail & Timeline */}
        {activeComplaint ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header of Active Complaint */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
                    {activeComplaint.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activeComplaint.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeComplaint.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    ● {activeComplaint.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Reported on {new Date(activeComplaint.createdAt).toLocaleString()} by{' '}
                  <strong className="text-slate-700 dark:text-slate-300">{activeComplaint.citizenName}</strong>
                </p>
              </div>

              {activeComplaint.status === 'Resolved' && (
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 border border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold rounded-xl transition"
                >
                  Issue Persists? Reopen
                </button>
              )}
            </div>

            {/* Visual Timeline Stepper */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Resolution Journey & Verification
              </h4>

              <div className="relative">
                {/* Horizontal Progress bar for sm+ */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                  {steps.map((st, idx) => {
                    const state = getStepState(st.status, activeComplaint.status);
                    const Icon = st.icon;

                    return (
                      <div
                        key={st.status}
                        className="flex sm:flex-col items-center gap-3 sm:text-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : state === 'current'
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {state === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              state !== 'upcoming'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {state === 'completed'
                              ? 'Verified'
                              : state === 'current'
                              ? 'In Execution'
                              : 'Pending Step'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assigned Field Worker Info */}
            {activeComplaint.assignedWorker && (
              <div className="bg-blue-50/70 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                    👨‍🔧
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300 tracking-wider">
                      Assigned MBMC Field Inspector
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-base">
                      {activeComplaint.assignedWorker.name}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {activeComplaint.assignedWorker.designation}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${activeComplaint.assignedWorker.phone}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Inspector ({activeComplaint.assignedWorker.phone})</span>
                </a>
              </div>
            )}

            {/* Resolution Notes (if resolved) */}
            {activeComplaint.status === 'Resolved' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Inspection & Redressal Complete</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  &ldquo;{activeComplaint.resolutionNotes || 'Field inspection completed and normal water pressure restored.'}&rdquo;
                </p>

                {/* Rating Widget */}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Rate Service Redressal:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        className="p-1 hover:scale-125 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            (userRating || activeComplaint.rating || 0) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Timeline Log */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Detailed Activity Log
              </h5>
              <div className="space-y-2">
                {activeComplaint.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs gap-3"
                  >
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        {item.status}: {item.notes}
                      </strong>
                      <span className="text-[11px] text-slate-500">By: {item.actor}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Reopen Complaint {activeComplaint?.id}
            </h3>
            <p className="text-xs text-slate-500">
              Please state why the grievance remains unresolved so the municipal supervisor can escalate.
            </p>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Water is still dirty this morning / pressure dropped again..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
