import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ActiveTab } from './Navbar';
import { JalSevaLogo } from './JalSevaLogo';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About MBMC JalSeva */}
          <div className="space-y-4">
            <JalSevaLogo size="sm" showSubtitle={false} />
            <p className="text-xs text-amber-300 font-hindi font-medium">
              &ldquo;आपका पानी, आपकी सेवा - हर बूंद मायने रखती है&rdquo;
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Digital Water Supply Management Portal for Mira-Bhayandar Citizens. Connecting 809,378 residents with municipal water authorities through transparent timings, emergency tankers, and rapid complaint resolution.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 9001:2015 MBMC Municipal Water Standards</span>
            </div>
          </div>

          {/* Col 2: Quick Citizen Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="hover:text-blue-400 transition flex items-center gap-1.5"
                >
                  <span>→</span> Area Water Supply Timings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tanker-book')}
                  className="hover:text-[#fd7e14] transition flex items-center gap-1.5"
                >
                  <span>→</span> Emergency Water Tanker (Today/Tomorrow)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('complaint-file')}
                  className="hover:text-rose-400 transition flex items-center gap-1.5"
                >
                  <span>→</span> Register Water Supply Grievance
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className="hover:text-purple-400 transition flex items-center gap-1.5"
                >
                  <span>→</span> Track Complaint & Tanker Live Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('support')}
                  className="hover:text-blue-400 transition flex items-center gap-1.5"
                >
                  <span>→</span> Ward Offices & Contact Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: 24x7 Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Helplines</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#fd7e14] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Central Water Control Room</div>
                  <div className="text-slate-400 font-mono">1800-22-2026 (Toll Free)</div>
                  <div className="text-slate-400 font-mono">022-2819 2828 / 022-2818 4040</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Water Grievance Cell</div>
                  <div className="text-slate-400 font-mono">jalseva@mbmc.gov.in</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Head Office Address</div>
                  <div className="text-slate-400">
                    Indira Gandhi Bhavan, Chhatrapati Shivaji Maharaj Marg, Bhayandar (W), 401101
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Administrative Gateway */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Internal MBMC Staff</h4>
            <p className="text-xs text-slate-400">
              Authorized municipal officers, zone managers, and field staff can log in to the administrative command desk.
            </p>
            <button
              onClick={onOpenAdmin}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#fd7e14]" />
              <span>Access JalSeva Admin Portal</span>
            </button>
            <div className="text-[11px] text-slate-500">
              RBAC: Super Admin, Zone Manager, Field Worker
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} JalSeva • Mira-Bhayandar Municipal Corporation (MBMC). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Citizen Charter</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Water Quality Norms</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
