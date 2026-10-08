import React, { useState } from 'react';
import { AdminUser } from '../../types';
import { JalSevaLogo } from '../common/JalSevaLogo';
import { Shield, Key, Mail, ArrowRight, Lock, CheckCircle2, UserCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToCitizen: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToCitizen,
}) => {
  const [email, setEmail] = useState('superadmin@mbmc.gov.in');
  const [password, setPassword] = useState('mbmc@2026');
  const [error, setError] = useState('');

  const demoAccounts: {
    user: AdminUser;
    roleDesc: string;
    badgeColor: string;
  }[] = [
    {
      user: {
        id: 'adm-1',
        name: 'Er. Ramesh Sawant',
        email: 'superadmin@mbmc.gov.in',
        role: 'Super Admin',
        lastLogin: new Date().toISOString(),
      },
      roleDesc: 'Superintendent Engineer (Full Municipal Authority)',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    },
    {
      user: {
        id: 'adm-2',
        name: 'Er. Sachin Patil',
        email: 'zonemanager@mbmc.gov.in',
        role: 'Zone Manager',
        assignedZone: 'zone-1',
        lastLogin: new Date().toISOString(),
      },
      roleDesc: 'Executive Engineer (Zone 1 & 2 Schedules & Outages)',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      user: {
        id: 'adm-3',
        name: 'Suresh Patil',
        email: 'fieldofficer@mbmc.gov.in',
        role: 'Field Officer',
        assignedZone: 'zone-1',
        lastLogin: new Date().toISOString(),
      },
      roleDesc: 'Field Supervisor (Complaints Redressal & Tankers)',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    // Match demo user or default
    const matched = demoAccounts.find((d) => d.user.email === email);
    if (matched) {
      onLoginSuccess(matched.user);
    } else {
      onLoginSuccess({
        id: 'adm-custom',
        name: email.split('@')[0],
        email,
        role: 'Super Admin',
        lastLogin: new Date().toISOString(),
      });
    }
  };

  const handleQuickLogin = (user: AdminUser) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <JalSevaLogo size="md" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
            Official Municipal Staff Gateway
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            MBMC JalSeva Command Desk
          </h2>
          <p className="text-xs text-slate-500">
            Restricted access for MBMC Water Works engineers and supervisors.
          </p>
        </div>

        {/* 1-Click Persona Switchers */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick 1-Click Role Login:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.user.id}
                type="button"
                onClick={() => handleQuickLogin(account.user)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                      {account.user.name}
                    </strong>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${account.badgeColor}`}>
                      {account.user.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {account.roleDesc}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 uppercase font-bold text-[10px]">
              Or Login With Credentials
            </span>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Municipal Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sign In to Admin Console</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={onBackToCitizen}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Return to Public Citizen Portal
          </button>
        </div>
      </div>
    </div>
  );
};
