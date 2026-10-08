import React, { useState, useEffect } from 'react';
import {
  WaterZoneId,
  TankerCapacity,
  TankerBooking,
  Depot,
} from '../../types';
import { MBMC_ZONES, MBMC_AREAS, MBMC_DEPOTS, TIME_SLOTS } from '../../data/mbmcData';
import {
  storageService,
  getTodayDateString,
  getTomorrowDateString,
  isValidBookingDate,
} from '../../services/storageService';
import {
  calculateHaversineDistance,
  calculateEstimatedDeliveryTime,
  findNearestDepot,
} from '../../services/distanceService';
import { LeafletMapView } from '../common/LeafletMapView';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  Truck,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Droplets,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TankerBookingFormProps {
  initialArea?: string;
  onBookingConfirmed: (booking: TankerBooking) => void;
  onTrackBooking: (bookingId: string) => void;
}

export const TankerBookingForm: React.FC<TankerBookingFormProps> = ({
  initialArea,
  onBookingConfirmed,
  onTrackBooking,
}) => {
  const [step, setStep] = useState<number>(1);
  const [depots, setDepots] = useState<Depot[]>(() => storageService.getDepots());
  const [confirmedBooking, setConfirmedBooking] = useState<TankerBooking | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [zoneId, setZoneId] = useState<WaterZoneId>('zone-1');
  const [areaName, setAreaName] = useState<string>(initialArea || 'Golden Nest');

  // Strict Date Restriction: strictly today or tomorrow
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[2]); // 10:00 - 12:00
  const [capacity, setCapacity] = useState<TankerCapacity>(10000);
  const [reason, setReason] = useState<string>('Emergency (no supply for 24+ hours)');

  // Coordinates & Depot Assignment
  const defaultArea = MBMC_AREAS.find((a) => a.name === areaName) || MBMC_AREAS[0];
  const [citizenCoords, setCitizenCoords] = useState<[number, number]>([
    defaultArea.lat,
    defaultArea.lng,
  ]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculated Nearest Depot & Distance
  const { depot: assignedDepot, distanceKm, eta } = findNearestDepot(
    citizenCoords[0],
    citizenCoords[1],
    depots
  );

  // Auto-detect GPS coordinates
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationSuccessMsg(null);

    if (!navigator.geolocation) {
      fallbackToAreaCoords();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const isNearMBMC = lat >= 19.22 && lat <= 19.38 && lng >= 72.74 && lng <= 72.95;
        const finalCoords: [number, number] = isNearMBMC
          ? [lat, lng]
          : [19.3015 + (Math.random() - 0.5) * 0.008, 72.8592 + (Math.random() - 0.5) * 0.008];

        setCitizenCoords(finalCoords);

        // Find closest area
        let closest = MBMC_AREAS[0];
        let minD = 99999;
        MBMC_AREAS.forEach((a) => {
          const d = calculateHaversineDistance(finalCoords[0], finalCoords[1], a.lat, a.lng);
          if (d < minD) {
            minD = d;
            closest = a;
          }
        });

        setZoneId(closest.zoneId);
        setAreaName(closest.name);
        setLocationSuccessMsg(
          `📍 GPS Pin locked in ${closest.name}. Auto-routed to nearest depot!`
        );
        setIsLocating(false);
      },
      () => {
        fallbackToAreaCoords();
      },
      { timeout: 6000 }
    );
  };

  const fallbackToAreaCoords = () => {
    const area = MBMC_AREAS.find((a) => a.name === areaName) || MBMC_AREAS[0];
    setCitizenCoords([area.lat, area.lng]);
    setLocationSuccessMsg(`📍 Location centered on ${area.name}`);
    setIsLocating(false);
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!name.trim()) errs.name = 'Full name is required';
      if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        errs.phone = 'Valid 10-digit mobile number required for driver dispatch';
      }
    }

    if (currentStep === 2) {
      if (!address.trim()) errs.address = 'Complete building address & flat number required';
      if (!landmark.trim()) errs.landmark = 'Prominent landmark helps tanker driver reach quickly';
    }

    if (currentStep === 4) {
      if (!isValidBookingDate(bookingDate)) {
        errs.bookingDate = 'Booking is strictly restricted to Today or Tomorrow only.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Form
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidBookingDate(bookingDate)) {
      alert('Violation: Tanker bookings are strictly restricted to Today or Tomorrow.');
      return;
    }

    const newBooking = storageService.addBooking({
      citizenName: name,
      phone: phone.replace(/\D/g, ''),
      email: email || `${phone}@citizen.mbmc.gov.in`,
      alternatePhone,
      zoneId,
      areaName,
      address,
      landmark,
      citizenCoordinates: citizenCoords,
      assignedDepotId: assignedDepot.id,
      assignedDepotName: assignedDepot.name,
      depotCoordinates: [assignedDepot.lat, assignedDepot.lng],
      distanceKm,
      estimatedArrivalMins: eta,
      bookingDate,
      timeSlot,
      capacity,
      reason,
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setConfirmedBooking(newBooking);
    onBookingConfirmed(newBooking);
  };

  // If confirmed, show Receipt Modal
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto">
        <ReceiptModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onTrackNow={() => onTrackBooking(confirmedBooking.id)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            MBMC Rapid Tanker Dispatch System
          </span>
          <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold">
            Step {step} of 5
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black">Book Emergency Water Tanker</h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
          Direct municipal delivery for societies and residences experiencing supply failure.
          <strong> Strictly restricted to Today or Tomorrow.</strong>
        </p>

        {/* Wizard Progress */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {['Citizen', 'Address', 'Map Route', 'Slot & Vol', 'Confirm'].map((title, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={title} className="text-center">
                <div
                  className={`h-1.5 rounded-full mb-1 transition-all ${
                    isCompleted
                      ? 'bg-white'
                      : isCurrent
                      ? 'bg-amber-300'
                      : 'bg-white/20'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold block truncate ${
                    isCurrent ? 'text-white' : 'text-emerald-100/70'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmitBooking} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Citizen Contact */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Step 1: Citizen Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunil Merchant"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mobile Number (Driver Calls Here) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10 digits (e.g. 9820544123)"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email Address (For PDF Receipt)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sunil.m@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alternate Phone / Society Security Guard
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="Optional backup number"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Step 2: Delivery Address & Ward Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Water Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => {
                    const z = e.target.value as WaterZoneId;
                    setZoneId(z);
                    const first = MBMC_AREAS.find((a) => a.zoneId === z);
                    if (first) {
                      setAreaName(first.name);
                      setCitizenCoords([first.lat, first.lng]);
                    }
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  {MBMC_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Sub-Area
                </label>
                <select
                  value={areaName}
                  onChange={(e) => {
                    setAreaName(e.target.value);
                    const a = MBMC_AREAS.find((item) => item.name === e.target.value);
                    if (a) setCitizenCoords([a.lat, a.lng]);
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  {MBMC_AREAS.filter((a) => a.zoneId === zoneId).map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Complete Delivery Address (Building / Society / Wing) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. B-Wing, Gokul Dham CHS, 150 Feet Road, Near D-Mart"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Prominent Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Jain Derasar / Near Maxus Mall Gate 2"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              {errors.landmark && <p className="text-rose-500 text-xs mt-1">{errors.landmark}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: Map & Depot Auto-Assignment */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Step 3: Depot Auto-Routing & Distance Calculation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Using Haversine formula to compute shortest municipal logistics route.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:brightness-105 transition self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Detecting GPS...' : '📍 Detect My Location'}</span>
              </button>
            </div>

            {locationSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{locationSuccessMsg}</span>
              </div>
            )}

            {/* Auto-Assignment Result Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">
                  Assigned MBMC Depot
                </span>
                <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {assignedDepot.name}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Available Fleet: {assignedDepot.availableTankers} tankers
                </span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">
                  Haversine Distance
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {distanceKm} km
                </strong>
                <span className="text-[11px] text-emerald-600 block mt-0.5">
                  ✓ Nearest municipal depot
                </span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">
                  Estimated Transit Time
                </span>
                <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {eta}
                </strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Speed: 30 km/h + prep time
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Map with Route */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Map View: Red marker = Assigned Depot • Blue marker = Your Address • Green line = Optimal route
              </span>
              <LeafletMapView
                center={citizenCoords}
                zoom={14}
                userLocation={citizenCoords}
                depots={depots}
                selectedDepot={assignedDepot}
                showRoute={true}
                heightClass="h-80"
                interactive={true}
                onSelectLocation={(coords) => {
                  setCitizenCoords(coords);
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Preferences (Strict Date & Slots) */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Step 4: Strict Date & Slot Selection</span>
            </h3>

            {/* CRITICAL FEATURE: STRICT DATE RESTRICTION (TODAY OR TOMORROW ONLY) */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Strict Municipal Policy: Today or Tomorrow Only</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                To prevent speculative hoarding of emergency tankers, booking dates are strictly limited to{' '}
                <strong>Today ({todayStr})</strong> or <strong>Tomorrow ({tomorrowStr})</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingDate(todayStr)}
                  className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition ${
                    bookingDate === todayStr
                      ? 'border-emerald-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-amber-200 dark:border-amber-900 bg-amber-100/50 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="block text-xs uppercase text-slate-500 font-semibold">Deliver</span>
                  <span>Today ({todayStr})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingDate(tomorrowStr)}
                  className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition ${
                    bookingDate === tomorrowStr
                      ? 'border-emerald-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-amber-200 dark:border-amber-900 bg-amber-100/50 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="block text-xs uppercase text-slate-500 font-semibold">Deliver</span>
                  <span>Tomorrow ({tomorrowStr})</span>
                </button>
              </div>

              {/* Native Date Input with enforced min and max */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Enforced Date Picker (Min: {todayStr}, Max: {tomorrowStr}):
                </label>
                <input
                  type="date"
                  min={todayStr}
                  max={tomorrowStr}
                  value={bookingDate}
                  onChange={(e) => {
                    const picked = e.target.value;
                    if (isValidBookingDate(picked)) {
                      setBookingDate(picked);
                    } else {
                      alert('You can only book tankers for Today or Tomorrow.');
                    }
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
                {errors.bookingDate && (
                  <p className="text-rose-500 text-xs mt-1">{errors.bookingDate}</p>
                )}
              </div>
            </div>

            {/* 9 Time Slots per Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Select Time Slot (9 Slots Available Daily)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot, index) => {
                  const isSelected = timeSlot === slot;
                  const availableCount = Math.max(1, 4 - (index % 3));
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{slot}</span>
                        {isSelected && <span className="text-emerald-600">✓</span>}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {availableCount} tankers available
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanker Capacity Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Tanker Capacity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { cap: 5000 as TankerCapacity, label: '5,000 Liters', desc: 'Small Societies / Row Houses' },
                  { cap: 10000 as TankerCapacity, label: '10,000 Liters (Standard)', desc: 'Large Apartment Wings' },
                  { cap: 15000 as TankerCapacity, label: '15,000 Liters', desc: 'Commercial / Mega Complexes' },
                ].map((item) => (
                  <button
                    key={item.cap}
                    type="button"
                    onClick={() => setCapacity(item.cap)}
                    className={`p-3 rounded-xl border text-left transition ${
                      capacity === item.cap
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason for Booking */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Reason for Emergency Booking
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Emergency (no supply for 24+ hours)">
                  Emergency (no supply for 24+ hours)
                </option>
                <option value="Low Pressure (insufficient for daily needs)">
                  Low Pressure (insufficient for daily needs)
                </option>
                <option value="Special Event (wedding, function)">
                  Special Event (wedding, function)
                </option>
                <option value="Medical Emergency (hospital, patient care)">
                  Medical Emergency (hospital, patient care)
                </option>
                <option value="Construction Work">Construction Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Confirm */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Step 5: Review & Confirm Booking</span>
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-slate-500 block">Citizen:</span>
                  <strong className="text-slate-900 dark:text-white">{name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Mobile Contact:</span>
                  <strong className="text-slate-900 dark:text-white">+91 {phone}</strong>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 block">Delivery Location:</span>
                <strong className="text-slate-900 dark:text-white">
                  {address}, {areaName} (Near {landmark})
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-slate-500 block">Delivery Date:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {bookingDate} ({bookingDate === todayStr ? 'Today' : 'Tomorrow'})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Time Slot:</span>
                  <strong className="text-blue-700 dark:text-blue-400 font-bold">{timeSlot}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-slate-500 block">Tanker Volume:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {capacity.toLocaleString()} Liters
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Depot:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {assignedDepot.name} ({distanceKm} km away)
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">Reason:</span>
                <p className="text-slate-800 dark:text-slate-200 italic">&ldquo;{reason}&rdquo;</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              ✓ A digital receipt with QR code will be generated immediately, and the driver will contact +91 {phone} upon dispatch.
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl transition transform hover:scale-102 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Generate Booking Receipt</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
