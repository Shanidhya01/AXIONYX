import React, { useEffect } from 'react'; // Added useEffect
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Volume2, Plus, Minus } from 'lucide-react';

const PomodoroTimer = ({ 
  mode, 
  setMode, 
  timeLeft, 
  isActive, 
  setIsActive, 
  onReset,
  isAlarmRinging,
  customMinutes,
  setCustomMinutes,
  onAdjustTime
}) => {
  
  const modes = {
    focus: { label: 'Focus', minutes: 25, icon: Brain, color: 'text-blue-500' },
    short: { label: 'Short Break', minutes: 5, icon: Coffee, color: 'text-green-500' },
    long: { label: 'Long Break', minutes: 15, icon: Zap, color: 'text-purple-500' },
  };

  // --- NEW: AUTO-LOG LOGIC ---
  // This watches the timer. When it hits 0 AND mode is 'Focus', it saves to DB.
  useEffect(() => {
    if (timeLeft === 0 && mode === 'focus') {
        logSessionToBackend();
    }
  }, [timeLeft, mode]);

  const logSessionToBackend = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) return;

          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study-zone/log`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-auth-token': token 
              },
              // Log the duration of a focus session (25 mins)
              body: JSON.stringify({ minutes: modes.focus.minutes, source: 'pomodoro' })
          });
      } catch (err) {
          console.error("Failed to log study time:", err);
      }
  };
  // ---------------------------

  const totalTime = modes[mode].minutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const CurrentIcon = modes[mode].icon;

  return (
    <>
        <div className="flex flex-col items-center ">
        
        {/* 1. Mode Switcher */}
        <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl mb-8 w-full max-w-xs">
            {Object.keys(modes).map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-0 rounded-lg text-sm font-bold transition-all ${
                        mode === m 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {modes[m].label}
                </button>
            ))}
        </div>

        {/* Time Adjustment Controls - Only show when not running */}
        {!isActive && !isAlarmRinging && (
          <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 px-6 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onAdjustTime(-5)}
              className="p-2.5 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400 hover:from-red-200 hover:to-rose-200 dark:hover:from-red-900/50 dark:hover:to-rose-900/50 transition-all shadow-md hover:scale-110 active:scale-95 hover:shadow-lg"
              title="Decrease 5 minutes"
              disabled={customMinutes <= 1}
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <div className="text-center min-w-[80px]">
              <div className="text-3xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {customMinutes}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
                minutes
              </div>
            </div>
            <button
              onClick={() => onAdjustTime(5)}
              className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all shadow-md hover:scale-110 active:scale-95 hover:shadow-lg"
              title="Increase 5 minutes"
              disabled={customMinutes >= 120}
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* 2. Circular Timer Visualization */}
        <div className="relative mb-8 group cursor-pointer" onClick={() => setIsActive(!isActive)}>
            <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-800"
                    />
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-1000 ease-linear ${
                            isAlarmRinging ? 'text-red-500 animate-pulse' :
                            mode === 'focus' ? 'text-blue-500' : 
                            mode === 'short' ? 'text-green-500' : 'text-purple-500'
                        }`}
                        strokeLinecap="round"
                    />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isAlarmRinging ? (
                        <Volume2 size={48} className="mb-2 text-red-500 animate-bounce" />
                    ) : (
                        <CurrentIcon size={32} className={`mb-2 ${modes[mode].color} opacity-80`} />
                    )}
                    
                    <span className={`text-6xl font-bold font-mono tracking-tighter ${isAlarmRinging ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
                        {formatTime(timeLeft)}
                    </span>
                    
                    <span className={`text-sm font-medium mt-2 uppercase tracking-widest flex items-center gap-2 ${isAlarmRinging ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {isAlarmRinging ? "Time's Up!" : isActive ? 'Running' : 'Paused'}
                    </span>
                </div>
            </div>
        </div>

        {/* 3. Controls */}
        <div className="flex gap-4 w-full justify-center">
            {/* Main Action Button */}
            <button 
                onClick={() => setIsActive(!isActive)}
                className={`h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 font-bold gap-2 
                    ${isAlarmRinging 
                        ? 'w-48 bg-red-500 shadow-red-500/30 animate-pulse' 
                        : isActive 
                            ? 'w-16 bg-orange-500 shadow-orange-500/30' 
                            : 'w-16 bg-blue-600 shadow-blue-500/30'
                    }`}
            >
                {isAlarmRinging ? (
                    <>STOP ALARM</>
                ) : isActive ? (
                    <Pause size={28} fill="currentColor" />
                ) : (
                    <Play size={28} fill="currentColor" className="ml-1"/>
                )}
            </button>
            
            {/* Reset Button */}
            <button 
                onClick={onReset}
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                <RotateCcw size={24} />
            </button>
        </div>

        </div>
    </>
  );
};

export default PomodoroTimer;