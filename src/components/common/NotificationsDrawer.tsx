import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Clock,
  Truck,
  AlertTriangle,
  Send,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Sparkles,
  WifiOff,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface AlertNotification {
  id: string;
  type: 'supply-15m' | 'tanker-sms' | 'scada-pressure' | 'pwa-sync';
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
  meta?: {
    ward?: string;
    bookingId?: string;
    otp?: string;
    eta?: string;
  };
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking?: (bookingId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'supply' | 'tanker' | 'system'>('all');
  const [phoneForAlerts, setPhoneForAlerts] = useState<string>('98200 48291');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted' ? 'granted' : 'default';
    }
    return 'unsupported';
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>([
    {
      id: 'notif-1',
      type: 'supply-15m',
      title: '⏰ Ward 4 (Uttan) Water Supply in 15 Mins',
      body: 'Verified Municipal Window: Morning supply begins strictly at 07:00 AM (ends at 08:00 AM). Please open your building sump inlet valve. No evening supply in this zone.',
      timestamp: '6:45 AM (15m reminder)',
      unread: true,
      meta: { ward: 'Zone 4: Uttan & Coastal Belt' },
    },
    {
      id: 'notif-2',
      type: 'tanker-sms',
      title: '🚚 Tanker #TK-8491 Dispatched & En Route',
      body: 'Driver Rahul Sharma (MH-04-AZ-9921) has left the Bhayandar Depot. Real-time GPS navigation active. Share Handover OTP [7492] only upon physical arrival.',
      timestamp: '12 mins ago (SMS sent)',
      unread: true,
      meta: { bookingId: 'TK-8491', otp: '7492', eta: '14 mins' },
    },
    {
      id: 'notif-3',
      type: 'scada-pressure',
      title: '⚠️ SCADA IoT Advisory: Pressure Regulation',
      body: 'Booster pump scheduled maintenance at Mira Road Sector 10 ESR. Water pressure may briefly reduce between 02:00 PM and 03:00 PM.',
      timestamp: '1 hour ago',
      unread: false,
    },
    {
      id: 'notif-4',
      type: 'pwa-sync',
      title: '📶 PWA Offline Cache Synced',
      body: 'Ward timetables and emergency helpline (1800-22-2026) cached locally. Accessible even in weak coastal network zones (Uttan, Pali, Gorai creek).',
      timestamp: '2 hours ago',
      unread: false,
    },
  ]);

  if (!isOpen) return null;

  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleSimulateSupplyAlert = () => {
    playNotificationChime();
    const newAlert: AlertNotification = {
      id: `supply-${Date.now()}`,
      type: 'supply-15m',
      title: '⏰ [TEST ALERT] Supply Starts in 15 Minutes!',
      body: 'SMS Ping delivered to ' + phoneForAlerts + ': Uttan ESR water distribution valves opening at 07:00 AM. Flow expected at ~1.8 bar pressure.',
      timestamp: 'Just now',
      unread: true,
      meta: { ward: 'Uttan Coastal Belt' },
    };
    setNotifications((prev) => [newAlert, ...prev]);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('JalSeva MBMC: Supply Warning', {
          body: newAlert.body,
          icon: '/favicon.ico',
        });
      } catch {
        // Notification failed or blocked
      }
    }
  };

  const handleSimulateTankerPing = () => {
    playNotificationChime();
    const newAlert: AlertNotification = {
      id: `tanker-${Date.now()}`,
      type: 'tanker-sms',
      title: '🚚 [TEST SMS] Tanker Approaching Premise',
      body: 'SMS to ' + phoneForAlerts + ': Water Tanker is 800m away (~4 mins). Please prepare the underground suction line or overhead inlet.',
      timestamp: 'Just now',
      unread: true,
      meta: { bookingId: 'TK-8491', eta: '4 mins' },
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const handleRequestPush = async () => {
    if ('Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPushStatus(res);
        if (res === 'granted') {
          playNotificationChime();
        }
      } catch {
        setPushStatus('denied');
      }
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'supply') return n.type === 'supply-15m';
    if (filter === 'tanker') return n.type === 'tanker-sms';
    if (filter === 'system') return n.type === 'scada-pressure' || n.type === 'pwa-sync';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Alert & Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100">Automated SMS, FCM Push & SCADA alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('supply')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'supply'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              15m Supply
            </button>
            <button
              onClick={() => setFilter('tanker')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'tanker'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tanker SMS
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}
        </div>

        {/* Notifications Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.map((item) => {
            const isSupply = item.type === 'supply-15m';
            const isTanker = item.type === 'tanker-sms';
            const isPressure = item.type === 'scada-pressure';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all relative ${
                  item.unread
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.unread && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSupply
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                        : isTanker
                        ? 'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300'
                        : isPressure
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {isSupply && <Clock className="w-4 h-4" />}
                    {isTanker && <Truck className="w-4 h-4" />}
                    {isPressure && <AlertTriangle className="w-4 h-4" />}
                    {item.type === 'pwa-sync' && <WifiOff className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.body}
                    </p>

                    {item.meta?.otp && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100/80 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 text-xs font-mono font-bold">
                        <span>OTP:</span>
                        <span className="tracking-widest font-black text-sm">{item.meta.otp}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      <span>{item.timestamp}</span>
                      {item.meta?.bookingId && onSelectBooking && (
                        <button
                          onClick={() => {
                            onSelectBooking(item.meta!.bookingId!);
                            onClose();
                          }}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          View Tracker →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Testing & Configuration Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Automated SMS & Webhook Simulator</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              FCM / SMS Gateway
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSimulateSupplyAlert}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Test a simulated 15-minute ward supply alert"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Test 15m Supply Alert</span>
            </button>

            <button
              onClick={handleSimulateTankerPing}
              className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Test an instant tanker en-route SMS ping"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Test Tanker Ping</span>
            </button>
          </div>

          {pushStatus !== 'granted' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Enable browser push reminders for your ward
              </div>
              <button
                onClick={handleRequestPush}
                className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold hover:opacity-90 transition shrink-0"
              >
                Enable Push
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
