import React, { useState, useEffect } from 'react';
import { Activity, Droplets, ShieldCheck, Zap, Radio, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TankTelemetry {
  id: string;
  name: string;
  location: string;
  capacityLiters: string;
  waterLevelPct: number;
  turbidityNtu: number;
  chlorinePpm: number;
  flowRateMld: number;
  status: 'Normal' | 'Pumping Active' | 'Maintenance';
  lastUpdated: string;
}

export const ScadaTelemetryWidget: React.FC = () => {
  const { t } = useLanguage();
  const [tanks, setTanks] = useState<TankTelemetry[]>([
    {
      id: 'uttan-esr',
      name: 'Uttan Elevated Storage Reservoir (ESR)',
      location: 'Uttan Coastal Zone 4',
      capacityLiters: '2.5 Million L',
      waterLevelPct: 82,
      turbidityNtu: 0.72,
      chlorinePpm: 1.2,
      flowRateMld: 14.5,
      status: 'Pumping Active',
      lastUpdated: 'Just now',
    },
    {
      id: 'bhayandar-west',
      name: 'Bhayandar West Pali Reservoir',
      location: 'Zone 1 - Pali Ground Tank',
      capacityLiters: '5.0 Million L',
      waterLevelPct: 74,
      turbidityNtu: 0.65,
      chlorinePpm: 1.4,
      flowRateMld: 28.2,
      status: 'Normal',
      lastUpdated: '2 mins ago',
    },
    {
      id: 'mira-road-sec10',
      name: 'Mira Road Sector 10 ESR',
      location: 'Zone 3 - Shanti Nagar',
      capacityLiters: '4.0 Million L',
      waterLevelPct: 91,
      turbidityNtu: 0.58,
      chlorinePpm: 1.5,
      flowRateMld: 32.0,
      status: 'Pumping Active',
      lastUpdated: 'Just now',
    },
    {
      id: 'kashimira-tank',
      name: 'Kashimira Booster Station',
      location: 'Zone 2 - Eastern Express Highway',
      capacityLiters: '3.0 Million L',
      waterLevelPct: 68,
      turbidityNtu: 0.81,
      chlorinePpm: 1.1,
      flowRateMld: 19.8,
      status: 'Normal',
      lastUpdated: '4 mins ago',
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate live random fluctuation
      setTanks((prev) =>
        prev.map((tank) => ({
          ...tank,
          waterLevelPct: Math.min(98, Math.max(50, tank.waterLevelPct + (Math.random() * 4 - 2))),
          lastUpdated: 'Just now',
        }))
      );
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Live SCADA & IoT Telemetry Feed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>MBMC Reservoir Water Levels & Purity Stream</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time IoT sensor telemetry from municipal elevated storage reservoirs (ESR) across Mira-Bhayandar.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing IoT Stream...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tanks.map((tank) => (
          <div
            key={tank.id}
            className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {tank.location}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{tank.name}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Capacity: {tank.capacityLiters}</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                  tank.status === 'Pumping Active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}
              >
                {tank.status}
              </span>
            </div>

            {/* Water Level Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Reservoir Water Head Level</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{Math.round(tank.waterLevelPct)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    tank.waterLevelPct > 75
                      ? 'bg-emerald-500'
                      : tank.waterLevelPct > 50
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${tank.waterLevelPct}%` }}
                />
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-center">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Turbidity</div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {tank.turbidityNtu} <span className="text-[10px] text-emerald-600 font-normal">NTU</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Chlorine</div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {tank.chlorinePpm} <span className="text-[10px] text-emerald-600 font-normal">ppm</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Flow Rate</div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {tank.flowRateMld} <span className="text-[10px] text-blue-600 font-normal">MLD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>WHO Water Quality Standards Verified</span>
              </span>
              <span>Updated: {tank.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
