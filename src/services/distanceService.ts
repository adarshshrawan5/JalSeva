import { Depot } from '../types';

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * Returns distance in kilometers (rounded to 1 decimal place).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates estimated delivery time based on:
 * ETA = (Distance / 30) * 1.5 + 0.17 hours
 * Converted to a readable window like "15-20 minutes" or "25-35 minutes"
 */
export function calculateEstimatedDeliveryTime(distanceKm: number): {
  minMinutes: number;
  maxMinutes: number;
  formatted: string;
} {
  // Base formula in hours:
  const etaHours = (distanceKm / 30) * 1.5 + 0.17;
  const etaMinutes = Math.max(12, Math.round(etaHours * 60));

  const minMinutes = Math.max(10, etaMinutes - 5);
  const maxMinutes = etaMinutes + 5;

  return {
    minMinutes,
    maxMinutes,
    formatted: `${minMinutes}-${maxMinutes} minutes`,
  };
}

/**
 * Finds the nearest depot with available tankers.
 * Falls back to closest depot overall if none have available tankers.
 */
export function findNearestDepot(
  citizenLat: number,
  citizenLng: number,
  depots: Depot[]
): {
  depot: Depot;
  distanceKm: number;
  eta: string;
} {
  if (!depots || depots.length === 0) {
    throw new Error('No depots available');
  }

  const sorted = depots.map((depot) => {
    const dist = calculateHaversineDistance(citizenLat, citizenLng, depot.lat, depot.lng);
    return {
      depot,
      distanceKm: dist,
    };
  });

  // Prefer depots with available tankers > 0, otherwise closest
  const availableDepots = sorted.filter((d) => d.depot.availableTankers > 0);
  const bestList = availableDepots.length > 0 ? availableDepots : sorted;

  bestList.sort((a, b) => a.distanceKm - b.distanceKm);

  const best = bestList[0];
  const eta = calculateEstimatedDeliveryTime(best.distanceKm).formatted;

  return {
    depot: best.depot,
    distanceKm: best.distanceKm,
    eta,
  };
}

/**
 * Generates intermediate route coordinates between two points for polyline visualization
 */
export function generateRoutePoints(
  start: [number, number],
  end: [number, number],
  steps: number = 8
): [number, number][] {
  const points: [number, number][] = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add a tiny organic road deviation for realism
    const midJitter = Math.sin(t * Math.PI) * 0.0018 * (i % 2 === 0 ? 1 : -0.5);
    const lat = lat1 + (lat2 - lat1) * t + midJitter;
    const lng = lng1 + (lng2 - lng1) * t - midJitter * 0.8;
    points.push([lat, lng]);
  }

  return points;
}
