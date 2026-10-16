import React, { useState, useMemo } from 'react';
import { Complaint, FieldWorker } from '../../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  DollarSign,
  FileText,
  User,
  MapPin,
  Phone,
  Search,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  Download,
  ShieldCheck,
  Check,
  Droplets,
  Wrench,
  Award,
} from 'lucide-react';

interface WorkerWorkHistorySectionProps {
  worker: FieldWorker;
  completedJobs: Complaint[];
  onOpenCitizenView?: (complaintId?: string) => void;
}

export const WorkerWorkHistorySection: React.FC<WorkerWorkHistorySectionProps> = ({
  worker,
  completedJobs,
  onOpenCitizenView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [issueFilter, setIssueFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [expandedDocketId, setExpandedDocketId] = useState<string | null>(null);
  const [selectedReceiptComplaint, setSelectedReceiptComplaint] = useState<Complaint | null>(null);

  // Filtered list
  const filteredList = useMemo(() => {
    return completedJobs.filter((job) => {
      // Issue filter
      if (issueFilter !== 'All' && job.issueType !== issueFilter) return false;

      // Payment filter
      if (paymentFilter === 'Paid' && job.paymentStatus !== 'Paid') return false;
      if (paymentFilter === 'Pending' && job.paymentStatus === 'Paid') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          job.id.toLowerCase().includes(q) ||
          job.citizenName.toLowerCase().includes(q) ||
          job.areaName.toLowerCase().includes(q) ||
          job.address.toLowerCase().includes(q) ||
          job.issueType.toLowerCase().includes(q) ||
          (job.workAnalysis?.diagnosis && job.workAnalysis.diagnosis.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [completedJobs, issueFilter, paymentFilter, searchQuery]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    return completedJobs.reduce((acc, curr) => {
      if (curr.paymentStatus === 'Paid' && curr.workAnalysis?.totalAmount) {
        return acc + curr.workAnalysis.totalAmount;
      }
      return acc;
    }, 0);
  }, [completedJobs]);

  const averageRating = useMemo(() => {
    const ratedJobs = completedJobs.filter((j) => j.rating && j.rating > 0);
    if (ratedJobs.length === 0) return worker.rating || 4.9;
    const sum = ratedJobs.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / ratedJobs.length).toFixed(1);
  }, [completedJobs, worker.rating]);

  const uniqueIssues = useMemo(() => {
    const set = new Set(completedJobs.map((j) => j.issueType));
    return Array.from(set);
  }, [completedJobs]);

  const handlePrintCertificate = (job: Complaint) => {
    setSelectedReceiptComplaint(job);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-100">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-3xl font-black">{completedJobs.length}</div>
          <span className="text-[11px] text-blue-200">Municipal work orders redressed</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Fees Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-3xl font-black">₹{totalRevenue}</div>
          <span className="text-[11px] text-emerald-200">Verified citizen service receipts</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-100">
            <span className="font-bold uppercase tracking-wider text-[10px]">Avg Citizen Rating</span>
            <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
          </div>
          <div className="text-3xl font-black">{averageRating} / 5.0</div>
          <span className="text-[11px] text-amber-100">High civic satisfaction score</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Specialization</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black truncate">{worker.specialization}</div>
          <span className="text-[11px] text-slate-300">Grade A MBMC Technician</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Issue filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-[11px]">Issue Type:</span>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="All">All Categories ({completedJobs.length})</option>
              {uniqueIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-[11px]">Payment Status:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="All">All Payment States</option>
              <option value="Paid">Paid &amp; Settled</option>
              <option value="Pending">Pending Collection</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docket, diagnosis, citizen..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* History Cards / Table */}
      <div className="space-y-3.5">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No completed work records found
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or category filters.
            </p>
          </div>
        ) : (
          filteredList.map((job) => {
            const isExpanded = expandedDocketId === job.id;
            const hasAnalysis = !!job.workAnalysis;

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition p-5 sm:p-6 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {job.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                        job.issueType === 'Pipeline Leak'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : job.issueType === 'Contaminated Water' || job.issueType === 'Dirty Water'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      {job.issueType}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      ✓ Resolved &amp; Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(job.resolvedAt || job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    {job.workAnalysis && (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{job.workAnalysis.totalAmount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Citizen & Location summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <strong className="text-slate-900 dark:text-white">{job.citizenName}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>+91 {job.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-slate-800 dark:text-slate-200">
                        {job.address}, {job.locality} ({job.areaName})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Work Analysis Highlight */}
                {hasAnalysis && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                        Diagnostic Finding &amp; Resolution:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {job.workAnalysis?.diagnosis}
                      </p>
                    </div>

                    {/* Materials and Labor */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-bold text-slate-500">Materials Replaced:</span>
                        {job.workAnalysis?.materialsUsed && job.workAnalysis.materialsUsed.length > 0 ? (
                          job.workAnalysis.materialsUsed.map((m) => (
                            <span
                              key={m}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]"
                            >
                              ✓ {m}
                            </span>
                          ))
                        ) : (
                          <span>Standard valve lubrication (no parts replaced)</span>
                        )}
                      </div>

                      {job.workAnalysis?.laborTimeHours && (
                        <span>
                          Time on site: <strong>{job.workAnalysis.laborTimeHours} hrs</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment and Rating Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Settlement:</span>
                    {job.paymentStatus === 'Paid' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Paid ₹{job.paymentDetails?.amount || job.workAnalysis?.totalAmount} via {job.paymentDetails?.method || 'UPI'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                        ⏳ Pending Settlement
                      </span>
                    )}
                  </div>

                  {job.rating && (
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{job.rating} / 5.0</span>
                      {job.feedback && (
                        <span className="text-slate-500 italic text-[11px] font-normal ml-1">
                          &ldquo;{job.feedback}&rdquo;
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handlePrintCertificate(job)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                      title="Print Municipal Job Sheet"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Docket</span>
                    </button>

                    {onOpenCitizenView && (
                      <button
                        onClick={() => onOpenCitizenView(job.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                      >
                        Citizen View &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Work Sheet / Certificate Modal */}
      {selectedReceiptComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="text-center border-b pb-4 border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block">
                Mira-Bhayandar Municipal Corporation
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Official Water Works Redressal Certificate
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Docket #{selectedReceiptComplaint.id}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Resident / Complainant:</span>
                <strong>{selectedReceiptComplaint.citizenName}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Contact Number:</span>
                <span>+91 {selectedReceiptComplaint.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Location:</span>
                <span>{selectedReceiptComplaint.address}, {selectedReceiptComplaint.locality}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Issue Addressed:</span>
                <strong>{selectedReceiptComplaint.issueType}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Assigned Technician:</span>
                <strong>{worker.name} ({worker.specialization})</strong>
              </div>
              {selectedReceiptComplaint.workAnalysis && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Findings:</span>
                    <p className="text-slate-800 dark:text-slate-200">{selectedReceiptComplaint.workAnalysis.diagnosis}</p>
                  </div>
                  <div className="flex justify-between border-b pb-2 font-bold text-sm">
                    <span>Total Service Amount:</span>
                    <span className="text-emerald-600">₹{selectedReceiptComplaint.workAnalysis.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-bold text-emerald-600">
                      {selectedReceiptComplaint.paymentStatus === 'Paid' ? 'Paid & Verified' : 'Pending Settlement'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setSelectedReceiptComplaint(null)}
                className="px-4 py-2 rounded-xl border font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
