export type WaterZoneId = 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4';

export interface WaterZone {
  id: WaterZoneId;
  name: string;
  marathiName: string;
  wards: string;
  population: number;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  center: [number, number]; // [lat, lng]
  wardOffice: {
    name: string;
    address: string;
    phone: string;
    officer: string;
  };
  supplyWindows: {
    morning: { start: string; end: string };
    evening: { start: string; end: string };
    pressure: 'High' | 'Normal' | 'Moderate';
    frequency: string;
  };
}

export interface SubArea {
  id: string;
  zoneId: WaterZoneId;
  name: string;
  localities: string[];
  lat: number;
  lng: number;
  currentStatus: 'Normal' | 'Low Pressure' | 'Maintenance' | 'No Supply';
}

export type OutageType = 'Emergency Outage' | 'Planned Maintenance' | 'General Notice';
export type OutagePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type OutageStatus = 'Active' | 'Resolved' | 'Expired';

export interface OutageAlert {
  id: string;
  title: string;
  type: OutageType;
  priority: OutagePriority;
  zoneIds: WaterZoneId[];
  affectedAreas: string[];
  startTime: string;
  endTime: string;
  reason: string;
  alternativeArrangement: string;
  status: OutageStatus;
  views: number;
  createdAt: string;
  publishedBy: string;
}

export type ComplaintType =
  | 'Low Water Pressure'
  | 'No Water Supply'
  | 'Contaminated Water'
  | 'Pipeline Leak'
  | 'Irregular Supply'
  | 'Dirty Water'
  | 'Water Logging'
  | 'Meter Reading Issue'
  | 'Connection Issue'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Reopened';
export type ComplaintPriority = 'High' | 'Medium' | 'Low';

export interface ComplaintTimelineStep {
  status: ComplaintStatus;
  timestamp: string;
  notes: string;
  actor: string;
}

export interface Complaint {
  id: string; // CMP2026100701
  citizenName: string;
  phone: string;
  email: string;
  address: string;
  zoneId: WaterZoneId;
  areaId: string;
  areaName: string;
  locality: string;
  coordinates?: [number, number];
  issueType: ComplaintType;
  priority: ComplaintPriority;
  description: string;
  photoUrl?: string;
  status: ComplaintStatus;
  timeline: ComplaintTimelineStep[];
  assignedWorker?: {
    id: string;
    name: string;
    phone: string;
    designation: string;
  };
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  rating?: number;
  feedback?: string;
}

export type TankerBookingStatus =
  | 'Pending'
  | 'Approved'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled';

export type TankerCapacity = 5000 | 10000 | 15000;

export interface Depot {
  id: string;
  name: string;
  zoneId: WaterZoneId;
  address: string;
  lat: number;
  lng: number;
  totalTankers: number;
  availableTankers: number;
  managerName: string;
  phone: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  depotId: string;
  capacity: TankerCapacity;
  currentStatus: 'Available' | 'On Delivery' | 'Off Duty';
  currentLocation?: [number, number];
  rating: number;
  deliveriesToday: number;
}

export interface TankerBooking {
  id: string; // TNK2026100701
  citizenName: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  zoneId: WaterZoneId;
  areaName: string;
  address: string;
  landmark: string;
  citizenCoordinates: [number, number];
  assignedDepotId: string;
  assignedDepotName: string;
  depotCoordinates: [number, number];
  distanceKm: number;
  estimatedArrivalMins: string;
  bookingDate: string; // YYYY-MM-DD (Strictly today or tomorrow)
  timeSlot: string; // e.g., "10:00 - 12:00"
  capacity: TankerCapacity;
  reason: string;
  status: TankerBookingStatus;
  createdAt: string;
  assignedDriver?: Driver;
  cancellationReason?: string;
  rating?: number;
  feedback?: string;
  deliveryCompletedAt?: string;
}

export interface FieldWorker {
  id: string;
  name: string;
  phone: string;
  zoneId: WaterZoneId;
  specialization: 'Pipeline & Valve' | 'Water Quality & Chemical' | 'Motor & Pump' | 'General Plumber';
  activeComplaints: number;
  completedTotal: number;
  rating: number;
  avatar: string;
}

export interface CitizenUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  zoneId?: WaterZoneId;
  areaName?: string;
  locality?: string;
  isGuest?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Zone Manager' | 'Field Officer';
  assignedZone?: WaterZoneId;
  lastLogin: string;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'complaint' | 'tanker' | 'alert' | 'schedule';
  zoneId?: WaterZoneId;
}

export interface SystemStats {
  waterSuppliedTodayMLD: number;
  activeComplaintsCount: number;
  tankersDispatchedToday: number;
  citizensServedTotal: number;
  avgResponseTimeHours: number;
  tankerUtilizationPercent: number;
}
