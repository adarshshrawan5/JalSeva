import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintStatus, WorkerPaymentDetails } from '../../types';
import { storageService } from '../../services/storageService';
import { WorkerPaymentModal } from './WorkerPaymentModal';
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
  DollarSign,
  CreditCard,
  Sparkles,
  Check,
  FileText,
  Droplets,
  Printer,
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [showRejectWorkerModal, setShowRejectWorkerModal] = useState(false);
  const [rejectWorkerReason, setRejectWorkerReason] = useState('Not available at home today / Need another time slot');

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

  const handleRejectWorker = () => {
    if (!activeComplaint || !rejectWorkerReason.trim()) return;
    storageService.citizenRejectAssignedWorker(activeComplaint.id, rejectWorkerReason);
    setShowRejectWorkerModal(false);
    setRejectWorkerReason('Not available at home today / Need another time slot');
    alert('Request submitted. Assigned technician has been unassigned and the ticket has been returned to MBMC Admin Dispatch for re-assignment.');
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
                  {activeComplaint.cloudSyncStatus === 'synced' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      ☁️ Cloud Synced
                    </span>
                  ) : activeComplaint.cloudSyncStatus === 'failed' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800" title={activeComplaint.cloudSyncError}>
                      ⚠️ Local Only (Cloud Write Failed)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      💾 Local Storage
                    </span>
                  )}
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

            {/* Assigned Field Specialist Info or Awaiting Assignment State */}
            {activeComplaint.assignedWorker ? (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 p-5 sm:p-6 rounded-3xl border border-blue-200 dark:border-blue-900/60 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={
                          activeComplaint.assignedWorker.avatar ||
                          'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80'
                        }
                        alt={activeComplaint.assignedWorker.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          activeComplaint.status === 'Resolved'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500 animate-ping'
                        }`}
                        title="Specialist Active"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                          MBMC Certified Field Plumber
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            activeComplaint.status === 'Assigned'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : activeComplaint.status === 'In Progress'
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          ● {activeComplaint.status === 'Assigned'
                            ? 'Dispatched & En Route'
                            : activeComplaint.status === 'In Progress'
                            ? 'Working On Site'
                            : 'Job Completed & Verified'}
                        </span>
                      </div>

                      <h5 className="font-black text-slate-900 dark:text-white text-lg">
                        {activeComplaint.assignedWorker.name}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {activeComplaint.assignedWorker.specialization || activeComplaint.assignedWorker.designation || 'Specialized Pipeline & Leak Technician'}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{activeComplaint.assignedWorker.rating || 4.9} / 5.0 Rating</span>
                        </span>
                        <span>•</span>
                        <span>ID: {activeComplaint.assignedWorker.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
                    <a
                      href={`tel:${activeComplaint.assignedWorker.phone}`}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Technician (+91 {activeComplaint.assignedWorker.phone})</span>
                    </a>
                    <a
                      href={`https://wa.me/91${activeComplaint.assignedWorker.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${activeComplaint.assignedWorker.name}, this is regarding JalSeva Complaint #${activeComplaint.id} at ${activeComplaint.address}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Specialist</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowRejectWorkerModal(true)}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="If you do not want this worker or need rescheduling"
                    >
                      <span>Decline / Change Plumber</span>
                    </button>
                  </div>
                </div>

                {/* Status Notice Banner */}
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-200/60 dark:border-blue-900/60 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    {activeComplaint.status === 'Assigned'
                      ? 'Technician has departed the Mira Road Depot with diagnostic tools. Estimated arrival: 15-25 minutes.'
                      : activeComplaint.status === 'In Progress'
                      ? 'Technician is presently on site. Pipe excavation and pressure telemetry underway.'
                      : 'Job completed. Work analysis report submitted and verified with MBMC Water Works.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-amber-900 dark:text-amber-200 font-bold">
                    Awaiting Specialist Assignment
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    MBMC Operations Desk has logged your ticket for <strong>{activeComplaint.issueType}</strong>. An administrator is matching a qualified municipal plumber or water quality technician to your locality. You will receive an SMS and see their profile here shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Technical Work Analysis & Diagnostic Docket */}
            {activeComplaint.workAnalysis && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Technician Work Analysis &amp; Inspection Docket
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Submitted by {activeComplaint.assignedWorker?.name || 'Field Specialist'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                    Total: ₹{activeComplaint.workAnalysis.totalAmount}
                  </span>
                </div>

                {/* Problem & Diagnosis */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Diagnostic Finding:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {activeComplaint.workAnalysis.diagnosis}
                  </p>
                </div>

                {/* Materials & Action */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Materials Replaced:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeComplaint.workAnalysis.materialsUsed && activeComplaint.workAnalysis.materialsUsed.length > 0 ? (
                        activeComplaint.workAnalysis.materialsUsed.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                          >
                            ✓ {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard pipe adjustment (no parts billed)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Before vs After Inspection:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {activeComplaint.workAnalysis.beforeAfterNote || 'Pressure normalized to MBMC standards.'}
                    </p>
                  </div>
                </div>

                {/* Chemical / Water Quality readings if applicable */}
                {activeComplaint.workAnalysis.waterQualityReading && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">TDS</span>
                      <strong className="text-sky-800 dark:text-sky-300 font-mono">
                        {activeComplaint.workAnalysis.waterQualityReading.ppm} PPM
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">pH Index</span>
                      <strong className="text-sky-800 dark:text-sky-300 font-mono">
                        {activeComplaint.workAnalysis.waterQualityReading.ph} (Neutral)
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Turbidity</span>
                      <strong className="text-sky-800 dark:text-sky-300 font-mono">
                        {activeComplaint.workAnalysis.waterQualityReading.turbidity}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Citizen Payment Action Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        Technician Service &amp; Analysis Fee: ₹{activeComplaint.workAnalysis.totalAmount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Standard MBMC base fee: ₹{activeComplaint.workAnalysis.serviceFee} + Parts: ₹{activeComplaint.workAnalysis.partsCost || 0}
                    </p>
                  </div>

                  {activeComplaint.paymentStatus === 'Paid' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Paid via {activeComplaint.paymentDetails?.method || 'UPI'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>e-Receipt</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{activeComplaint.workAnalysis.totalAmount} to Technician</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Resolution Notes & Star Rating */}
            {activeComplaint.status === 'Resolved' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Inspection &amp; Redressal Complete</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  &ldquo;{activeComplaint.resolutionNotes || 'Field inspection completed and normal water pressure restored.'}&rdquo;
                </p>

                {/* Rating & Citizen Feedback Widget */}
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Rate Technician &amp; Service Quality:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          className="p-1 hover:scale-125 transition cursor-pointer"
                          title={`Rate ${star} Stars`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              (userRating || activeComplaint.rating || 0) >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {(userRating || activeComplaint.rating || 0) > 0
                          ? `${userRating || activeComplaint.rating} / 5.0`
                          : 'Select stars'}
                      </span>
                    </div>
                  </div>

                  {/* Citizen Review Text Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write feedback for technician (e.g., Quick response, clean work)..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const stars = userRating || activeComplaint.rating || 5;
                        setUserRating(stars);
                        storageService.rateComplaint(
                          activeComplaint.id,
                          stars,
                          feedbackText.trim() || 'Work verified and approved by citizen.'
                        );
                        setFeedbackText('');
                        alert('Thank you! Your feedback has been submitted and recorded on the technician roster.');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Worker Payment Modal */}
            {showPaymentModal && (
              <WorkerPaymentModal
                complaint={activeComplaint}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={() => {
                  setComplaints(storageService.getComplaints());
                }}
              />
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

      {/* Decline / Change Assigned Worker Modal */}
      {showRejectWorkerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Decline Assigned Technician / Request Reschedule
            </h3>
            <p className="text-xs text-slate-500">
              If you are not available or prefer a different plumber for Docket #{activeComplaint?.id}, please select or state your reason. This will return the ticket to MBMC Admin Desk for immediate re-assignment.
            </p>
            <div className="space-y-2">
              {['Not available at home today / Need another time slot', 'Prefer a different specialist / language preference', 'Family emergency / reschedule required', 'Issue resolved independently'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectWorkerReason(preset)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                    rejectWorkerReason === preset
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ✓ {preset}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={rejectWorkerReason}
              onChange={(e) => setRejectWorkerReason(e.target.value)}
              placeholder="Or specify custom reason..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRejectWorkerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Plumber
              </button>
              <button
                onClick={handleRejectWorker}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
              >
                Confirm Decline &amp; Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
