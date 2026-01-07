import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, setYear } from 'date-fns';

const DatePicker = ({ value, onChange, placeholder = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
  });
  
  const wrapperRef = useRef(null);
  const yearDropdownRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideYear = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) setIsYearOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutsideYear);
    return () => document.removeEventListener("mousedown", handleClickOutsideYear);
  }, []);

  const handleYearSelect = (year) => {
      setCurrentMonth(setYear(currentMonth, year));
      setIsYearOpen(false);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 px-1">
      <button onClick={(e) => { e.preventDefault(); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
        <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
      </button>
      
      <div className="flex items-center gap-2 relative" ref={yearDropdownRef}>
        <span className="font-bold text-gray-800 dark:text-white">{format(currentMonth, 'MMMM')}</span>
        
        {/* Year Dropdown Trigger */}
        <button type="button" onClick={() => setIsYearOpen(!isYearOpen)} className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm">
            {currentMonth.getFullYear()} <ChevronDown size={14} className={`transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Custom Year Dropdown List */}
        {isYearOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-24 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-[60] custom-scrollbar">
                {years.map(y => (
                    <button key={y} onClick={() => handleYearSelect(y)} className={`w-full py-2 text-sm hover:bg-blue-50 dark:hover:bg-white/10 ${currentMonth.getFullYear() === y ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700 dark:text-gray-300'}`}>{y}</button>
                ))}
            </div>
        )}
      </div>

      <button onClick={(e) => { e.preventDefault(); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
        <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dateString = format(cloneDay, 'yyyy-MM-dd');
        const isSelected = value && String(value).substring(0, 10) === dateString;
        
        days.push(
          <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all mx-auto ${!isSameMonth(day, monthStart) ? "text-gray-300 dark:text-gray-600 opacity-50" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"} ${isSelected ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:!bg-blue-700 !opacity-100" : ""}`}
            onClick={() => { onChange(dateString); setIsOpen(false); }}
          >{formattedDate}</div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day} className="grid grid-cols-7 gap-1 mb-1">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Restore Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 10px; }
      `}</style>

      {/* Main Input Field */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        // Forced padding-left: 3rem to clear the icon safely
        style={{ paddingLeft: '3rem' }}
        className="flex items-center justify-between w-full glass-input rounded-xl pr-4 py-3 cursor-pointer transition-colors relative border border-transparent focus:border-blue-500/50"
      >
        <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <span className={`text-sm ${value ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>
            {value ? format(new Date(value), 'MMMM dd, yyyy') : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 w-72 glass-panel rounded-2xl z-50 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95">
          {renderHeader()}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>)}</div>
          {renderCells()}
        </div>
      )}
    </div>
  );
};

export default DatePicker;