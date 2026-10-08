import React from 'react';
import { TankerBooking } from '../../types';
import { Printer, CheckCircle, Droplets, MapPin, Phone, ShieldCheck, Download } from 'lucide-react';

interface ReceiptModalProps {
  booking: TankerBooking;
  onClose: () => void;
  onTrackNow?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, onTrackNow }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Paper Card */}
      <div
        id="printable-receipt"
        className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm print:m-0 print:border-none print:shadow-none"
      >
        {/* Receipt Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow">
                <Droplets className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  MIRA-BHAYANDAR MUNICIPAL CORPORATION
                </h2>
                <p className="text-xs font-semibold text-blue-700 tracking-wider uppercase">
                  Department of Water Supply & Sewerage | JalSeva (जलसेवा)
                </p>
                <p className="text-[11px] text-slate-500">
                  Indira Gandhi Bhavan, Chhatrapati Shivaji Maharaj Marg, Bhayandar (W) 401101
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                BOOKING CONFIRMED
              </span>
              <div className="mt-2 text-xs font-mono text-slate-600">
                Receipt Date: {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Reference & QR Code Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 items-center">
          <div className="sm:col-span-2 space-y-1">
            <div className="text-xs text-slate-500 font-semibold uppercase">Booking Reference ID</div>
            <div className="text-2xl font-mono font-black text-blue-700 tracking-wider">
              {booking.id}
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>MBMC Verified Emergency Water Delivery Request</span>
            </div>
          </div>

          {/* SVG QR Code Simulation */}
          <div className="flex flex-col items-center justify-center border-l sm:border-slate-200 sm:pl-4">
            <div className="p-2 bg-white border border-slate-300 rounded shadow-sm">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                {/* Simulated high-fidelity QR Code blocks */}
                <rect x="5" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="65" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="75" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="5" y="65" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="75" width="10" height="10" fill="#0f172a" />

                {/* Data dots */}
                <rect x="45" y="10" width="8" height="8" fill="#0f172a" />
                <rect x="42" y="25" width="12" height="8" fill="#0f172a" />
                <rect x="15" y="45" width="8" height="12" fill="#0f172a" />
                <rect x="30" y="45" width="10" height="8" fill="#0f172a" />
                <rect x="50" y="50" width="15" height="15" fill="#0f172a" />
                <rect x="70" y="45" width="8" height="18" fill="#0f172a" />
                <rect x="45" y="75" width="15" height="8" fill="#0f172a" />
                <rect x="75" y="75" width="12" height="12" fill="#0f172a" />
              </svg>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1">Scan to Verify</span>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-6">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Citizen & Delivery Information
            </h4>
            <div>
              <span className="text-slate-500 text-xs block">Citizen Name:</span>
              <strong className="text-slate-900">{booking.citizenName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Contact Phone:</span>
              <strong className="text-slate-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                +91 {booking.phone}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Delivery Address:</span>
              <p className="text-slate-900 text-xs font-medium flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                {booking.address}, {booking.areaName}
                {booking.landmark ? ` (Near ${booking.landmark})` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Dispatch & Logistics Assignment
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-xs block">Scheduled Date:</span>
                <strong className="text-slate-900">{booking.bookingDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Time Slot:</span>
                <strong className="text-blue-700">{booking.timeSlot}</strong>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Water Capacity:</span>
              <strong className="text-slate-900 text-sm">
                {booking.capacity.toLocaleString()} Liters (Potable Water)
              </strong>
            </div>
            <div className="bg-blue-50 p-2.5 rounded border border-blue-200 text-xs">
              <span className="text-blue-900 font-semibold block">Auto-Assigned MBMC Depot:</span>
              <strong className="text-blue-800">{booking.assignedDepotName}</strong>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Distance: {booking.distanceKm} km | Estimated Transit: {booking.estimatedArrivalMins}
              </div>
            </div>
          </div>
        </div>

        {/* SMS Notification Preview */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 mb-4">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            📱 Simulated MBMC SMS Dispatched to +91 {booking.phone}:
          </div>
          <div className="font-mono bg-white p-2 rounded border border-slate-300 text-slate-800">
            &ldquo;MBMC ALERT: Tanker booking {booking.id} confirmed for {booking.bookingDate} ({booking.timeSlot}) from {booking.assignedDepotName}. Driver details will follow. Helpline: 022-28192828&rdquo;
          </div>
        </div>

        {/* Footer Notes */}
        <div className="text-[11px] text-slate-500 border-t pt-3 flex flex-col sm:flex-row justify-between gap-2">
          <div>This is a computer-generated digital receipt issued under MBMC Water Act 2026.</div>
          <div className="font-semibold text-slate-700">Official Municipal Portal: JalSeva (जलसेवा)</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold shadow transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>

        {onTrackNow && (
          <button
            onClick={onTrackNow}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition transform hover:scale-105"
          >
            🚚 Track Live Tanker Delivery
          </button>
        )}
      </div>
    </div>
  );
};
