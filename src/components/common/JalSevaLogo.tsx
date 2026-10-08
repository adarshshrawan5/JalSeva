import React from 'react';
import { Droplets, HeartHandshake } from 'lucide-react';

interface JalSevaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const JalSevaLogo: React.FC<JalSevaLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 💧 + 🤝 = JalSeva Badge Icon */}
      <div className="relative group">
        <div
          className={`${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 p-2 transition-transform duration-300 group-hover:scale-105`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Blue Water Drop */}
            <Droplets className="w-full h-full text-white drop-shadow" />
            {/* Service Orange Helping Hand / Seva Badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#fd7e14] rounded-full flex items-center justify-center text-white text-[10px] shadow border border-white">
              <HeartHandshake className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight text-slate-900 dark:text-white ${titleSizes[size]}`}
          >
            <span className="text-blue-600 dark:text-blue-400">Jal</span>
            <span className="text-[#fd7e14]">Seva</span>
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-hindi border-l border-slate-300 dark:border-slate-700 pl-2">
            जलसेवा
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 -mt-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              MBMC Water Portal
            </span>
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
              हर बूंद मायने रखती है
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
