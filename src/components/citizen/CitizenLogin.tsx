import React, { useState } from 'react';
import { JalSevaLogo } from '../common/JalSevaLogo';
import { User, Phone, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface CitizenLoginProps {
  onLoginSuccess: (citizenPhone: string, citizenName: string) => void;
  onContinueAsGuest: () => void;
  onBackToHome: () => void;
}

export const CitizenLogin: React.FC<CitizenLoginProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  onBackToHome,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const demoCitizens = [
    {
      name: 'Sunil Merchant',
      phone: '9820544123',
      area: 'Jesal Park (Bhayandar East)',
      activeItem: '🚚 Active Tanker Delivery In Transit',
    },
    {
      name: 'Rajesh Kumar',
      phone: '9820123456',
      area: 'Golden Nest (Bhayandar East)',
      activeItem: '🛠️ Active Grievance (Low Water Pressure)',
    },
    {
      name: 'Fatima Shaikh',
      phone: '9870188992',
      area: 'Naya Nagar (Mira Road East)',
      activeItem: '🧪 Active Grievance (Water Sample Inspection)',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    onLoginSuccess(cleanPhone, nameInput || `Citizen (${cleanPhone.slice(-4)})`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <JalSevaLogo size="md" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Citizen Resident Portal
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Log In as Resident
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with your mobile number to view your active water tanker bookings, file complaints, and check your neighborhood timetable.
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick 1-Click Resident Login:
          </label>
          <div className="space-y-2">
            {demoCitizens.map((citizen) => (
              <button
                key={citizen.phone}
                type="button"
                onClick={() => onLoginSuccess(citizen.phone, citizen.name)}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                      {citizen.name}
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500">
                      +91 {citizen.phone}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {citizen.area}
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 uppercase font-bold text-[10px]">
              Or Login With Your Number
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Anjali Sharma"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              10-Digit Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="98XXXXXXXX"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Proceed to Citizen Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 flex flex-col items-center gap-2 text-xs">
          <button
            onClick={onContinueAsGuest}
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 underline"
          >
            Continue as Guest Resident (No Login Needed)
          </button>
          <button
            onClick={onBackToHome}
            className="text-slate-400 hover:text-slate-600"
          >
            ← Return to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
