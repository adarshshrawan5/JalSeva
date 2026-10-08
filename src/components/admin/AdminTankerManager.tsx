import React, { useState, useMemo } from 'react';
import {
  TankerBooking,
  TankerBookingStatus,
  Driver,
  Depot,
} from '../../types';
import { MBMC_DRIVERS, MBMC_DEPOTS } from '../../data/mbmcData';
import {
  storageService,
  getTodayDateString,
  getTomorrowDateString,
} from '../../services/storageService';
import {
  Truck,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  User,
  Filter,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminTankerManagerProps {
  bookings: TankerBooking[];
  adminName: string;
}

export const AdminTankerManager: React.FC<AdminTankerManagerProps> = ({
  bookings,
  adminName,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickDateFilter, setQuickDateFilter] = useState<'All' | 'Today' | 'Tomorrow' | 'Pending'>('All');
  const [selectedBooking, setSelectedBooking] = useState<TankerBooking | null>(null);

  // Dispatch modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(MBMC_DRIVERS[0].id);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Area not serviceable');

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  // Filtered Bookings
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.citizenName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.areaName.toLowerCase().includes(q);

      let matchDate = true;
      if (quickDateFilter === 'Today') matchDate = b.bookingDate === todayStr;
      if (quickDateFilter === 'Tomorrow') matchDate = b.bookingDate === tomorrowStr;
      if (quickDateFilter === 'Pending') matchDate = b.status === 'Pending';

      return matchSearch && matchDate;
    });
  }, [bookings, searchQuery, quickDateFilter, todayStr, tomorrowStr]);

  // Actions
  const handleApprove = (bookingId: string) => {
    storageService.updateBookingStatus(bookingId, 'Approved', undefined, undefined, adminName);
  };

  const handleOpenDispatch = (booking: TankerBooking) => {
    setSelectedBooking(booking);
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = () => {
    if (!selectedBooking) return;
    const driver = MBMC_DRIVERS.find((d) => d.id === selectedDriverId);
    storageService.updateBookingStatus(
      selectedBooking.id,
      'In Transit',
      driver,
      undefined,
      adminName
    );
    setShowDispatchModal(false);
    setSelectedBooking(null);
  };

  const handleMarkDelivered = (bookingId: string) => {
    storageService.updateBookingStatus(bookingId, 'Delivered', undefined, undefined, adminName);
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;
    storageService.updateBookingStatus(
      selectedBooking.id,
      'Cancelled',
      undefined,
      cancelReason,
      adminName
    );
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  // Kanban Columns
  const kanbanColumns: { status: TankerBookingStatus; label: string; color: string }[] = [
    { status: 'Pending', label: 'Pending Approval', color: 'bg-amber-500' },
    { status: 'Approved', label: 'Approved (Filling Tank)', color: 'bg-blue-500' },
    { status: 'In Transit', label: 'In Transit / On Route', color: 'bg-purple-500' },
    { status: 'Delivered', label: 'Delivered Successfully', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#ea580c] dark:text-amber-400 uppercase tracking-wider">
            Municipal Fleet Dispatch
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tanker Booking & Dispatch Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time control log for Today ({todayStr}) and Tomorrow ({tomorrowStr}) emergency tanker allocations.
          </p>
        </div>

        {/* View Switcher: List vs Kanban Board */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'All', label: 'All Requests' },
            { id: 'Today', label: `Today's Bookings` },
            { id: 'Tomorrow', label: `Tomorrow's Bookings` },
            { id: 'Pending', label: `Pending Approval` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQuickDateFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                quickDateFilter === tab.id
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID, citizen..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const columnBookings = filtered.filter((b) => b.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-[650px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border text-slate-600 dark:text-slate-400">
                    {columnBookings.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-400 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {b.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {b.capacity.toLocaleString()}L
                        </span>
                      </div>

                      <div>
                        <strong className="text-xs text-slate-900 dark:text-white block">
                          {b.citizenName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {b.areaName} (Near {b.landmark})
                        </span>
                      </div>

                      <div className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border space-y-0.5 text-slate-600 dark:text-slate-400 font-mono">
                        <div>Date: {b.bookingDate} ({b.timeSlot})</div>
                        <div>Depot: {b.assignedDepotName.split(' ')[0]} ({b.distanceKm}km)</div>
                      </div>

                      {/* Driver details if dispatched */}
                      {b.assignedDriver && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span>Driver: {b.assignedDriver.name}</span>
                          <span className="text-slate-400 font-normal">({b.assignedDriver.vehicleNumber})</span>
                        </div>
                      )}

                      {/* Action buttons on card */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
                          >
                            Approve
                          </button>
                        )}

                        {b.status === 'Approved' && (
                          <button
                            onClick={() => handleOpenDispatch(b)}
                            className="w-full py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Assign Driver</span>
                          </button>
                        )}

                        {b.status === 'In Transit' && (
                          <button
                            onClick={() => handleMarkDelivered(b.id)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Delivered</span>
                          </button>
                        )}

                        {b.status === 'Delivered' && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Citizen & Contact</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Origin Depot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 dark:text-white block">{b.citizenName}</strong>
                      <span className="text-slate-500 text-[11px] font-mono">+91 {b.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold block">{b.areaName}</span>
                      <span className="text-slate-400 text-[11px] truncate block max-w-xs">{b.address}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{b.bookingDate}</div>
                      <div className="text-slate-500">{b.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {b.capacity.toLocaleString()}L
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <div>{b.assignedDepotName.split(' ')[0]}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{b.distanceKm} km</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'In Transit'
                            ? 'bg-purple-100 text-purple-800 animate-pulse'
                            : b.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ● {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => handleApprove(b.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {b.status === 'Approved' && (
                        <button
                          onClick={() => handleOpenDispatch(b)}
                          className="px-3 py-1 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-lg text-xs"
                        >
                          Dispatch
                        </button>
                      )}
                      {b.status === 'In Transit' && (
                        <button
                          onClick={() => handleMarkDelivered(b.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                          Deliver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDispatchModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#ea580c]" />
              <span>Assign Driver & Vehicle for {selectedBooking.id}</span>
            </h4>
            <p className="text-xs text-slate-500">
              Select available tanker driver from <strong>{selectedBooking.assignedDepotName}</strong>.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
              {MBMC_DRIVERS.map((driver) => (
                <label
                  key={driver.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                    selectedDriverId === driver.id
                      ? 'border-[#ea580c] bg-orange-50 dark:bg-orange-950 font-bold'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="driver"
                      checked={selectedDriverId === driver.id}
                      onChange={() => setSelectedDriverId(driver.id)}
                    />
                    <div>
                      <strong className="block">{driver.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Vehicle: {driver.vehicleNumber} ({driver.capacity}L)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ⭐ {driver.rating}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 border rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs"
              >
                Assign & Dispatch Tanker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
