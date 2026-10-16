import React, { useState } from 'react';
import { Complaint, FieldWorker, WorkAnalysis } from '../../types';
import {
  Wrench,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Droplets,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface WorkAnalysisModalProps {
  complaint: Complaint;
  worker: FieldWorker;
  onClose: () => void;
  onSubmit: (analysis: WorkAnalysis) => void;
}

const COMMON_MATERIALS = [
  '110mm HDPE Pipe Sleeve',
  '2-inch CPVC Pressure Valve',
  'Teflon High-Pressure Gasket',
  'Rubber Compression O-Ring',
  'Acoustic Leak Detection Seal',
  'Chlorine Disinfection Tablet (100g)',
  'Brass Gate Valve Joint',
  'Silt Flushing Filter Mesh',
];

export const WorkAnalysisModal: React.FC<WorkAnalysisModalProps> = ({
  complaint,
  worker,
  onClose,
  onSubmit,
}) => {
  // Pre-fill diagnostic based on issue type
  const [diagnosis, setDiagnosis] = useState(() => {
    if (complaint.issueType === 'Pipeline Leak') {
      return 'Underground joint crack due to roadway ground vibration; high-pressure seepage detected.';
    }
    if (complaint.issueType === 'Contaminated Water' || complaint.issueType === 'Dirty Water') {
      return 'Turbid silt intrusion through hairline breach in distribution branch during non-supply hours.';
    }
    if (complaint.issueType === 'Low Water Pressure') {
      return 'Air-lock in branch manifold and sediment accumulation choking secondary inlet valve.';
    }
    return `Inspected site for ${complaint.issueType}. Physical root-cause identified and rectified.`;
  });

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    complaint.issueType === 'Pipeline Leak' ? '110mm HDPE Pipe Sleeve' : 'Rubber Compression O-Ring',
    'Teflon High-Pressure Gasket',
  ]);
  const [customMaterial, setCustomMaterial] = useState('');

  const [laborHours, setLaborHours] = useState(2.0);
  const [serviceFee, setServiceFee] = useState(120); // Base municipal fee
  const [partsCost, setPartsCost] = useState(180);
  const [analysisNotes, setAnalysisNotes] = useState(
    'Excavated damaged segment, flushed contaminants from line, pressure-clamped replacement fitting, and conducted 20-minute flow inspection. Water pressure restored to normal.'
  );
  const [beforeAfterNote, setBeforeAfterNote] = useState(
    'Prior to repair: Water leaking at ~15L/min. Post repair: Zero leakage, full line stability confirmed.'
  );
  const [includeWaterTest, setIncludeWaterTest] = useState(
    complaint.issueType === 'Contaminated Water' || complaint.issueType === 'Dirty Water'
  );
  const [waterPpm, setWaterPpm] = useState(145);
  const [waterPh, setWaterPh] = useState(7.2);
  const [turbidity, setTurbidity] = useState('Clear (< 1 NTU)');

  const totalAmount = Number(serviceFee) + Number(partsCost);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleAddCustomMaterial = () => {
    if (customMaterial.trim() && !selectedMaterials.includes(customMaterial.trim())) {
      setSelectedMaterials((prev) => [...prev, customMaterial.trim()]);
      setCustomMaterial('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const analysis: WorkAnalysis = {
      diagnosis: diagnosis.trim(),
      materialsUsed: selectedMaterials,
      laborTimeHours: laborHours,
      serviceFee,
      partsCost,
      totalAmount,
      completedAt: new Date().toISOString(),
      analysisNotes: analysisNotes.trim(),
      beforeAfterNote: beforeAfterNote.trim(),
      ...(includeWaterTest
        ? {
            waterQualityReading: {
              ppm: waterPpm,
              ph: waterPh,
              turbidity,
            },
          }
        : {}),
    };

    onSubmit(analysis);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                Official MBMC Technical Report
              </span>
              <h3 className="text-lg font-black leading-tight">
                Submit Work Analysis &amp; Job Completion
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Complaint Context Banner */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-slate-400 font-mono font-bold mr-2">{complaint.id}</span>
            <strong className="text-slate-900 dark:text-white">{complaint.issueType}</strong>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-slate-600 dark:text-slate-300">{complaint.citizenName} ({complaint.areaName})</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
            Tech: {worker.name}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Section 1: Problem Diagnosis */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              1. Root Cause &amp; Technical Diagnosis
            </label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              placeholder="Describe the exact physical defect found on inspection..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Section 2: Materials & Replacement Parts */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              2. Materials &amp; Hardware Replaced
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MATERIALS.map((mat) => {
                const isSelected = selectedMaterials.includes(mat);
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}</span>
                    <span>{mat}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Material Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                placeholder="Add other spare part / fitting..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomMaterial}
                className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 3: Repair Notes & Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Technical Action Summary</span>
              </label>
              <textarea
                rows={3}
                value={analysisNotes}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                required
                placeholder="What mechanical steps were carried out..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Before vs After Inspection Result</span>
              </label>
              <textarea
                rows={3}
                value={beforeAfterNote}
                onChange={(e) => setBeforeAfterNote(e.target.value)}
                required
                placeholder="Verification proof (e.g. pressure restored, zero leakage)..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Section 4: Water Quality Test (Optional / Recommended for Contamination) */}
          <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sky-900 dark:text-sky-200">
                <input
                  type="checkbox"
                  checked={includeWaterTest}
                  onChange={(e) => setIncludeWaterTest(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Include Chemical &amp; Potability Test Results</span>
              </label>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase">
                BIS-10500 Compliant
              </span>
            </div>

            {includeWaterTest && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">TDS / Salinity (PPM)</span>
                  <input
                    type="number"
                    value={waterPpm}
                    onChange={(e) => setWaterPpm(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">pH Level (6.5 - 8.5)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={waterPh}
                    onChange={(e) => setWaterPh(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Turbidity (NTU)</span>
                  <input
                    type="text"
                    value={turbidity}
                    onChange={(e) => setTurbidity(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Labor Hours & Municipal Fee Calculation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Service Fee &amp; Material Charges</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Citizen can pay via UPI QR / Card / Cash upon receipt
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Labor Time</label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value))}
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">hrs</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Base Municipal Fee</label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Parts Cost</label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={partsCost}
                    onChange={(e) => setPartsCost(Number(e.target.value))}
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Total Citizen Settlement Amount:
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Analysis &amp; Resolve Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
