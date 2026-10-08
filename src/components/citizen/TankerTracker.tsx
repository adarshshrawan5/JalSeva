import React, { useState, useEffect, useMemo } from 'react';
import { TankerBooking, Driver } from '../../types';
import { storageService } from '../../services/storageService';
import { LeafletMapView } from '../common/LeafletMapView';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  Truck,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Printer,
  ShieldCheck,
  Search,
  Navigation,
  ArrowRight,
} from 'lucide-react';

interface TankerTrackerProps {
  initialBookingId?: string;
  onBookAnother?: () => void;
}

export const TankerTracker: React.FC<TankerTrackerProps> = ({
  initialBookingId = '',
  onBookAnother,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialBookingId);
  const [bookings, setBookings] = useState<TankerBooking[]>(() => storageService.getBookings());
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBookingId || (bookings[0]?.id ?? '')
  );
  const [showReceipt, setShowReceipt] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Moving Tanker simulation along route
  const [progressFactor, setProgressFactor] = useState<number>(0.65); // 0 to 1

  useEffect(() => {
    const handleUpdate = () => {
      setBookings(storageService.getBookings());
    };
    window.addEventListener('aqua_connect_storage_update', handleUpdate);
    return () => window.removeEventListener('aqua_connect_storage_update', handleUpdate);
  }, []);

  // Filtered
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.citizenName.toLowerCase().includes(q) ||
        b.areaName.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const activeBooking = useMemo(() => {
    return (
      bookings.find((b) => b.id === selectedBookingId) ||
      filteredBookings[0] ||
      bookings[0]
    );
  }, [bookings, selectedBookingId, filteredBookings]);

  // Simulate gentle movement of tanker along the path
  useEffect(() => {
    if (!activeBooking || activeBooking.status !== 'In Transit') return;
    const interval = setInterval(() => {
      setProgressFactor((prev) => {
        if (prev >= 0.95) return 0.2; // loop for demo
        return prev + 0.04;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [activeBooking]);

  // Compute intermediate coords for moving tanker
  const tankerCoords = useMemo<[number, number] | null>(() => {
    if (!activeBooking) return null;
    if (activeBooking.status !== 'In Transit' && activeBooking.status !== 'Dispatched') {
      return null;
    }
    const [dLat, dLng] = activeBooking.depotCoordinates;
    const [cLat, cLng] = activeBooking.citizenCoordinates;
    const curLat = dLat + (cLat - dLat) * progressFactor;
    const curLng = dLng + (cLng - dLng) * progressFactor;
    return [curLat, curLng];
  }, [activeBooking, progressFactor]);

  const handleRate = (rating: number) => {
    if (!activeBooking) return;
    setUserRating(rating);
    storageService.rateBooking(activeBooking.id, rating, 'Citizen feedback recorded.');
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Request awaiting depot confirmation. Scheduled for dispatch.';
      case 'Approved':
        return 'Booking confirmed at depot. Tanker filling and driver assignment in progress.';
      case 'Dispatched':
        return 'Tanker has left the municipal depot and is on route.';
      case 'In Transit':
        return 'Tanker is approaching your neighborhood (~1.2 km away).';
      case 'Delivered':
        return 'Water delivered to overhead/ground reservoir successfully.';
      case 'Cancelled':
        return 'Booking was cancelled.';
      default:
        return 'Status update pending.';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            MBMC Emergency Logistics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Track Water Tanker Live Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time GPS tracking and driver contact for your booked municipal water tanker.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Booking ID (e.g. TNK2026100701) or Phone..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {onBookAnother && (
            <button
              onClick={onBookAnother}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition shrink-0"
            >
              + Book Another Tanker
            </button>
          )}
        </div>
      </div>

      {/* Grid: Booking list & Detail tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bookings list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Tanker Bookings ({filteredBookings.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                No tanker bookings found.
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isSelected = activeBooking?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {b.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'In Transit'
                            ? 'bg-purple-100 text-purple-800'
                            : b.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {b.capacity.toLocaleString()}L • {b.timeSlot}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Date: {b.bookingDate} • {b.areaName}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Live Map Tracking & Status Details */}
        {activeBooking ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
                    {activeBooking.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activeBooking.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeBooking.status === 'In Transit'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    🚚 {activeBooking.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Delivery for <strong className="text-slate-800 dark:text-slate-200">{activeBooking.citizenName}</strong> on{' '}
                  <span className="text-emerald-600 font-bold">{activeBooking.bookingDate}</span> ({activeBooking.timeSlot})
                </p>
              </div>

              <button
                onClick={() => setShowReceipt(true)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>View Receipt & QR</span>
              </button>
            </div>

            {/* Live Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  🚚
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    Real-Time Dispatch Progress
                  </span>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {getStatusMessage(activeBooking.status)}
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-500 font-mono">Distance</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {activeBooking.distanceKm} km
                </div>
              </div>
            </div>

            {/* Interactive Live Tracking Map */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>📍 Citizen Destination: {activeBooking.areaName}</span>
                <span>🏢 Origin Depot: {activeBooking.assignedDepotName}</span>
              </div>

              <LeafletMapView
                center={activeBooking.citizenCoordinates}
                zoom={14}
                userLocation={activeBooking.citizenCoordinates}
                depots={[
                  {
                    id: activeBooking.assignedDepotId,
                    name: activeBooking.assignedDepotName,
                    zoneId: activeBooking.zoneId,
                    address: 'MBMC Water Depot',
                    lat: activeBooking.depotCoordinates[0],
                    lng: activeBooking.depotCoordinates[1],
                    totalTankers: 15,
                    availableTankers: 8,
                    managerName: 'Depot Manager',
                    phone: '022-28194401',
                  },
                ]}
                selectedDepot={{
                  id: activeBooking.assignedDepotId,
                  name: activeBooking.assignedDepotName,
                  zoneId: activeBooking.zoneId,
                  address: 'MBMC Water Depot',
                  lat: activeBooking.depotCoordinates[0],
                  lng: activeBooking.depotCoordinates[1],
                  totalTankers: 15,
                  availableTankers: 8,
                  managerName: 'Depot Manager',
                  phone: '022-28194401',
                }}
                tankerLocation={tankerCoords}
                tankerDriverName={activeBooking.assignedDriver?.name}
                showRoute={true}
                heightClass="h-96"
              />
            </div>

            {/* Driver Contact & Vehicle Card */}
            {activeBooking.assignedDriver ? (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                    👨‍✈️
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Assigned MBMC Driver
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-base">
                      {activeBooking.assignedDriver.name}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Vehicle: <strong className="font-mono">{activeBooking.assignedDriver.vehicleNumber}</strong> • Rating: ⭐ {activeBooking.assignedDriver.rating}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${activeBooking.assignedDriver.phone}`}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Driver ({activeBooking.assignedDriver.phone})</span>
                </a>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  Driver assignment in progress at {activeBooking.assignedDepotName}. SMS alert will be triggered upon dispatch.
                </span>
              </div>
            )}

            {/* Star Rating if delivered */}
            {activeBooking.status === 'Delivered' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  Delivery Complete! Please rate your tanker service:
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
                          (userRating || activeBooking.rating || 0) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Receipt Modal */}
      {showReceipt && activeBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>
            <ReceiptModal
              booking={activeBooking}
              onClose={() => setShowReceipt(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
