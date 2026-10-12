import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  Complaint,
  TankerBooking,
  MeterReadingRecord,
  OutageAlert,
  CitizenUser,
  AdminUser,
} from '../types';

export class FirebaseService {
  // Sync Complaint to Firestore
  async syncComplaint(complaint: Complaint): Promise<void> {
    const path = `complaints/${complaint.id}`;
    try {
      const docRef = doc(db, 'complaints', complaint.id);
      const payload: Record<string, any> = {
        id: complaint.id,
        citizenName: complaint.citizenName,
        phone: complaint.phone,
        zoneId: complaint.zoneId,
        issueType: complaint.issueType,
        status: complaint.status,
        description: complaint.description,
        address: complaint.address || '',
        areaName: complaint.areaName || '',
        createdAt: complaint.createdAt || new Date().toISOString(),
      };

      if (complaint.priority) payload.priority = complaint.priority;
      if (complaint.email) payload.email = complaint.email;
      if (complaint.locality) payload.locality = complaint.locality;
      if (complaint.areaId) payload.areaId = complaint.areaId;
      if (auth.currentUser) payload.userId = auth.currentUser.uid;

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Sync Tanker Booking to Firestore
  async syncTankerBooking(booking: TankerBooking): Promise<void> {
    const path = `tanker_bookings/${booking.id}`;
    try {
      const docRef = doc(db, 'tanker_bookings', booking.id);
      const payload: Record<string, any> = {
        id: booking.id,
        citizenName: booking.citizenName,
        phone: booking.phone,
        zoneId: booking.zoneId,
        address: booking.address,
        bookingDate: booking.bookingDate,
        capacity: Number(booking.capacity),
        status: booking.status,
        deliveryOtp: booking.deliveryOtp || '0000',
        createdAt: booking.createdAt || new Date().toISOString(),
      };

      if (booking.email) payload.email = booking.email;
      if (booking.landmark) payload.landmark = booking.landmark;
      if (booking.assignedDepotId) payload.assignedDepotId = booking.assignedDepotId;
      if (booking.assignedDepotName) payload.assignedDepotName = booking.assignedDepotName;
      if (booking.timeSlot) payload.timeSlot = booking.timeSlot;
      if (booking.reason) payload.reason = booking.reason;
      if (auth.currentUser) payload.userId = auth.currentUser.uid;

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Sync Meter Reading to Firestore
  async syncMeterReading(reading: MeterReadingRecord): Promise<void> {
    const path = `meter_readings/${reading.id}`;
    try {
      const docRef = doc(db, 'meter_readings', reading.id);
      const payload: Record<string, any> = {
        id: reading.id,
        consumerNumber: reading.consumerNumber,
        citizenName: reading.citizenName,
        previousReadingKl: Number(reading.previousReadingKl),
        currentReadingKl: Number(reading.currentReadingKl),
        consumptionKl: Number(reading.consumptionKl),
        readingDate: reading.readingDate,
        status: reading.status,
      };

      if (reading.meterSerialNumber) payload.meterSerialNumber = reading.meterSerialNumber;
      if (reading.zoneId) payload.zoneId = reading.zoneId;
      if (reading.areaName) payload.areaName = reading.areaName;
      if (reading.address) payload.address = reading.address;
      if (reading.phone) payload.phone = reading.phone;
      if (typeof reading.estimatedBillAmount === 'number') payload.estimatedBillAmount = reading.estimatedBillAmount;
      if (auth.currentUser) payload.userId = auth.currentUser.uid;

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Sync Outage Alert to Firestore
  async syncOutageAlert(alert: OutageAlert): Promise<void> {
    const path = `outage_alerts/${alert.id}`;
    try {
      const docRef = doc(db, 'outage_alerts', alert.id);
      const payload: Record<string, any> = {
        id: alert.id,
        title: alert.title,
        type: alert.type,
        priority: alert.priority,
        reason: alert.reason,
        status: alert.status,
        createdAt: alert.createdAt || new Date().toISOString(),
      };

      if (alert.startTime) payload.startTime = alert.startTime;
      if (alert.endTime) payload.endTime = alert.endTime;
      if (alert.alternativeArrangement) payload.alternativeArrangement = alert.alternativeArrangement;
      if (alert.publishedBy) payload.publishedBy = alert.publishedBy;

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Sync User Profile to Firestore
  async syncUserProfile(profile: CitizenUser | AdminUser, role: 'citizen' | 'admin' = 'citizen'): Promise<void> {
    const userId = auth.currentUser?.uid || profile.id;
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const payload: Record<string, any> = {
        id: userId,
        name: profile.name,
        role: role,
      };

      if ('phone' in profile && profile.phone) payload.phone = profile.phone;
      if ('email' in profile && profile.email) payload.email = profile.email;
      if ('address' in profile && profile.address) payload.address = profile.address;
      if ('zoneId' in profile && profile.zoneId) payload.zoneId = profile.zoneId;

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Listen to Outage Alerts in Realtime
  subscribeToAlerts(onUpdate: (alerts: OutageAlert[]) => void): () => void {
    const path = 'outage_alerts';
    try {
      const q = query(collection(db, path), limit(25));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAlerts: OutageAlert[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: d.id || docSnap.id,
                title: d.title,
                type: d.type || 'General Notice',
                priority: d.priority || 'Medium',
                zoneIds: d.zoneIds || ['zone-1'],
                affectedAreas: d.affectedAreas || ['All Wards'],
                startTime: d.startTime || new Date().toISOString(),
                endTime: d.endTime || new Date().toISOString(),
                reason: d.reason || '',
                alternativeArrangement: d.alternativeArrangement || 'Water tankers available on call',
                status: d.status || 'Active',
                views: d.views || 10,
                createdAt: d.createdAt || new Date().toISOString(),
                publishedBy: d.publishedBy || 'Municipal Engineer',
              };
            });
            onUpdate(remoteAlerts);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return () => {};
    }
  }
}

export const firebaseService = new FirebaseService();
