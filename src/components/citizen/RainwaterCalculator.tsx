import React, { useState } from 'react';
import { CloudRain, Home, Users, Sparkles, CheckCircle2, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RainwaterCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [roofArea, setRoofArea] = useState<number>(1200); // sq.ft
  const [familySize, setFamilySize] = useState<number>(4);
  const [locality, setLocality] = useState<string>('Uttan Coastal Zone');
  const [rainfallMm, setRainfallMm] = useState<number>(2400); // Mumbai annual avg ~2400mm
  const [calculated, setCalculated] = useState<boolean>(true);

  // Runoff coefficient for typical rooftop (concrete/tile ~0.85)
  const runoffCoeff = 0.85;
  // Annual harvest in liters = Roof area (sq m) * Rainfall (mm) * Runoff Coeff
  // 1 sq ft = 0.092903 sq m
  const roofAreaSqM = roofArea * 0.092903;
  const annualHarvestLiters = Math.round(roofAreaSqM * rainfallMm * runoffCoeff);
  const dailyHarvestLiters = Math.round(annualHarvestLiters / 365);
  const recommendedTankSize = Math.round(annualHarvestLiters * 0.1); // ~10% storage capacity

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>MBMC AI Sustainability Advisor & Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Rooftop Rainwater Harvesting & Conservation Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estimate your household annual rainwater potential, optimal storage tank sizing, and AI-powered conservation recommendations for Mira-Bhayandar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Parameters Form */}
        <div className="space-y-6 lg:col-span-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-600" />
            <span>Household Details</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rooftop Area (Square Feet): <span className="text-blue-600 font-black">{roofArea} sq.ft</span>
              </label>
              <input
                type="range"
                min="400"
                max="5000"
                step="50"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>400 sq.ft (Small Flat)</span>
                <span>2500 sq.ft (Bungalow)</span>
                <span>5000+ sq.ft (CHS Society)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Family / Household Members: <span className="text-blue-600 font-black">{familySize} Persons</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={familySize}
                onChange={(e) => setFamilySize(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                MBMC Locality / Zone:
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Uttan Coastal Zone">Zone 4: Uttan & Coastal Pocket</option>
                <option value="Bhayandar West">Zone 1: Bhayandar West (Pali / Navghar)</option>
                <option value="Bhayandar East">Zone 2: Bhayandar East (Indralok / Mhatre Nagar)</option>
                <option value="Mira Road Sector">Zone 3: Mira Road (Shanti Nagar / Kankia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Annual Rainfall (Mumbai Avg ~2400 mm): <span className="text-blue-600 font-black">{rainfallMm} mm</span>
              </label>
              <input
                type="number"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Results & AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-sky-700 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-sky-200 uppercase tracking-wider mb-1">Annual Harvest Potential</div>
              <div className="text-3xl font-black font-mono">
                {annualHarvestLiters.toLocaleString()} <span className="text-lg">Liters</span>
              </div>
              <div className="text-xs text-sky-100 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Based on {roofArea} sq.ft rooftop</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">Daily Average Yield</div>
              <div className="text-3xl font-black font-mono">
                {dailyHarvestLiters} <span className="text-lg">Liters/day</span>
              </div>
              <div className="text-xs text-emerald-100 mt-2 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-white" />
                <span>Covers {Math.round((dailyHarvestLiters / (familySize * 135)) * 100)}% of daily need</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Recommended Tank Size</div>
              <div className="text-3xl font-black font-mono">
                {recommendedTankSize.toLocaleString()} <span className="text-lg">Liters</span>
              </div>
              <div className="text-xs text-indigo-100 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Underground Sump + First Flush</span>
              </div>
            </div>
          </div>

          {/* AI Advisor Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950/40 p-6 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-4">
            <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>MBMC AI Water Conservation Advisory for {locality}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>First-Flush Diverter:</strong> Given coastal dust in Uttan and Bhayandar, install a first-flush diverter to discard the first 20 minutes of roof runoff before storing in your {recommendedTankSize.toLocaleString()}L tank.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Recharge Pit Integration:</strong> Excess rainwater exceeding {annualHarvestLiters.toLocaleString()}L can be routed directly to groundwater recharge borewells to prevent waterlogging during monsoon high tide.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>MBMC Tax Rebate:</strong> Property owners implementing certified rainwater harvesting systems in Mira-Bhayandar are eligible for a <strong>5% to 10% annual general tax rebate</strong> under MBMC civic bylaws.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
