import React, { useState, useEffect } from 'react';
import {
  WaterZoneId,
  TankerCapacity,
  TankerBooking,
  Depot,
  CitizenUser,
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
import { JalSevaLogo } from '../common/JalSevaLogo';
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
  Building2,
  Lock,
  QrCode,
  CreditCard,
  Building,
  KeyRound,
  Check,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TankerBookingFormProps {
  initialArea?: string;
  onBookingConfirmed: (booking: TankerBooking) => void;
  onTrackBooking: (bookingId: string) => void;
  citizenUser?: CitizenUser | null;
  onCitizenLogin?: (user: CitizenUser) => void;
}

const DEMO_RESIDENTS = [
  {
    name: 'Sunil Merchant',
    phone: '9820544123',
    area: 'Jesal Park (Bhayandar East)',
    address: 'Flat 302, Building 14, Bhakti Park, Chowpatty Road',
    role: 'Individual Resident',
  },
  {
    name: 'Rajesh Kumar',
    phone: '9820123456',
    area: 'Golden Nest (Bhayandar East)',
    address: 'Flat 402, Golden Heritage Phase 2',
    role: 'CHS Secretary / Resident',
  },
  {
    name: 'Fatima Shaikh',
    phone: '9870188992',
    area: 'Naya Nagar (Mira Road East)',
    address: 'A-Wing, Millat Heights, Naya Nagar',
    role: 'Individual Resident',
  },
];

export const TankerBookingForm: React.FC<TankerBookingFormProps> = ({
  initialArea,
  onBookingConfirmed,
  onTrackBooking,
  citizenUser,
  onCitizenLogin,
}) => {
  // Check active citizen authentication
  const [currentCitizen, setCurrentCitizen] = useState<CitizenUser | null>(() => {
    return citizenUser || storageService.getCitizenProfile();
  });

  // Citizen Login Gate State (for unauthenticated users)
  const [gatePhone, setGatePhone] = useState('');
  const [gateName, setGateName] = useState('');
  const [gateArea, setGateArea] = useState(initialArea || 'Golden Nest');
  const [gateOtp, setGateOtp] = useState('5821');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // Form Wizard Step (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [depots, setDepots] = useState<Depot[]>(() => storageService.getDepots());
  const [confirmedBooking, setConfirmedBooking] = useState<TankerBooking | null>(null);

  // Form State
  const [isSocietyBooking, setIsSocietyBooking] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [societyRegNumber, setSocietyRegNumber] = useState('');
  const [authorizedPersonName, setAuthorizedPersonName] = useState('');
  const [authorizedPersonPhone, setAuthorizedPersonPhone] = useState('');
  const [tankerCount, setTankerCount] = useState<number>(2);
  const [staggeredDispatch, setStaggeredDispatch] = useState<boolean>(true);
  const [societySumpCapacityLiters, setSocietySumpCapacityLiters] = useState<number>(40000);

  const [name, setName] = useState(currentCitizen?.name || '');
  const [phone, setPhone] = useState(currentCitizen?.phone || '');
  const [email, setEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState(currentCitizen?.address || '');
  const [landmark, setLandmark] = useState('');
  const [zoneId, setZoneId] = useState<WaterZoneId>('zone-1');
  const [areaName, setAreaName] = useState<string>(initialArea || currentCitizen?.areaName || 'Golden Nest');

  // Strict Date Restriction: strictly today or tomorrow
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[2]); // 10:00 - 12:00

  // Flexible Water Capacity: Presets + Custom Liters (250L, 500L, 1000L, 2000L...)
  const [capacity, setCapacity] = useState<number>(1000);
  const [isCustomLiters, setIsCustomLiters] = useState<boolean>(false);
  const [customLitersInput, setCustomLitersInput] = useState<string>('1000');

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

  // Payment Options & Simulation State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card' | 'cash'>('upi');
  const [upiMode, setUpiMode] = useState<'qr' | 'apps' | 'id'>('qr');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'>('gpay');
  const [upiIdInput, setUpiIdInput] = useState<string>('citizen@okhdfcbank');
  const [upiIdVerified, setUpiIdVerified] = useState<boolean>(true);
  const [selectedBank, setSelectedBank] = useState<string>('State Bank of India');
  const [netBankingUserId, setNetBankingUserId] = useState<string>('CITIZEN_MBMC_9820');
  const [cardNumber, setCardNumber] = useState<string>('4532 8920 1142 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('891');
  const [cardHolder, setCardHolder] = useState<string>('Sunil Merchant');
  const [cardNetwork, setCardNetwork] = useState<'rupay' | 'visa' | 'mastercard'>('rupay');
  const [paymentProcessingStage, setPaymentProcessingStage] = useState<'idle' | 'connecting' | 'authorizing' | 'success'>('idle');
  const [simulatedTxnId, setSimulatedTxnId] = useState<string>('');

  // Auto-calculated Nearest Depot & Distance
  const { depot: assignedDepot, distanceKm, eta } = findNearestDepot(
    citizenCoords[0],
    citizenCoords[1],
    depots
  );

  // Sync when currentCitizen changes
  useEffect(() => {
    if (citizenUser) {
      setCurrentCitizen(citizenUser);
    }
  }, [citizenUser]);

  useEffect(() => {
    if (currentCitizen) {
      if (currentCitizen.name && !name) setName(currentCitizen.name);
      if (currentCitizen.phone && !phone) setPhone(currentCitizen.phone);
      if (currentCitizen.address && !address) setAddress(currentCitizen.address);
      if (currentCitizen.areaName && !initialArea) setAreaName(currentCitizen.areaName);
    }
  }, [currentCitizen, initialArea]);

  // Pre-fill location on mount
  useEffect(() => {
    const savedLoc = storageService.getSavedDetectedLocation();
    if (savedLoc && !initialArea) {
      setAreaName(savedLoc.areaName);
      setZoneId(savedLoc.zoneId as WaterZoneId);
      setCitizenCoords(savedLoc.coords);
      setLocationSuccessMsg(`📍 Pre-filled using detected MBMC location: ${savedLoc.areaName}`);
    }
  }, [initialArea]);

  // Update capacity when custom input changes
  const handleCustomLitersChange = (valStr: string) => {
    setCustomLitersInput(valStr);
    const parsed = parseInt(valStr.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCapacity(parsed);
      setIsCustomLiters(true);
    }
  };

  const handleQuickAddLiters = (addition: number) => {
    const current = capacity || 0;
    const nextVal = Math.min(25000, Math.max(100, current + addition));
    setCapacity(nextVal);
    setCustomLitersInput(nextVal.toString());
    setIsCustomLiters(true);
  };

  // Calculate Municipal Tariff & Fees
  const calculateTariff = () => {
    if (isSocietyBooking) {
      const totalVol = tankerCount * 10000;
      const baseTariff = Math.round(totalVol * 0.10);
      const societyRebate = Math.round(baseTariff * 0.15);
      const deliveryPumpingFee = 150;
      const finalAmount = baseTariff - societyRebate + deliveryPumpingFee;
      return {
        liters: totalVol,
        baseTariff,
        rebate: societyRebate,
        deliveryPumpingFee,
        finalAmount,
      };
    }

    // Household individual
    const liters = capacity;
    const baseTariff = Math.round(liters * 0.11);
    const deliveryPumpingFee = liters <= 1000 ? 25 : liters <= 5000 ? 50 : 100;
    const civicSubsidy = Math.round((baseTariff + deliveryPumpingFee) * 0.10);
    const finalAmount = Math.max(45, baseTariff + deliveryPumpingFee - civicSubsidy);
    return {
      liters,
      baseTariff,
      deliveryPumpingFee,
      subsidy: civicSubsidy,
      finalAmount,
    };
  };

  const tariff = calculateTariff();

  // Handle Citizen Login from Gate
  const handlePerformGateLogin = (phoneNum: string, citizenName: string, addr?: string, area?: string) => {
    setGateError(null);
    const clean = phoneNum.replace(/\D/g, '');
    if (clean.length !== 10) {
      setGateError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const finalName = citizenName.trim() || `Resident (${clean.slice(-4)})`;
    const newProfile: CitizenUser = {
      id: 'cit-' + clean,
      name: finalName,
      phone: clean,
      address: addr || 'Mira-Bhayandar',
      areaName: area || 'Golden Nest',
      joinedDate: new Date().toISOString(),
    };
    storageService.saveCitizenProfile(newProfile);
    setCurrentCitizen(newProfile);
    setName(newProfile.name);
    setPhone(newProfile.phone);
    if (newProfile.address) setAddress(newProfile.address);
    if (newProfile.areaName) setAreaName(newProfile.areaName);
    onCitizenLogin?.(newProfile);
  };

  // Fallback to area coordinates
  const fallbackToAreaCoords = () => {
    const area = MBMC_AREAS.find((a) => a.name === areaName) || MBMC_AREAS[0];
    setCitizenCoords([area.lat, area.lng]);
    setIsLocating(false);
    setLocationSuccessMsg(`📍 Standard municipal coordinates loaded for ${area.name}`);
  };

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
        setIsLocating(false);
        setLocationSuccessMsg(
          isNearMBMC
            ? '✓ High-accuracy GPS delivery coordinates pinned!'
            : '✓ Pinned to nearest municipal distribution node in Mira-Bhayandar'
        );
      },
      () => {
        fallbackToAreaCoords();
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (isSocietyBooking) {
        if (!societyName.trim()) errs.societyName = 'Society registered name is required';
        if (!societyRegNumber.trim()) errs.societyRegNumber = 'Society Registration Number (e.g. MH/TNA/CHS/...) is required';
        if (!name.trim()) errs.name = 'Authorized Society Chairman/Secretary name is required';
        if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
          errs.phone = 'Valid 10-digit mobile number required';
        }
      } else {
        if (!name.trim()) errs.name = 'Full name is required';
        if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
          errs.phone = 'Valid 10-digit mobile number is required';
        }
      }
    }

    if (currentStep === 2) {
      if (!address.trim()) errs.address = 'Detailed doorstep/building address is required';
      if (!landmark.trim()) errs.landmark = 'Nearest recognizable landmark is required for tanker access';
      if (!areaName.trim()) errs.areaName = 'Locality selection is required';
    }

    if (currentStep === 4) {
      if (!isValidBookingDate(bookingDate)) {
        errs.bookingDate = 'Strict policy: Bookings are only permitted for Today or Tomorrow';
      }
      if (!timeSlot) errs.timeSlot = 'Please select a delivery time slot';
      if (capacity <= 0) errs.capacity = 'Please enter a valid water volume (liters)';
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

  // Submit and Trigger Simulated Payment Flow
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    if (!isValidBookingDate(bookingDate)) {
      setErrors((prev) => ({
        ...prev,
        bookingDate: 'Violation: Tanker bookings are strictly restricted to Today or Tomorrow.',
      }));
      return;
    }

    const txnRef = 'TXN_MBMC_' + Math.floor(10000000 + Math.random() * 90000000);
    setSimulatedTxnId(txnRef);

    // If Doorstep Cash/OTP, skip gateway spinner
    if (paymentMethod === 'cash') {
      finalizeBooking('Cash on Delivery (Doorstep Decanting)', txnRef, tariff.finalAmount, true);
      return;
    }

    // Execute realistic animated gateway processing
    setPaymentProcessingStage('connecting');

    setTimeout(() => {
      setPaymentProcessingStage('authorizing');
    }, 700);

    setTimeout(() => {
      setPaymentProcessingStage('success');
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }, 1500);

    setTimeout(() => {
      let methodLabel = 'UPI / QR Code (mbmc.water@sbi)';
      if (paymentMethod === 'upi') {
        if (upiMode === 'apps') methodLabel = `UPI / ${upiApp.toUpperCase()} App`;
        else if (upiMode === 'id') methodLabel = `UPI / VPA (${upiIdInput || 'citizen@upi'})`;
        else methodLabel = 'UPI / BharatQR (mbmc.water@sbi)';
      } else if (paymentMethod === 'netbanking') {
        methodLabel = `Net Banking (${selectedBank})`;
      } else if (paymentMethod === 'card') {
        methodLabel = `${cardNetwork.toUpperCase()} Debit/Credit Card (•••• ${cardNumber.replace(/\s/g, '').slice(-4)})`;
      }

      finalizeBooking(methodLabel, txnRef, tariff.finalAmount, false);
    }, 2300);
  };

  const finalizeBooking = (methodText: string, txnRef: string, amt: number, isCash: boolean = false) => {
    const effectiveTotalVolume = isSocietyBooking ? tankerCount * 10000 : capacity;

    const newBooking = storageService.addBooking({
      citizenName: isSocietyBooking ? `${societyName} (CHS Rep: ${name})` : name,
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
      reason: isSocietyBooking ? `CHS Bulk Water Supply: ${reason}` : reason,
      isSocietyBooking,
      societyName: isSocietyBooking ? societyName : undefined,
      societyRegNumber: isSocietyBooking ? societyRegNumber : undefined,
      authorizedPersonName: isSocietyBooking ? name : undefined,
      authorizedPersonPhone: isSocietyBooking ? phone : undefined,
      tankerCount: isSocietyBooking ? tankerCount : 1,
      totalVolumeLiters: effectiveTotalVolume,
      staggeredDispatch: isSocietyBooking ? staggeredDispatch : false,
      societySumpCapacityLiters: isSocietyBooking ? societySumpCapacityLiters : undefined,
      bulkDiscountPercent: isSocietyBooking ? 15 : undefined,
      // Payment Record
      paymentStatus: isCash ? 'Pending' : 'Paid',
      paymentMethod: methodText,
      transactionId: txnRef,
      amountPaid: isCash ? 0 : amt,
      paidAt: isCash ? undefined : new Date().toISOString(),
    });

    setPaymentProcessingStage('idle');
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

  // 1. MANDATORY CITIZEN LOGIN GATE (If user is not logged in)
  if (!currentCitizen) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl mx-auto overflow-hidden animate-in fade-in">
        {/* Civic Gate Header */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-800 to-indigo-900 p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-sky-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>MBMC Municipal Security Protocol</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
              Order WS-2026/894
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">Citizen Login Required</h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1.5 leading-relaxed">
            As per Mira-Bhayandar Municipal Corporation (MBMC) regulations, water tanker bookings and society allocations 
            <strong> require verified citizen authentication</strong> to track municipal water quotas and issue your confidential 4-digit handover OTP.
          </p>
        </div>

        {/* Gate Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {gateError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          {/* 1-Click Fast Resident Profiles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                ⚡ 1-Click Instant Resident Login (For Testing / Fast Booking):
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified Citizens</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_RESIDENTS.map((res) => (
                <button
                  key={res.phone}
                  type="button"
                  onClick={() => handlePerformGateLogin(res.phone, res.name, res.address, res.area)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition text-left group"
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center justify-between">
                    <span>{res.name}</span>
                    <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100">Login →</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {res.phone}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">{res.area}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">Or Enter Mobile Number</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Manual Phone OTP Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformGateLogin(gatePhone, gateName, undefined, gateArea);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Citizen Full Name:
              </label>
              <input
                type="text"
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                placeholder="e.g. Anand Sharma"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  10-Digit Mobile Number:
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-slate-500 font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={gatePhone}
                    onChange={(e) => setGatePhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full p-3 rounded-r-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Locality / Municipal Area:
                </label>
                <select
                  value={gateArea}
                  onChange={(e) => setGateArea(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {MBMC_AREAS.slice(0, 15).map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700 dark:text-slate-300">
                  Simulated 4-Digit OTP Code: <strong>5821</strong>
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Auto-Verified
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Verify Mobile &amp; Unlock Tanker Booking</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN TANKER BOOKING WIZARD (WHEN CITIZEN IS AUTHENTICATED)
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Verified Citizen Header Status */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Logged in as:</span>
          <strong className="text-slate-900 dark:text-white">
            {currentCitizen.name} (+91 {currentCitizen.phone})
          </strong>
          <span className="text-slate-400 hidden sm:inline">• {currentCitizen.areaName}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            storageService.clearCitizenProfile();
            setCurrentCitizen(null);
          }}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
        >
          Switch Account
        </button>
      </div>

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
          Direct municipal delivery for households and societies.
          <strong> Strictly restricted to Today or Tomorrow.</strong>
        </p>

        {/* Wizard Progress */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {['Citizen', 'Address', 'Map Route', 'Slot & Vol', 'Pay & Confirm'].map((title, i) => {
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
      <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Citizen Contact */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            {/* Category Toggle: Individual vs Society CHS Bulk */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsSocietyBooking(false)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  !isSocietyBooking
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Individual Household</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSocietyBooking(true)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  isSocietyBooking
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Cooperative Housing Society (CHS Bulk)</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline">
                  Bulk Rate
                </span>
              </button>
            </div>

            {/* Society Specific Inputs */}
            {isSocietyBooking && (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Housing Society Verification Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Registered Society Name *
                    </label>
                    <input
                      type="text"
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="e.g. Shanti Park CHS Ltd."
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                    />
                    {errors.societyName && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.societyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Society Registration No. *
                    </label>
                    <input
                      type="text"
                      value={societyRegNumber}
                      onChange={(e) => setSocietyRegNumber(e.target.value)}
                      placeholder="e.g. MH/TNA/CHS/2016/4821"
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-semibold text-slate-900 dark:text-white"
                    />
                    {errors.societyRegNumber && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.societyRegNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Society Underground Sump Capacity (Liters)
                    </label>
                    <select
                      value={societySumpCapacityLiters}
                      onChange={(e) => setSocietySumpCapacityLiters(Number(e.target.value))}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                    >
                      <option value={20000}>20,000 Liters (Small Sump)</option>
                      <option value={40000}>40,000 Liters (Standard CHS)</option>
                      <option value={60000}>60,000 Liters (Large Complex)</option>
                      <option value={100000}>1,00,000+ Liters (Mega Township)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Authorized Representative Role
                    </label>
                    <select
                      value={authorizedPersonName || 'Secretary'}
                      onChange={(e) => setAuthorizedPersonName(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Society Chairman">Society Chairman</option>
                      <option value="Society Secretary">Society Secretary</option>
                      <option value="Society Treasurer">Society Treasurer</option>
                      <option value="Estate Manager">Estate Manager / Supervisor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Person Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {isSocietyBooking ? 'Authorized Representative Name *' : 'Citizen Full Name *'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mobile Number (For Handover OTP) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-slate-500 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="Family or Security Guard Phone"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email Address (For PDF Challan)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Address & Locality */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Step 2: Delivery Location &amp; Landmark</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Municipal Sub-Area / Locality *
                </label>
                <select
                  value={areaName}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setAreaName(chosen);
                    const found = MBMC_AREAS.find((a) => a.name === chosen);
                    if (found) {
                      setZoneId(found.zoneId);
                      setCitizenCoords([found.lat, found.lng]);
                    }
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {MBMC_AREAS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.zoneId})
                    </option>
                  ))}
                </select>
                {errors.areaName && (
                  <p className="text-rose-500 text-xs mt-1">{errors.areaName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nearest Landmark (Crucial for Tanker Driver) *
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Maxus Mall, Near Jain Temple"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
                {errors.landmark && (
                  <p className="text-rose-500 text-xs mt-1">{errors.landmark}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Full Street / Building Address *
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Building Name, Wing, Flat/House No., Street Name, Gate No."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
              {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* GPS Locate Button */}
            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-sky-900 dark:text-sky-200 block">
                  Accurate GPS Pinpoint for Tanker Nav
                </span>
                <span className="text-[11px] text-sky-700 dark:text-sky-300">
                  Transmits GPS coordinates directly to driver Rahul&apos;s handset map.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Pinpointing GPS...' : 'Auto-Pin My GPS'}</span>
              </button>
            </div>

            {locationSuccessMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {locationSuccessMsg}
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Route & Depot Telemetry Map */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Step 3: Depot Logistics &amp; Route Telemetry</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Municipal algorithms auto-route from closest active emergency filling station.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nearest Depot</span>
                  <strong className="text-slate-800 dark:text-slate-200">{assignedDepot.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Distance</span>
                  <strong className="text-blue-600">{distanceKm} km</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated ETA</span>
                  <strong className="text-emerald-600">{eta}</strong>
                </div>
              </div>
            </div>

            <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              <LeafletMapView
                userLocation={citizenCoords}
                selectedDepot={assignedDepot}
                depots={depots}
                showRoute={true}
                interactive={true}
                heightClass="h-72"
                onSelectLocation={(coords) => {
                  setCitizenCoords(coords);
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Preferences (Strict Date & Slots & CUSTOM WATER LITERS) */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Step 4: Strict Date, Slot &amp; Water Volume</span>
            </h3>

            {/* STRICT DATE RESTRICTION (TODAY OR TOMORROW ONLY) */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Strict Municipal Policy: Today or Tomorrow Only</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                To prevent speculative hoarding, booking dates are strictly limited to{' '}
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
                        {isSelected && <span className="text-emerald-600 font-bold">✓</span>}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {availableCount} tankers available
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FLEXIBLE WATER CAPACITY SELECTION (250L, 500L, 1000L, 2000L, 5000L OR ENTER CUSTOM LITERS) */}
            {isSocietyBooking ? (
              <div className="space-y-3 p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                    CHS Multi-Tanker Fleet Order (10,000L each)
                  </label>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    15% Society Bulk Rebate
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((count) => {
                    const totalL = count * 10000;
                    const isSelected = tankerCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setTankerCount(count);
                          setCapacity(10000);
                        }}
                        className={`p-3 rounded-xl border text-center transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="font-black text-sm">{count}x Tanker{count > 1 ? 's' : ''}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {totalL.toLocaleString()} Liters
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Staggered vs Simultaneous */}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fleet Dispatch Coordination:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStaggeredDispatch(true)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        staggeredDispatch
                          ? 'border-emerald-600 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold">⏱️ Staggered 1-Hr Interval</div>
                      <span className="text-[10px] font-normal text-slate-500 block">Recommended • Prevents society sump overflow</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStaggeredDispatch(false)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        !staggeredDispatch
                          ? 'border-emerald-600 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold">⚡ Simultaneous Fleet Arrival</div>
                      <span className="text-[10px] font-normal text-slate-500 block">All tankers dispatched together at start of slot</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Select or Enter Water Liters (पाण्याचे लिटर)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Subsidized municipal rates starting from mini drum refills up to full-scale tankers.
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    Selected: {capacity.toLocaleString()} Liters
                  </span>
                </div>

                {/* Popular Presets: 250L, 500L, 1000L, 2000L, 5000L, 10000L, 15000L */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 250, label: '250 Liters', desc: 'Mini Drum Refill', price: '₹45' },
                    { val: 500, label: '500 Liters', desc: 'Loft / Overhead Tank', price: '₹72' },
                    { val: 1000, label: '1,000 Liters', desc: 'Sintex Domestic Tank', price: '₹122' },
                    { val: 2000, label: '2,000 Liters', desc: 'Double Loft Sump', price: '₹221' },
                    { val: 5000, label: '5,000 Liters', desc: 'Mini Municipal Tanker', price: '₹518' },
                    { val: 10000, label: '10,000 Liters', desc: 'Standard MBMC Tanker', price: '₹1,013' },
                    { val: 15000, label: '15,000 Liters', desc: 'Commercial Heavy Tanker', price: '₹1,508' },
                  ].map((item) => {
                    const isSelected = !isCustomLiters && capacity === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setCapacity(item.val);
                          setCustomLitersInput(item.val.toString());
                          setIsCustomLiters(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                          <span>{item.label}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">{item.price}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                      </button>
                    );
                  })}

                  {/* "Custom Liters" button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomLiters(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      isCustomLiters
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-blue-700 dark:text-blue-300">
                      ✍️ Custom Liters
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Type any amount</span>
                  </button>
                </div>

                {/* Custom Liters Input Box & Quick Increment Helpers */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enter Exact Water Volume Required (Liters):
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Quick adjust:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickAddLiters(100)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        +100L
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddLiters(250)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        +250L
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddLiters(500)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        +500L
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddLiters(1000)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        +1,000L
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={100}
                        max={25000}
                        step={50}
                        value={customLitersInput}
                        onChange={(e) => handleCustomLitersChange(e.target.value)}
                        placeholder="e.g. 250, 500, 750, 1000, 1500"
                        className="w-full p-2.5 pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">
                        Liters
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Subsidized Tariff</span>
                      <strong className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{tariff.finalAmount}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

        {/* STEP 5: REVIEW, FAKE PAYMENT METHOD & PAYMENT SUCCESSFUL FLOW */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Step 5: Review &amp; Secure Municipal Payment</span>
            </h3>

            {/* Itemized Civic Bill Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {isSocietyBooking ? 'CHS Bulk Supply Invoice' : 'Household Potable Water Invoice'}
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold px-2 py-0.5 rounded">
                  MBMC Regulated Rates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Citizen / Society</span>
                  <strong className="text-slate-900 dark:text-white">
                    {isSocietyBooking ? societyName : name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Delivery Slot</span>
                  <strong className="text-slate-900 dark:text-white">
                    {bookingDate} ({timeSlot})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Allocated Volume</span>
                  <strong className="text-blue-600 font-mono">
                    {tariff.liters.toLocaleString()} Liters
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Depot</span>
                  <strong className="text-slate-900 dark:text-white">
                    {assignedDepot.name} ({distanceKm} km away)
                  </strong>
                </div>
              </div>

              {/* Cost Calculation Rows */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 font-mono text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Base Water Tariff ({tariff.liters}L @ ₹0.11/L):</span>
                  <span>₹{tariff.baseTariff}</span>
                </div>
                <div className="flex justify-between">
                  <span>Municipal Pumping &amp; Tanker Transit Fee:</span>
                  <span>₹{tariff.deliveryPumpingFee}</span>
                </div>
                {tariff.rebate ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>15% Society Bulk Rebate:</span>
                    <span>-₹{tariff.rebate}</span>
                  </div>
                ) : null}
                {tariff.subsidy ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>MBMC Civic Emergency Subsidy:</span>
                    <span>-₹{tariff.subsidy}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-600">
                  <span>Total Amount Payable:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">₹{tariff.finalAmount}</span>
                </div>
              </div>
            </div>

            {/* REALISTIC FAKE PAYMENT METHODS */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Choose Payment Method (प्रदान पद्धत निवडा)
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Method 1: UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer min-w-0 ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">UPI / QR Code</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">GPay, PhonePe, Paytm, BHIM</span>
                </button>

                {/* Method 2: Net Banking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer min-w-0 ${
                    paymentMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">Net Banking</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">SBI, HDFC, ICICI, BoB</span>
                </button>

                {/* Method 3: Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer min-w-0 ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">Debit / Credit</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">RuPay, Visa, MasterCard</span>
                </button>

                {/* Method 4: Cash / Doorstep */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer min-w-0 ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <KeyRound className="w-4 h-4 text-[#ea580c] shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">Doorstep OTP</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">Pay to Driver at Delivery</span>
                </button>
              </div>

              {/* Payment Details Sub-panel */}
              {paymentMethod === 'upi' && (
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs animate-in fade-in">
                  {/* UPI Sub-Mode Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUpiMode('qr')}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold text-center text-xs transition cursor-pointer min-w-0 ${
                        upiMode === 'qr'
                          ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate block">Dynamic BharatQR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('apps')}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold text-center text-xs transition cursor-pointer min-w-0 ${
                        upiMode === 'apps'
                          ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate block">Instant UPI Apps</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('id')}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold text-center text-xs transition cursor-pointer min-w-0 ${
                        upiMode === 'id'
                          ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate block">Enter UPI ID</span>
                    </button>
                  </div>

                  {/* Mode A: BharatQR */}
                  {upiMode === 'qr' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="p-2.5 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-md shrink-0 text-center relative group">
                        <svg viewBox="0 0 100 100" className="w-28 h-28">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                          <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="13" y="13" width="12" height="12" fill="#059669" rx="2" />
                          <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                          <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="75" y="13" width="12" height="12" fill="#059669" rx="2" />
                          <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
                          <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="13" y="75" width="12" height="12" fill="#059669" rx="2" />
                          <rect x="42" y="10" width="8" height="8" fill="#0f172a" />
                          <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="38" width="16" height="16" fill="#0f172a" />
                          <rect x="46" y="42" width="8" height="8" fill="#059669" />
                          <rect x="68" y="42" width="10" height="10" fill="#0f172a" />
                          <rect x="82" y="52" width="10" height="10" fill="#0f172a" />
                          <rect x="42" y="68" width="12" height="12" fill="#0f172a" />
                          <rect x="68" y="72" width="20" height="20" fill="#0f172a" />
                          <rect x="74" y="78" width="8" height="8" fill="#ffffff" />
                        </svg>
                        <span className="text-[10px] font-mono font-black text-emerald-700 block mt-1">
                          MBMC • ₹{tariff.finalAmount}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Official Municipal VPA</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <strong className="text-slate-900 dark:text-white font-mono text-sm bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              mbmc.water@sbi
                            </strong>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                              ✓ NPCI Certified
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Scan using any UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay). Amount ₹{tariff.finalAmount} is pre-locked for instant settlement.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500">Supported:</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300">GPay</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300">PhonePe</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300">Paytm</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300">BHIM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode B: Instant UPI Apps */}
                  {upiMode === 'apps' && (
                    <div className="space-y-3">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Select your preferred UPI App for 1-Tap Payment:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'gpay', label: 'Google Pay', color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' },
                          { id: 'phonepe', label: 'PhonePe', color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40' },
                          { id: 'paytm', label: 'Paytm UPI', color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40' },
                          { id: 'bhim', label: 'BHIM UPI', color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' },
                          { id: 'cred', label: 'CRED UPI', color: 'border-slate-800 bg-slate-100 dark:bg-slate-800' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setUpiApp(app.id as any)}
                            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                              upiApp === app.id
                                ? `${app.color} ring-2 ring-emerald-500 font-bold text-slate-900 dark:text-white`
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center font-black text-xs text-slate-800 dark:text-white shadow-xs">
                              {app.label.slice(0, 1)}
                            </span>
                            <span className="text-[11px] font-bold">{app.label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                          Clicking Continue will simulate instant approval via <strong>{upiApp.toUpperCase()}</strong>.
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                          ₹{tariff.finalAmount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mode C: Enter UPI ID */}
                  {upiMode === 'id' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Enter Citizen Virtual Payment Address (VPA / UPI ID)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiIdInput}
                            onChange={(e) => {
                              setUpiIdInput(e.target.value);
                              setUpiIdVerified(e.target.value.includes('@'));
                            }}
                            placeholder="e.g. mobile@okaxis or name@ybl"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white pr-24"
                          />
                          <span className={`absolute right-2.5 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            upiIdVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {upiIdVerified ? '✓ Valid VPA' : 'Enter @bank'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Quick handles:</span>
                        {['@okaxis', '@okhdfcbank', '@ybl', '@paytm', '@sbi', '@icici'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const base = (phone || '9820544123').slice(0, 10);
                              setUpiIdInput(`${base}${handle}`);
                              setUpiIdVerified(true);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono text-[10px] transition"
                          >
                            +{handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Net Banking Sub-panel */}
              {paymentMethod === 'netbanking' && (
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Choose Authorized Civic Gateway Bank:
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'State Bank of India', code: 'SBI' },
                      { name: 'HDFC Bank', code: 'HDFC' },
                      { name: 'ICICI Bank', code: 'ICICI' },
                      { name: 'Bank of Baroda', code: 'BOB' },
                      { name: 'Axis Bank', code: 'AXIS' },
                      { name: 'Kotak Mahindra', code: 'KOTAK' },
                      { name: 'Punjab National Bank', code: 'PNB' },
                      { name: 'Canara Bank', code: 'CANARA' },
                    ].map((b) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => setSelectedBank(b.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          selectedBank === b.name
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold truncate">{b.name}</span>
                        <span className="text-[9px] font-mono opacity-60 ml-1">{b.code}</span>
                      </button>
                    ))}
                  </div>

                  {/* Simulated Bank Login Preview */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block">Selected Institution</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{selectedBank} NetBanking Gateway</strong>
                      <p className="text-slate-500 text-[10px]">Connected via RBI e-Payment Switch (256-Bit SSL Secured)</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-emerald-600 font-mono font-bold text-xs">₹{tariff.finalAmount}</span>
                      <span className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">1-Tap Demo Auth</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Sub-panel */}
              {paymentMethod === 'card' && (
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Enter Municipal Water Bill Payment Card:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCardNetwork('rupay');
                          setCardNumber('6082 1920 4410 8821');
                          setCardExpiry('11/29');
                          setCardCvv('721');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          cardNetwork === 'rupay'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        RuPay Card
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNetwork('visa');
                          setCardNumber('4532 9901 2341 4242');
                          setCardExpiry('08/28');
                          setCardCvv('891');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          cardNetwork === 'visa'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Visa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNetwork('mastercard');
                          setCardNumber('5412 7500 1100 9823');
                          setCardExpiry('03/27');
                          setCardCvv('410');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          cardNetwork === 'mastercard'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        MasterCard
                      </button>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="16-digit card number"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>PCI-DSS Compliant • 3D Secure Verified</span>
                    </span>
                    <span>No international fee</span>
                  </div>
                </div>
              )}

              {/* Cash / Doorstep OTP Sub-panel */}
              {paymentMethod === 'cash' && (
                <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <strong className="font-bold text-sm">Doorstep Payment &amp; Discharge Verification</strong>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black font-mono text-[11px]">
                      ₹0 Paid Now
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    You do not need to pay in advance online. When municipal driver Rahul arrives at your building in {areaName}, pay ₹{tariff.finalAmount} directly via Cash or Driver&apos;s UPI scanner.
                  </p>

                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-300 dark:border-amber-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Doorstep Verification Flow:</span>
                      <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">Step 1 of 4</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                      <li>Driver arrives and connects discharge pipe to your underground sump or rooftop tank.</li>
                      <li>Driver collects ₹{tariff.finalAmount} (Cash or UPI).</li>
                      <li>A 4-digit confidential delivery OTP is SMSed to <strong>+91 {phone}</strong> upon booking.</li>
                      <li>Share the OTP with driver Rahul to authorize decanting and generate the official MBMC handover receipt.</li>
                    </ol>
                  </div>
                </div>
              )}
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
              disabled={paymentProcessingStage !== 'idle'}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-75 text-white font-bold text-sm shadow-xl transition transform hover:scale-102 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {paymentMethod === 'cash'
                  ? 'Confirm Booking (Pay on Doorstep OTP)'
                  : `Pay ₹${tariff.finalAmount} & Confirm Booking`}
              </span>
            </button>
          )}
        </div>
      </form>

      {/* SIMULATED PAYMENT PROCESSING OVERLAY */}
      {paymentProcessingStage !== 'idle' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            {paymentProcessingStage === 'connecting' && (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 mx-auto flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Connecting to MBMC Gateway...
                </h4>
                <p className="text-xs text-slate-500">
                  Securing 256-bit encrypted session with National Payments Corporation of India (NPCI)
                </p>
              </>
            )}

            {paymentProcessingStage === 'authorizing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-[#ea580c] mx-auto flex items-center justify-center animate-pulse">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Authorizing ₹{tariff.finalAmount}...
                </h4>
                <p className="text-xs text-slate-500">
                  Verifying account authorization via {paymentMethod.toUpperCase()}
                </p>
              </>
            )}

            {paymentProcessingStage === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  Payment Successful!
                </h4>
                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300">
                  Ref: {simulatedTxnId}
                </div>
                <p className="text-xs text-slate-500">
                  Generating official MBMC delivery challan with 4-digit verification OTP...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
