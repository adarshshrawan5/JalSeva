import React, { useState, useEffect, useMemo } from 'react';
import { JalSevaLogo } from './JalSevaLogo';
import { ThemeToggle } from './ThemeToggle';
import { OutageAlert, SystemStats, WaterZone, SubArea } from '../../types';
import { MBMC_ZONES, MBMC_AREAS, MBMC_DEPOTS } from '../../data/mbmcData';
import { storageService } from '../../services/storageService';
import { calculateHaversineDistance, findNearestDepot } from '../../services/distanceService';
import {
  Users,
  Truck,
  Shield,
  ArrowRight,
  PhoneCall,
  Calendar,
  AlertCircle,
  Search,
  Droplets,
  Activity,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  ChevronRight,
  Navigation,
  Compass,
  Check,
  RefreshCw,
  Award,
  FlaskConical,
  Filter,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import heroWaterPlantImg from '../../assets/images/hero_water_infrastructure_1791556389961.jpg';
import tankerFleetImg from '../../assets/images/card_tanker_fleet_1791556405148.jpg';
import waterLabImg from '../../assets/images/card_water_testing_lab_1791556421425.jpg';

// Authentic civic photo assets generated for MBMC
const HERO_WATER_PLANT_IMG = heroWaterPlantImg || '/images/hero_water_infrastructure.jpg';
const TANKER_FLEET_IMG = tankerFleetImg || '/images/card_tanker_fleet.jpg';
const WATER_LAB_IMG = waterLabImg || '/images/card_water_testing_lab.jpg';

interface MainLandingPageProps {
  stats: SystemStats;
  alerts: OutageAlert[];
  zones: WaterZone[];
  onSelectRole: (role: 'citizen' | 'driver' | 'admin' | 'worker') => void;
  onOpenQuickSchedule: (zoneId?: string) => void;
  onOpenQuickTanker: (areaName?: string) => void;
  onOpenQuickComplaint: (areaName?: string) => void;
  onSelectAlert: (alert: OutageAlert) => void;
}

export const MainLandingPage: React.FC<MainLandingPageProps> = ({
  stats,
  alerts,
  zones,
  onSelectRole,
  onOpenQuickSchedule,
  onOpenQuickTanker,
  onOpenQuickComplaint,
  onSelectAlert,
}) => {
  const [quickZoneId, setQuickZoneId] = useState('zone-1');
  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const selectedZone = zones.find((z) => z.id === quickZoneId) || zones[0];

  // Geolocation & Locality Detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);
  const [searchLocalityQuery, setSearchLocalityQuery] = useState('');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const [detectedData, setDetectedData] = useState<{
    coords: [number, number];
    area: SubArea;
    zone: WaterZone;
    distanceKm: number;
    source: 'gps' | 'manual' | 'saved';
    timestamp: string;
  }>(() => {
    // Default to Jesal Park (MBMC center)
    const defaultArea = MBMC_AREAS[0];
    const defaultZone = zones.find((z) => z.id === defaultArea.zoneId) || zones[0];
    return {
      coords: [defaultArea.lat, defaultArea.lng],
      area: defaultArea,
      zone: defaultZone,
      distanceKm: 0.8,
      source: 'saved',
      timestamp: 'Initial Municipal Center',
    };
  });

  // Check previously saved detected location on mount
  useEffect(() => {
    const saved = storageService.getSavedDetectedLocation();
    if (saved && saved.coords) {
      const matchedArea = MBMC_AREAS.find((a) => a.name === saved.areaName) || MBMC_AREAS[0];
      const matchedZone = zones.find((z) => z.id === saved.zoneId || z.id === matchedArea.zoneId) || zones[0];
      setDetectedData({
        coords: saved.coords,
        area: matchedArea,
        zone: matchedZone,
        distanceKm: calculateHaversineDistance(saved.coords[0], saved.coords[1], matchedArea.lat, matchedArea.lng),
        source: 'saved',
        timestamp: 'From Saved Resident Session',
      });
    }
  }, [zones]);

  // Robust GPS detection handler
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setDetectionNotice(null);

    if (!navigator.geolocation) {
      setDetectionNotice('GPS is not supported on this browser. Displaying default civic node: Jesal Park.');
      selectLocalityByName('Jesal Park', 'manual');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Check if coordinates are reasonably in Greater Mumbai / Mira-Bhayandar area
        // MBMC bounding box approx: 19.20 to 19.38 lat, 72.74 to 72.95 lng
        const isNearMBMC = userLat >= 19.15 && userLat <= 19.45 && userLng >= 72.70 && userLng <= 73.10;

        let closestArea = MBMC_AREAS[0];
        let minDistance = calculateHaversineDistance(userLat, userLng, closestArea.lat, closestArea.lng);

        for (const area of MBMC_AREAS) {
          const d = calculateHaversineDistance(userLat, userLng, area.lat, area.lng);
          if (d < minDistance) {
            minDistance = d;
            closestArea = area;
          }
        }

        const matchedZone = zones.find((z) => z.id === closestArea.zoneId) || zones[0];
        const finalCoords: [number, number] = isNearMBMC
          ? [userLat, userLng]
          : [closestArea.lat, closestArea.lng];

        storageService.saveDetectedLocation(finalCoords, closestArea.name, closestArea.zoneId);

        setDetectedData({
          coords: finalCoords,
          area: closestArea,
          zone: matchedZone,
          distanceKm: isNearMBMC ? Math.max(0.2, minDistance) : 0.8,
          source: 'gps',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (!isNearMBMC) {
          setDetectionNotice(
            `Device GPS is currently outside Mira-Bhayandar. Mapped to municipal node: ${closestArea.name} (${matchedZone.name}).`
          );
        } else {
          setDetectionNotice(
            `GPS auto-detected: ${closestArea.name} (${matchedZone.name}) with high accuracy.`
          );
        }
        setIsDetectingLocation(false);
      },
      (err) => {
        // Graceful fallback without alarming errors
        const fallbackArea = MBMC_AREAS[0];
        const fallbackZone = zones.find((z) => z.id === fallbackArea.zoneId) || zones[0];
        storageService.saveDetectedLocation([fallbackArea.lat, fallbackArea.lng], fallbackArea.name, fallbackArea.zoneId);

        setDetectedData({
          coords: [fallbackArea.lat, fallbackArea.lng],
          area: fallbackArea,
          zone: fallbackZone,
          distanceKm: 0.6,
          source: 'manual',
          timestamp: 'Default Civic Node',
        });

        if (err.code === 1) {
          setDetectionNotice('GPS permission prompt was dismissed. Mapped to municipal center (Jesal Park).');
        } else {
          setDetectionNotice('GPS query timed out. Mapped to central water distribution hub (Jesal Park).');
        }
        setIsDetectingLocation(false);
      },
      { timeout: 7000, maximumAge: 300000, enableHighAccuracy: false }
    );
  };

  // Select locality manually by name
  const selectLocalityByName = (areaName: string, source: 'gps' | 'manual' | 'saved' = 'manual') => {
    const foundArea = MBMC_AREAS.find((a) => a.name.toLowerCase() === areaName.toLowerCase()) || MBMC_AREAS[0];
    const foundZone = zones.find((z) => z.id === foundArea.zoneId) || zones[0];
    const coords: [number, number] = [foundArea.lat, foundArea.lng];

    storageService.saveDetectedLocation(coords, foundArea.name, foundArea.zoneId);
    setDetectedData({
      coords,
      area: foundArea,
      zone: foundZone,
      distanceKm: 0.5,
      source,
      timestamp: 'Selected Locality',
    });
    setDetectionNotice(`Selected locality set to ${foundArea.name} (${foundZone.name}).`);
    setShowLocalityDropdown(false);
    setSearchLocalityQuery('');
  };

  // Filtered localities for search
  const filteredLocalities = useMemo(() => {
    if (!searchLocalityQuery.trim()) return MBMC_AREAS.slice(0, 12);
    return MBMC_AREAS.filter(
      (a) =>
        a.name.toLowerCase().includes(searchLocalityQuery.toLowerCase()) ||
        a.localities.some((l) => l.toLowerCase().includes(searchLocalityQuery.toLowerCase()))
    ).slice(0, 12);
  }, [searchLocalityQuery]);

  // Nearest depot for detected locality
  const nearestDepot = useMemo(() => {
    return (
      MBMC_DEPOTS.find((d) => d.zoneId === detectedData.zone.id) ||
      MBMC_DEPOTS[0]
    );
  }, [detectedData.zone.id]);

  return (
    <div className="relative space-y-12 sm:space-y-16 pb-20">

      {/* 1. OFFICIAL MUNICIPAL HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-700 dark:text-blue-400">MBMC Gov Portal:</span>
          <span>Department of Water Supply &amp; Sewerage • पाणी पुरवठा व मलनिस्सारण विभाग</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline font-mono">Surya Regional Supply: Active</span>
          <a
            href="tel:1800222026"
            className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-[#ea580c]" />
            <span>Emergency Toll-Free: 1800-22-2026</span>
          </a>
        </div>
      </div>

      {/* 2. CIVIC HERO SECTION (2-COLUMN BALANCED SPLIT) */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[480px]">
          {/* Left Column: Civic Value Proposition & CTAs (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 z-10">
            <div className="space-y-4">
              {/* Civic Tagline & Official Insignia */}
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                <HeartHandshake className="w-4 h-4 text-[#ea580c]" />
                <span>Mira-Bhayandar Municipal Corporation</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-300 font-hindi">आपका पानी, आपकी सेवा</span>
              </div>

              {/* Marquee Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-snug text-white">
                JalSeva: <span className="text-sky-400 font-hindi tracking-normal inline-block">हर बूंद मायने रखती है</span>
              </h1>

              <p className="text-base sm:text-lg text-amber-200 font-hindi font-medium">
                &ldquo;आपका पानी, आपकी सेवा - हर बूंद मायने रखती है&rdquo;
              </p>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                The centralized digital municipal bridge connecting <strong>809,378 residents</strong> across 4 Municipal Zones with real-time piped water timetables, strict Today/Tomorrow emergency tanker dispatch, 48-hour grievance redressal, and transparent fleet telemetry.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectRole('citizen')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <span>Enter Citizen Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickTanker(detectedData.area.name)}
                  className="px-5 py-3.5 bg-gradient-to-r from-[#ea580c] to-[#fd7e14] hover:from-[#c2410c] hover:to-[#ea580c] active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Book Tanker (Today/Tomorrow)</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IS 10500:2012 Certified Potable</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-300">142.5 MLD Surya &amp; Jambhul Intake</span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-300">79 Localities Covered</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Civic Photography (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800">
            <img
              src={HERO_WATER_PLANT_IMG}
              alt="Mira-Bhayandar Municipal Corporation Surya Dam Water Purification Facility"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            {/* Measured Scrim for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
              <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-sky-400 font-bold">
                  <span>Surya Dam Water Treatment Hub</span>
                  <span className="text-emerald-400 font-mono">110 MLD Gravity</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Continuous computerized turbidity monitoring and pressurized reservoir supply for Mira-Bhayandar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RELIABLE GEOLOCATION WATER SUPPLY ZONE DETECTOR (FIXED & HIGH ACCURACY) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Navigation className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Detect Your Municipal Water Supply Zone
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Find your water release window, pressurized delivery hours, and closest tanker depot by GPS or search.
            </p>
          </div>

          {/* Action cluster: GPS button + Locality Search */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-75 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
              title="Use Device GPS to auto-detect current locality"
            >
              {isDetectingLocation ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Locating via GPS...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-sky-200" />
                  <span>Auto-Detect My GPS Location</span>
                </>
              )}
            </button>

            {/* Quick dropdown trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLocalityDropdown(!showLocalityDropdown)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Search 79 Localities</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Searchable dropdown menu */}
              {showLocalityDropdown && (
                <div className="absolute right-0 top-12 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 max-h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden flex flex-col space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchLocalityQuery}
                      onChange={(e) => setSearchLocalityQuery(e.target.value)}
                      placeholder="Type locality (e.g. Silver Park, Jesal Park)..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto max-h-64 space-y-1 pr-1 text-xs">
                    {filteredLocalities.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => selectLocalityByName(area.name)}
                        className="w-full text-left p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 transition"
                      >
                        <div>
                          <strong className="block text-slate-900 dark:text-white font-semibold">
                            {area.name}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            {area.zoneId.replace('zone-', 'Zone ')} • {area.localities[0] || 'Center'}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Select</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Covering 4 MBMC Wards</span>
                    <button
                      type="button"
                      onClick={() => setShowLocalityDropdown(false)}
                      className="font-bold text-slate-700 dark:text-slate-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Locality Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Wards:
          </span>
          {['Jesal Park', 'Silver Park', 'Beverly Park', 'Poonam Sagar', 'Uttan Village', 'Golden Nest', 'Shanti Park'].map(
            (loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => selectLocalityByName(loc)}
                className={`px-3 py-1.5 rounded-xl border transition text-xs font-semibold ${
                  detectedData.area.name.toLowerCase() === loc.toLowerCase()
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {loc}
              </button>
            )
          )}
        </div>

        {/* Live Detected Details Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                📍
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                  Active Locality Detected &bull; {detectedData.source === 'gps' ? 'GPS Sensor Active' : 'Verified Civic Node'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {detectedData.area.name} <span className="text-sm font-normal text-slate-500 font-hindi">({detectedData.zone.marathiName})</span>
                </h3>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {detectedData.zone.name} &bull; {detectedData.zone.wards}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Normal Supply Operational</span>
              </span>
              <span className="block text-[10px] text-slate-500 mt-1">
                Last verified: {detectedData.timestamp}
              </span>
            </div>
          </div>

          {/* 3 Metric Summary Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Today&apos;s Supply Window
              </span>
              <strong className="text-sm font-mono font-black text-blue-600 dark:text-blue-400 block">
                {detectedData.zone.supplyWindows.morning.start} - {detectedData.zone.supplyWindows.morning.end}
              </strong>
              <span className="text-[11px] text-slate-500">
                Evening: {detectedData.zone.supplyWindows.evening ? `${detectedData.zone.supplyWindows.evening.start} - ${detectedData.zone.supplyWindows.evening.end}` : 'None (Morning Only)'}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Water Pressure &amp; Potability
              </span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                {detectedData.zone.supplyWindows.pressure} (2.4 bar)
              </strong>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Purity Index 99.4% Potable
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Nearest Emergency Tanker Depot
              </span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                {nearestDepot.name}
              </strong>
              <span className="text-[11px] text-slate-500">
                Approx {detectedData.distanceKm.toFixed(1)} km transit (~18 mins ETA)
              </span>
            </div>
          </div>

          {/* Action Row: Mobile Responsive Stacking */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => onOpenQuickTanker(detectedData.area.name)}
              className="px-4 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Book Emergency Tanker to {detectedData.area.name}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenQuickSchedule(detectedData.zone.id)}
              className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>View Full Weekly Timetable</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenQuickComplaint(detectedData.area.name)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Report Leak / Dirty Water</span>
            </button>
          </div>
        </div>

        {detectionNotice && (
          <p className="text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
            ℹ️ {detectionNotice}
          </p>
        )}
      </section>

      {/* 4. DEDICATED 3 ROLE PORTAL LOGIN CARDS (CITIZEN, DRIVER, ADMIN) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] dark:text-amber-400">
            Role-Based Civic Gateways
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Log In to Your JalSeva Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated interfaces tailored for residents, authorized municipal tanker drivers, and administrative engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {/* PORTAL 1: CITIZEN */}
          <div
            onClick={() => onSelectRole('citizen')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-600 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-sm">
                👤
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
                  Public Resident Gateway
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Citizen Dashboard
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Check supply schedules, book emergency tankers strictly for Today or Tomorrow, report leaks, and pay technician fees online.
              </p>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>79 Sub-Areas Timetables</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>Emergency Tanker Booking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>Technician UPI Payment</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* PORTAL 2: DRIVER RAHUL */}
          <div
            onClick={() => onSelectRole('driver')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#ea580c] dark:hover:border-orange-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-[#ea580c] dark:text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-sm">
                🚚
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#ea580c] dark:text-amber-400 block">
                  Municipal Fleet Operators
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Tanker Driver Portal
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Primary Driver: <strong>Rahul</strong> (Vehicle <span className="font-mono">MH-04-RH-8821</span>). Trip dispatch queues, depot navigation, and 4-digit OTP handover.
              </p>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ea580c] font-bold">✓</span>
                  <span>Live Dispatch Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ea580c] font-bold">✓</span>
                  <span>4-Digit Handshake OTP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ea580c] font-bold">✓</span>
                  <span>4 Municipal Depots Hub</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-gradient-to-r from-[#ea580c] to-[#fd7e14] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Driver Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* PORTAL 3: FIELD WORKER & PLUMBER */}
          <div
            onClick={() => onSelectRole('worker')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-600 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-sm">
                🔧
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Field Maintenance Specialists
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Worker &amp; Plumber Desk
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Plumber &amp; water quality technicians. Receive assigned leakages and dirty water tasks, submit technical analysis, and collect payments.
              </p>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                  <span>Pipeline &amp; Leakage Tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                  <span>Submit Diagnostic Report</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                  <span>Citizen UPI Fee Settlements</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Worker Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* PORTAL 4: ADMIN ADARSH YADAV */}
          <div
            onClick={() => onSelectRole('admin')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-900 dark:hover:border-slate-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-sm">
                🛡️
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Municipal Authority &amp; Engineering
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  MBMC Admin Console
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Super Admin: <strong>Adarsh Yadav</strong>. Control room dispatch, outage alerts broadcast, plumber assignment desk, and tanker Kanban.
              </p>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Assign Plumbers &amp; Workers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Broadcast Outage Notices</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">✓</span>
                  <span>Kanban Fleet Dispatch Board</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CIVIC LOGISTICS & PURITY FEATURE SPOTLIGHT (2 PHOTO CARDS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logistics & Tanker Fleet Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <img
              src={TANKER_FLEET_IMG}
              alt="Mira-Bhayandar Municipal Corporation Water Tanker Fleet"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                MBMC Fleet Depots: 4 Auxiliary Hubs
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Emergency Water Tanker Logistics &amp; Security Handover
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When pipeline maintenance occurs, MBMC operates a rapid tanker fleet delivering 5,000L to 15,000L potable water to housing societies. Deliveries are protected by our Two-Way OTP verification handover protocol.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Fleet Lead: Driver Rahul (MH-04-RH-8821)
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickTanker()}
                className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1"
              >
                <span>Book Tanker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Purity & Water Testing Lab Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <img
              src={WATER_LAB_IMG}
              alt="MBMC Municipal Water Purity and Quality Testing Laboratory"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                Certified Testing Lab: BIS IS 10500 Compliant
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Continuous Water Purity &amp; Pressure Assurance
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our central municipal laboratory tests water samples across 16 wards daily for pH (7.2–7.6), turbidity (&lt;1 NTU), and residual chlorine (0.2–0.5 ppm) to guarantee safe drinking water for every household.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Purity Rating: 99.4% Potable Standard
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickComplaint()}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Report Quality Issue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL-TIME WATER TELEMETRY STATS */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparency Metrics
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              MBMC JalSeva City Water Distribution Today
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated live from Surya &amp; MIDC Telemetry</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-xs font-semibold">Supplied Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.waterSuppliedTodayMLD} <span className="text-sm font-medium text-slate-500">MLD</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Surya Dam Gravity &amp; Jambhul Line</p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center gap-2 text-[#ea580c] dark:text-amber-400 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-xs font-semibold">Tankers Dispatched</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.tankersDispatchedToday} <span className="text-sm font-medium text-slate-500">Trips</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Average arrival within 22 minutes</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-semibold">Active Grievances</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.activeComplaintsCount}{' '}
              <span className="text-xs font-medium text-emerald-600">
                (96.8% Resolved)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">SLA turnaround in {stats.avgResponseTimeHours} hrs</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold">Citizens Covered</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.citizensServedTotal.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across 16 Wards &amp; 79 Localities</p>
          </div>
        </div>
      </section>

      {/* 7. QUICK 4-ZONE TIMETABLE LOOKUP */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Zone Water Timetable
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Quick Supply Schedule Lookup
            </h3>
            <p className="text-xs text-slate-500">
              Select your municipal zone to view current pressurized supply hours.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenQuickSchedule(selectedZone.id)}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View Full 79 Localities Schedule</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* 4 Zones Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setQuickZoneId(z.id)}
              className={`p-4 rounded-2xl border text-left transition ${
                quickZoneId === z.id
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mb-1"
                style={{ backgroundColor: z.color }}
              />
              <strong className="block text-xs text-slate-900 dark:text-white line-clamp-1">
                {z.name}
              </strong>
              <span className="text-[10px] text-slate-500">{z.wards}</span>
            </button>
          ))}
        </div>

        {/* Selected Zone Supply Hours Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60">
            <span className="text-xs uppercase font-bold text-sky-800 dark:text-sky-300 block mb-1">
              Morning Supply Window
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {selectedZone.supplyWindows.morning.start} to {selectedZone.supplyWindows.morning.end}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Pressure: {selectedZone.supplyWindows.pressure}</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
            <span className="text-xs uppercase font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
              Evening Supply Window
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {selectedZone.supplyWindows.evening ? `${selectedZone.supplyWindows.evening.start} to ${selectedZone.supplyWindows.evening.end}` : 'No Evening Supply (Morning Only)'}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Frequency: {selectedZone.supplyWindows.frequency}</span>
          </div>
        </div>
      </section>

      {/* 8. 24x7 HELPLINES & WARD DIRECTORY */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#ea580c] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">24x7 Emergency Water Desk</h4>
          <p className="text-xs text-slate-500">
            Direct municipal helpline for pipeline bursts, contamination, or sudden supply disruption.
          </p>
          <a
            href="tel:1800222026"
            className="text-base font-black text-[#ea580c] hover:underline block"
          >
            1800-22-2026 (Toll-Free)
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">4 Water Tanker Depots</h4>
          <p className="text-xs text-slate-500">
            Kharigaon Central, Sector 4 Mira Rd, Subhash Nagar, and Uttan Coastal Depots.
          </p>
          <button
            type="button"
            onClick={() => onOpenQuickTanker()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Book Tanker (Today/Tomorrow) &rarr;
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Citizen Redressal SLA</h4>
          <p className="text-xs text-slate-500">
            Pipeline leaks inspected within 2 hours. Maximum redressal turnaround: 48 hours.
          </p>
          <button
            type="button"
            onClick={() => onOpenQuickComplaint()}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Report Pipeline Leak / Issue &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
