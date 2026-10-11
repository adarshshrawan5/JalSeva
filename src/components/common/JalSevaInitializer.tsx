import React, { useState, useEffect } from 'react';
import { Droplets, HeartHandshake, ShieldCheck, Activity, CheckCircle2, ChevronRight, Volume2, VolumeX } from 'lucide-react';

interface JalSevaInitializerProps {
  onComplete: () => void;
  isOpen: boolean;
}

const INITIALIZATION_STEPS = [
  { percent: 18, label: 'Connecting to MBMC Surya Dam telemetry conduit...', icon: Droplets, status: 'Conduit Online (7.5 Bar)' },
  { percent: 42, label: 'Calibrating 4 Zonal Distribution Grids (Mira Road & Bhayandar)...', icon: Activity, status: '79 Localities Synced' },
  { percent: 70, label: 'Tracking GPS Municipal Depot Fleet & Active Tankers...', icon: ShieldCheck, status: '24 Tankers Deployed' },
  { percent: 92, label: 'Verifying Chlorination & Potable Purity (BIS 10500:2012)...', icon: CheckCircle2, status: '100% Certified Safe' },
  { percent: 100, label: 'JalSeva Smart Water Network Online • हर बूंद मायने रखती है', icon: HeartHandshake, status: 'System Operational' },
];

export const JalSevaInitializer: React.FC<JalSevaInitializerProps> = ({ onComplete, isOpen }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play gentle acoustic water tone on completion
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // AudioContext may be blocked before gesture
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < INITIALIZATION_STEPS.length) {
        setStepIndex(currentStep);
        setProgress(INITIALIZATION_STEPS[currentStep].percent);
      } else {
        clearInterval(interval);
        playChime();
        const timeout = setTimeout(() => {
          onComplete();
        }, 850);
        return () => clearTimeout(timeout);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const currentStepData = INITIALIZATION_STEPS[stepIndex] || INITIALIZATION_STEPS[INITIALIZATION_STEPS.length - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-500 overflow-hidden text-white font-sans">
      {/* Background dynamic water ripples & glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ea580c]/15 rounded-full blur-[100px]" />
        
        {/* Animated concentric SVG Water Ripple rings */}
        <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="#60a5fa" strokeWidth="1" className="animate-ping" style={{ animationDuration: '4s' }} />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="#fdba74" strokeWidth="0.75" className="animate-ping" style={{ animationDuration: '5s' }} />
        </svg>
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4 p-8 sm:p-10 bg-slate-900/80 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        {/* Sound toggle pill */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] font-mono text-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>MBMC TELEMETRY READY</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Central Logo with Animated Water Droplet Coalescence */}
        <div className="relative my-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-500 to-[#ea580c] flex items-center justify-center shadow-2xl shadow-blue-500/40 p-3 transform transition hover:scale-105 duration-300 ring-4 ring-white/10">
            <div className="relative w-full h-full flex items-center justify-center">
              <Droplets className="w-14 h-14 text-white drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#fd7e14] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Orbiting particles */}
          <div className="absolute -inset-2 border border-sky-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Brand Titles */}
        <div className="mt-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="text-sky-400">Jal</span>
            <span className="text-[#fd7e14]">Seva</span>
            <span className="text-xl text-slate-300 font-hindi font-normal ml-2">जलसेवा</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-semibold">
            Mira Bhayandar Municipal Corporation
          </p>
          <p className="text-xs text-amber-300/90 font-hindi font-medium mt-1">
            &ldquo;आपका पानी, आपकी सेवा • हर बूंद मायने रखती है&rdquo;
          </p>
        </div>

        {/* Progress Display Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <StepIcon className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="truncate max-w-[280px] text-left">{currentStepData.label}</span>
            </span>
            <span className="font-mono font-bold text-sky-300">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-[#ea580c] rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-mono">
            <span>Status: <strong className="text-emerald-400">{currentStepData.status}</strong></span>
            <span>Step {stepIndex + 1} of 5</span>
          </div>
        </div>

        {/* Skip / Enter Action */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 group"
          >
            <span>{progress === 100 ? 'Enter Portal' : 'Skip & Enter Now'}</span>
            <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
