import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

const TimePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Parse initial 24h value (e.g., "14:30") into 12h format
  const parseTime = (val) => {
    if (!val) return { hour: '12', minute: '00', period: 'PM' };
    const [h, m] = val.split(':');
    let hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12
    return { 
      hour: hour.toString().padStart(2, '0'), 
      minute: m, 
      period 
    };
  };

  const [timeState, setTimeState] = useState(parseTime(value));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync internal state if prop changes
  useEffect(() => {
    setTimeState(parseTime(value));
  }, [value]);

  // Convert 12h state back to 24h string for parent (e.g., "14:30")
  const updateParent = (h, m, p) => {
    let hourInt = parseInt(h);
    if (p === 'PM' && hourInt < 12) hourInt += 12;
    if (p === 'AM' && hourInt === 12) hourInt = 0;
    
    const timeString = `${hourInt.toString().padStart(2, '0')}:${m}`;
    onChange(timeString);
  };

  const handleSelect = (type, val) => {
    const newState = { ...timeState, [type]: val };
    setTimeState(newState);
    updateParent(newState.hour, newState.minute, newState.period);
  };

  // Generate Options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 5-minute intervals
  const periods = ['AM', 'PM'];

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full glass-input rounded-xl px-4 py-2.5 cursor-pointer text-gray-800 dark:text-white transition-all duration-200 hover:bg-white/70 dark:hover:bg-black/50 hover:scale-[1.01] active:scale-[0.99] border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md backdrop-blur-lg group"
      >
        <span className={value ? "font-semibold" : "text-gray-400 dark:text-gray-500"}>
          {value ? `${timeState.hour}:${timeState.minute} ${timeState.period}` : 'Select Time'}
        </span>
        <Clock size={18} className={value ? "text-blue-500 dark:text-blue-400 transition-transform duration-200 group-hover:scale-105" : "text-gray-400 dark:text-gray-500 transition-transform duration-200 group-hover:scale-105"} />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 w-full min-w-[200px] glass-panel rounded-xl z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-3">
          
          {/* Hours Column */}
          <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-center border-r border-gray-200 dark:border-gray-700 pr-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 sticky top-0 bg-white dark:bg-black py-1.5 uppercase tracking-wide z-10">HR</span>
            {hours.map(h => (
              <button
                key={h}
                onClick={(e) => { e.preventDefault(); handleSelect('hour', h); }}
                className={`py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  timeState.hour === h 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105 active:scale-95'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Minutes Column */}
          <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-center border-r border-gray-200 dark:border-gray-700 pr-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 sticky top-0 bg-white dark:bg-black py-1.5 uppercase tracking-wide z-10">MIN</span>
            {minutes.map(m => (
              <button
                key={m}
                onClick={(e) => { e.preventDefault(); handleSelect('minute', m); }}
                className={`py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  timeState.minute === m 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105 active:scale-95'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Period Column */}
          <div className="h-40 flex flex-col gap-2 text-center justify-center">
            {periods.map(p => (
              <button
                key={p}
                onClick={(e) => { e.preventDefault(); handleSelect('period', p); }}
                className={`py-3 rounded-lg text-sm font-bold transition-all duration-150 ${
                  timeState.period === p 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-105 active:scale-95'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default TimePicker;