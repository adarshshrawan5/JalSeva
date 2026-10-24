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
  MeterReadingRecord,
  CitizenUser,
  WorkAnalysis,
  WorkerPaymentDetails,
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
  INITIAL_METER_READINGS,
} from '../data/mbmcData';
import { firebaseService } from './firebaseService';

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
  METER_READINGS: 'aqua_connect_meter_readings_v1',
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
    if (!localStorage.getItem(STORAGE_KEYS.METER_READINGS)) {
      localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify(INITIAL_METER_READINGS));
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
      cloudSyncStatus: 'local_only',
    };
    alerts.unshift(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    this.addAuditLog(adminName, 'Alert Published', `${alert.type}: ${alert.title}`);
    this.dispatchEvent();
    firebaseService
      .syncOutageAlert(newAlert)
      .then((res) => {
        if (res && res.success) {
          this.updateAlertSyncStatus(newId, 'synced');
        } else {
          this.updateAlertSyncStatus(newId, 'failed', res?.error || 'Firestore write rejected');
        }
      })
      .catch((err: any) => {
        this.updateAlertSyncStatus(newId, 'failed', err?.message || 'Firestore write error');
      });
    return newAlert;
  }

  updateAlertSyncStatus(alertId: string, status: 'synced' | 'failed' | 'local_only', error?: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, cloudSyncStatus: status, cloudSyncError: error } : a
    );
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    this.dispatchEvent();
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

  updateComplaintSyncStatus(complaintId: string, status: 'synced' | 'failed' | 'local_only', error?: string): void {
    const complaints = this.getComplaints();
    const updated = complaints.map((c) =>
      c.id === complaintId ? { ...c, cloudSyncStatus: status, cloudSyncError: error } : c
    );
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.dispatchEvent();
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
      cloudSyncStatus: 'local_only',
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
    firebaseService
      .syncComplaint(newComplaint)
      .then((res) => {
        if (res && res.success) {
          this.updateComplaintSyncStatus(id, 'synced');
        } else {
          this.updateComplaintSyncStatus(id, 'failed', res?.error || 'Firestore write rejected');
        }
      })
      .catch((err: any) => {
        this.updateComplaintSyncStatus(id, 'failed', err?.message || 'Firestore write error');
      });
    return newComplaint;
  }

  assignComplaintWorker(
    complaintId: string,
    worker: {
      id: string;
      name: string;
      phone: string;
      designation: string;
      avatar?: string;
      rating?: number;
      specialization?: string;
    },
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
          paymentStatus: c.paymentStatus || 'Pending',
          timeline: [
            ...c.timeline,
            {
              status: 'Assigned' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Assigned to field specialist ${worker.name} (${worker.phone} - ${worker.designation || worker.specialization || 'Field Engineer'})`,
              actor: adminName,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    // Update worker's active load
    const workers = this.getWorkers();
    const updatedWorkers = workers.map((w) =>
      w.id === worker.id
        ? { ...w, activeComplaints: (w.activeComplaints || 0) + 1, currentStatus: 'On Job' as const }
        : w
    );
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));

    this.addAuditLog(adminName, 'Worker Assigned to Complaint', `Complaint ${complaintId} assigned to specialist ${worker.name}`);
    this.dispatchEvent();
  }

  citizenRejectAssignedWorker(complaintId: string, reason: string): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    let assignedWorkerId: string | undefined;

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        assignedWorkerId = c.assignedWorker?.id;
        return {
          ...c,
          status: 'Pending' as ComplaintStatus,
          assignedWorker: undefined,
          timeline: [
            ...c.timeline,
            {
              status: 'Pending' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Citizen declined assigned specialist due to: "${reason}". Ticket returned to MBMC Admin Desk for reassignment.`,
              actor: 'Citizen Complainant',
            },
          ],
        };
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    if (assignedWorkerId) {
      const workers = this.getWorkers();
      const updatedWorkers = workers.map((w) =>
        w.id === assignedWorkerId
          ? {
              ...w,
              activeComplaints: Math.max(0, (w.activeComplaints || 1) - 1),
              currentStatus: 'Available' as const,
            }
          : w
      );
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));
    }

    this.addAuditLog('Citizen', 'Worker Declined & Reassignment Requested', `Complaint ${complaintId} worker declined: ${reason}`);
    this.dispatchEvent();
  }

  broadcastComplaint(complaintId: string, adminName: string = 'Admin Desk'): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          isBroadcasted: true,
          timeline: [
            ...c.timeline,
            {
              status: c.status,
              timestamp: nowIso,
              notes: `Broadcasted to qualified municipal plumbers in zone/specialty pool for 1st-accept claim.`,
              actor: adminName,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.addAuditLog(adminName, 'Complaint Broadcasted', `Complaint ${complaintId} broadcasted to open plumber pool for 1st-claim`);
    this.dispatchEvent();
  }

  workerAcceptBroadcastJob(complaintId: string, worker: FieldWorker): boolean {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    let success = false;

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        if (c.assignedWorker) {
          return c; // Already claimed by another worker!
        }
        success = true;
        return {
          ...c,
          status: 'Assigned' as ComplaintStatus,
          assignedWorker: {
            id: worker.id,
            name: worker.name,
            phone: worker.phone,
            designation: worker.specialization,
            avatar: worker.avatar,
            rating: worker.rating,
            specialization: worker.specialization,
          },
          paymentStatus: c.paymentStatus || 'Pending',
          timeline: [
            ...c.timeline,
            {
              status: 'Assigned' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Claimed and accepted first by field specialist ${worker.name} (${worker.phone} - ${worker.specialization})`,
              actor: `${worker.name} (Field Plumber)`,
            },
          ],
        };
      }
      return c;
    });

    if (success) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      const workers = this.getWorkers();
      const updatedWorkers = workers.map((w) =>
        w.id === worker.id
          ? { ...w, activeComplaints: (w.activeComplaints || 0) + 1, currentStatus: 'On Job' as const }
          : w
      );
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));
      this.addAuditLog(worker.name, 'Broadcast Job Claimed', `Worker ${worker.name} claimed broadcast job ${complaintId}`);
      this.dispatchEvent();
    }
    return success;
  }

  workerCancelOrDeclineJob(complaintId: string, workerId: string, reason: string): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    let workerName = 'Field Plumber';

    const updated = complaints.map((c) => {
      if (c.id === complaintId && c.assignedWorker?.id === workerId) {
        workerName = c.assignedWorker.name;
        return {
          ...c,
          status: 'Pending' as ComplaintStatus,
          assignedWorker: undefined,
          isBroadcasted: true, // Return to open broadcast pool
          timeline: [
            ...c.timeline,
            {
              status: 'Pending' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Job cancelled/released by assigned specialist ${workerName} due to: "${reason}". Returned to open broadcast queue for 1st-claim.`,
              actor: `${workerName} (Field Plumber)`,
            },
          ],
        };
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    const workers = this.getWorkers();
    const updatedWorkers = workers.map((w) =>
      w.id === workerId
        ? {
            ...w,
            activeComplaints: Math.max(0, (w.activeComplaints || 1) - 1),
            currentStatus: 'Available' as const,
          }
        : w
    );
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));
    this.addAuditLog(workerName, 'Job Cancelled / Released', `Worker ${workerName} cancelled job ${complaintId}: ${reason}`);
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

  workerUpdateJobStatus(
    complaintId: string,
    status: ComplaintStatus,
    notes: string,
    workerName: string
  ): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status,
          timeline: [
            ...c.timeline,
            {
              status,
              timestamp: nowIso,
              notes,
              actor: workerName,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.addAuditLog(workerName, `Worker Status -> ${status}`, `Complaint ${complaintId}: ${notes}`);
    this.dispatchEvent();
  }

  workerSubmitWorkAnalysis(
    complaintId: string,
    analysis: WorkAnalysis,
    worker: FieldWorker
  ): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'Resolved' as ComplaintStatus,
          workAnalysis: analysis,
          resolutionNotes: analysis.analysisNotes || analysis.diagnosis,
          resolvedAt: nowIso,
          paymentStatus: c.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
          timeline: [
            ...c.timeline,
            {
              status: 'Resolved' as ComplaintStatus,
              timestamp: nowIso,
              notes: `Field Work & Technical Analysis Completed: ${analysis.diagnosis}. Total repair/service fee: ₹${analysis.totalAmount}`,
              actor: `${worker.name} (Field Specialist)`,
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    // Update worker stats: decrement active load, increment completedTotal
    const workers = this.getWorkers();
    const updatedWorkers = workers.map((w) =>
      w.id === worker.id
        ? {
            ...w,
            activeComplaints: Math.max(0, (w.activeComplaints || 1) - 1),
            completedTotal: (w.completedTotal || 0) + 1,
            currentStatus: 'Available' as const,
          }
        : w
    );
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));

    this.updateStatsDelta({ activeComplaintsDelta: -1 });
    this.addAuditLog(worker.name, 'Work Analysis Submitted', `Complaint ${complaintId} resolved with fee ₹${analysis.totalAmount}`);
    this.dispatchEvent();
  }

  citizenPayWorkerService(
    complaintId: string,
    payment: WorkerPaymentDetails
  ): void {
    const complaints = this.getComplaints();
    const nowIso = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          paymentStatus: 'Paid' as const,
          paymentDetails: payment,
          timeline: [
            ...c.timeline,
            {
              status: c.status,
              timestamp: nowIso,
              notes: `Citizen payment of ₹${payment.amount} settled via ${payment.method} (TXN ID: ${payment.transactionId}). Official e-Receipt issued.`,
              actor: payment.payerName || 'Citizen Complainant',
            },
          ],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.addAuditLog('Citizen Payment', 'Worker Service Fee Paid', `Complaint ${complaintId}: ₹${payment.amount} paid via ${payment.method} [TXN: ${payment.transactionId}]`);
    this.dispatchEvent();
  }

  rateComplaint(complaintId: string, rating: number, feedback?: string): void {
    const complaints = this.getComplaints();
    let assignedWorkerId: string | undefined;
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        assignedWorkerId = c.assignedWorker?.id;
        return { ...c, rating, feedback };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    // Also update assigned worker rating average if worker exists
    if (assignedWorkerId) {
      const workers = this.getWorkers();
      const updatedWorkers = workers.map((w) => {
        if (w.id === assignedWorkerId) {
          const currentRating = w.rating || 5.0;
          const newAvg = Number(((currentRating * 4 + rating) / 5).toFixed(1));
          return { ...w, rating: newAvg };
        }
        return w;
      });
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updatedWorkers));
    }

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

  updateBookingSyncStatus(bookingId: string, status: 'synced' | 'failed' | 'local_only', error?: string): void {
    const bookings = this.getBookings();
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, cloudSyncStatus: status, cloudSyncError: error } : b
    );
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    this.dispatchEvent();
  }

  addBooking(
    bookingData: Omit<TankerBooking, 'id' | 'createdAt' | 'status' | 'deliveryOtp'> & { deliveryOtp?: string }
  ): TankerBooking {
    if (!isValidBookingDate(bookingData.bookingDate)) {
      throw new Error('Booking date must be strictly restricted to Today or Tomorrow.');
    }
    const bookings = this.getBookings();

    // Duplicate check: prevent duplicate active booking spam for same phone & booking date
    const hasDuplicateActive = bookings.some(
      (b) =>
        b.phone === bookingData.phone &&
        b.bookingDate === bookingData.bookingDate &&
        ['Pending', 'Approved', 'Dispatched', 'In Transit'].includes(b.status)
    );
    if (hasDuplicateActive) {
      throw new Error(`An active tanker booking already exists for phone ${bookingData.phone} on ${bookingData.bookingDate}.`);
    }

    const id = generateBookingId();
    const deliveryOtp =
      bookingData.deliveryOtp ||
      Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: TankerBooking = {
      ...bookingData,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      deliveryOtp,
      otpVerified: false,
      cloudSyncStatus: 'local_only',
    };
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Decrement available tanker count at depot
    this.decrementDepotTanker(bookingData.assignedDepotId);
    this.dispatchEvent();
    firebaseService
      .syncTankerBooking(newBooking)
      .then((res) => {
        if (res && res.success) {
          this.updateBookingSyncStatus(id, 'synced');
        } else {
          this.updateBookingSyncStatus(id, 'failed', res?.error || 'Firestore write rejected');
        }
      })
      .catch((err: any) => {
        this.updateBookingSyncStatus(id, 'failed', err?.message || 'Firestore write error');
      });
    return newBooking;
  }

  verifyDeliveryOtp(bookingId: string, otp: string): boolean {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    if (booking.deliveryOtp === otp.trim()) {
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, otpVerified: true } : b
      );
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      this.dispatchEvent();
      return true;
    }
    return false;
  }

  updateTankerPayment(
    bookingId: string,
    paymentDetails: {
      paymentStatus: 'Paid';
      paymentMethod: string;
      transactionId: string;
      amountPaid: number;
      paidAt?: string;
    }
  ): void {
    const bookings = this.getBookings();
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            paymentStatus: paymentDetails.paymentStatus,
            paymentMethod: paymentDetails.paymentMethod,
            transactionId: paymentDetails.transactionId,
            amountPaid: paymentDetails.amountPaid,
            paidAt: paymentDetails.paidAt || new Date().toISOString(),
          }
        : b
    );
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    this.addAuditLog('Citizen Payment', 'Tanker Fee Settled', `Booking ${bookingId}: ₹${paymentDetails.amountPaid} paid via ${paymentDetails.paymentMethod}`);
    this.dispatchEvent();
  }

  // Location persistence across site
  saveDetectedLocation(coords: [number, number], areaName: string, zoneId: string): void {
    localStorage.setItem(
      'jalseva_detected_location',
      JSON.stringify({ coords, areaName, zoneId, timestamp: new Date().toISOString() })
    );
    this.dispatchEvent();
  }

  getSavedDetectedLocation(): { coords: [number, number]; areaName: string; zoneId: string } | null {
    const raw = localStorage.getItem('jalseva_detected_location');
    return raw ? JSON.parse(raw) : null;
  }

  // Registered Citizens Repository (Enforcing unique phone numbers)
  getRegisteredCitizens(): CitizenUser[] {
    const raw = localStorage.getItem('jalseva_registered_citizens_v1');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Seed with standard municipal demo citizen accounts
    const initialSeed: CitizenUser[] = [
      {
        id: 'cit-9820544123',
        name: 'Sunil Merchant',
        phone: '9820544123',
        areaName: 'Jesal Park',
        address: 'Building 14, Bhakti Park, Chowpatty Road',
        zoneId: 'zone-1',
        joinedDate: '2026-09-15T10:00:00.000Z',
      },
      {
        id: 'cit-9820123456',
        name: 'Rajesh Kumar',
        phone: '9820123456',
        areaName: 'Golden Nest',
        address: 'Flat 402, Golden Heritage Phase 2',
        zoneId: 'zone-1',
        joinedDate: '2026-09-20T11:30:00.000Z',
      },
      {
        id: 'cit-9870188992',
        name: 'Fatima Shaikh',
        phone: '9870188992',
        areaName: 'Naya Nagar',
        address: 'A-Wing, Millat Heights, Naya Nagar',
        zoneId: 'zone-3',
        joinedDate: '2026-09-28T14:15:00.000Z',
      },
    ];
    localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(initialSeed));
    return initialSeed;
  }

  isPhoneRegistered(phone: string): boolean {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const citizens = this.getRegisteredCitizens();
    return citizens.some((c) => c.phone.replace(/\D/g, '').slice(-10) === clean);
  }

  findCitizenByPhone(phone: string): CitizenUser | null {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const citizens = this.getRegisteredCitizens();
    return citizens.find((c) => c.phone.replace(/\D/g, '').slice(-10) === clean) || null;
  }

  async findCitizenByPhoneAsync(phone: string): Promise<CitizenUser | null> {
    const local = this.findCitizenByPhone(phone);
    if (local) return local;

    // Query Cloud Firestore document directly by ID (allowed get operation)
    try {
      const remote = await firebaseService.fetchCitizenByPhone(phone);
      if (remote) {
        const citizens = this.getRegisteredCitizens();
        const clean = phone.replace(/\D/g, '').slice(-10);
        if (!citizens.some((c) => c.phone.replace(/\D/g, '').slice(-10) === clean)) {
          citizens.push(remote);
          localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(citizens));
          this.dispatchEvent();
        }
        return remote;
      }
    } catch {
      // Non-blocking fallback
    }
    return null;
  }

  registerCitizen(citizen: Omit<CitizenUser, 'id'> & { id?: string }): { success: boolean; error?: string; citizen?: CitizenUser } {
    const clean = citizen.phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      return { success: false, error: 'Mobile number must be a valid 10-digit number.' };
    }
    const citizens = this.getRegisteredCitizens();
    const existing = citizens.find((c) => c.phone.replace(/\D/g, '').slice(-10) === clean);
    if (existing) {
      return {
        success: false,
        error: `An account already exists for +91 ${clean} (${existing.name}). Please use the Log In tab or sign in directly with your registered number.`,
      };
    }

    const newCitizen: CitizenUser = {
      ...citizen,
      id: citizen.id || `cit-${clean}`,
      phone: clean,
      joinedDate: citizen.joinedDate || new Date().toISOString(),
    };
    citizens.push(newCitizen);
    localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(citizens));
    this.dispatchEvent();

    // Automatically sync registered citizen user details to Cloud Firestore database
    firebaseService.syncUserProfile(newCitizen, 'citizen').catch((err) => {
      console.warn('[StorageService] Error syncing registered citizen to Firestore:', err);
    });

    return { success: true, citizen: newCitizen };
  }

  // Citizen Profile persistence
  saveCitizenProfile(profile: any): void {
    localStorage.setItem('jalseva_active_citizen_profile', JSON.stringify(profile));
    // If saving a new profile with a phone number, make sure it is in registered citizens if not present
    if (profile?.phone) {
      const clean = profile.phone.replace(/\D/g, '').slice(-10);
      const citizens = this.getRegisteredCitizens();
      const existingIdx = citizens.findIndex((c) => c.phone.replace(/\D/g, '').slice(-10) === clean);
      const userToSync: CitizenUser = {
        id: profile.id || `cit-${clean}`,
        name: profile.name,
        phone: clean,
        address: profile.address,
        areaName: profile.areaName,
        zoneId: profile.zoneId,
        joinedDate: profile.joinedDate || new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        citizens[existingIdx] = { ...citizens[existingIdx], ...userToSync };
        localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(citizens));
      } else {
        citizens.push(userToSync);
        localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(citizens));
      }

      // Automatically sync citizen user details to Cloud Firestore database
      firebaseService.syncUserProfile(userToSync, 'citizen').catch((err) => {
        console.warn('[StorageService] Error syncing citizen profile to Firestore:', err);
      });
    }
    this.dispatchEvent();
  }

  // Sync registered citizens from Cloud Firestore to browser local storage
  async syncRegisteredCitizensFromCloud(): Promise<number> {
    try {
      const remoteCitizens = await firebaseService.fetchRegisteredCitizens();
      if (!remoteCitizens || remoteCitizens.length === 0) return 0;

      const localCitizens = this.getRegisteredCitizens();
      const localPhones = new Set(localCitizens.map((c) => c.phone.replace(/\D/g, '').slice(-10)));

      let added = 0;
      remoteCitizens.forEach((rc) => {
        const clean = rc.phone.replace(/\D/g, '').slice(-10);
        if (clean && !localPhones.has(clean)) {
          localCitizens.push(rc);
          localPhones.add(clean);
          added++;
        }
      });

      if (added > 0) {
        localStorage.setItem('jalseva_registered_citizens_v1', JSON.stringify(localCitizens));
        this.dispatchEvent();
      }
      return added;
    } catch (err) {
      console.warn('[StorageService] Failed to sync registered citizens from Firestore:', err);
      return 0;
    }
  }

  clearCitizenProfile(): void {
    localStorage.removeItem('jalseva_active_citizen_profile');
    this.dispatchEvent();
  }

  getCitizenProfile(): any | null {
    const raw = localStorage.getItem('jalseva_active_citizen_profile');
    return raw ? JSON.parse(raw) : null;
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

  updateWorkerStatus(workerId: string, status: 'Available' | 'On Job' | 'Off Duty'): void {
    const workers = this.getWorkers();
    const updated = workers.map((w) => (w.id === workerId ? { ...w, currentStatus: status } : w));
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(updated));
    this.dispatchEvent();
  }

  getActiveWorkerSession(): FieldWorker | null {
    const raw = localStorage.getItem('jalseva_active_worker_session');
    return raw ? JSON.parse(raw) : null;
  }

  setActiveWorkerSession(worker: FieldWorker | null): void {
    if (worker) {
      localStorage.setItem('jalseva_active_worker_session', JSON.stringify(worker));
    } else {
      localStorage.removeItem('jalseva_active_worker_session');
    }
    this.dispatchEvent();
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

  // Meter Readings
  getMeterReadings(): MeterReadingRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.METER_READINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify(INITIAL_METER_READINGS));
      return INITIAL_METER_READINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify(INITIAL_METER_READINGS));
        return INITIAL_METER_READINGS;
      }
      return parsed;
    } catch {
      return INITIAL_METER_READINGS;
    }
  }

  updateMeterReadingSyncStatus(readingId: string, status: 'synced' | 'failed' | 'local_only', error?: string): void {
    const readings = this.getMeterReadings();
    const updated = readings.map((r) =>
      r.id === readingId ? { ...r, cloudSyncStatus: status, cloudSyncError: error } : r
    );
    localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify(updated));
    this.dispatchEvent();
  }

  addMeterReading(reading: Omit<MeterReadingRecord, 'id' | 'readingDate' | 'status'>): MeterReadingRecord {
    const readings = this.getMeterReadings();
    const newRecord: MeterReadingRecord = {
      ...reading,
      id: `WMR${Date.now().toString().slice(-8)}`,
      readingDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      cloudSyncStatus: 'local_only',
    };
    readings.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify(readings));
    this.dispatchEvent();
    firebaseService
      .syncMeterReading(newRecord)
      .then((res) => {
        if (res && res.success) {
          this.updateMeterReadingSyncStatus(newRecord.id, 'synced');
        } else {
          this.updateMeterReadingSyncStatus(newRecord.id, 'failed', res?.error || 'Firestore write rejected');
        }
      })
      .catch((err: any) => {
        this.updateMeterReadingSyncStatus(newRecord.id, 'failed', err?.message || 'Firestore write error');
      });
    return newRecord;
  }

  // Cloud Hydration upon authenticated session
  async hydrateUserFromFirestore(userId: string): Promise<{
    complaintsHydrated: number;
    bookingsHydrated: number;
    readingsHydrated: number;
  }> {
    const stats = { complaintsHydrated: 0, bookingsHydrated: 0, readingsHydrated: 0 };
    try {
      const [remoteComplaints, remoteBookings, remoteReadings] = await Promise.all([
        firebaseService.fetchUserComplaints(userId),
        firebaseService.fetchUserBookings(userId),
        firebaseService.fetchUserMeterReadings(userId),
      ]);

      if (remoteComplaints && remoteComplaints.length > 0) {
        const localComplaints = this.getComplaints();
        const localIds = new Set(localComplaints.map((c) => c.id));
        const toAdd = remoteComplaints.filter((rc) => !localIds.has(rc.id));
        if (toAdd.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify([...toAdd, ...localComplaints]));
          stats.complaintsHydrated = toAdd.length;
        }
      }

      if (remoteBookings && remoteBookings.length > 0) {
        const localBookings = this.getBookings();
        const localIds = new Set(localBookings.map((b) => b.id));
        const toAdd = remoteBookings.filter((rb) => !localIds.has(rb.id));
        if (toAdd.length > 0) {
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([...toAdd, ...localBookings]));
          stats.bookingsHydrated = toAdd.length;
        }
      }

      if (remoteReadings && remoteReadings.length > 0) {
        const localReadings = this.getMeterReadings();
        const localIds = new Set(localReadings.map((r) => r.id));
        const toAdd = remoteReadings.filter((rr) => !localIds.has(rr.id));
        if (toAdd.length > 0) {
          localStorage.setItem(STORAGE_KEYS.METER_READINGS, JSON.stringify([...toAdd, ...localReadings]));
          stats.readingsHydrated = toAdd.length;
        }
      }

      if (stats.complaintsHydrated > 0 || stats.bookingsHydrated > 0 || stats.readingsHydrated > 0) {
        this.dispatchEvent();
      }
    } catch (err) {
      console.error('[StorageService] Error during Firestore hydration:', err);
    }
    return stats;
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
