import React, { useState } from 'react';
import { FieldWorker } from '../../types';
import { storageService } from '../../services/storageService';
import { JalSevaLogo } from '../common/JalSevaLogo';
import {
  Wrench,
  ShieldCheck,
  ArrowRight,
  Phone,
  KeyRound,
  AlertCircle,
  Star,
  CheckCircle2,
  HardHat,
  Droplets,
  Layers,
} from 'lucide-react';

interface WorkerLoginProps {
  onLoginSuccess: (worker: FieldWorker) => void;
  onBackToHome: () => void;
}

export const WorkerLogin: React.FC<WorkerLoginProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [workers] = useState<FieldWorker[]>(() => storageService.getWorkers());
  const [phoneOrId, setPhoneOrId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDemoWorker = (worker: FieldWorker) => {
    storageService.setActiveWorkerSession(worker);
    onLoginSuccess(worker);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = phoneOrId.trim().replace(/\D/g, '');
      const matched = workers.find(
        (w) =>
          w.id.toLowerCase() === phoneOrId.trim().toLowerCase() ||
          w.phone.replace(/\D/g, '').endsWith(cleanInput)
      );

      if (!matched) {
        setError('No field technician found with this Mobile Number or Worker ID. Try quick-selecting from the roster below.');
        setIsLoading(false);
        return;
      }

      if (pin.trim() !== '1234' && matched.pin && pin.trim() !== matched.pin) {
        setError('Incorrect 4-digit Security PIN. (Default demo PIN is 1234)');
        setIsLoading(false);
        return;
      }

      storageService.setActiveWorkerSession(matched);
      onLoginSuccess(matched);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Municipal Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <JalSevaLogo className="w-12 h-12" />
            <div>
              <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                JalSeva <span className="text-blue-600 dark:text-blue-400">Worker</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                MBMC Field Technical Staff &amp; Plumber Desk
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Authorized Field Staff Portal
              </span>
            </div>

            <h3 className="text-xl font-bold leading-snug">
              Direct Grievance Dispatch, Repair Work Analysis &amp; Citizen Settlement
            </h3>

            <p className="text-xs text-blue-100/90 leading-relaxed">
              When administrators assign water leakage, dirty water, or pressure faults, field specialists receive live work orders, submit technical inspection analysis, and track digital payments.
            </p>

            <div className="pt-2 border-t border-white/20 grid grid-cols-2 gap-3 text-[11px] font-medium text-blue-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Instant Work Order</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Diagnostic Report</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Digital UPI Receipts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>5-Star Performance</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition flex items-center gap-1.5"
          >
            &larr; Back to Main JalSeva Portal
          </button>
        </div>

        {/* Right Side: Login Form & Quick Worker Picker */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Field Technician Login</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sign In to Plumber &amp; Worker Dashboard
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your profile from the roster below or enter credentials with PIN <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-blue-600">1234</code>.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Roster Selection */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick 1-Click Demo Profiles (Tap to Login Instantly):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {workers.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectDemoWorker(w)}
                  className="p-3 text-left rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-slate-800 transition group flex items-center gap-3"
                >
                  <img
                    src={w.avatar}
                    alt={w.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {w.name}
                      </strong>
                      <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {w.rating}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {w.specialization}
                    </span>
                    <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium">
                      {w.zoneId.toUpperCase()} • {w.activeComplaints} active task(s)
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
              Or Manual Sign In
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Technician Phone or Worker ID
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={phoneOrId}
                  onChange={(e) => setPhoneOrId(e.target.value)}
                  placeholder="e.g. 9820511984 or wrk-1"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Security PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Demo PIN: 1234"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with MBMC Roster...</span>
              ) : (
                <>
                  <span>Sign In as Field Technician</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
