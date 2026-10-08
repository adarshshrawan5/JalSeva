import {
  WaterZone,
  OutageAlert,
  Complaint,
  TankerBooking,
  Depot,
  Driver,
  FieldWorker,
  SystemStats,
  ComplaintStatus,
  TankerBookingStatus,
} from '../types';
import {
  MBMC_ZONES,
  MBMC_DEPOTS,
  MBMC_DRIVERS,
  MBMC_WORKERS,
  INITIAL_ALERTS,
  INITIAL_COMPLAINTS,
  INITIAL_BOOKINGS,
  INITIAL_STATS,
} from '../data/mbmcData';

const STORAGE_KEYS = {
  ZONES: 'aqua_connect_zones_v1',
  ALERTS: 'aqua_connect_alerts_v1',
  COMPLAINTS: 'aqua_connect_complaints_v1',
  BOOKINGS: 'aqua_connect_bookings_v1',
  DEPOTS: 'aqua_connect_depots_v1',
  DRIVERS: 'aqua_connect_drivers_v1',
  WORKERS: 'aqua_connect_workers_v1',
  STATS: 'aqua_connect_stats_v1',
  AUDIT_LOGS: 'aqua_connect_audit_logs_v1',
};

// Date helper functions (Strict Today & Tomorrow logic)
export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function isValidBookingDate(dateStr: string): boolean {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  return dateStr === today || dateStr === tomorrow;
}

export function generateComplaintId(): string {
  const todayStr = getTodayDateString().replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `CMP${todayStr}${randomSuffix}`;
}

export function generateBookingId(): string {
  const todayStr = getTodayDateString().replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `TNK${todayStr}${randomSuffix}`;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

class StorageService {
  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.ZONES)) {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(MBMC_ZONES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPOTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPOTS, JSON.stringify(MBMC_DEPOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(MBMC_DRIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(MBMC_WORKERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(
        STORAGE_KEYS.AUDIT_LOGS,
        JSON.stringify([
          {
            id: 'log-1',
            adminName: 'Chief Engineer',
            action: 'Schedule Published',
            details: 'Standard monsoon-to-winter supply timings synced across all 4 zones.',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ])
      );
    }
  }

  private dispatchEvent() {
    window.dispatchEvent(new Event('aqua_connect_storage_update'));
  }

  // Zones & Schedule
  getZones(): WaterZone[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ZONES);
    return raw ? JSON.parse(raw) : MBMC_ZONES;
  }

  updateZoneSchedule(
    zoneId: string,
    morningStart: string,
    morningEnd: string,
    eveningStart: string,
    eveningEnd: string,
    frequency?: string,
    pressure?: 'High' | 'Normal' | 'Moderate',
    adminName: string = 'Admin'
  ): void {
    const zones = this.getZones();
    const updated = zones.map((z) => {
      if (z.id === zoneId) {
        return {
          ...z,
          supplyWindows: {
            morning: { start: morningStart, end: morningEnd },
            evening: { start: eveningStart, end: eveningEnd },
            frequency: frequency || z.supplyWindows.frequency,
            pressure: pressure || z.supplyWindows.pressure,
          },
        };
      }
      return z;
    });

    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(updated));
    this.addAuditLog(
      adminName,
      `Updated ${zoneId} Water Schedule`,
      `Morning: ${morningStart}-${morningEnd}, Evening: ${eveningStart}-${eveningEnd}`
    );
    this.dispatchEvent();
  }

  bulkUpdateSchedule(
    morningStart: string,
    morningEnd: string,
    eveningStart: string,
    eveningEnd: string,
    adminName: string = 'Super Admin'
  ): void {
    const zones = this.getZones();
    const updated = zones.map((z) => ({
      ...z,
      supplyWindows: {
        ...z.supplyWindows,
        morning: { start: morningStart, end: morningEnd },
        evening: { start: eveningStart, end: eveningEnd },
      },
    }));
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(updated));
    this.addAuditLog(
      adminName,
      'Bulk Schedule Updated',
      `Applied ${morningStart}-${morningEnd} & ${eveningStart}-${eveningEnd} to all zones`
    );
    this.dispatchEvent();
  }

  // Alerts
  getAlerts(): OutageAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return raw ? JSON.parse(raw) : INITIAL_ALERTS;
  }

  addAlert(alert: Omit<OutageAlert, 'id' | 'createdAt' | 'views'>, adminName: string = 'Admin'): OutageAlert {
    const alerts = this.getAlerts();
    const todayStr = getTodayDateString().replace(/-/g, '');
    const newId = `ALT${todayStr}${Math.floor(10 + Math.random() * 90)}`;
    const newAlert: OutageAlert = {
      ...alert,
      id: newId,
      createdAt: new Date().toISOString(),
      views: 1,
    };
    alerts.unshift(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    this.addAuditLog(adminName, 'Alert Published', `${alert.type}: ${alert.title}`);
    this.dispatchEvent();
    return newAlert;
  }

  updateAlertStatus(alertId: string, status: 'Active' | 'Resolved' | 'Expired', adminName: string = 'Admin'): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, status } : a));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    this.addAuditLog(adminName, `Alert Status Changed: ${alertId}`, `Changed to ${status}`);
    this.dispatchEvent();
  }

  deleteAlert(alertId: string, adminName: string = 'Admin'): void {
    const alerts = this.getAlerts();
    const filtered = alerts.filter((a) => a.id !== alertId);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(filtered));
    this.addAuditLog(adminName, 'Alert Deleted', `Removed alert ID: ${alertId}`);
    this.dispatchEvent();
  }

  // Complaints
  getComplaints(): Complaint[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return raw ? JSON.parse(raw) : INITIAL_COMPLAINTS;
  }

  addComplaint(data: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'timeline'>): Complaint {
    const complaints = this.getComplaints();
    const id = generateComplaintId();
    const nowIso = new Date().toISOString();
    const newComplaint: Complaint = {
      ...data,
      id,
      status: 'Pending',
      createdAt: nowIso,
      timeline: [
        {
          status: 'Pending',
          timestamp: nowIso,
          notes: 'Complaint registered successfully on citizen portal',
          actor: 'Citizen Portal',
        },
      ],
    };
    complaints.unshift(newComplaint);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));

    // Update active complaints count in stats
    this.updateStatsDelta({ activeComplaintsDelta: 1 });
    this.dispatchEvent();
    return newComplaint;
  }

  assignComplaintWorker(
    complaintId: string,
    worker: { id: string; name: string; phone: string; designation: string },
    adminName: string = 'Admin Desk'
  ): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'Assigned' as ComplaintStatus,
          assignedWorker: worker,
          timeline: [
            ...c.timeline,
            {
              status: 'Assigned' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Assigned to field worker ${worker.name} (${worker.phone})`,
              actor: adminName,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.addAuditLog(adminName, 'Complaint Assigned', `Complaint ${complaintId} assigned to ${worker.name}`);
    this.dispatchEvent();
  }

  updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    notes: string,
    actor: string = 'Admin Desk'
  ): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const isResolved = status === 'Resolved';
        return {
          ...c,
          status,
          resolutionNotes: isResolved ? notes : c.resolutionNotes,
          resolvedAt: isResolved ? nowIso : c.resolvedAt,
          timeline: [
            ...c.timeline,
            {
              status,
              timestamp: nowIso,
              notes,
              actor,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    if (status === 'Resolved') {
      this.updateStatsDelta({ activeComplaintsDelta: -1 });
    }
    this.addAuditLog(actor, `Complaint Status -> ${status}`, `${complaintId}: ${notes}`);
    this.dispatchEvent();
  }

  rateComplaint(complaintId: string, rating: number, feedback?: string): void {
    const complaints = this.getComplaints();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return { ...c, rating, feedback };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.dispatchEvent();
  }

  reopenComplaint(complaintId: string, reason: string): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'Reopened' as ComplaintStatus,
          timeline: [
            ...c.timeline,
            {
              status: 'Reopened' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Citizen reopened complaint: "${reason}"`,
              actor: 'Citizen',
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.updateStatsDelta({ activeComplaintsDelta: 1 });
    this.dispatchEvent();
  }

  // Tanker Bookings
  getBookings(): TankerBooking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  }

  addBooking(
    bookingData: Omit<TankerBooking, 'id' | 'createdAt' | 'status'>
  ): TankerBooking {
    if (!isValidBookingDate(bookingData.bookingDate)) {
      throw new Error('Booking date must be strictly restricted to Today or Tomorrow.');
    }
    const bookings = this.getBookings();
    const id = generateBookingId();
    const newBooking: TankerBooking = {
      ...bookingData,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Decrement available tanker count at depot
    this.decrementDepotTanker(bookingData.assignedDepotId);
    this.dispatchEvent();
    return newBooking;
  }

  updateBookingStatus(
    bookingId: string,
    status: TankerBookingStatus,
    driver?: Driver,
    cancellationReason?: string,
    adminName: string = 'Tanker Dispatch Manager'
  ): void {
    const bookings = this.getBookings();
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          assignedDriver: driver || b.assignedDriver,
          cancellationReason: cancellationReason || b.cancellationReason,
          deliveryCompletedAt: status === 'Delivered' ? new Date().toISOString() : b.deliveryCompletedAt,
        };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));

    if (status === 'Delivered') {
      this.updateStatsDelta({ tankersDispatchedDelta: 1 });
    }
    this.addAuditLog(adminName, `Tanker Booking ${status}`, `Booking ${bookingId} marked as ${status}`);
    this.dispatchEvent();
  }

  driverStartTrip(bookingId: string, driver: Driver): void {
    const bookings = this.getBookings();
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'In Transit' as TankerBookingStatus,
          assignedDriver: driver,
        };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));

    // Update driver status to On Delivery
    const drivers = this.getDrivers();
    const updatedDrivers = drivers.map((d) =>
      d.id === driver.id ? { ...d, currentStatus: 'On Delivery' as const } : d
    );
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(updatedDrivers));

    this.addAuditLog(driver.name, 'Driver Started Trip', `Tanker ${driver.vehicleNumber} en route to booking ${bookingId}`);
    this.dispatchEvent();
  }

  driverCompleteTrip(bookingId: string, driverId: string): void {
    const bookings = this.getBookings();
    const nowIso = new Date().toISOString();
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Delivered' as TankerBookingStatus,
          deliveryCompletedAt: nowIso,
        };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));

    // Update driver: Available, increment deliveriesToday
    const drivers = this.getDrivers();
    const updatedDrivers = drivers.map((d) =>
      d.id === driverId
        ? { ...d, currentStatus: 'Available' as const, deliveriesToday: d.deliveriesToday + 1 }
        : d
    );
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(updatedDrivers));

    this.updateStatsDelta({ tankersDispatchedDelta: 1 });
    this.addAuditLog('Driver', 'Water Tanker Delivered', `Delivery for booking ${bookingId} marked complete`);
    this.dispatchEvent();
  }

  rateBooking(bookingId: string, rating: number, feedback?: string): void {
    const bookings = this.getBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, rating, feedback } : b));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    this.dispatchEvent();
  }

  // Depots & Drivers
  getDepots(): Depot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPOTS);
    return raw ? JSON.parse(raw) : MBMC_DEPOTS;
  }

  private decrementDepotTanker(depotId: string) {
    const depots = this.getDepots();
    const updated = depots.map((d) => {
      if (d.id === depotId && d.availableTankers > 0) {
        return { ...d, availableTankers: d.availableTankers - 1 };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEYS.DEPOTS, JSON.stringify(updated));
  }

  getDrivers(): Driver[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return raw ? JSON.parse(raw) : MBMC_DRIVERS;
  }

  getWorkers(): FieldWorker[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKERS);
    return raw ? JSON.parse(raw) : MBMC_WORKERS;
  }

  // Stats
  getStats(): SystemStats {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? JSON.parse(raw) : INITIAL_STATS;
  }

  private updateStatsDelta(deltas: {
    activeComplaintsDelta?: number;
    tankersDispatchedDelta?: number;
  }) {
    const stats = this.getStats();
    if (deltas.activeComplaintsDelta) {
      stats.activeComplaintsCount = Math.max(0, stats.activeComplaintsCount + deltas.activeComplaintsDelta);
    }
    if (deltas.tankersDispatchedDelta) {
      stats.tankersDispatchedToday += deltas.tankersDispatchedDelta;
    }
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  addAuditLog(adminName: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      adminName,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 50)));
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.ZONES);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.DEPOTS);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.initDefaults();
    this.dispatchEvent();
  }
}

export const storageService = new StorageService();
