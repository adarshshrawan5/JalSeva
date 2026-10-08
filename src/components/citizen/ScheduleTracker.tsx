import React, { useState, useEffect, useMemo } from 'react';
import { WaterZone, SubArea, OutageAlert, Depot } from '../../types';
import { MBMC_AREAS, MBMC_DEPOTS } from '../../data/mbmcData';
import { LeafletMapView } from '../common/LeafletMapView';
import { calculateHaversineDistance } from '../../services/distanceService';
import {
  Search,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Building,
  Navigation,
  ChevronRight,
  RefreshCw,
  Info,
  Phone,
  Waves,
} from 'lucide-react';

interface ScheduleTrackerProps {
  zones: WaterZone[];
  alerts: OutageAlert[];
  onSelectAlert?: (alert: OutageAlert) => void;
  onBookTankerForArea?: (area: SubArea) => void;
}

export const ScheduleTracker: React.FC<ScheduleTrackerProps> = ({
  zones,
  alerts,
  onSelectAlert,
  onBookTankerForArea,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('be-1');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [viewMode, viewModeSet] = useState<'daily' | 'weekly'>('daily');

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || zones[0],
    [zones, selectedZoneId]
  );

  const zoneAreas = useMemo(
    () => MBMC_AREAS.filter((a) => a.zoneId === selectedZoneId),
    [selectedZoneId]
  );

  const selectedArea = useMemo(
    () => zoneAreas.find((a) => a.id === selectedAreaId) || zoneAreas[0] || MBMC_AREAS[0],
    [zoneAreas, selectedAreaId]
  );

  // Set default locality when area changes
  useEffect(() => {
    if (selectedArea && selectedArea.localities && selectedArea.localities.length > 0) {
      if (!selectedLocality || !selectedArea.localities.includes(selectedLocality)) {
        setSelectedLocality(selectedArea.localities[0]);
      }
    }
  }, [selectedArea]);

  // Filtered areas for search
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return MBMC_AREAS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.localities.some((l) => l.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery]);

  // Next supply countdown calculation
  const countdownText = useMemo(() => {
    if (!selectedZone) return { label: 'Next Supply', timeString: 'Calculating...' };
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [mH, mM] = selectedZone.supplyWindows.morning.start.split(':').map(Number);
    const [eH, eM] = selectedZone.supplyWindows.evening.start.split(':').map(Number);
    const morningTotal = mH * 60 + mM;
    const eveningTotal = eH * 60 + eM;

    let targetTotal = morningTotal;
    let label = 'Morning Supply';

    if (currentTotalMinutes < morningTotal) {
      targetTotal = morningTotal;
      label = "Today's Morning Supply";
    } else if (currentTotalMinutes < eveningTotal) {
      targetTotal = eveningTotal;
      label = "Today's Evening Supply";
    } else {
      // Tomorrow morning
      targetTotal = morningTotal + 24 * 60;
      label = "Tomorrow's Morning Supply";
    }

    const diffMinutes = targetTotal - currentTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    return {
      label,
      timeString: `${hours} hours ${mins} minutes`,
    };
  }, [selectedZone]);

  // Live Location Detection
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationMessage(null);

    if (!navigator.geolocation) {
      setIsLocating(false);
      // Fallback
      fallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        // Check if user is anywhere in or near Mira-Bhayandar, otherwise clamp to centroid for demo
        const isNearMBMC = lat >= 19.22 && lat <= 19.38 && lng >= 72.74 && lng <= 72.95;
        const finalCoords: [number, number] = isNearMBMC
          ? [lat, lng]
          : [19.3015 + (Math.random() - 0.5) * 0.01, 72.8592 + (Math.random() - 0.5) * 0.01];

        setUserLocation(finalCoords);
        setLocationAccuracy(isNearMBMC ? accuracy : 45);

        // Find nearest area
        let nearestArea = MBMC_AREAS[0];
        let minDistance = 999999;
        MBMC_AREAS.forEach((area) => {
          const dist = calculateHaversineDistance(finalCoords[0], finalCoords[1], area.lat, area.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestArea = area;
          }
        });

        setSelectedZoneId(nearestArea.zoneId);
        setSelectedAreaId(nearestArea.id);
        if (nearestArea.localities.length > 0) {
          setSelectedLocality(nearestArea.localities[0]);
        }

        const zName = zones.find((z) => z.id === nearestArea.zoneId)?.name || 'Mira-Bhayandar';
        setLocationMessage(
          `📍 You are located in ${nearestArea.name}, ${zName} (~${minDistance.toFixed(1)} km from centroid)`
        );
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        fallbackLocation();
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const fallbackLocation = () => {
    // Graceful fallback to prominent Bhayandar East location
    const fallbackCoords: [number, number] = [19.3015, 72.8592];
    setUserLocation(fallbackCoords);
    setLocationAccuracy(60);
    const area = MBMC_AREAS.find((a) => a.id === 'be-1') || MBMC_AREAS[0];
    setSelectedZoneId(area.zoneId);
    setSelectedAreaId(area.id);
    setSelectedLocality(area.localities[0]);
    setLocationMessage(`📍 Defaulting to ${area.name}, Zone 1: Bhayandar East`);
    setIsLocating(false);
  };

  // Check active alerts for this zone
  const zoneAlerts = alerts.filter(
    (a) => a.status === 'Active' && a.zoneIds.includes(selectedZone.id)
  );

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayDayName = daysOfWeek[(new Date().getDay() + 6) % 7];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Title & Location Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            MBMC Water Timetable & Network Status
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Area-Wise Schedule & Outage Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official municipal water release schedule across all 16 wards and 79 sub-localities.
          </p>
        </div>

        {/* Live Location Auto-Detection Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition transform hover:scale-102"
          >
            {isLocating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-sky-200" />
            )}
            <span>{isLocating ? 'Detecting GPS...' : '📍 Detect My Location'}</span>
          </button>
        </div>
      </div>

      {/* Location Detected Feedback Banner */}
      {locationMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{locationMessage}</span>
            {locationAccuracy && (
              <span className="text-[11px] bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Accuracy: ±{locationAccuracy}m
              </span>
            )}
          </div>
          <button
            onClick={() => setLocationMessage(null)}
            className="text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Zone Cards Selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Step 1: Select Your Municipal Zone
          </h3>
          <span className="text-xs text-slate-500">4 Water Supply Zones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  const firstArea = MBMC_AREAS.find((a) => a.zoneId === zone.id);
                  if (firstArea) {
                    setSelectedAreaId(firstArea.id);
                    if (firstArea.localities.length > 0) {
                      setSelectedLocality(firstArea.localities[0]);
                    }
                  }
                }}
                className={`p-5 rounded-2xl text-left border-2 transition-all transform hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {zone.wards}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {zone.name}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {zone.marathiName}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Pop: {(zone.population / 1000).toFixed(0)}k</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {zone.supplyWindows.frequency}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3-Level Area Hierarchy Selector & Search */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 2: Choose Sub-Area & Locality
            </h3>
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedZone.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedArea.name}
              </span>
              {selectedLocality && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">{selectedLocality}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 79 areas (e.g. Golden Nest)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
            {filteredSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto">
                {filteredSearchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setSelectedZoneId(res.zoneId);
                      setSelectedAreaId(res.id);
                      if (res.localities.length > 0) {
                        setSelectedLocality(res.localities[0]);
                      }
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {res.name}
                      </span>
                      <span className="text-slate-400 block text-[10px]">
                        {res.localities.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      {zones.find((z) => z.id === res.zoneId)?.name.split(':')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dropdowns Row: Sub-Area and Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Sub-Area in {selectedZone.name.split(':')[1]} ({zoneAreas.length} Areas)
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => {
                setSelectedAreaId(e.target.value);
                const a = zoneAreas.find((item) => item.id === e.target.value);
                if (a && a.localities.length > 0) {
                  setSelectedLocality(a.localities[0]);
                }
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {zoneAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} — Status: {area.currentStatus}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Locality / Phase / Society
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedArea.localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Schedule & Countdown Display Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timing Cards and Weekly View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Countdown Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-sky-200 block">
                    Next Water Release Countdown
                  </span>
                  <div className="text-xl sm:text-2xl font-black">{countdownText.timeString}</div>
                  <div className="text-xs text-sky-100 font-medium">{countdownText.label}</div>
                </div>
              </div>

              {selectedArea.currentStatus !== 'Normal' && (
                <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Area Alert: {selectedArea.currentStatus}</span>
                </div>
              )}
            </div>

            {/* View Switcher: Today Daily vs 7-Day Weekly Grid */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Supply Windows for {selectedArea.name}
              </h4>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => viewModeSet('daily')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'daily'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Today ({todayDayName})
                </button>
                <button
                  onClick={() => viewModeSet('weekly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  7-Day Schedule
                </button>
              </div>
            </div>

            {viewMode === 'daily' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Morning Window */}
                <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-sky-600" />
                      Morning Window
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
                      Pressure: {selectedZone.supplyWindows.pressure}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {selectedZone.supplyWindows.morning.start}{' '}
                    <span className="text-base font-semibold text-slate-500">to</span>{' '}
                    {selectedZone.supplyWindows.morning.end}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Primary overhead tank replenishment window. Booster pumps active.
                  </p>
                </div>

                {/* Evening Window */}
                <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-indigo-600" />
                      Evening Window
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                      Standard Supply
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {selectedZone.supplyWindows.evening.start}{' '}
                    <span className="text-base font-semibold text-slate-500">to</span>{' '}
                    {selectedZone.supplyWindows.evening.end}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Domestic peak evening consumption window. Full municipal pressure.
                  </p>
                </div>
              </div>
            ) : (
              /* Weekly Calendar Grid (7 Days) */
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {daysOfWeek.map((day) => {
                  const isToday = day === todayDayName;
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border text-center transition ${
                        isToday
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {day.slice(0, 3)}
                      </div>
                      {isToday && (
                        <span className="inline-block text-[9px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.2 rounded-full mb-1">
                          Today
                        </span>
                      )}
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        AM: {selectedZone.supplyWindows.morning.start}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        PM: {selectedZone.supplyWindows.evening.start}
                      </div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        Normal
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Outage Alerts specifically affecting this zone */}
            {zoneAlerts.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Notices affecting this zone:</span>
                </div>
                {zoneAlerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAlert && onSelectAlert(a)}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 cursor-pointer hover:border-amber-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {a.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{a.reason}</p>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      Alternative: {a.alternativeArrangement}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Ward Office Info & Tanker Quick Trigger */}
        <div className="space-y-6">
          {/* Ward Office Contact */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Building className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Ward Office In-Charge
              </h4>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {selectedZone.wardOffice.name}
                </span>
                <span>{selectedZone.wardOffice.address}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block">Executive Engineer:</span>
                <strong className="text-slate-900 dark:text-white">
                  {selectedZone.wardOffice.officer}
                </strong>
              </div>
              <div className="pt-1">
                <a
                  href={`tel:${selectedZone.wardOffice.phone}`}
                  className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Desk: {selectedZone.wardOffice.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Tanker Action */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white space-y-3 shadow-lg shadow-emerald-500/20">
            <h4 className="font-black text-lg">Facing Water Shortage?</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Book an emergency MBMC water tanker to <strong>{selectedArea.name}</strong> for Today or Tomorrow.
            </p>
            {onBookTankerForArea && (
              <button
                onClick={() => onBookTankerForArea(selectedArea)}
                className="w-full py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition transform hover:scale-102 flex items-center justify-center gap-2"
              >
                <span>Book Tanker to {selectedArea.name}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Map of Zones and Depots */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Interactive Mira-Bhayandar Water Supply Map</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visual overview showing 4 water zones, depots, and your current GPS position.
            </p>
          </div>
        </div>

        <LeafletMapView
          center={selectedZone.center}
          zoom={13}
          userLocation={userLocation || [selectedArea.lat, selectedArea.lng]}
          depots={MBMC_DEPOTS}
          zones={zones}
          showRoute={false}
          heightClass="h-96"
        />
      </section>
    </div>
  );
};
