import React, { useState } from 'react';
import { ComplaintType, WaterZoneId, SubArea, ComplaintPriority, Complaint } from '../../types';
import { MBMC_ZONES, MBMC_AREAS } from '../../data/mbmcData';
import { storageService } from '../../services/storageService';
import { calculateHaversineDistance } from '../../services/distanceService';
import {
  AlertCircle,
  CheckCircle2,
  Navigation,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Camera,
  ShieldCheck,
  Droplets,
  Wrench,
  Activity,
  Waves,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ComplaintFormProps {
  onSuccess: (complaint: Complaint) => void;
  onCancel?: () => void;
}

const ISSUE_CATEGORIES: {
  type: ComplaintType;
  priority: ComplaintPriority;
  icon: string;
  description: string;
  color: string;
}[] = [
  { type: 'Low Water Pressure', priority: 'Medium', icon: '📉', description: 'Water pressure insufficient for overhead tanks', color: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30' },
  { type: 'No Water Supply', priority: 'High', icon: '🚫', description: 'Zero water flow during scheduled supply hours', color: 'border-rose-300 bg-rose-50 dark:bg-rose-950/30' },
  { type: 'Contaminated Water', priority: 'High', icon: '☣️', description: 'Turbid, brownish, or foul-smelling tap water', color: 'border-purple-300 bg-purple-50 dark:bg-purple-950/30' },
  { type: 'Pipeline Leak', priority: 'High', icon: '💦', description: 'Visible road or main line water leakage', color: 'border-blue-300 bg-blue-50 dark:bg-blue-950/30' },
  { type: 'Irregular Supply', priority: 'Medium', icon: '⏱️', description: 'Timings deviating wildly from official schedule', color: 'border-sky-300 bg-sky-50 dark:bg-sky-950/30' },
  { type: 'Dirty Water', priority: 'High', icon: '🟤', description: 'Mud and sediment in drinking supply', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' },
  { type: 'Water Logging', priority: 'Medium', icon: '🌊', description: 'Stagnant overflow from municipal inspection valve', color: 'border-cyan-300 bg-cyan-50 dark:bg-cyan-950/30' },
  { type: 'Meter Reading Issue', priority: 'Low', icon: '🔢', description: 'Inaccurate meter reading or billing grievance', color: 'border-slate-300 bg-slate-50 dark:bg-slate-800' },
  { type: 'Connection Issue', priority: 'Medium', icon: '🔌', description: 'New tap line or ferrule joint problem', color: 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30' },
  { type: 'Other', priority: 'Low', icon: '📝', description: 'Miscellaneous water works concern', color: 'border-slate-300 bg-slate-50 dark:bg-slate-800' },
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState<WaterZoneId>('zone-1');
  const [areaId, setAreaId] = useState<string>('be-1');
  const [locality, setLocality] = useState<string>('Phase 1');
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);
  const [issueType, setIssueType] = useState<ComplaintType>('Low Water Pressure');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const zoneAreas = MBMC_AREAS.filter((a) => a.zoneId === zoneId);
  const currentArea = MBMC_AREAS.find((a) => a.id === areaId) || zoneAreas[0] || MBMC_AREAS[0];

  const handleIssueTypeSelect = (cat: (typeof ISSUE_CATEGORIES)[0]) => {
    setIssueType(cat.type);
    setPriority(cat.priority);
  };

  // Location Auto-Detect
  const handleDetectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      fallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords: [number, number] = [lat, lng];
        setCoordinates(coords);

        let nearest = MBMC_AREAS[0];
        let min = 999999;
        MBMC_AREAS.forEach((a) => {
          const d = calculateHaversineDistance(lat, lng, a.lat, a.lng);
          if (d < min) {
            min = d;
            nearest = a;
          }
        });

        setZoneId(nearest.zoneId);
        setAreaId(nearest.id);
        if (nearest.localities.length > 0) {
          setLocality(nearest.localities[0]);
        }
        setIsLocating(false);
      },
      () => {
        fallbackLocation();
      },
      { timeout: 6000 }
    );
  };

  const fallbackLocation = () => {
    const area = MBMC_AREAS.find((a) => a.id === 'be-1') || MBMC_AREAS[0];
    setZoneId(area.zoneId);
    setAreaId(area.id);
    setLocality(area.localities[0]);
    setCoordinates([area.lat, area.lng]);
    setIsLocating(false);
  };

  // Handle Photo selection/upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!name.trim()) errs.name = 'Please enter your full name';
      if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        errs.phone = 'Valid 10-digit mobile number required';
      }
      if (!address.trim()) errs.address = 'Detailed address/building name required';
    }

    if (currentStep === 3) {
      if (!description.trim() || description.length < 10) {
        errs.description = 'Please provide at least 10 characters describing the issue';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setStep(3);
      return;
    }

    const newComplaint = storageService.addComplaint({
      citizenName: name,
      phone: phone.replace(/\D/g, ''),
      email: email || `${phone}@citizen.mbmc.gov.in`,
      address,
      zoneId,
      areaId,
      areaName: currentArea.name,
      locality,
      coordinates: coordinates || [currentArea.lat, currentArea.lng],
      issueType,
      priority,
      description,
      photoUrl,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setSubmittedComplaint(newComplaint);
  };

  // If successfully submitted, show success card
  if (submittedComplaint) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            MBMC Redressal Docket Generated
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Complaint Registered Successfully!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your grievance has been auto-assigned to the MBMC Water Works Division for {submittedComplaint.areaName}.
          </p>
        </div>

        {/* Docket Reference Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase">Your Complaint ID</span>
          <div className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-wider">
            {submittedComplaint.id}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Priority: <strong className="text-rose-600">{submittedComplaint.priority}</strong> • Issue: {submittedComplaint.issueType}
          </div>
        </div>

        {/* Simulated SMS Alert */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl text-xs text-blue-900 dark:text-blue-200">
          <div className="font-bold mb-1">📱 SMS Dispatched to +91 {submittedComplaint.phone}:</div>
          <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200">
            &ldquo;MBMC Water Dept: Your complaint {submittedComplaint.id} ({submittedComplaint.issueType}) has been logged. Field inspector will inspect within 48 hours. Helpline: 1800-22-2026&rdquo;
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onSuccess(submittedComplaint)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            🔍 Track Complaint Status Now
          </button>
          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setStep(1);
              setDescription('');
              setPhotoUrl('');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl font-semibold text-sm transition"
          >
            File Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-3xl mx-auto overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
            MBMC Public Grievance Redressal
          </span>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
            Step {step} of 4
          </span>
        </div>
        <h2 className="text-2xl font-black">Report a Water Supply Issue</h2>
        <p className="text-xs text-blue-100 mt-1">
          Directly connect with municipal pipeline inspectors, valve operators, and water test labs.
        </p>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {['Citizen Info', 'Location', 'Issue Details', 'Review'].map((title, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={title} className="text-center">
                <div
                  className={`h-1.5 rounded-full mb-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-400'
                      : isCurrent
                      ? 'bg-white'
                      : 'bg-white/20'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold block truncate ${
                    isCurrent ? 'text-white' : 'text-blue-200/70'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Citizen Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Step 1: Your Contact Information</span>
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
                    placeholder="e.g. Ramesh Patil"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mobile Number (For SMS Updates) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number (e.g. 9820123456)"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Complete Building & Flat Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, B-Wing, Radha Krishna CHS, Near Golden Nest Circle"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: Location Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Step 2: Grievance Location in Mira-Bhayandar</span>
              </h3>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Detecting...' : 'Auto-Detect Area'}</span>
              </button>
            </div>

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
                      setAreaId(first.id);
                      setLocality(first.localities[0] || '');
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
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    const a = zoneAreas.find((item) => item.id === e.target.value);
                    if (a && a.localities.length > 0) {
                      setLocality(a.localities[0]);
                    }
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  {zoneAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Specific Locality / Society / Pocket
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                {currentArea.localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Complaints in <strong>{currentArea.name}</strong> are directly monitored by MBMC {MBMC_ZONES.find((z) => z.id === zoneId)?.wardOffice.name}.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Issue Details */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Step 3: Select Issue Type & Description</span>
            </h3>

            {/* 10 Issue Type Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Issue Category (Click to Select)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = issueType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => handleIssueTypeSelect(cat)}
                      className={`p-3 rounded-xl border text-left transition transform hover:scale-101 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {cat.type}
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {cat.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the water problem (e.g., Since when is this happening? Color or odor? Any pipeline crack seen on street?)"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              {errors.description && (
                <p className="text-rose-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Photo Upload with Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Attach Photo Evidence (Optional, max 5MB)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition w-full sm:w-auto">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Choose Photo (JPG, PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoUrl && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow">
                    <img
                      src={photoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Step 4: Review Before Submitting to MBMC</span>
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-slate-500 block">Complainant:</span>
                  <strong className="text-slate-900 dark:text-white">{name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact:</span>
                  <strong className="text-slate-900 dark:text-white">+91 {phone}</strong>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 block">Location:</span>
                <strong className="text-slate-900 dark:text-white">
                  {address}, {locality}, {currentArea.name} ({MBMC_ZONES.find((z) => z.id === zoneId)?.name})
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-slate-500 block">Issue Category:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">{issueType}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Auto-Assigned Priority:</span>
                  <span className="inline-block px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800">
                    {priority} Priority
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">Description:</span>
                <p className="text-slate-800 dark:text-slate-200 italic">&ldquo;{description}&rdquo;</p>
              </div>

              {photoUrl && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Attached Photo:</span>
                  <img
                    src={photoUrl}
                    alt="Complaint attachment"
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              ✓ Upon clicking submit, a unique docket number will be generated, and an SMS notification will be transmitted to +91 {phone}.
            </div>
          </div>
        )}

        {/* Wizard Controls */}
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
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs"
            >
              Cancel
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl transition transform hover:scale-102 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Complaint to MBMC</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
