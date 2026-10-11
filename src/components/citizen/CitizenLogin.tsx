import React, { useState, useEffect } from 'react';
import { JalSevaLogo } from '../common/JalSevaLogo';
import { MBMC_AREAS } from '../../data/mbmcData';
import { storageService } from '../../services/storageService';
import { calculateHaversineDistance } from '../../services/distanceService';
import { CitizenUser } from '../../types';
import {
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Building,
  Navigation,
  AlertTriangle,
  UserPlus,
  LogIn,
  Compass,
  RotateCw,
} from 'lucide-react';

interface CitizenLoginProps {
  onLoginSuccess: (
    citizenPhone: string,
    citizenName: string,
    address?: string,
    areaName?: string
  ) => void;
  onContinueAsGuest: () => void;
  onBackToHome: () => void;
  initialMode?: 'login' | 'register';
}

export const CitizenLogin: React.FC<CitizenLoginProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  onBackToHome,
  initialMode = 'login',
}) => {
  // Tabs: 'login' (existing resident) vs 'register' (new account registration)
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Input fields
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [areaInput, setAreaInput] = useState('Jesal Park');

  // GPS auto-detection states
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [gpsSourceInfo, setGpsSourceInfo] = useState<string | null>(null);

  // Status and validation feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reusable GPS detector
  const detectGpsAndPreFill = (silent: boolean = false) => {
    setIsGpsLocating(true);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      applyDefaultFallbackLocation(silent);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords: [number, number] = [lat, lng];

        // Find closest MBMC municipal area
        let nearestArea = MBMC_AREAS[0];
        let minDistance = 999999;
        MBMC_AREAS.forEach((area) => {
          const dist = calculateHaversineDistance(lat, lng, area.lat, area.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestArea = area;
          }
        });

        const autoLocality =
          nearestArea.localities && nearestArea.localities.length > 0
            ? nearestArea.localities[0]
            : 'Municipal Ward Area';

        const generatedAddress = `${autoLocality}, Near ${nearestArea.name}, Mira-Bhayandar (${minDistance <= 15 ? `${minDistance} km` : 'GPS Localized'})`;

        // Update form state
        setAreaInput(nearestArea.name);
        setAddressInput(generatedAddress);
        setDetectedAddress(generatedAddress);
        setGpsSourceInfo(`GPS Auto-detected: ${nearestArea.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

        // Persist to storage for site-wide use
        storageService.saveDetectedLocation(coords, nearestArea.name, nearestArea.zoneId);

        if (!silent) {
          setFeedbackMsg(`📍 GPS successfully detected! Pre-filled address: ${generatedAddress}`);
        }
        setIsGpsLocating(false);
      },
      (err) => {
        console.warn('Geolocation lookup notice:', err.message);
        // Fallback to previously saved location if available, otherwise sensible default
        const saved = storageService.getSavedDetectedLocation();
        if (saved?.areaName) {
          setAreaInput(saved.areaName);
          const matchedArea = MBMC_AREAS.find((a) => a.name === saved.areaName);
          const autoLoc = matchedArea?.localities?.[0] || 'Main Sector Road';
          const genAddr = `${autoLoc}, ${saved.areaName}, Mira-Bhayandar`;
          setAddressInput((prev) => (prev ? prev : genAddr));
          setDetectedAddress(genAddr);
          setGpsSourceInfo(`Stored Location: ${saved.areaName}`);
          if (!silent) {
            setFeedbackMsg(`📍 Pre-filled using previously saved municipal location: ${saved.areaName}`);
          }
        } else {
          applyDefaultFallbackLocation(silent);
        }
        setIsGpsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const applyDefaultFallbackLocation = (silent: boolean = false) => {
    const defaultArea = MBMC_AREAS.find((a) => a.name === 'Jesal Park') || MBMC_AREAS[0];
    setAreaInput(defaultArea.name);
    const genAddr = `Chowpatty Road, ${defaultArea.name}, Mira-Bhayandar (Zone 1)`;
    setAddressInput((prev) => (prev ? prev : genAddr));
    setDetectedAddress(genAddr);
    setGpsSourceInfo(`Municipal Zone 1: ${defaultArea.name}`);
    storageService.saveDetectedLocation([defaultArea.lat, defaultArea.lng], defaultArea.name, defaultArea.zoneId);
    if (!silent) {
      setFeedbackMsg('📍 Location initialized to Jesal Park (Zone 1). You can modify anytime.');
    }
    setIsGpsLocating(false);
  };

  // Automatically detect user's current GPS location on screen mount
  useEffect(() => {
    detectGpsAndPreFill(true);
  }, []);

  const demoCitizens = [
    {
      name: 'Sunil Merchant',
      phone: '9820544123',
      area: 'Jesal Park (Bhayandar East)',
      address: 'Building 14, Bhakti Park, Chowpatty Road',
      activeItem: '🚚 Active Tanker Delivery In Transit',
    },
    {
      name: 'Rajesh Kumar',
      phone: '9820123456',
      area: 'Golden Nest (Bhayandar East)',
      address: 'Flat 402, Golden Heritage Phase 2',
      activeItem: '🛠️ Active Grievance (Low Water Pressure)',
    },
    {
      name: 'Fatima Shaikh',
      phone: '9870188992',
      area: 'Naya Nagar (Mira Road East)',
      address: 'A-Wing, Millat Heights, Naya Nagar',
      activeItem: '🧪 Active Grievance (Water Sample Inspection)',
    },
  ];

  // Handle Register (Enforcing Unique Phone Number)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFeedbackMsg(null);

    const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!nameInput.trim()) {
      setErrorMessage('Please enter your full name for registration.');
      return;
    }

    // Check if phone number is already registered
    if (storageService.isPhoneRegistered(cleanPhone)) {
      const existing = storageService.findCitizenByPhone(cleanPhone);
      setErrorMessage(
        `Mobile number +91 ${cleanPhone} is ALREADY registered (${existing?.name || 'Resident'}). Duplicate registration is not permitted. Please switch to the "Log In" tab or sign in directly.`
      );
      return;
    }

    // Find zone for area
    const matchedArea = MBMC_AREAS.find((a) => a.name === areaInput);
    const finalAddress = addressInput.trim() || `${areaInput}, Mira-Bhayandar`;

    const registerResult = storageService.registerCitizen({
      name: nameInput.trim(),
      phone: cleanPhone,
      address: finalAddress,
      areaName: areaInput,
      zoneId: matchedArea?.zoneId || 'zone-1',
    });

    if (!registerResult.success) {
      setErrorMessage(registerResult.error || 'Failed to complete registration.');
      return;
    }

    // Success: auto-login
    const newCitizen = registerResult.citizen!;
    storageService.saveCitizenProfile(newCitizen);
    onLoginSuccess(newCitizen.phone, newCitizen.name, newCitizen.address, newCitizen.areaName);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFeedbackMsg(null);

    const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const existing = storageService.findCitizenByPhone(cleanPhone);
    if (existing) {
      // Existing citizen found: load profile
      storageService.saveCitizenProfile(existing);
      onLoginSuccess(
        existing.phone,
        existing.name,
        addressInput.trim() || existing.address,
        areaInput || existing.areaName
      );
    } else {
      // If user isn't found in registered list, prompt them to register or quick-onboard
      const citizenName = nameInput.trim() || `Resident (${cleanPhone.slice(-4)})`;
      const finalAddress = addressInput.trim() || `${areaInput}, Mira-Bhayandar`;
      const matchedArea = MBMC_AREAS.find((a) => a.name === areaInput);

      const registerResult = storageService.registerCitizen({
        name: citizenName,
        phone: cleanPhone,
        address: finalAddress,
        areaName: areaInput,
        zoneId: matchedArea?.zoneId || 'zone-1',
      });

      if (!registerResult.success) {
        setErrorMessage(registerResult.error || 'Account lookup failed.');
        return;
      }

      const created = registerResult.citizen!;
      storageService.saveCitizenProfile(created);
      onLoginSuccess(created.phone, created.name, created.address, created.areaName);
    }
  };

  const handle1ClickDemo = (citizen: (typeof demoCitizens)[0]) => {
    // If not in registered list, seed it
    if (!storageService.isPhoneRegistered(citizen.phone)) {
      storageService.registerCitizen({
        name: citizen.name,
        phone: citizen.phone,
        address: citizen.address,
        areaName: citizen.area.split(' ')[0],
      });
    }
    const profile = storageService.findCitizenByPhone(citizen.phone) || {
      id: 'cit-' + citizen.phone,
      name: citizen.name,
      phone: citizen.phone,
      address: citizen.address,
      areaName: citizen.area,
    };
    storageService.saveCitizenProfile(profile);
    onLoginSuccess(citizen.phone, citizen.name, citizen.address, citizen.area);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-5 sm:space-y-6 bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1 sm:mb-2">
            <JalSevaLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 sm:px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MBMC Citizen Water Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {authMode === 'register' ? 'Register Citizen Account' : 'Resident Sign In'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {authMode === 'register'
              ? 'Create a verified resident account with your unique mobile number to book municipal tankers and report water supply grievances.'
              : 'Enter your registered 10-digit mobile number to view active tanker dispatches, filed grievances, and water supply timetables.'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Register vs Log In) */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">New Registration</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Resident Sign In</span>
          </button>
        </div>

        {/* GPS Live Detection Banner & Pre-fill Status */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-200 dark:border-sky-800/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>Current GPS Location Auto-Detection</span>
            </span>
            <button
              type="button"
              onClick={() => detectGpsAndPreFill(false)}
              disabled={isGpsLocating}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              title="Re-run GPS detection to refresh coordinates"
            >
              <RotateCw className={`w-3 h-3 ${isGpsLocating ? 'animate-spin' : ''}`} />
              <span>{isGpsLocating ? 'Detecting...' : 'Redetect GPS'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {detectedAddress ? (
              <span className="flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Auto-Detected Address:</strong> {detectedAddress}
                </span>
              </span>
            ) : isGpsLocating ? (
              <span>Locating your current GPS coordinates to pre-fill service request address...</span>
            ) : (
              <span>GPS pre-fill ready. Address has been automatically filled into the form below.</span>
            )}
          </p>

          {gpsSourceInfo && (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
              <Compass className="w-3 h-3 text-sky-500" />
              <span>{gpsSourceInfo}</span>
            </div>
          )}
        </div>

        {/* Alert Notifications: Error or Success */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong className="block font-bold">Registration Verification Failed:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {feedbackMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Quick 1-Click Verified Demo Profiles:</span>
            <span className="text-[10px] text-blue-600 font-semibold">Pre-Verified Numbers</span>
          </label>
          <div className="space-y-2">
            {demoCitizens.map((citizen) => (
              <button
                key={citizen.phone}
                type="button"
                onClick={() => handle1ClickDemo(citizen)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                      {citizen.name}
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500">
                      +91 {citizen.phone}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                      Verified
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    📍 {citizen.area}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {citizen.activeItem}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 uppercase font-bold text-[10px]">
              {authMode === 'register' ? 'Or Register New Resident' : 'Or Sign In with Mobile'}
            </span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
              <span>Full Name</span>
              {authMode === 'register' && (
                <span className="text-[10px] text-rose-500 font-semibold">*Required for registration</span>
              )}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Ramesh Kadam"
                required={authMode === 'register'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Unique 10-Digit Mobile Number */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
              <span>10-Digit Mobile Number (Unique Account Key)</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                {authMode === 'register' ? 'Checked for uniqueness' : 'Registered number'}
              </span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhoneInput(cleaned);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="98XXXXXXXX"
                required
                maxLength={10}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {authMode === 'register' && phoneInput.length === 10 && (
              <p className="mt-1 text-[11px] font-medium flex items-center gap-1">
                {storageService.isPhoneRegistered(phoneInput) ? (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Number already registered! Please switch to Login tab.</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mobile number available for new resident registration.</span>
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Locality Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">
                Locality / Sub-Area
              </label>
              <button
                type="button"
                onClick={() => detectGpsAndPreFill(false)}
                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Sync with GPS</span>
              </button>
            </div>
            <select
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MBMC_AREAS.slice(0, 40).map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.zoneId === 'zone-1' ? 'Bhayandar E' : a.zoneId === 'zone-2' ? 'Bhayandar W' : a.zoneId === 'zone-3' ? 'Mira Rd E' : 'Uttan Coastal'})
                </option>
              ))}
            </select>
          </div>

          {/* Service Request Residential Address (Auto-filled by GPS) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">
                Service Request Address (GPS Pre-filled)
              </label>
              {detectedAddress && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>GPS Auto-Filled</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="e.g. Flat 301, Shree Ram Heights, Near Temba Hospital"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Automatically populated using your current GPS coordinates. You can add specific flat or building numbers.
            </p>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 group"
          >
            <span>
              {authMode === 'register' ? 'Register & Open Citizen Portal' : 'Proceed to Citizen Dashboard'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </form>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col items-center gap-2 text-xs">
          <button
            onClick={onContinueAsGuest}
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 underline"
          >
            Continue as Guest Resident (Browse Schedules & Directories)
          </button>
          <button
            onClick={onBackToHome}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ← Return to Municipal Home
          </button>
        </div>
      </div>
    </div>
  );
};
