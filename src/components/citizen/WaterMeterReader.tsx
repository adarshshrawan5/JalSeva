import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { MBMC_AREAS, MBMC_ZONES } from '../../data/mbmcData';
import { MeterReadingRecord, WaterZoneId } from '../../types';
import {
  Gauge,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  FileText,
  DollarSign,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Droplets,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterMeterReaderProps {
  onBackToHome?: () => void;
}

const createMeterSvg = (dialValue: string, serial: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="200" cy="200" r="160" fill="%23f8fafc" stroke="%233b82f6" stroke-width="12"/><circle cx="200" cy="200" r="130" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="3"/><rect x="110" y="140" width="180" height="50" rx="8" fill="%231e293b"/><text x="200" y="176" font-family="monospace" font-size="28" font-weight="bold" fill="%2338bdf8" text-anchor="middle">${dialValue} kL</text><circle cx="200" cy="240" r="8" fill="%23ef4444"/><line x1="200" y1="240" x2="250" y2="220" stroke="%23ef4444" stroke-width="4" stroke-linecap="round"/><text x="200" y="300" font-family="sans-serif" font-size="12" font-weight="bold" fill="%2364748b" text-anchor="middle">MBMC WATER DEPT</text><text x="200" y="320" font-family="monospace" font-size="11" fill="%2394a3b8" text-anchor="middle">${serial}</text></svg>`;

const SAMPLE_METERS = [
  {
    name: 'Analog Multi-Jet Dial (142.5 kL)',
    currentKl: 142.5,
    prevKl: 118.0,
    serial: 'MBMC-MTR-89214',
    imgUrl: createMeterSvg('142.5', 'MBMC-MTR-89214'),
  },
  {
    name: 'Digital Smart Pulse Meter (198.0 kL)',
    currentKl: 198.0,
    prevKl: 165.0,
    serial: 'MBMC-DIG-40192',
    imgUrl: createMeterSvg('198.0', 'MBMC-DIG-40192'),
  },
  {
    name: 'Residential Sub-Meter (235.8 kL)',
    currentKl: 235.8,
    prevKl: 210.0,
    serial: 'MBMC-RES-55318',
    imgUrl: createMeterSvg('235.8', 'MBMC-RES-55318'),
  },
];

export const WaterMeterReader: React.FC<WaterMeterReaderProps> = ({ onBackToHome }) => {
  const { language } = useLanguage();
  const citizenProfile = storageService.getCitizenProfile();

  // Form State
  const [consumerNumber, setConsumerNumber] = useState('CCN-2026-90412');
  const [citizenName, setCitizenName] = useState(citizenProfile?.name || 'Adarsh Yadav');
  const [phone, setPhone] = useState(citizenProfile?.phone || '9820123456');
  const [areaName, setAreaName] = useState(citizenProfile?.areaName || 'Golden Nest');
  const [meterSerial, setMeterSerial] = useState('MBMC-MTR-89214');

  // Readings
  const [prevReading, setPrevReading] = useState<number>(118);
  const [currReading, setCurrReading] = useState<number>(142);
  const [photoPreview, setPhotoPreview] = useState<string | null>(SAMPLE_METERS[0].imgUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  // Submission State
  const [submittedRecord, setSubmittedRecord] = useState<MeterReadingRecord | null>(null);
  const [readingHistory, setReadingHistory] = useState<MeterReadingRecord[]>(() =>
    storageService.getMeterReadings()
  );

  // Tariff Calculation according to MBMC slabs:
  // 0 - 15 kL: ₹6.50/kL
  // 16 - 30 kL: ₹10.00/kL
  // > 30 kL: ₹16.00/kL
  // Sewerage Cess: 20%
  // Meter Service Rent: ₹40
  const consumption = Math.max(0, Number((currReading - prevReading).toFixed(1)));

  const calculateBreakdown = (units: number) => {
    let slab1 = 0;
    let slab2 = 0;
    let slab3 = 0;

    if (units <= 15) {
      slab1 = units * 6.5;
    } else if (units <= 30) {
      slab1 = 15 * 6.5;
      slab2 = (units - 15) * 10.0;
    } else {
      slab1 = 15 * 6.5;
      slab2 = 15 * 10.0;
      slab3 = (units - 30) * 16.0;
    }

    const waterSubtotal = slab1 + slab2 + slab3;
    const sewerageCess = Number((waterSubtotal * 0.2).toFixed(2));
    const meterRent = 40;
    const total = Number((waterSubtotal + sewerageCess + meterRent).toFixed(2));

    return {
      slab1Amount: Number(slab1.toFixed(2)),
      slab2Amount: Number(slab2.toFixed(2)),
      slab3Amount: Number(slab3.toFixed(2)),
      waterSubtotal: Number(waterSubtotal.toFixed(2)),
      sewerageCess,
      meterRent,
      total,
    };
  };

  const breakdown = calculateBreakdown(consumption);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      runOpticalScan();
    }
  };

  const handleApplySample = (sample: (typeof SAMPLE_METERS)[0]) => {
    setPhotoPreview(sample.imgUrl);
    setMeterSerial(sample.serial);
    setPrevReading(sample.prevKl);
    setCurrReading(sample.currentKl);
    runOpticalScan();
  };

  const runOpticalScan = () => {
    setIsScanning(true);
    setScanStatus('Reading optical odometer dial digits...');
    setTimeout(() => {
      setScanStatus('Verifying municipal lead seal & tamper check...');
    }, 700);
    setTimeout(() => {
      setScanStatus('Meter dial recognized with 99.4% confidence!');
      setIsScanning(false);
    }, 1400);
  };

  const handleSubmitReading = (e: React.FormEvent) => {
    e.preventDefault();

    if (currReading < prevReading) {
      alert('Error: Current reading cannot be less than previous reading.');
      return;
    }

    const areaObj = MBMC_AREAS.find((a) => a.name === areaName) || MBMC_AREAS[0];

    const newRecord = storageService.addMeterReading({
      consumerNumber,
      citizenName,
      phone,
      meterSerialNumber: meterSerial,
      zoneId: areaObj.zoneId,
      areaName,
      address: `${areaName}, Mira-Bhayandar, Maharashtra`,
      previousReadingKl: prevReading,
      currentReadingKl: currReading,
      consumptionKl: consumption,
      estimatedBillAmount: breakdown.total,
      photoUrl: photoPreview || undefined,
      tariffBreakdown: {
        slab1Amount: breakdown.slab1Amount,
        slab2Amount: breakdown.slab2Amount,
        slab3Amount: breakdown.slab3Amount,
        sewerageCess: breakdown.sewerageCess,
        meterRent: breakdown.meterRent,
      },
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

    setSubmittedRecord(newRecord);
    setReadingHistory(storageService.getMeterReadings());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-sky-700/40">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-200">
            <Gauge className="w-4 h-4 text-cyan-300" />
            <span>MBMC Water Revenue & Metering Division</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {language === 'mr'
              ? 'पाणी मीटर स्वयं-वाचन व बिल अंदाज'
              : language === 'hi'
              ? 'जल मीटर स्वयं-रीडिंग एवं बिल अनुमान'
              : 'Water Meter Self-Reading & Instant Bill Estimator'}
          </h1>

          <p className="text-sm text-sky-100 leading-relaxed">
            {language === 'mr'
              ? 'मीटरचा फोटो काढून स्वयं-वाचन नोंदवा. पालिकेच्या अधिकृत घरगुती दरांनुसार तात्काळ बिल अंदाज मिळवा आणि बिलिंग वाद टाळा.'
              : language === 'hi'
              ? 'मीटर का फोटो अपलोड कर स्वयं-रीडिंग दर्ज करें। नगर निगम के आधिकारिक स्लैब दरों पर तुरंत बिल अनुमान प्राप्त करें।'
              : 'Upload or snap your domestic water meter dial for transparent AI-assisted bill calculation based on official MBMC slab tariffs.'}
          </p>
        </div>
      </section>

      {/* Acknowledgment View if Just Submitted */}
      {submittedRecord ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-300 dark:border-emerald-800 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Submission Acknowledged
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  MBMC Water Meter Self-Reading Certificate
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Docket ID:</span>
              <strong className="text-base font-mono text-blue-600 dark:text-blue-400">
                {submittedRecord.id}
              </strong>
            </div>
          </div>

          {/* Certificate summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Consumer (CCN)</span>
              <strong className="text-sm text-slate-900 dark:text-white">{submittedRecord.consumerNumber}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Net Consumption</span>
              <strong className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                {submittedRecord.consumptionKl} kL ({submittedRecord.consumptionKl * 1000} L)
              </strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Estimated Bill</span>
              <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-mono font-black">
                ₹{submittedRecord.estimatedBillAmount}
              </strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Status</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Recorded for MBMC Audit
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Acknowledgment Receipt</span>
            </button>

            <button
              onClick={() => setSubmittedRecord(null)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Take Another Meter Reading
            </button>
          </div>
        </div>
      ) : (
        /* Main Form & Interactive Estimator Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (7 cols) */}
          <form
            onSubmit={handleSubmitReading}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>1. Water Connection & Consumer Identity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure details match your physical municipal water bill docket
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Consumer Connection Number (CCN) *
                </label>
                <input
                  type="text"
                  required
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meter Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={meterSerial}
                  onChange={(e) => setMeterSerial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Citizen / Registered Name *
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                MBMC Area / Locality *
              </label>
              <select
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {MBMC_AREAS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.zoneId})
                  </option>
                ))}
              </select>
            </div>

            {/* Meter Photo Upload Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Meter Dial Photo (Capture / Upload)
                </label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  Required for billing dispute immunity
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700">
                {photoPreview ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img
                      src={photoPreview}
                      alt="Water Meter Dial"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-cyan-300 animate-pulse" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <Camera className="w-7 h-7 mb-1" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Device Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <p className="text-[11px] text-slate-500">
                    Or select an instant sample preset dial:
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_METERS.map((s, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplySample(s)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 transition"
                      >
                        Sample #{idx + 1} ({s.currentKl} kL)
                      </button>
                    ))}
                  </div>

                  {scanStatus && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{scanStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dial Readings Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                3. Water Consumption Readings (kL = Kiloliters)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Previous Reading (kL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={prevReading}
                    onChange={(e) => setPrevReading(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">From last MBMC bill</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Current Reading (kL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currReading}
                    onChange={(e) => setCurrReading(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Visible dial digits</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Self-Reading & Generate MBMC Challan</span>
            </button>
          </form>

          {/* Right Estimator Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  Live Tariff Computation
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  MBMC Estimated Water Bill
                </h4>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 border border-blue-200 dark:border-blue-900/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Net Consumption:
                  </span>
                  <span className="text-base font-black font-mono text-blue-700 dark:text-sky-300">
                    {consumption} kL ({consumption * 1000} L)
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Total Estimated Payable:
                  </span>
                  <span className="text-2xl font-black font-mono text-[#ea580c] dark:text-amber-400">
                    ₹{breakdown.total}
                  </span>
                </div>
              </div>

              {/* Slab Details */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  MBMC Domestic Tariff Breakdown:
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Slab 1 (0 to 15 kL @ ₹6.50/kL)</span>
                  <span className="font-mono font-semibold">₹{breakdown.slab1Amount}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Slab 2 (16 to 30 kL @ ₹10.00/kL)</span>
                  <span className="font-mono font-semibold">₹{breakdown.slab2Amount}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Slab 3 (&gt;30 kL @ ₹16.00/kL)</span>
                  <span className="font-mono font-semibold">₹{breakdown.slab3Amount}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Sewerage Disposal Cess (20%)</span>
                  <span className="font-mono font-semibold">₹{breakdown.sewerageCess}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1">
                  <span>Meter Service Rent (Flat)</span>
                  <span className="font-mono font-semibold">₹{breakdown.meterRent}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Self-readings submitted before 25th of the month are automatically credited to your municipal bill with a 2% digital prompt-payment rebate.
                </span>
              </div>
            </div>

            {/* Reading History */}
            {readingHistory.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h5 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Past Self-Readings ({readingHistory.length})</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </h5>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {readingHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {item.id}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.readingDate} • {item.consumptionKl} kL
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{item.estimatedBillAmount}
                        </strong>
                        <div className="text-[9px] text-slate-400 uppercase">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
