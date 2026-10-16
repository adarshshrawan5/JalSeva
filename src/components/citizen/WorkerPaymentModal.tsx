import React, { useState } from 'react';
import { Complaint, WorkerPaymentDetails } from '../../types';
import { storageService } from '../../services/storageService';
import { JalSevaLogo } from '../common/JalSevaLogo';
import {
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  X,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Wrench,
  Check,
} from 'lucide-react';

interface WorkerPaymentModalProps {
  complaint: Complaint;
  onClose: () => void;
  onPaymentSuccess: (payment: WorkerPaymentDetails) => void;
}

export const WorkerPaymentModal: React.FC<WorkerPaymentModalProps> = ({
  complaint,
  onClose,
  onPaymentSuccess,
}) => {
  const amount = complaint.workAnalysis?.totalAmount || 150;
  const workerName = complaint.assignedWorker?.name || 'Field Specialist';
  const workerPhone = complaint.assignedWorker?.phone || '+91 98205 11984';

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<WorkerPaymentDetails | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedTxnId = `MBMC-${paymentMethod}-${Date.now().toString().slice(-8)}`;
      const payment: WorkerPaymentDetails = {
        amount,
        method: paymentMethod,
        transactionId: generatedTxnId,
        paidAt: new Date().toISOString(),
        payerName: complaint.citizenName,
        upiId: paymentMethod === 'UPI' ? `${complaint.phone}@okaxis` : undefined,
      };

      storageService.citizenPayWorkerService(complaint.id, payment);
      setIsProcessing(false);
      setPaymentSuccess(payment);
      onPaymentSuccess(payment);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                MBMC Civic Gateway
              </span>
              <h3 className="text-lg font-black leading-tight">
                Technician Service Settlement
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success & Electronic Receipt View */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Payment Completed Successfully
              </span>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{paymentSuccess.amount}.00 Settled
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Disbursed to technician {workerName} for docket {complaint.id}.
              </p>
            </div>

            {/* Official Digital e-Receipt Box */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-400">MBMC Receipt No:</span>
                <strong className="text-slate-900 dark:text-white">RCP-2026-{paymentSuccess.transactionId.slice(-6)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-900 dark:text-white">{paymentSuccess.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Technician:</span>
                <span className="text-slate-900 dark:text-white">{workerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Citizen:</span>
                <span className="text-slate-900 dark:text-white">{paymentSuccess.payerName}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 font-bold text-sm">
                <span className="text-slate-700 dark:text-slate-300">Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{paymentSuccess.amount}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Selection Form */
          <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
            {/* Technician Profile Snapshot */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    complaint.assignedWorker?.avatar ||
                    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={workerName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                    Beneficiary Field Specialist
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {workerName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {complaint.assignedWorker?.designation || 'Certified Plumber'} &bull; {workerPhone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Due</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{amount}
                </span>
              </div>
            </div>

            {/* Work Analysis Summary */}
            {complaint.workAnalysis && (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60 text-[11px] space-y-1">
                <strong className="text-blue-900 dark:text-blue-200 block">
                  Work Carried Out:
                </strong>
                <p className="text-slate-700 dark:text-slate-300">
                  {complaint.workAnalysis.diagnosis}
                </p>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-blue-200 dark:border-blue-900/40">
                  <span>Base Inspection: ₹{complaint.workAnalysis.serviceFee}</span>
                  <span>Materials / Spares: ₹{complaint.workAnalysis.partsCost || 0}</span>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Choose Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="block text-xs">UPI / QR Code</span>
                  <span className="text-[9px] text-emerald-600 font-bold">Fastest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'Cash'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="block text-xs">Cash on Site</span>
                  <span className="text-[9px] text-slate-400">Handshake</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="block text-xs">Card / NetBanking</span>
                  <span className="text-[9px] text-slate-400">Debit / Credit</span>
                </button>
              </div>
            </div>

            {/* UPI View */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Dynamic QR Code representation */}
                  <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-slate-900 rounded-lg">
                      <div className="bg-white rounded-xs" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-white rounded-xs" />
                      <div className="bg-white rounded-xs" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scan with any UPI App
                    </span>
                    <strong className="text-xs text-slate-900 dark:text-white block font-mono">
                      mbmc.waterworks@sbi
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      Amount locked to ₹{amount}.00 for docket {complaint.id}.
                    </p>
                  </div>
                </div>

                {/* Instant App Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
                  {(['gpay', 'phonepe', 'paytm', 'bhim'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiApp(app)}
                      className={`py-2 rounded-xl border text-center transition cursor-pointer capitalize ${
                        upiApp === app
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {app === 'gpay' ? 'GPay' : app === 'phonepe' ? 'PhonePe' : app === 'paytm' ? 'Paytm' : 'BHIM'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cash on Site View */}
            {paymentMethod === 'Cash' && (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Physical Cash Handover Verified by MBMC</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  Please hand over exact cash of <strong className="text-emerald-700 dark:text-emerald-300">₹{amount}.00</strong> directly to technician {workerName}. The technician will confirm receipt in their dashboard and this electronic receipt will be generated.
                </p>
              </div>
            )}

            {/* Card View */}
            {paymentMethod === 'Card' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing ₹{amount}.00 Settlement...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm &amp; Pay ₹{amount}.00 to {workerName}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
