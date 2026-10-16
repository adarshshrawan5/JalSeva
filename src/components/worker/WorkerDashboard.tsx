import React, { useState, useMemo } from 'react';
import { FieldWorker, Complaint, WorkAnalysis } from '../../types';
import { storageService } from '../../services/storageService';
import { WorkAnalysisModal } from './WorkAnalysisModal';
import { WorkerWorkHistorySection } from './WorkerWorkHistorySection';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  AlertTriangle,
  FileText,
  DollarSign,
  Star,
  LogOut,
  Navigation,
  Check,
  ShieldCheck,
  Droplets,
  HardHat,
  Search,
  Filter,
  Eye,
  CreditCard,
  User,
  Sparkles,
  CheckSquare,
  Square,
  Zap,
  Activity,
} from 'lucide-react';

interface WorkerDashboardProps {
  worker: FieldWorker;
  onLogout: () => void;
  onOpenCitizenView?: (complaintId?: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  worker,
  onLogout,
  onOpenCitizenView,
}) => {
  const [currentWorker, setCurrentWorker] = useState<FieldWorker>(worker);
  const [complaints, setComplaints] = useState<Complaint[]>(() => storageService.getComplaints());
  const [activeTab, setActiveTab] = useState<'broadcast' | 'assigned' | 'in-progress' | 'completed'>('broadcast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaintForAnalysis, setSelectedComplaintForAnalysis] = useState<Complaint | null>(null);
  const [viewingAnalysisDocket, setViewingAnalysisDocket] = useState<Complaint | null>(null);
  const [showSystemsGuide, setShowSystemsGuide] = useState<boolean>(false);
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<Record<string, boolean>>({
    'isolate-valve': true,
    'pressure-test': true,
  });

  const toggleChecklistItem = (itemId: string) => {
    setCheckedChecklistItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Storage updates listener
  React.useEffect(() => {
    const handleUpdate = () => {
      setComplaints(storageService.getComplaints());
      const updatedWorkers = storageService.getWorkers();
      const me = updatedWorkers.find((w) => w.id === worker.id);
      if (me) setCurrentWorker(me);
    };
    window.addEventListener('aqua_connect_storage_update', handleUpdate);
    return () => window.removeEventListener('aqua_connect_storage_update', handleUpdate);
  }, [worker.id]);

  // Complaints assigned to this worker
  const myComplaints = useMemo(() => {
    return complaints.filter((c) => c.assignedWorker?.id === currentWorker.id);
  }, [complaints, currentWorker.id]);

  // Open broadcasted complaints pool
  const broadcastList = useMemo(() => {
    return complaints.filter((c) => c.isBroadcasted && !c.assignedWorker && c.status === 'Pending');
  }, [complaints]);

  // Sub-categorized by task status
  const assignedList = useMemo(
    () => myComplaints.filter((c) => c.status === 'Assigned'),
    [myComplaints]
  );
  const inProgressList = useMemo(
    () => myComplaints.filter((c) => c.status === 'In Progress'),
    [myComplaints]
  );
  const completedList = useMemo(
    () => myComplaints.filter((c) => c.status === 'Resolved'),
    [myComplaints]
  );

  // Filtered based on active tab and search
  const displayedList = useMemo(() => {
    let list: Complaint[] = [];
    if (activeTab === 'broadcast') list = broadcastList;
    else if (activeTab === 'assigned') list = assignedList;
    else if (activeTab === 'in-progress') list = inProgressList;
    else list = completedList;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.areaName.toLowerCase().includes(q) ||
        c.issueType.toLowerCase().includes(q)
    );
  }, [activeTab, broadcastList, assignedList, inProgressList, completedList, searchQuery]);

  // Status Actions & Handlers
  const handleAcceptBroadcast = (complaintId: string) => {
    const success = storageService.workerAcceptBroadcastJob(complaintId, currentWorker);
    if (success) {
      alert(`Success! You have claimed Job #${complaintId} on a first-come, first-served basis.`);
      setActiveTab('assigned');
    } else {
      alert(`Sorry, this job was already claimed by another specialist.`);
    }
  };

  const handleCancelJob = (complaintId: string) => {
    const reason = prompt('Please enter the reason for cancelling/releasing this job (e.g. Schedule conflict, vehicle breakdown, wrong equipment):');
    if (!reason || !reason.trim()) return;
    storageService.workerCancelOrDeclineJob(complaintId, currentWorker.id, reason.trim());
    alert('Job has been cancelled and returned to the open broadcast dispatch queue.');
  };

  // Status Actions
  const handleStartTravel = (complaintId: string) => {
    storageService.workerUpdateJobStatus(
      complaintId,
      'In Progress',
      `Field technician ${currentWorker.name} has departed from depot and is en-route to customer address.`,
      currentWorker.name
    );
    // Auto-sync status to On Job
    handleToggleStatus('On Job');
    setActiveTab('in-progress');
  };

  const handleArriveSite = (complaintId: string) => {
    storageService.workerUpdateJobStatus(
      complaintId,
      'In Progress',
      `Technician arrived on-site. Diagnostic pressure meter connected; valve excavation in progress.`,
      currentWorker.name
    );
    handleToggleStatus('On Job');
  };

  const handleSubmitAnalysis = (analysis: WorkAnalysis) => {
    if (!selectedComplaintForAnalysis) return;
    const completedComplaintId = selectedComplaintForAnalysis.id;
    storageService.workerSubmitWorkAnalysis(
      completedComplaintId,
      analysis,
      currentWorker
    );
    setSelectedComplaintForAnalysis(null);
    setActiveTab('completed');

    // Auto-sync: if no other jobs in progress, set status back to Available
    const remainingActive = inProgressList.filter((c) => c.id !== completedComplaintId);
    if (remainingActive.length === 0) {
      handleToggleStatus('Available');
    }
  };

  // Toggle availability with persistence
  const handleToggleStatus = (status: 'Available' | 'On Job' | 'Off Duty') => {
    storageService.updateWorkerStatus(currentWorker.id, status);
    setCurrentWorker((prev) => ({ ...prev, currentStatus: status }));
  };

  // Total earnings / service collected
  const totalFeesCollected = useMemo(() => {
    return completedList.reduce((acc, curr) => {
      if (curr.paymentStatus === 'Paid' && curr.workAnalysis?.totalAmount) {
        return acc + curr.workAnalysis.totalAmount;
      }
      return acc;
    }, 0);
  }, [completedList]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Profile Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentWorker.avatar}
                alt={currentWorker.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  currentWorker.currentStatus === 'Available'
                    ? 'bg-emerald-500'
                    : currentWorker.currentStatus === 'On Job'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
                title={`Status: ${currentWorker.currentStatus || 'Available'}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider">
                  MBMC Field Technician
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {currentWorker.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentWorker.zoneId.toUpperCase()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {currentWorker.name}
              </h2>

              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Specialization: {currentWorker.specialization}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {currentWorker.rating} / 5.0
                </span>
                <span>•</span>
                <span>Phone: {currentWorker.phone}</span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Availability selector: Available, On Job, Off Duty */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => handleToggleStatus('Available')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  currentWorker.currentStatus === 'Available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mark as Available for new MBMC assignments"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Available</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('On Job')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  currentWorker.currentStatus === 'On Job'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mark as currently busy on site"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>On Job</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('Off Duty')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  currentWorker.currentStatus === 'Off Duty'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mark as off duty / shift ended"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Off Duty</span>
              </button>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Skills pill list */}
        {currentWorker.skills && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Technical Skills:</span>
            {currentWorker.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Duty Status Explanation & How It Works */}
      <div className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2 transition-all ${
        currentWorker.currentStatus === 'On Job'
          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : currentWorker.currentStatus === 'Available'
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shrink-0 ${
              currentWorker.currentStatus === 'On Job'
                ? 'bg-amber-500 animate-ping'
                : currentWorker.currentStatus === 'Available'
                ? 'bg-emerald-500'
                : 'bg-slate-400'
            }`} />
            <strong className="text-sm font-black">
              {currentWorker.currentStatus === 'On Job'
                ? '● Status: ON JOB (Actively Engaged in Field Repair)'
                : currentWorker.currentStatus === 'Available'
                ? '● Status: AVAILABLE (Ready for Central Dispatch)'
                : '● Status: OFF DUTY (Break / Shift Ended)'}
            </strong>
          </div>

          <button
            type="button"
            onClick={() => setShowSystemsGuide(!showSystemsGuide)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showSystemsGuide ? 'Hide Systems Overview' : 'What Systems Are Available in Worker Portal?'}</span>
          </button>
        </div>

        <p className="text-xs leading-relaxed opacity-90">
          {currentWorker.currentStatus === 'On Job'
            ? `You are presently working on site or en route to a citizen complaint. MBMC Municipal Admin Dispatch sees your status as 'On Job' with active load (${inProgressList.length} in progress). When you submit the diagnostic work analysis, your status will automatically return to 'Available'.`
            : currentWorker.currentStatus === 'Available'
            ? 'You are active and available in the MBMC field technician roster. When Mira-Bhayandar municipal administrators assign citizen reports (water leaking, dirty water, low pressure) matching your specialization, new dockets will appear in "Assigned by Admin".'
            : 'You are currently marked as off duty. The central dispatch desk will temporarily route urgent water complaints to alternate zone specialists until you switch back to Available.'}
        </p>
      </div>

      {/* Available Systems & Modules in Worker Portal */}
      {showSystemsGuide && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-200 dark:border-blue-900/60 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Field Technician Operational Suite — Available Systems
                </h4>
                <p className="text-xs text-slate-500">
                  Overview of all 5 municipal operational modules accessible in this worker portal
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              All 5 Systems Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* System 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-blue-600">1.</span> Live Grievance Dispatch
                </span>
                <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold">
                  Push Alerts
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Receive auto-matched citizen tickets directly from MBMC Admin Triage with complainant details, locality landmarks, and direct phone/WhatsApp contact.
              </p>
            </div>

            {/* System 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-indigo-600">2.</span> Transit &amp; Site Progress
                </span>
                <span className="text-[9px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                  GPS Ready
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                One-click dispatch workflow: Start Travel (depart depot) &rarr; Arrived on site &rarr; Diagnostic checks. Citizen gets real-time ETA updates.
              </p>
            </div>

            {/* System 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-amber-600">3.</span> Diagnostic Analysis Docket
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  Technical
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Submit certified diagnosis (main pipeline fracture, turbid silt, contaminated joint), log replacement parts, and record labor hours.
              </p>
            </div>

            {/* System 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-emerald-600">4.</span> Citizen UPI &amp; Spot Billing
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                  Payments
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Auto-calculates standard municipal service fee + parts. Citizens can pay directly via dynamic UPI QR code or verify cash handover.
              </p>
            </div>

            {/* System 5 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-purple-600">5.</span> Work History &amp; Certificate
                </span>
                <span className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 rounded font-bold">
                  Audit Trail
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Track full ledger of redressed dockets, citizen 5-star ratings &amp; reviews, and print official MBMC Redressal Certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">New Assignments</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {assignedList.length}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Requires initial inspection
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">In Progress</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {inProgressList.length}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            Active on-site repairs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Resolved Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {currentWorker.completedTotal}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Verified MBMC redressed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Digital Fees Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalFeesCollected}
          </div>
          <span className="text-[10px] text-slate-500">
            Direct UPI &amp; citizen receipts
          </span>
        </div>
      </div>

      {/* 2.5 Active On-Job Fix Console (Appears whenever status is 'On Job' or there are jobs in progress) */}
      {(currentWorker.currentStatus === 'On Job' || inProgressList.length > 0) && (
        <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 p-6 sm:p-7 rounded-3xl border-2 border-amber-400 dark:border-amber-700 shadow-lg space-y-6 animate-in fade-in">
          {inProgressList.length > 0 ? (
            <>
              {/* Active Repair Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800 pb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 animate-pulse shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0">
                        Active On-Job Fix Console
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5 break-words leading-snug">
                      Live Field Repair in Progress • {inProgressList[0].issueType}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    Docket #{inProgressList[0].id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Priority: {inProgressList[0].priority}
                  </span>
                </div>
              </div>

              {/* Citizen & Location Briefing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Complainant:</span>
                    <strong className="text-slate-900 dark:text-white text-sm font-black">
                      {inProgressList[0].citizenName}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${inProgressList[0].phone}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition inline-flex items-center gap-1.5 text-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call (+91 {inProgressList[0].phone})</span>
                    </a>
                    <a
                      href={`https://wa.me/91${inProgressList[0].phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition inline-flex items-center gap-1.5 text-xs"
                    >
                      <span>WhatsApp Citizen</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Doorstep Location:</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium leading-relaxed">
                    {inProgressList[0].address}, {inProgressList[0].locality} ({inProgressList[0].areaName})
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Reported: &ldquo;{inProgressList[0].description}&rdquo;
                  </p>
                </div>
              </div>

              {/* 4-Step Field Workflow Stepper */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Field Repair Operational Progression:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px]">STAGE 1</span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <strong className="block text-xs font-black">Departed Depot</strong>
                    <span className="text-[10px] text-slate-400 block">En route confirmed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px]">STAGE 2</span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <strong className="block text-xs font-black">Arrived On-Site</strong>
                    <span className="text-[10px] text-slate-400 block">Pressure check done</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-500 text-amber-900 dark:text-amber-200 space-y-1 animate-pulse">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px]">STAGE 3 (ACTIVE)</span>
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <strong className="block text-xs font-black">Physical Fix / Clamp</strong>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 block">In progress</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-1 opacity-70">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px]">STAGE 4</span>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <strong className="block text-xs font-black">Submit &amp; Bill</strong>
                    <span className="text-[10px] text-slate-400 block">Civic payment</span>
                  </div>
                </div>
              </div>

              {/* Interactive Field Checklist for On-Job Fix */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>On-Site Field Repair Checklist (ऑन-जॉब दुरुस्ती सूची)</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Tap to verify repair milestones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    { id: 'isolate-valve', label: 'Shut branch distribution sluice valve to isolate line pressure' },
                    { id: 'pressure-test', label: 'Acoustic / Manometer test (baseline leak pressure measured)' },
                    { id: 'clamp-hdpe', label: 'Excavate rupture & mount high-pressure HDPE sleeve / Teflon gasket' },
                    { id: 'flush-silt', label: 'Flush accumulated silt sediment & clear turbidity from pipeline' },
                    { id: 'potability-test', label: 'Conduct chlorine residual potability test (>0.2 ppm safe target)' },
                    { id: 'citizen-verify', label: 'Demonstrate normal pressure flow to citizen at tap outlet' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 cursor-pointer ${
                        checkedChecklistItems[item.id]
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {checkedChecklistItems[item.id] ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </span>
                      <span className={`leading-snug ${checkedChecklistItems[item.id] ? 'line-through opacity-85' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* On-Job Primary CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Ready to conclude repair and generate official municipal invoice?
                </span>

                <div className="flex items-center gap-2">
                  {onOpenCitizenView && (
                    <button
                      type="button"
                      onClick={() => onOpenCitizenView(inProgressList[0].id)}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Citizen Preview</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedComplaintForAnalysis(inProgressList[0])}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition transform hover:scale-102 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit Work Analysis &amp; Conclude Fix</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* On Job Status Active but No In-Progress Ticket Yet */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    On-Job Mode Active — Ready for Field Operations
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You are clocked in as &apos;On Job&apos;. Select an assigned citizen grievance to start travel and initiate the repair workflow.
                  </p>
                </div>
              </div>

              {assignedList.length > 0 ? (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-300 dark:border-amber-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Recommended Next Docket</span>
                    <strong className="text-slate-900 dark:text-white text-sm font-black break-words leading-snug">
                      #{assignedList[0].id} • {assignedList[0].issueType}
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5 break-words">
                      {assignedList[0].citizenName} — {assignedList[0].locality} ({assignedList[0].areaName})
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartTravel(assignedList[0].id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Navigation className="w-3.5 h-3.5 shrink-0" />
                      <span>Start Travel for #{assignedList[0].id}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleArriveSite(assignedList[0].id);
                        setSelectedComplaintForAnalysis(assignedList[0]);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Wrench className="w-3.5 h-3.5 shrink-0" />
                      <span>Arrived &amp; Fix on Site</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No new assigned grievances in queue right now. You can switch your status to &apos;Available&apos; to receive alerts from MBMC Admin Dispatch.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Task Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'broadcast'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast Offers ({broadcastList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'assigned'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Assigned by Admin ({assignedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('in-progress')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'in-progress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>In Progress ({inProgressList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Work Analysis &amp; History ({completedList.length})</span>
            </button>

            <button
              onClick={() => setShowSystemsGuide(!showSystemsGuide)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showSystemsGuide
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100'
              }`}
              title="Overview of all 5 municipal modules in this worker portal"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showSystemsGuide ? 'Hide Systems' : 'Systems Available (5)'}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docket, citizen, area..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Task Cards List / Work History */}
        {activeTab === 'completed' ? (
          <div className="p-6">
            <WorkerWorkHistorySection
              worker={currentWorker}
              completedJobs={completedList}
              onOpenCitizenView={onOpenCitizenView}
            />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {displayedList.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No tickets in this section
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'assigned'
                    ? 'You have cleared all pending assigned grievances. New tickets will appear here when assigned by MBMC admin.'
                    : 'No active repairs ongoing. Accept an assigned ticket to start.'}
                </p>
              </div>
            ) : (
            displayedList.map((complaint) => {
              const isUrgent = complaint.priority === 'High';
              return (
                <div
                  key={complaint.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition space-y-4 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  {/* Top Row: Docket ID, Type, Priority, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                        {complaint.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          complaint.issueType === 'Pipeline Leak'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : complaint.issueType === 'Contaminated Water' || complaint.issueType === 'Dirty Water'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        }`}
                      >
                        {complaint.issueType}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          CRITICAL PRIORITY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Status: {complaint.status}
                      </span>
                    </div>
                  </div>

                  {/* Citizen details & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Complainant:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {complaint.citizenName}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${complaint.phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Citizen (+91 {complaint.phone})</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Address &amp; Landmark:</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {complaint.address}, {complaint.locality} ({complaint.areaName})
                      </p>
                    </div>
                  </div>

                  {/* Citizen's description */}
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Reported Defect Note:
                    </span>
                    <p className="italic text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      &ldquo;{complaint.description}&rdquo;
                    </p>
                  </div>

                  {/* Work Analysis & Payment Preview (if completed) */}
                  {complaint.workAnalysis && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Submitted Work Analysis</span>
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300">
                          Fee: ₹{complaint.workAnalysis.totalAmount}
                        </span>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        <strong>Diagnosis:</strong> {complaint.workAnalysis.diagnosis}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                        <span>Materials:</span>
                        {complaint.workAnalysis.materialsUsed?.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border text-[10px] font-medium">
                            {m}
                          </span>
                        ))}
                      </div>

                      {/* Payment Status */}
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          Citizen Payment:
                        </span>
                        {complaint.paymentStatus === 'Paid' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Paid ₹{complaint.paymentDetails?.amount || complaint.workAnalysis.totalAmount} via {complaint.paymentDetails?.method || 'UPI'}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[11px]">
                            ⏳ Pending Citizen Settlement (₹{complaint.workAnalysis.totalAmount})
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {complaint.rating && (
                        <div className="flex items-center gap-1 text-amber-500 font-bold pt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Citizen Rated: {complaint.rating} / 5.0</span>
                          {complaint.feedback && <span className="text-slate-500 italic ml-2">&ldquo;{complaint.feedback}&rdquo;</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">
                      Assigned to you by MBMC Admin Desk
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {activeTab === 'broadcast' && (
                        <button
                          onClick={() => handleAcceptBroadcast(complaint.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition flex items-center gap-2 cursor-pointer"
                          title="Claim this job on a first-come, first-served basis"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Accept &amp; Claim Job (1st-Claim)</span>
                        </button>
                      )}

                      {complaint.status === 'Assigned' && (
                        <>
                          <button
                            onClick={() => handleStartTravel(complaint.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Start Travel (En Route)</span>
                          </button>
                          <button
                            onClick={() => {
                              handleArriveSite(complaint.id);
                              setSelectedComplaintForAnalysis(complaint);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Arrived &amp; Work on Site</span>
                          </button>
                        </>
                      )}

                      {complaint.status === 'In Progress' && (
                        <button
                          onClick={() => setSelectedComplaintForAnalysis(complaint)}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Submit Work Analysis &amp; Complete Job</span>
                        </button>
                      )}

                      {(complaint.status === 'Assigned' || complaint.status === 'In Progress') && (
                        <button
                          onClick={() => handleCancelJob(complaint.id)}
                          className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          title="Cancel or release this job if you cannot work on it"
                        >
                          <span>Cancel / Release Job</span>
                        </button>
                      )}

                      {complaint.status === 'Resolved' && onOpenCitizenView && (
                        <button
                          onClick={() => onOpenCitizenView(complaint.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View in Citizen Tracker</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>

      {/* Work Analysis Modal */}
      {selectedComplaintForAnalysis && (
        <WorkAnalysisModal
          complaint={selectedComplaintForAnalysis}
          worker={currentWorker}
          onClose={() => setSelectedComplaintForAnalysis(null)}
          onSubmit={handleSubmitAnalysis}
        />
      )}
    </div>
  );
};
