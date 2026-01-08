import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  setYear,
} from "date-fns";

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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideYear = (e) => {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(e.target)
      )
        setIsYearOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutsideYear);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideYear);
  }, []);

  const handleYearSelect = (year) => {
    setCurrentMonth(setYear(currentMonth, year));
    setIsYearOpen(false);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-5 px-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          setCurrentMonth(subMonths(currentMonth, 1));
        }}
        className="p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
      </button>

      <div className="flex items-center gap-2 relative" ref={yearDropdownRef}>
        <span className="font-black text-gray-800 dark:text-white text-lg tracking-wide">
          {format(currentMonth, "MMMM")}
        </span>

        {/* Year Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsYearOpen(!isYearOpen)}
          className="flex items-center gap-1 font-black text-blue-600 dark:text-blue-400 hover:text-blue-500 text-base hover:scale-110 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          {currentMonth.getFullYear()}{" "}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${isYearOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Custom Year Dropdown List */}
        {isYearOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-28 max-h-52 overflow-y-auto bg-white/98 dark:bg-black/98 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/20 z-[60] custom-scrollbar backdrop-blur-xl ring-1 ring-blue-500/10 dark:ring-blue-400/10">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                className={`w-full py-2.5 text-sm font-bold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 hover:scale-105 active:scale-95 ${
                  currentMonth.getFullYear() === y
                    ? "text-blue-600 dark:text-blue-400 font-black bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-md"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          setCurrentMonth(addMonths(currentMonth, 1));
        }}
        className="p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
      >
        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
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
        const dateString = format(cloneDay, "yyyy-MM-dd");
        const isSelected =
          value && String(value).substring(0, 10) === dateString;

        days.push(
          <div
            key={day}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm cursor-pointer transition-all duration-200 mx-auto font-bold ${
              !isSameMonth(day, monthStart)
                ? "text-gray-300 dark:text-gray-600 opacity-40"
                : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:scale-115 active:scale-95 hover:shadow-md hover:text-blue-600 dark:hover:text-blue-400 hover:font-extrabold"
            } ${
              isSelected
                ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/60 !opacity-100 scale-115 ring-2 ring-blue-300/50 dark:ring-blue-400/50 hover:scale-120"
                : ""
            }`}
            onClick={() => {
              onChange(dateString);
              setIsOpen(false);
            }}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-2 mb-2">
          {days}
        </div>
      );
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
        style={{ paddingLeft: "3rem" }}
        className="flex items-center justify-between w-full glass-input rounded-xl pr-4 py-3 cursor-pointer transition-all duration-300 relative border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-black/60 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-xl group"
      >
        <CalendarIcon
          size={20}
          className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 group-hover:scale-110 ${
            value ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
          }`}
        />
        <span
          className={`text-lg font-bold tracking-wide ${
            value ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {value ? format(new Date(value), "MMMM dd, yyyy") : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 p-5 w-80 glass-panel rounded-2xl z-50 bg-white/98 dark:bg-black/98 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border-2 border-gray-200/60 dark:border-gray-700/60 ring-1 ring-blue-500/10 dark:ring-blue-400/10 animate-in fade-in zoom-in-95 duration-300">
          {renderHeader()}
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span
                key={d}
                className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
              >
                {d}
              </span>
            ))}
          </div>
          {renderCells()}
        </div>
      )}
    </div>
  );
};

export default DatePicker;