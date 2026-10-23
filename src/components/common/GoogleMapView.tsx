import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Depot, WaterZone } from '../../types';
import { Truck, MapPin, Building2, Navigation, Layers, ShieldCheck } from 'lucide-react';

interface GoogleMapViewProps {
  center?: [number, number]; // [lat, lng]
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

// Inner helper component to handle map click events and camera updates
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  onSelectLocation?: (coords: [number, number]) => void;
  interactive: boolean;
  showRoute?: boolean;
  depots?: Depot[];
  selectedDepot?: Depot | null;
  userLocation?: [number, number] | null;
  tankerLocation?: [number, number] | null;
  zones?: WaterZone[];
}> = ({
  center,
  zoom,
  onSelectLocation,
  interactive,
  showRoute,
  depots = [],
  selectedDepot,
  userLocation,
  tankerLocation,
  zones = [],
}) => {
  const map = useMap();

  // Pan map when center or target coordinates update
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: center[0], lng: center[1] });
  }, [map, center]);

  // Handle map clicks to set address / pin coordinates
  useEffect(() => {
    if (!map || !interactive || !onSelectLocation) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onSelectLocation([e.latLng.lat(), e.latLng.lng()]);
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, interactive, onSelectLocation]);

  // Draw Polylines and Zone Circles using Google Maps Core Geometry
  useEffect(() => {
    if (!map) return;

    const polylines: google.maps.Polyline[] = [];
    const circles: google.maps.Circle[] = [];

    // 1. Draw Zone Circles
    if (zones && zones.length > 0) {
      zones.forEach((zone) => {
        const circle = new google.maps.Circle({
          strokeColor: zone.color || '#0284c7',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: zone.color || '#0284c7',
          fillOpacity: 0.12,
          map,
          center: { lat: zone.center[0], lng: zone.center[1] },
          radius: 2200,
        });
        circles.push(circle);
      });
    }

    // 2. Draw Route Polyline from Tanker/Depot to User Delivery Location
    if (showRoute && userLocation) {
      const depotCoord: [number, number] | null = selectedDepot
        ? (selectedDepot.coordinates || [selectedDepot.lat, selectedDepot.lng])
        : (depots[0] ? (depots[0].coordinates || [depots[0].lat, depots[0].lng]) : null);
      const origin = tankerLocation || depotCoord;
      if (origin) {
        // Multi-point simulated route path
        const path = [
          { lat: origin[0], lng: origin[1] },
          { lat: origin[0] + (userLocation[0] - origin[0]) * 0.35 + 0.002, lng: origin[1] + (userLocation[1] - origin[1]) * 0.25 - 0.001 },
          { lat: origin[0] + (userLocation[0] - origin[0]) * 0.7 - 0.001, lng: origin[1] + (userLocation[1] - origin[1]) * 0.65 + 0.002 },
          { lat: userLocation[0], lng: userLocation[1] },
        ];

        const routeLine = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#2563eb',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
        polylines.push(routeLine);
      }
    }

    return () => {
      polylines.forEach((line) => line.setMap(null));
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, zones, showRoute, userLocation, tankerLocation, selectedDepot, depots]);

  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
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
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedMarker, setSelectedMarker] = useState<{
    title: string;
    description: string;
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900`}>
      <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
        <Map
          defaultCenter={{ lat: center[0], lng: center[1] }}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling={interactive ? 'greedy' : 'none'}
          disableDefaultUI={!interactive}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <MapController
            center={center}
            zoom={zoom}
            onSelectLocation={onSelectLocation}
            interactive={interactive}
            showRoute={showRoute}
            depots={depots}
            selectedDepot={selectedDepot}
            userLocation={userLocation}
            tankerLocation={tankerLocation}
            zones={zones}
          />

          {/* User Delivery Location Marker */}
          {userLocation && (
            <AdvancedMarker
              position={{ lat: userLocation[0], lng: userLocation[1] }}
              title="Citizen Delivery Destination"
              onClick={() =>
                setSelectedMarker({
                  title: 'Citizen Delivery Location',
                  description: 'Delivery destination confirmed via GPS telemetry.',
                  lat: userLocation[0],
                  lng: userLocation[1],
                })
              }
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-md mt-1">
                  Delivery Site
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* Municipal Depots Markers */}
          {depots.map((depot) => {
            const isSelected = selectedDepot?.id === depot.id;
            const dLat = depot.lat ?? depot.coordinates?.[0] ?? 19.295;
            const dLng = depot.lng ?? depot.coordinates?.[1] ?? 72.84;
            return (
              <AdvancedMarker
                key={depot.id}
                position={{ lat: dLat, lng: dLng }}
                title={depot.name}
                onClick={() =>
                  setSelectedMarker({
                    title: depot.name,
                    description: `${depot.address} • Available Fleet: ${depot.totalTankers} Tankers`,
                    lat: dLat,
                    lng: dLng,
                  })
                }
              >
                <Pin
                  background={isSelected ? '#2563eb' : '#059669'}
                  glyphColor="#ffffff"
                  borderColor={isSelected ? '#1d4ed8' : '#047857'}
                  scale={isSelected ? 1.2 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Live GPS Water Tanker Truck Marker */}
          {tankerLocation && (
            <AdvancedMarker
              position={{ lat: tankerLocation[0], lng: tankerLocation[1] }}
              title={tankerDriverName || 'MBMC Water Tanker Fleet'}
              onClick={() =>
                setSelectedMarker({
                  title: `MBMC Water Tanker (GPS Active)`,
                  description: `Driver: ${tankerDriverName || 'Municipal Fleet Operator'} • Speed: 32 km/h • En Route`,
                  lat: tankerLocation[0],
                  lng: tankerLocation[1],
                })
              }
            >
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-orange-200 dark:ring-orange-950 animate-pulse">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap">
                  {tankerDriverName ? tankerDriverName.split(' ')[0] : 'Tanker'}
                </span>
              </div>
            </AdvancedMarker>
          )}

          {/* Interactive InfoWindow */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-1 max-w-xs text-slate-900">
                <h5 className="font-bold text-xs">{selectedMarker.title}</h5>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {selectedMarker.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-md flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Depot
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Destination
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          Live Tanker
        </span>
      </div>
    </div>
  );
};
