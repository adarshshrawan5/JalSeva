import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Depot, WaterZone } from '../../types';
import { generateRoutePoints } from '../../services/distanceService';

interface LeafletMapViewProps {
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  depots?: Depot[];
  selectedDepot?: Depot | null;
  zones?: WaterZone[];
  tankerLocation?: [number, number] | null;
  tankerDriverName?: string;
  showRoute?: boolean;
  onSelectLocation?: (coords: [number, number]) => void;
  interactive?: boolean;
  heightClass?: string;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  center = [19.295, 72.84],
  zoom = 13,
  userLocation,
  depots = [],
  selectedDepot,
  zones = [],
  tankerLocation,
  tankerDriverName,
  showRoute = true,
  onSelectLocation,
  interactive = true,
  heightClass = 'h-80',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive ? 'center' : false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MBMC GIS',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    if (interactive && onSelectLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onSelectLocation([e.latlng.lat, e.latlng.lng]);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update layers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Zone Circles / Outlines
    if (zones && zones.length > 0) {
      zones.forEach((zone) => {
        const zoneCircle = L.circle(zone.center, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.12,
          weight: 2,
          radius: 2200,
        });

        zoneCircle.bindTooltip(
          `<strong>${zone.name}</strong><br/><span style="font-size:11px">${zone.wards} | Pop: ${zone.population.toLocaleString()}</span>`,
          { direction: 'top', className: 'zone-map-tooltip' }
        );

        markersGroup.addLayer(zoneCircle);
      });
    }

    // 2. Depots
    depots.forEach((depot) => {
      const isSelected = selectedDepot?.id === depot.id;
      const depotIcon = L.divIcon({
        className: 'custom-depot-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="${
              isSelected
                ? 'w-10 h-10 bg-red-600 ring-4 ring-red-300'
                : 'w-8 h-8 bg-slate-800 ring-2 ring-white'
            } text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110">
              <span class="text-sm">🏢</span>
            </div>
            ${
              isSelected
                ? '<span class="absolute -bottom-6 bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">Selected Depot</span>'
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([depot.lat, depot.lng], { icon: depotIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 2px;">${depot.name}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">${depot.address}</div>
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
            🚰 <strong>Available Tankers:</strong> ${depot.availableTankers} / ${depot.totalTankers}<br/>
            📞 <strong>Depot Officer:</strong> ${depot.managerName} (${depot.phone})
          </div>
        </div>
      `);
      markersGroup.addLayer(marker);
    });

    // 3. User / Citizen Location
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
            <div class="relative w-8 h-8 bg-blue-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-xl">
              <span class="text-xs">📍</span>
            </div>
            <span class="absolute -bottom-5 bg-blue-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
              You (Citizen)
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong>Your Selected Delivery Location</strong>
          <div style="color: #64748b; font-size: 11px;">GPS: ${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}</div>
        </div>
      `);
      markersGroup.addLayer(userMarker);

      // Route polyline from depot to citizen
      if (showRoute && selectedDepot) {
        const depotCoords: [number, number] = [selectedDepot.lat, selectedDepot.lng];
        const routePoints = generateRoutePoints(depotCoords, userLocation);

        const routeLine = L.polyline(routePoints, {
          color: '#16a34a', // green route line
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 6',
        });
        markersGroup.addLayer(routeLine);

        // Fit bounds to show both citizen and depot comfortably
        const bounds = L.latLngBounds([userLocation, depotCoords]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    // 4. Tanker Moving Marker (Live Tracking)
    if (tankerLocation) {
      const tankerIcon = L.divIcon({
        className: 'custom-tanker-marker',
        html: `
          <div class="relative flex items-center justify-center animate-bounce">
            <div class="w-10 h-10 bg-emerald-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-2xl">
              <span class="text-lg">🚚</span>
            </div>
            <span class="absolute -bottom-6 bg-emerald-900 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow">
              ${tankerDriverName || 'MBMC Tanker In Transit'}
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const tankerMarker = L.marker(tankerLocation, { icon: tankerIcon });
      tankerMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="color:#059669;">🚚 MBMC Emergency Tanker</strong><br/>
          Driver: ${tankerDriverName || 'Ramesh Kumar (MH-04-AB-1234)'}<br/>
          <em>Moving towards delivery address...</em>
        </div>
      `);
      markersGroup.addLayer(tankerMarker);
    }
  }, [userLocation, selectedDepot, depots, zones, tankerLocation, tankerDriverName, showRoute]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
