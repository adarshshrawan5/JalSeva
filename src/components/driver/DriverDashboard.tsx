import React, { useState } from 'react';
import { Driver, TankerBooking, Depot } from '../../types';
import { storageService } from '../../services/storageService';
import { MBMC_DEPOTS } from '../../data/mbmcData';
import { LeafletMapView } from '../common/LeafletMapView';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  Truck,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Navigation,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Star,
  Fuel,
  Droplets,
  Radio,
  AlertCircle,
} from 'lucide-react';

interface DriverDashboardProps {
  driver: Driver;
  bookings: TankerBooking[];
  onLogout: () => void;
  onSwitchToHome: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  driver,
  bookings,
  onLogout,
  onSwitchToHome,
}) => {
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<TankerBooking | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed' | 'vehicle'>('assigned');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const depot = MBMC_DEPOTS.find((d) => d.id === driver.depotId) || MBMC_DEPOTS[0];

  // Bookings assigned to this driver or available at their depot
  const myAssignedBookings = bookings.filter(
    (b) =>
      b.assignedDriver?.id === driver.id ||
      (b.assignedDepotId === driver.depotId && (b.status === 'Approved' || b.status === 'In Transit'))
  );

  const activeTrip = myAssignedBookings.find(
    (b) => b.status === 'In Transit' || b.status === 'Approved'
  );

  const completedTrips = bookings.filter(
    (b) => b.status === 'Delivered' && (b.assignedDriver?.id === driver.id || b.assignedDepotId === driver.depotId)
  );

  // Actions
  const handleStartTrip = (booking: TankerBooking) => {
    storageService.driverStartTrip(booking.id, driver);
    setActionNotice(`🚀 Trip Started! Booking ${booking.id} is now In Transit. Live tracking active for citizen.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleMarkDelivered = (booking: TankerBooking) => {
    storageService.driverCompleteTrip(booking.id, driver.id);
    setActionNotice(`✓ Delivery Completed for ${booking.id}! Citizen notified.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Driver Header */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#fd7e14] text-white flex items-center justify-center font-bold text-3xl shadow-lg border border-white/20">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{driver.name}</h2>
              <span className="text-[10px] uppercase font-mono font-bold bg-[#ea580c] text-white px-2 py-0.5 rounded-full">
                {driver.vehicleNumber}
              </span>
            </div>
            <p className="text-xs text-orange-200 mt-0.5">
              Assigned Depot: <strong className="text-white">{depot.name}</strong> • Fleet Tanker: <strong>{driver.capacity.toLocaleString()}L</strong>
            </p>
          </div>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onSwitchToHome}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2.5 bg-rose-600/80 hover:bg-rose-600 rounded-xl transition"
            title="Driver Logout"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <Radio className="w-4 h-4 text-emerald-600 animate-ping" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Driver Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {driver.deliveriesToday + completedTrips.length} <span className="text-xs font-normal">Trips</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">100% On-Time Delivery</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Water Dispatched</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {((driver.deliveriesToday + completedTrips.length) * driver.capacity).toLocaleString()} <span className="text-xs font-normal">L</span>
          </div>
          <span className="text-[10px] text-slate-500">Potable Drinking Water</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Driver Performance</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {driver.rating} <span className="text-xs font-normal">/ 5.0</span>
          </div>
          <span className="text-[10px] text-amber-500 font-bold">Top Rated Driver</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Depot Inventory</span>
            <Fuel className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {depot.availableTankers} <span className="text-xs font-normal">/ {depot.totalTankers} Tankers</span>
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">{depot.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* ACTIVE TRIP SHOWCASE */}
      {activeTrip && (
        <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 p-6 sm:p-8 rounded-3xl border-2 border-[#ea580c] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200 dark:border-orange-900/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] text-white flex items-center gap-1.5 animate-pulse">
                <Truck className="w-3.5 h-3.5" />
                <span>Active Delivery In Progress</span>
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                Docket: {activeTrip.id}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Scheduled: <strong>{activeTrip.bookingDate} ({activeTrip.timeSlot})</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Citizen & Destination Info */}
            <div className="space-y-4 text-xs">
              <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Delivery Recipient
                </span>
                <strong className="text-base text-slate-900 dark:text-white block">
                  {activeTrip.citizenName}
                </strong>
                <p className="text-slate-600 dark:text-slate-400 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{activeTrip.address}, {activeTrip.areaName} (Near {activeTrip.landmark})</span>
                </p>

                <div className="pt-2">
                  <a
                    href={`tel:${activeTrip.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Citizen (+91 {activeTrip.phone})</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border text-xs">
                  <span className="text-slate-400 block text-[10px]">Volume</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {activeTrip.capacity.toLocaleString()} Liters
                  </strong>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border text-xs">
                  <span className="text-slate-400 block text-[10px]">Transit Distance</span>
                  <strong className="text-[#ea580c] text-sm">
                    {activeTrip.distanceKm} km (~{activeTrip.estimatedArrivalMins})
                  </strong>
                </div>
              </div>

              {/* Trip Action Buttons */}
              <div className="space-y-2 pt-2">
                {activeTrip.status === 'Approved' ? (
                  <button
                    onClick={() => handleStartTrip(activeTrip)}
                    className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Start Navigation / Mark In Transit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkDelivered(activeTrip)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Water Delivered (Complete Trip)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Interactive Navigation Map */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Turn-by-turn Route Map (From {depot.name} to {activeTrip.areaName})
              </span>
              <LeafletMapView
                center={activeTrip.citizenCoordinates}
                zoom={14}
                userLocation={activeTrip.citizenCoordinates}
                depots={[depot]}
                selectedDepot={depot}
                tankerLocation={activeTrip.citizenCoordinates}
                tankerDriverName={`${driver.name} (${driver.vehicleNumber})`}
                showRoute={true}
                heightClass="h-80"
              />
            </div>
          </div>
        </section>
      )}

      {/* Tabs: Trips Queue vs Completed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'assigned'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Assigned Queue ({myAssignedBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'completed'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Delivered Trips ({completedTrips.length})
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'assigned' ? (
            <div className="space-y-3">
              {myAssignedBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active bookings pending in your depot queue right now.
                </div>
              ) : (
                myAssignedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {b.id}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {b.citizenName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                          {b.capacity.toLocaleString()}L
                        </span>
                      </div>
                      <p className="text-slate-500">
                        {b.address}, {b.areaName} • {b.bookingDate} ({b.timeSlot})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${b.phone}`}
                        className="px-3 py-1.5 border rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition"
                      >
                        Call
                      </a>
                      {b.status === 'Approved' && (
                        <button
                          onClick={() => handleStartTrip(b)}
                          className="px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl transition"
                        >
                          Start Trip
                        </button>
                      )}
                      {b.status === 'In Transit' && (
                        <button
                          onClick={() => handleMarkDelivered(b)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {completedTrips.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No deliveries logged yet today.
                </div>
              ) : (
                completedTrips.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {b.id} — {b.citizenName} ({b.areaName})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {b.capacity.toLocaleString()}L delivered • Completed {b.deliveryCompletedAt ? new Date(b.deliveryCompletedAt).toLocaleTimeString() : 'Today'}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBookingForReceipt(b)}
                      className="px-3 py-1.5 border rounded-xl font-bold hover:bg-slate-50"
                    >
                      View Receipt
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedBookingForReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedBookingForReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 font-bold"
            >
              ✕
            </button>
            <ReceiptModal
              booking={selectedBookingForReceipt}
              onClose={() => setSelectedBookingForReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
