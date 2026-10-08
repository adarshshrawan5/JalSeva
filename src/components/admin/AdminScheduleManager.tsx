import React, { useState } from 'react';
import { WaterZone } from '../../types';
import { storageService, AuditLogItem } from '../../services/storageService';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  RotateCcw,
  History,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface AdminScheduleManagerProps {
  zones: WaterZone[];
  adminName: string;
}

export const AdminScheduleManager: React.FC<AdminScheduleManagerProps> = ({
  zones,
  adminName,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [morningStart, setMorningStart] = useState('06:00');
  const [morningEnd, setMorningEnd] = useState('09:00');
  const [eveningStart, setEveningStart] = useState('17:30');
  const [eveningEnd, setEveningEnd] = useState('20:30');
  const [frequency, setFrequency] = useState('Daily Twice');
  const [pressure, setPressure] = useState<'High' | 'Normal' | 'Moderate'>('High');
  const [applyToAll, setApplyToAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const auditLogs = storageService.getAuditLogs();

  const handleSelectZone = (zId: string) => {
    setSelectedZoneId(zId);
    const z = zones.find((item) => item.id === zId);
    if (z) {
      setMorningStart(z.supplyWindows.morning.start);
      setMorningEnd(z.supplyWindows.morning.end);
      setEveningStart(z.supplyWindows.evening.start);
      setEveningEnd(z.supplyWindows.evening.end);
      setFrequency(z.supplyWindows.frequency);
      setPressure(z.supplyWindows.pressure);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyToAll) {
      storageService.bulkUpdateSchedule(
        morningStart,
        morningEnd,
        eveningStart,
        eveningEnd,
        adminName
      );
      setSuccessMsg('✓ New timetable successfully applied to ALL 4 municipal zones!');
    } else {
      storageService.updateZoneSchedule(
        selectedZoneId,
        morningStart,
        morningEnd,
        eveningStart,
        eveningEnd,
        frequency,
        pressure,
        adminName
      );
      setSuccessMsg(`✓ Timetable updated for ${zones.find((z) => z.id === selectedZoneId)?.name}!`);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Municipal Water Timetable Operations
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Water Supply Schedule Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure morning and evening pressurized supply windows zone-by-zone with immutable audit trail.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Zone Selector & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Zone Status Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Municipal Zones
          </h3>

          <div className="space-y-2.5">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {zone.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{zone.wards}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div>
                      Morning: <strong>{zone.supplyWindows.morning.start} - {zone.supplyWindows.morning.end}</strong>
                    </div>
                    <div>
                      Evening: <strong>{zone.supplyWindows.evening.start} - {zone.supplyWindows.evening.end}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Edit Schedule for {zones.find((z) => z.id === selectedZoneId)?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Changes will immediately update the Citizen Portal timetable & notifications.
              </p>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-5 text-xs">
            {/* Morning Supply Window */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-3">
              <span className="font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block">
                Morning Supply Window
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Evening Supply Window */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <span className="font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block">
                Evening Supply Window
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eveningStart}
                    onChange={(e) => setEveningStart(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eveningEnd}
                    onChange={(e) => setEveningEnd(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Supply Pressure
                </label>
                <select
                  value={pressure}
                  onChange={(e) => setPressure(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="High">High (Booster pumps enabled)</option>
                  <option value="Normal">Normal (Standard gravity)</option>
                  <option value="Moderate">Moderate (Reduced pressure)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Bulk Apply Checkbox */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center gap-2">
              <input
                type="checkbox"
                id="applyAll"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="applyAll" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                Batch Update: Apply these exact supply hours across ALL 4 Mira-Bhayandar Zones
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Publish Schedule Changes</span>
              </button>
            </div>
          </form>

          {/* Audit History Log */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Schedule Audit Trail</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between text-slate-600 dark:text-slate-400"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-white">{log.adminName}:</strong>{' '}
                    <span>{log.action} - {log.details}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
