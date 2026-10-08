import React, { useState } from 'react';
import { OutageAlert, OutageType, OutagePriority, WaterZoneId } from '../../types';
import { MBMC_ZONES, MBMC_AREAS } from '../../data/mbmcData';
import { storageService } from '../../services/storageService';
import {
  ShieldAlert,
  Plus,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Radio,
  Eye,
  Calendar,
} from 'lucide-react';

interface AdminBroadcastManagerProps {
  alerts: OutageAlert[];
  adminName: string;
}

export const AdminBroadcastManager: React.FC<AdminBroadcastManagerProps> = ({
  alerts,
  adminName,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [broadcastNotificationMsg, setBroadcastNotificationMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<OutageType>('Emergency Outage');
  const [priority, setPriority] = useState<OutagePriority>('High');
  const [selectedZones, setSelectedZones] = useState<WaterZoneId[]>(['zone-1']);
  const [selectedAreasText, setSelectedAreasText] = useState('Golden Nest, Jesal Park');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 16)
  );
  const [reason, setReason] = useState('');
  const [alternativeArrangement, setAlternativeArrangement] = useState('');

  const toggleZone = (zId: WaterZoneId) => {
    setSelectedZones((prev) =>
      prev.includes(zId) ? prev.filter((id) => id !== zId) : [...prev, zId]
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reason.trim()) return;

    const areasList = selectedAreasText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    storageService.addAlert(
      {
        title,
        type,
        priority,
        zoneIds: selectedZones.length > 0 ? selectedZones : ['zone-1'],
        affectedAreas: areasList.length > 0 ? areasList : ['Entire Zone'],
        startTime,
        endTime,
        reason,
        alternativeArrangement:
          alternativeArrangement || 'Emergency tankers deployed to affected clusters.',
        status: 'Active',
        publishedBy: `${adminName} (MBMC Control)`,
      },
      adminName
    );

    setShowCreateModal(false);
    setTitle('');
    setReason('');
    setAlternativeArrangement('');
    setBroadcastNotificationMsg(`📢 Notice broadcasted live to ${areasList.join(', ')}`);
    setTimeout(() => setBroadcastNotificationMsg(null), 5000);
  };

  const handleExpire = (alertId: string) => {
    storageService.updateAlertStatus(alertId, 'Expired', adminName);
  };

  const handleDelete = (alertId: string) => {
    if (confirm('Are you sure you want to remove this public alert notice?')) {
      storageService.deleteAlert(alertId, adminName);
    }
  };

  const handleSimulateBroadcast = (alert: OutageAlert) => {
    setBroadcastNotificationMsg(
      `🚀 Instant Broadcast Sent! Push notifications & SMS dispatched to 14,200 registered residents in ${alert.affectedAreas.join(', ')}.`
    );
    setTimeout(() => setBroadcastNotificationMsg(null), 6000);
  };

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.affectedAreas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Emergency Communications
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Broadcast & Outage Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish sudden pipeline bursts or scheduled maintenance notices directly to citizen portals & SMS gateways.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/20 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Broadcast simulation feedback */}
      {broadcastNotificationMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Radio className="w-5 h-5 text-emerald-600 shrink-0 animate-ping" />
            <span>{broadcastNotificationMsg}</span>
          </div>
          <button
            onClick={() => setBroadcastNotificationMsg(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title or affected areas..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Active', 'Resolved', 'Expired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-800'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Master Alerts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Alert ID & Title</th>
                <th className="py-3 px-4">Type & Priority</th>
                <th className="py-3 px-4">Affected Areas</th>
                <th className="py-3 px-4">Duration Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-medium">
                    <span className="font-mono text-[10px] text-slate-400 block">{alert.id}</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{alert.title}</strong>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{alert.reason}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.type === 'Emergency Outage'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                      {alert.priority} Priority
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {alert.affectedAreas.join(', ')}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                    <div>Start: {new Date(alert.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div>End: {new Date(alert.endTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.status === 'Active'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ● {alert.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSimulateBroadcast(alert)}
                        title="Simulate push broadcast to citizen devices"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Broadcast</span>
                      </button>

                      {alert.status === 'Active' && (
                        <button
                          onClick={() => handleExpire(alert.id)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold transition"
                        >
                          Expire
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Publish Water Outage Alert</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alert Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent Pipeline Burst at Golden Nest Main Line"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Alert Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as OutageType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Emergency Outage">Emergency Outage</option>
                    <option value="Planned Maintenance">Planned Maintenance</option>
                    <option value="General Notice">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as OutagePriority)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Zones multi-select */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Target Municipal Zones
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MBMC_ZONES.map((z) => (
                    <label
                      key={z.id}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer ${
                        selectedZones.includes(z.id)
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 font-bold text-rose-700'
                          : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedZones.includes(z.id)}
                        onChange={() => toggleZone(z.id)}
                      />
                      <span className="truncate">{z.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Affected Areas (Comma Separated)
                </label>
                <input
                  type="text"
                  value={selectedAreasText}
                  onChange={(e) => setSelectedAreasText(e.target.value)}
                  placeholder="e.g. Golden Nest, Navghar Road, Indralok"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Expected Start
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Expected End
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Reason for Stoppage
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. High-pressure pipeline cracked near flyover pillar 12..."
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alternative Arrangements (Tankers / Diverted Lines)
                </label>
                <input
                  type="text"
                  value={alternativeArrangement}
                  onChange={(e) => setAlternativeArrangement(e.target.value)}
                  placeholder="e.g. 5 emergency tankers deployed at Golden Nest Circle"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
