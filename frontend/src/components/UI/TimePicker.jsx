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
        className="flex items-center justify-between w-full glass-input rounded-xl px-4 py-2 cursor-pointer text-gray-800 dark:text-white transition-all hover:bg-white/60 dark:hover:bg-black/40"
      >
        <span className={value ? "font-medium" : "text-gray-400"}>
          {value ? `${timeState.hour}:${timeState.minute} ${timeState.period}` : 'Select Time'}
        </span>
        <Clock size={18} className="text-gray-500" />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 w-full min-w-[200px] glass-panel rounded-2xl z-50 bg-white/90 dark:bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 grid grid-cols-3 gap-2">
          
          {/* Hours Column */}
          <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-center border-r border-gray-200 dark:border-gray-700 pr-1">
            <span className="text-xs text-gray-400 font-bold mb-1 sticky top-0 bg-white dark:bg-black py-1">HR</span>
            {hours.map(h => (
              <button
                key={h}
                onClick={(e) => { e.preventDefault(); handleSelect('hour', h); }}
                className={`py-1 rounded-md text-sm transition-colors ${timeState.hour === h ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Minutes Column */}
          <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-center border-r border-gray-200 dark:border-gray-700 pr-1">
            <span className="text-xs text-gray-400 font-bold mb-1 sticky top-0 bg-white dark:bg-black py-1">MIN</span>
            {minutes.map(m => (
              <button
                key={m}
                onClick={(e) => { e.preventDefault(); handleSelect('minute', m); }}
                className={`py-1 rounded-md text-sm transition-colors ${timeState.minute === m ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Period Column */}
          <div className="h-40 flex flex-col gap-1 text-center justify-center">
            {periods.map(p => (
              <button
                key={p}
                onClick={(e) => { e.preventDefault(); handleSelect('period', p); }}
                className={`py-2 rounded-md text-sm font-bold transition-colors ${timeState.period === p ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
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