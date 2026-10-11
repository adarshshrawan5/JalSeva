import React, { useState } from 'react';
import { TankerBooking } from '../../types';
import {
  MessageSquare,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  Volume2,
  Shield,
  Phone,
  Clock,
  X,
  Share2,
} from 'lucide-react';

interface WhatsAppNotificationModalProps {
  booking: TankerBooking;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  if (!isOpen) return null;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const rawMessage = `🏛️ *MIRA BHAYANDAR MUNICIPAL CORPORATION*
*JalSeva (जलसेवा) Official Water Alert*
━━━━━━━━━━━━━━━━━━━━━━━━
Dear Resident, your municipal potable water tanker has been scheduled.

📋 *Booking ID:* #${booking.id}
💧 *Capacity:* ${booking.capacity.toLocaleString()} Liters (Potable Water)
📅 *Scheduled Date:* ${booking.bookingDate} (${booking.timeSlot})
📍 *Delivery Destination:* ${booking.address}, ${booking.areaName}
🏢 *Assigned Depot:* ${booking.assignedDepotName}
🚚 *Driver Assigned:* ${booking.assignedDriver?.name || 'Driver Rahul Sharma'} (${booking.assignedDriver?.vehicleNumber || 'MH-04-AZ-9921'})

🔐 *YOUR 4-DIGIT DELIVERY VERIFICATION OTP:*
👉 👉  *[ ${booking.deliveryOtp} ]*  👈 👈

⚠️ *CIVIC HANDOVER SECURITY RULE:*
Share this 4-digit code ONLY with the municipal driver upon physical tanker arrival at your premises. Do NOT share over phone before visual inspection.

📞 *Emergency Helpline:* 1800-22-2026 / 022-28192828
🌐 *Live GPS Tracking:* https://jalseva.mbmc.gov.in`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
      setSoundPlayed(true);
      setTimeout(() => setSoundPlayed(false), 1500);
    } catch {
      // AudioContext unavailable
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(rawMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#efeae2] dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* WhatsApp Header Bar */}
        <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow ring-2 ring-emerald-300">
                <span>💧</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075e54] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-wide text-white">MBMC JalSeva Water Alert</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                  ✓ Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <span>+91 22 2819 2828</span>
                <span>•</span>
                <span>Official Municipal Service Bot</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPing}
              className={`p-2 rounded-full hover:bg-white/10 transition ${soundPlayed ? 'text-amber-300' : 'text-white'}`}
              title="Play WhatsApp Sound Notification Tone"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#efeae2] dark:bg-slate-950 flex-1">
          {/* Timestamp Pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-lg bg-white/70 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm uppercase tracking-wider">
              Today • Municipal Auto-Dispatch
            </span>
          </div>

          {/* Encryption Notice */}
          <div className="flex justify-center">
            <div className="bg-[#ffeecd] dark:bg-amber-950/40 text-[#54656f] dark:text-amber-200 text-[10px] py-1 px-3 rounded-lg max-w-xs text-center border border-amber-200/50 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Messages are end-to-end encrypted under MBMC Civic Data Standard.</span>
            </div>
          </div>

          {/* WhatsApp Message Bubble */}
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-200/60 dark:border-slate-800 max-w-[92%] sm:max-w-[85%] text-slate-800 dark:text-slate-100 space-y-2 relative">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                  🏛️ MIRA BHAYANDAR MUNICIPAL CORPORATION
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  JalSeva (जलसेवा) Official Dispatch Alert
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Dear Resident, your emergency potable water tanker booking has been confirmed by MBMC Water Supply Department.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                <div>📋 <strong>Docket:</strong> <span className="font-mono text-blue-600 dark:text-blue-400">{booking.id}</span></div>
                <div>💧 <strong>Capacity:</strong> {booking.capacity.toLocaleString()} Liters (Potable Water)</div>
                <div>📅 <strong>Delivery Slot:</strong> {booking.bookingDate} ({booking.timeSlot})</div>
                <div>🏢 <strong>Assigned Depot:</strong> {booking.assignedDepotName}</div>
                <div>🚚 <strong>Assigned Driver:</strong> {booking.assignedDriver?.name || 'Driver Rahul Sharma'} ({booking.assignedDriver?.vehicleNumber || 'MH-04-AZ-9921'})</div>
              </div>

              {/* Highlighted Delivery OTP box */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-dashed border-amber-400 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider block">
                  🔐 YOUR SECURE DELIVERY OTP (4 DIGITS)
                </span>
                <div className="text-3xl font-black font-mono tracking-widest text-[#ea580c] dark:text-amber-400 my-1">
                  {booking.deliveryOtp}
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-200">
                  Share this OTP <strong>ONLY</strong> with the municipal driver upon physical tanker arrival.
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Helpline: 1800-22-2026</span>
                <div className="flex items-center gap-1">
                  <span>{nowTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-emerald-500/20 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
