import React from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';

const SubjectCard = ({ subject, onPresent, onAbsent }) => {
  // 1. Calculate the Percentage
  const total = subject.sessions;
  const attended = subject.attended;
  const percentage = total === 0 ? 100 : Math.round((attended / total) * 100);
  
  // 2. Determine Health Color (Gamification logic)
  // Green > 75%, Orange > 60%, Red < 60%
  const getColor = () => {
    if (percentage >= 75) return 'text-green-500 bg-green-500';
    if (percentage >= 60) return 'text-orange-500 bg-orange-500';
    return 'text-red-500 bg-red-500';
  };

  const colorClass = getColor();

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate pr-2">
                {subject.name}
            </h3>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{subject.code}</p>
        </div>
        
        {/* The Big Percentage Badge */}
        <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-opacity-10 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 ${
          percentage >= 75 
            ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 shadow-green-500/20' 
            : percentage >= 60 
            ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 shadow-orange-500/20' 
            : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 shadow-red-500/20'
        }`}>
            <span className={`font-bold text-base ${colorClass.split(' ')[0]}`}>{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar (Visual Health Bar) */}
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden shadow-inner">
        <div 
            className={`h-full transition-all duration-500 ease-out shadow-md ${
              percentage >= 75 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : percentage >= 60 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`} 
            style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats Text */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-6 font-mono">
        <span className="font-semibold">Attended: {attended}/{total}</span>
        {percentage < 75 && (
            <span className="text-red-500 dark:text-red-400 flex items-center gap-1 animate-pulse font-bold">
                <AlertCircle size={12} /> Shortage Risk!
            </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto">
        <button 
            onClick={() => onPresent(subject.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 text-green-700 dark:text-green-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-green-200 dark:border-green-800"
        >
            <Plus size={18} strokeWidth={2.5} /> <span className="text-sm font-bold">Present</span>
        </button>
        
        <button 
            onClick={() => onAbsent(subject.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 hover:from-red-200 hover:to-rose-200 dark:hover:from-red-900/50 dark:hover:to-rose-900/50 text-red-700 dark:text-red-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-200 dark:border-red-800"
        >
            <Minus size={18} strokeWidth={2.5} /> <span className="text-sm font-bold">Absent</span>
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;