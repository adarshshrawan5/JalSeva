import React, { useState } from 'react';
import { Driver } from '../../types';
import { MBMC_DRIVERS, MBMC_DEPOTS } from '../../data/mbmcData';
import { JalSevaLogo } from '../common/JalSevaLogo';
import { Truck, ArrowRight, ShieldCheck, Phone, Star, MapPin } from 'lucide-react';

interface DriverLoginProps {
  onLoginSuccess: (driver: Driver) => void;
  onBackToHome: () => void;
}

export const DriverLogin: React.FC<DriverLoginProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [vehicleInput, setVehicleInput] = useState('MH-04-AB-1234');
  const [pinInput, setPinInput] = useState('1234');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVehicle = vehicleInput.trim().toUpperCase();
    const found = MBMC_DRIVERS.find(
      (d) => d.vehicleNumber.toUpperCase() === cleanVehicle
    ) || MBMC_DRIVERS[0];
    onLoginSuccess(found);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <JalSevaLogo size="md" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
            Municipal Tanker Fleet Driver Gateway
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Tanker Driver Portal
          </h2>
          <p className="text-xs text-slate-500">
            For MBMC authorized emergency water tanker drivers. View assigned trips, navigate to citizen locations, and confirm deliveries.
          </p>
        </div>

        {/* 1-Click Driver Profile Quick Switchers */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick 1-Click Driver Login:
          </label>
          <div className="space-y-2">
            {MBMC_DRIVERS.slice(0, 4).map((driver) => {
              const depot = MBMC_DEPOTS.find((d) => d.id === driver.depotId);
              return (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => onLoginSuccess(driver)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#ea580c] dark:hover:border-amber-400 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#fd7e14] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🚚
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-slate-900 dark:text-white group-hover:text-[#ea580c] transition">
                          {driver.name}
                        </strong>
                        <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border text-slate-700 dark:text-slate-300">
                          {driver.vehicleNumber}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{depot?.name.split(' ')[0]} Depot</span>
                        <span>•</span>
                        <span>{driver.capacity.toLocaleString()}L</span>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">⭐ {driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#ea580c] group-hover:translate-x-1 transition shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 uppercase font-bold text-[10px]">
              Or Login with Vehicle Reg No
            </span>
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Vehicle Registration Number
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value)}
                placeholder="e.g. MH-04-AB-1234"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-white uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Driver 4-Digit Security PIN
            </label>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              maxLength={4}
              required
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-center text-lg tracking-widest text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Access Driver Dashboard</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Return to JalSeva Portal Home
          </button>
        </div>
      </div>
    </div>
  );
};
