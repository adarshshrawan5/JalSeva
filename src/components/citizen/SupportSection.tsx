import React, { useState } from 'react';
import { MBMC_ZONES, MBMC_DEPOTS } from '../../data/mbmcData';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  Building,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const SupportSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const faqs = [
    {
      q: 'Why does the tanker booking system restrict dates to Today or Tomorrow only?',
      a: 'To guarantee equitable distribution and prevent unauthorized hoarding of emergency water supplies, MBMC algorithms allocate tanker fleets dynamically based on verified immediate demand across Mira-Bhayandar.',
    },
    {
      q: 'How does live location detection help in water management?',
      a: 'Clicking "Detect My Location" auto-identifies your municipal zone and computes the shortest road distance (via Haversine formula) to the nearest MBMC water depot, reducing transit time and estimating arrival within 15-25 minutes.',
    },
    {
      q: 'What is the standard resolution turnaround for water complaints?',
      a: 'Pipeline bursts and contaminated water alerts are classified as High/Critical and dispatched within 2 hours. General pressure and meter grievances have a maximum SLA of 48 hours.',
    },
    {
      q: 'Where does Mira-Bhayandar receive its municipal drinking water?',
      a: 'MBMC receives approximately 142.5 MLD of treated water sourced from the Surya Dam gravity project and the MIDC Jambhul water treatment facility.',
    },
    {
      q: 'Can I track the water tanker driver in real-time?',
      a: 'Yes! Once approved and dispatched, open "Track Live Status" to monitor the moving tanker icon on the map, along with driver name, vehicle registration number, and direct phone link.',
    },
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackMessage) return;
    setFeedbackSent(true);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Citizen Helpdesk & Municipal Ward Directory
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Contact MBMC Water Works & Ward Offices
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Visit your zonal engineering office, dial emergency hotlines, or browse frequent citizen inquiries.
        </p>
      </div>

      {/* 4 Ward Offices Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <span>MBMC Zonal Water Engineering Offices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MBMC_ZONES.map((zone) => (
            <div
              key={zone.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {zone.wards}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {zone.wardOffice.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{zone.wardOffice.address}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="text-slate-600 dark:text-slate-400">
                  Officer: <strong className="text-slate-900 dark:text-white">{zone.wardOffice.officer}</strong>
                </div>
                <div>
                  <a
                    href={`tel:${zone.wardOffice.phone}`}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{zone.wardOffice.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Frequently Asked Citizen Questions (FAQ)
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Feedback / Query Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/30 p-6 sm:p-8 rounded-3xl border border-blue-200 dark:border-blue-900/60">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Send Feedback to Water Works Commissioner
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
          Suggestions for supply schedule enhancements, water conservation projects, or pipeline audits.
        </p>

        {feedbackSent ? (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Thank you! Your suggestion has been queued for the municipal water executive.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder="Your Name"
                required
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Your inquiry or suggestion for MBMC JalSeva (जलसेवा)..."
              required
              className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Suggestion</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
