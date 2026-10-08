import React, { useState } from 'react';
import { OutageAlert } from '../../types';
import { AlertTriangle, Clock, ArrowRight, X } from 'lucide-react';

interface AlertTickerProps {
  alerts: OutageAlert[];
  onSelectAlert: (alert: OutageAlert) => void;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({ alerts, onSelectAlert }) => {
  const [dismissed, setDismissed] = useState(false);
  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  if (dismissed || activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white shadow-md relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping mr-0.5" />
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
            Live Outage Alert
          </span>

          <div className="truncate font-medium flex items-center gap-2">
            <span className="font-semibold text-yellow-100">{currentAlert.title}:</span>
            <span className="text-white/90 truncate hidden sm:inline">
              Affected: {currentAlert.affectedAreas.join(', ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectAlert(currentAlert)}
            className="flex items-center gap-1 px-3 py-1 bg-white text-rose-700 hover:bg-yellow-50 text-xs font-semibold rounded-md shadow transition transform hover:scale-105"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-white/20 rounded-md transition text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
