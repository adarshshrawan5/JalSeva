import React from 'react';
import { MBMC_WORKERS, MBMC_DRIVERS, MBMC_DEPOTS } from '../../data/mbmcData';
import { Users, Truck, Wrench, Building, Phone, Star, ShieldCheck } from 'lucide-react';

export const AdminStaffManager: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          MBMC Water Works Human Resources
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Field Engineers, Tanker Drivers & Depot Officers
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct operational roster of municipal water inspectors, tanker fleet drivers, and depot supervisors.
        </p>
      </div>

      {/* Section 1: Field Plumbers & Valve Operators */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span>Field Plumbers & Pipeline Inspectors ({MBMC_WORKERS.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MBMC_WORKERS.map((worker) => (
            <div
              key={worker.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {worker.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {worker.zoneId.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div>Specialization: <strong className="text-slate-900 dark:text-white">{worker.specialization}</strong></div>
                <div>Completed Jobs: <strong className="text-slate-900 dark:text-white">{worker.completedTotal}</strong></div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{worker.rating} / 5.0 Rating</span>
                </div>
              </div>

              <div className="pt-2 border-t text-xs">
                <a
                  href={`tel:${worker.phone}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{worker.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Municipal Tanker Drivers */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#ea580c]" />
          <span>Municipal Tanker Fleet Drivers ({MBMC_DRIVERS.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MBMC_DRIVERS.map((driver) => (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {driver.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    driver.currentStatus === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  ● {driver.currentStatus}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                <div>Vehicle: <strong className="text-slate-900 dark:text-white">{driver.vehicleNumber}</strong></div>
                <div>Capacity: {driver.capacity.toLocaleString()} Liters</div>
                <div>Deliveries Today: {driver.deliveriesToday}</div>
              </div>

              <div className="pt-2 border-t text-xs">
                <a
                  href={`tel:${driver.phone}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{driver.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Depot Incharges */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-600" />
          <span>Water Depots & Supervisory Officers ({MBMC_DEPOTS.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MBMC_DEPOTS.map((depot) => (
            <div
              key={depot.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm text-slate-900 dark:text-white">{depot.name}</strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {depot.availableTankers} / {depot.totalTankers} Tankers
                </span>
              </div>
              <p className="text-slate-500">{depot.address}</p>
              <div className="pt-2 border-t text-slate-700 dark:text-slate-300">
                In-Charge: <strong>{depot.managerName}</strong> ({depot.phone})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
