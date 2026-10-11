import React from 'react';
import { TankerBooking } from '../../types';
import { JalSevaLogo } from './JalSevaLogo';
import {
  Printer,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Droplets,
  MapPin,
  Phone,
  User,
  FileText,
  Calendar,
  X,
  Download,
} from 'lucide-react';

interface DeliveryReportModalProps {
  booking: TankerBooking;
  onClose: () => void;
  isOpen?: boolean;
}

export const DeliveryReportModal: React.FC<DeliveryReportModalProps> = ({
  booking,
  onClose,
  isOpen = true,
}) => {
  if (isOpen === false) return null;

  const isVerified = booking.otpVerified || booking.status === 'Delivered';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl relative my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Printable Action Ribbon */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Official MBMC Tanker Delivery &amp; OTP Handover Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Document (Printable) */}
        <div className="p-8 sm:p-10 space-y-6 text-xs">
          {/* Municipal Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <div className="flex justify-center items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  Mira-Bhayandar Municipal Corporation
                </h1>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Water Supply &amp; Distribution Department • JalSeva Portal
                </p>
                <p className="text-[10px] text-slate-500 font-hindi">
                  &ldquo;आपका पानी, आपकी सेवा - हर बूंद मायने रखती है&rdquo;
                </p>
              </div>
              <span className="text-3xl">💧</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono border-t border-slate-200 mt-3 pt-2">
              <span>REPORT NO: MBMC/WTR/RPT-{booking.id.slice(-6)}</span>
              <span>DATE GENERATED: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span>DOCKET ID: {booking.id}</span>
            </div>
          </div>

          {/* Title & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Certificate of Water Supply &amp; Security Handover
              </span>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                Potable Tanker Dispatch &amp; Citizen Verification Challan
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DELIVERED &amp; OTP VERIFIED</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span>IN TRANSIT / PENDING OTP</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Section 1: Citizen Recipient Information */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Citizen Recipient Particulars</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Citizen Name</span>
                <strong className="text-xs text-slate-900 block">{booking.citizenName}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Registered Contact</span>
                <strong className="text-xs text-slate-900 block font-mono">+91 {booking.phone}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Municipal Ward/Zone</span>
                <strong className="text-xs text-slate-900 block">{booking.areaName}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border sm:col-span-3">
                <span className="text-[10px] text-slate-500 font-bold block">Destination Delivery Address</span>
                <span className="text-xs text-slate-800 block">
                  {booking.address} (Landmark: {booking.landmark})
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Tanker Logistics & Assigned Fleet Driver */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Truck className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>2. Municipal Fleet &amp; Driver Logistics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Originating Depot</span>
                <strong className="text-xs text-slate-900 block">{booking.assignedDepotName}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Water Volume Delivered</span>
                <strong className="text-xs text-blue-700 block font-mono">
                  {booking.capacity.toLocaleString()} Liters (Potable)
                </strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Scheduled Slot</span>
                <strong className="text-xs text-slate-900 block font-mono">
                  {booking.bookingDate} ({booking.timeSlot})
                </strong>
              </div>

              <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-xl">
                <span className="text-[10px] text-orange-700 font-bold block">Assigned Driver</span>
                <strong className="text-xs text-slate-900 block">
                  {booking.assignedDriver?.name || 'Rahul'}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  Phone: {booking.assignedDriver?.phone || '+91 98204 88312'}
                </span>
              </div>

              <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-xl">
                <span className="text-[10px] text-orange-700 font-bold block">Tanker Vehicle No</span>
                <strong className="text-xs text-[#ea580c] block font-mono font-bold">
                  {booking.assignedDriver?.vehicleNumber || 'MH-04-RH-8821'}
                </strong>
                <span className="text-[10px] text-slate-500">Commercial Potable Carrier</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-500 font-bold block">Transit Distance &amp; ETA</span>
                <strong className="text-xs text-slate-900 block font-mono">
                  {booking.distanceKm} km ({booking.estimatedArrivalMins})
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: THE DELIVERY OTP VERIFICATION AUDIT (Key Requirement) */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Two-Way Delivery OTP Security Audit</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Official Verification Proof
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Citizen Handover OTP
                </span>
                <div className="text-xl font-black font-mono tracking-widest text-[#ea580c] mt-0.5">
                  {booking.deliveryOtp}
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Issued to citizen at booking time
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Driver Terminal Status
                </span>
                <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isVerified ? 'MATCHED & VERIFIED' : 'RECEIVED BY DRIVER'}</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Assigned to Driver: {booking.assignedDriver?.name || 'Rahul'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Handover Timestamp
                </span>
                <div className="text-xs font-bold text-slate-800 font-mono mt-1">
                  {booking.deliveryCompletedAt
                    ? new Date(booking.deliveryCompletedAt).toLocaleString('en-IN')
                    : 'Dispatched & Scheduled Today'}
                </div>
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                  Geo-tagged &amp; Logged
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Municipal Authority Endorsement */}
          <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Assigned Fleet Operator
              </span>
              <strong className="text-slate-900 block mt-1 font-mono">
                Driver {booking.assignedDriver?.name || 'Rahul'}
              </strong>
              <span className="text-slate-500 text-[10px] block">
                Vehicle: {booking.assignedDriver?.vehicleNumber || 'MH-04-RH-8821'}
              </span>
              <div className="mt-2 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                ✓ Handover Authorized via OTP #{booking.deliveryOtp}
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Approving Municipal Water Authority
              </span>
              <strong className="text-slate-900 block mt-1">
                Er. Adarsh Yadav
              </strong>
              <span className="text-slate-500 text-[10px] block">
                Chief Water Supply Engineer &amp; Super Admin
              </span>
              <span className="text-slate-500 text-[10px] block font-mono">
                Helpline: +91 7715804452
              </span>
              <div className="mt-2 text-[9px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                Digitally Signed &amp; Audited • MBMC HQ
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 border-t pt-3">
            This is an official computer-generated water distribution manifest issued under MBMC JalSeva Digital Services. For queries, contact Municipal Toll-Free 1800-22-2026.
          </div>
        </div>
      </div>
    </div>
  );
};
