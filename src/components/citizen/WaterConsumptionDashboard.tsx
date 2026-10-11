import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MeterReadingRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  IndianRupee,
  Calendar,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  FileText,
  ChevronRight,
  PlusCircle,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface WaterConsumptionDashboardProps {
  onNavigateToMeterReader?: () => void;
  compact?: boolean; // When rendered inside Profile modal
}

interface MonthlyDataPoint {
  id: string;
  monthKey: string; // "2026-10"
  monthLabel: string; // "Oct 2026"
  shortMonth: string; // "Oct"
  readingDate: string; // "2026-10-09"
  consumptionKl: number;
  consumptionLiters: number;
  billAmount: number;
  previousReadingKl: number;
  currentReadingKl: number;
  slab1Kl: number;
  slab2Kl: number;
  slab3Kl: number;
  slab1Cost: number;
  slab2Cost: number;
  slab3Cost: number;
  sewerageCess: number;
  meterRent: number;
  status: 'Submitted' | 'Verified' | 'Audited';
  meterSerialNumber: string;
  consumerNumber: string;
  dailyAvgLiters: number;
}

export const WaterConsumptionDashboard: React.FC<WaterConsumptionDashboardProps> = ({
  onNavigateToMeterReader,
  compact = false,
}) => {
  const { language } = useLanguage();
  const [readings, setReadings] = useState<MeterReadingRecord[]>(() =>
    storageService.getMeterReadings()
  );
  const [metricView, setMetricView] = useState<'consumption' | 'bill' | 'slabs'>('consumption');
  const [timeRange, setTimeRange] = useState<'all' | '6m' | '3m'>('6m');
  const [selectedRecord, setSelectedRecord] = useState<MeterReadingRecord | null>(null);

  // Sync when storage updates (e.g. user adds reading in WaterMeterReader)
  useEffect(() => {
    const handleStorageUpdate = () => {
      setReadings(storageService.getMeterReadings());
    };
    window.addEventListener('aqua_connect_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('aqua_connect_storage_update', handleStorageUpdate);
    };
  }, []);

  // Format month name
  const formatMonthName = (dateStr: string, format: 'short' | 'full' = 'short') => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', {
        month: format === 'short' ? 'short' : 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Transform readings into chronological monthly series
  const monthlyData: MonthlyDataPoint[] = useMemo(() => {
    // Sort readings by date ascending
    const sorted = [...readings].sort(
      (a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
    );

    return sorted.map((r) => {
      const kl = r.consumptionKl;
      const slab1Kl = Math.min(kl, 15);
      const slab2Kl = Math.min(Math.max(0, kl - 15), 15);
      const slab3Kl = Math.max(0, kl - 30);

      const d = new Date(r.readingDate + 'T00:00:00');
      const shortMonth = d.toLocaleDateString('en-IN', { month: 'short' });
      const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const monthKey = r.readingDate.slice(0, 7);

      return {
        id: r.id,
        monthKey,
        monthLabel,
        shortMonth,
        readingDate: r.readingDate,
        consumptionKl: kl,
        consumptionLiters: Math.round(kl * 1000),
        billAmount: r.estimatedBillAmount,
        previousReadingKl: r.previousReadingKl,
        currentReadingKl: r.currentReadingKl,
        slab1Kl,
        slab2Kl,
        slab3Kl,
        slab1Cost: r.tariffBreakdown?.slab1Amount ?? slab1Kl * 6.5,
        slab2Cost: r.tariffBreakdown?.slab2Amount ?? slab2Kl * 10,
        slab3Cost: r.tariffBreakdown?.slab3Amount ?? slab3Kl * 16,
        sewerageCess: r.tariffBreakdown?.sewerageCess ?? 0,
        meterRent: r.tariffBreakdown?.meterRent ?? 40,
        status: r.status,
        meterSerialNumber: r.meterSerialNumber,
        consumerNumber: r.consumerNumber,
        dailyAvgLiters: Math.round((kl * 1000) / 30),
      };
    });
  }, [readings]);

  // Filtered dataset for chart
  const filteredChartData = useMemo(() => {
    if (timeRange === '3m') {
      return monthlyData.slice(-3);
    }
    if (timeRange === '6m') {
      return monthlyData.slice(-6);
    }
    return monthlyData;
  }, [monthlyData, timeRange]);

  // Summary KPIs based on latest record & historical averages
  const stats = useMemo(() => {
    if (monthlyData.length === 0) {
      return {
        latestKl: 0,
        prevKl: 0,
        changePercent: 0,
        avgKl: 0,
        latestBill: 0,
        dailyLpcd: 0,
        highestKlMonth: 'N/A',
        lowestKlMonth: 'N/A',
      };
    }

    const latest = monthlyData[monthlyData.length - 1];
    const prev = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;

    let changePercent = 0;
    if (prev && prev.consumptionKl > 0) {
      changePercent = Number(
        (((latest.consumptionKl - prev.consumptionKl) / prev.consumptionKl) * 100).toFixed(1)
      );
    }

    const sumKl = monthlyData.reduce((acc, curr) => acc + curr.consumptionKl, 0);
    const avgKl = Number((sumKl / monthlyData.length).toFixed(1));

    // Daily per capita based on 5 members in Mira-Bhayandar household
    const dailyLpcd = Math.round(latest.dailyAvgLiters / 5);

    let maxRec = monthlyData[0];
    let minRec = monthlyData[0];
    monthlyData.forEach((m) => {
      if (m.consumptionKl > maxRec.consumptionKl) maxRec = m;
      if (m.consumptionKl < minRec.consumptionKl) minRec = m;
    });

    return {
      latestKl: latest.consumptionKl,
      prevKl: prev ? prev.consumptionKl : 0,
      changePercent,
      avgKl,
      latestBill: latest.billAmount,
      dailyLpcd,
      highestKlMonth: `${maxRec.monthLabel} (${maxRec.consumptionKl} kL)`,
      lowestKlMonth: `${minRec.monthLabel} (${minRec.consumptionKl} kL)`,
      latestRecord: latest,
    };
  }, [monthlyData]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 backdrop-blur-md max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-sky-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>{data.monthLabel}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                data.status === 'Audited'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                  : data.status === 'Verified'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-700'
              }`}
            >
              {data.status}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>Meter Dial Reading:</span>
              <span className="font-mono text-white">
                {data.previousReadingKl} → {data.currentReadingKl} kL
              </span>
            </div>

            <div className="flex justify-between items-center font-bold text-sky-400">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" /> Net Usage:
              </span>
              <span className="text-sm font-mono text-white">
                {data.consumptionKl} kL{' '}
                <span className="text-xs text-sky-300">({data.consumptionLiters.toLocaleString()} L)</span>
              </span>
            </div>

            <div className="flex justify-between items-center font-bold text-emerald-400">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> Municipal Bill:
              </span>
              <span className="font-mono text-white text-sm">₹{data.billAmount.toFixed(2)}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Slab 1 (0-15 kL @ ₹6.5):</span>
                <span className="font-mono text-slate-300">₹{data.slab1Cost.toFixed(2)}</span>
              </div>
              {data.slab2Kl > 0 && (
                <div className="flex justify-between">
                  <span>Slab 2 (16-30 kL @ ₹10):</span>
                  <span className="font-mono text-slate-300">₹{data.slab2Cost.toFixed(2)}</span>
                </div>
              )}
              {data.slab3Kl > 0 && (
                <div className="flex justify-between text-rose-300">
                  <span>Slab 3 (&gt;30 kL @ ₹16):</span>
                  <span className="font-mono">₹{data.slab3Cost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Cess &amp; Meter Rent:</span>
                <span className="font-mono">₹{(data.sewerageCess + data.meterRent).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${compact ? '' : 'p-1'}`}>
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span>MBMC Citizen Water Telemetry</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Telescopic Tariff</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
            <span>Water Consumption Dashboard</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              मासिक वापर
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time monthly water usage trends calculated directly from logged optical meter dial readings.
          </p>
        </div>

        {/* Action & Filter Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange('3m')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeRange === '3m'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeRange === '6m'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Logs
            </button>
          </div>

          {onNavigateToMeterReader && (
            <button
              type="button"
              onClick={onNavigateToMeterReader}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Meter Dial</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Latest Usage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Latest Month Usage
            </span>
            {stats.changePercent !== 0 && (
              <span
                className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  stats.changePercent > 0
                    ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
              >
                {stats.changePercent > 0 ? (
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-emerald-500" />
                )}
                <span>
                  {stats.changePercent > 0 ? '+' : ''}
                  {stats.changePercent}%
                </span>
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {stats.latestKl}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">kL</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ≈ {(stats.latestKl * 1000).toLocaleString()} Liters recorded
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>6-mo Avg: {stats.avgKl} kL</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {stats.latestKl <= 15 ? 'Subsidized' : stats.latestKl <= 30 ? 'Normal Tier' : 'High Usage'}
            </span>
          </div>
        </div>

        {/* KPI 2: Estimated Bill */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              Latest Water Bill
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
              MBMC Tariff
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">₹</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {stats.latestBill.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Includes 20% Sewerage &amp; ₹40 Rent
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Per kL Effective:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{(stats.latestBill / (stats.latestKl || 1)).toFixed(2)}/kL
            </span>
          </div>
        </div>

        {/* KPI 3: Daily LPCD Benchmark */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
              Per Capita Usage
            </span>
            <span className="text-[10px] text-slate-400">CPHEEO Norm</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {stats.dailyLpcd}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">LPCD</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Liters Per Capita / Day (5 members)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Urban Target: 135 LPCD</span>
            <span
              className={`font-bold ${
                stats.dailyLpcd <= 135
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.dailyLpcd <= 160
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {stats.dailyLpcd <= 135 ? 'Highly Conserved' : 'Within Range'}
            </span>
          </div>
        </div>

        {/* KPI 4: Tariff Slab Efficiency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Current Slab Tier
            </span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded-md">
              Slab 2
            </span>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              16 – 30 kL Band
            </div>
            {/* Progress bar to 30 kL */}
            <div className="mt-2 space-y-1">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((stats.latestKl / 30) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 kL</span>
                <span>15 kL</span>
                <span>30 kL limit</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Headroom to Slab 3:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {Math.max(0, Number((30 - stats.latestKl).toFixed(1)))} kL safe
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Main Visual Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Chart View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {metricView === 'consumption'
                  ? 'Monthly Water Consumption Trend (kL)'
                  : metricView === 'bill'
                  ? 'Monthly Water Billing Trend (₹ INR)'
                  : 'Telescopic Tariff Slab Composition (kL)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {metricView === 'consumption'
                ? 'Historical kiloliter usage with MBMC subsidized slab thresholds (15 kL & 30 kL)'
                : metricView === 'bill'
                ? 'Estimated billing breakdown based on official MBMC per-kL municipal rates'
                : 'Proportion of monthly water billed under Lifeline (₹6.5), Standard (₹10), and High (₹16) tiers'}
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setMetricView('consumption')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                metricView === 'consumption'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Usage (kL)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricView('bill')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                metricView === 'bill'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Bill (₹)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricView('slabs')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                metricView === 'slabs'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Slabs</span>
            </button>
          </div>
        </div>

        {/* Recharts Chart Rendering Area */}
        <div className="w-full h-72 sm:h-80 min-h-[280px]">
          {metricView === 'consumption' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredChartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterFlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="shortMonth"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" kL"
                  domain={[0, (dataMax: number) => Math.max(35, Math.ceil(dataMax * 1.2))]}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine
                  y={15}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Slab 1 (₹6.5)',
                    position: 'insideTopRight',
                    fill: '#10b981',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
                <ReferenceLine
                  y={30}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Slab 2 Cap (30 kL)',
                    position: 'insideTopRight',
                    fill: '#f59e0b',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumptionKl"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#waterFlowGradient)"
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#0369a1', stroke: '#ffffff', strokeWidth: 2 }}
                  name="Consumption (kL)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {metricView === 'bill' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="shortMonth"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" ₹"
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="billAmount"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  name="Municipal Bill (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {metricView === 'slabs' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="shortMonth"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" kL"
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={10}
                />
                <Bar
                  dataKey="slab1Kl"
                  name="Slab 1 (0-15 kL @ ₹6.5)"
                  fill="#0284c7"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="slab2Kl"
                  name="Slab 2 (16-30 kL @ ₹10)"
                  fill="#f59e0b"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="slab3Kl"
                  name="Slab 3 (>30 kL @ ₹16)"
                  fill="#ef4444"
                  stackId="a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart Legend / Tariff Explanation Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800 dark:text-slate-200">
                Slab 1: 0 – 15 kL (₹6.50/kL)
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Subsidized lifeline quota for basic domestic hygiene & drinking.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800 dark:text-slate-200">
                Slab 2: 16 – 30 kL (₹10.00/kL)
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard residential consumption tier for medium urban families.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800 dark:text-slate-200">
                Slab 3: &gt; 30 kL (₹16.00/kL)
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Conservation penalty rate to deter wastage & unmetered runoffs.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Logged Meter Readings History Log Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Logged Meter Reading Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified monthly records logged via optical dial scan or municipal meter inspection.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {monthlyData.length} records on file
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Billing Cycle</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Meter Dial (Prev → Curr)</th>
                <th className="py-3 px-3">Consumption</th>
                <th className="py-3 px-3">Bill Amount</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...monthlyData].reverse().map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                >
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {item.monthLabel}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {item.readingDate}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.previousReadingKl} kL → <span className="font-bold text-blue-600 dark:text-blue-400">{item.currentReadingKl} kL</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{item.consumptionKl} kL</span>{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({item.consumptionLiters.toLocaleString()} L)
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{item.billAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Audited'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                          : item.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const rec = readings.find((r) => r.id === item.id) || null;
                        setSelectedRecord(rec);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <span>Breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Breakdown Modal for Selected Record */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Municipal Bill Docket: {selectedRecord.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Consumer Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedRecord.consumerNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Meter Serial Number:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedRecord.meterSerialNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Reading Date:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedRecord.readingDate}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold text-blue-900 dark:text-blue-200">
                  <span>Consumption Recorded:</span>
                  <span className="font-mono text-sm">{selectedRecord.consumptionKl} kL</span>
                </div>
                <div className="flex justify-between text-[11px] text-blue-700 dark:text-blue-300">
                  <span>Previous Dial: {selectedRecord.previousReadingKl} kL</span>
                  <span>Current Dial: {selectedRecord.currentReadingKl} kL</span>
                </div>
              </div>

              {/* Tariff Breakdown Slabs */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block">
                  MBMC Telescopic Tariff Split
                </span>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Slab 1 (0-15 kL @ ₹6.50/kL):</span>
                    <span className="font-mono">
                      ₹{selectedRecord.tariffBreakdown?.slab1Amount?.toFixed(2) ?? '97.50'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slab 2 (16-30 kL @ ₹10.00/kL):</span>
                    <span className="font-mono">
                      ₹{selectedRecord.tariffBreakdown?.slab2Amount?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slab 3 (&gt;30 kL @ ₹16.00/kL):</span>
                    <span className="font-mono">
                      ₹{selectedRecord.tariffBreakdown?.slab3Amount?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sewerage Cess (20%):</span>
                    <span className="font-mono">
                      ₹{selectedRecord.tariffBreakdown?.sewerageCess?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Fixed Meter Rent:</span>
                    <span className="font-mono">
                      ₹{selectedRecord.tariffBreakdown?.meterRent?.toFixed(2) ?? '40.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                    <span>Total Assessed Bill:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{selectedRecord.estimatedBillAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Close Docket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
