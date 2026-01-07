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
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate pr-2">
                {subject.name}
            </h3>
            <p className="text-xs font-mono text-gray-500">{subject.code}</p>
        </div>
        
        {/* The Big Percentage Badge */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-opacity-10 backdrop-blur-md ${colorClass.split(' ')[1]} bg-opacity-10`}>
            <span className={`font-bold text-sm ${colorClass.split(' ')[0]}`}>{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar (Visual Health Bar) */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div 
            className={`h-full transition-all duration-500 ease-out ${colorClass.split(' ')[1]}`} 
            style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats Text */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-6 font-mono">
        <span>Attended: {attended}/{total}</span>
        {percentage < 75 && (
            <span className="text-red-400 flex items-center gap-1 animate-pulse">
                <AlertCircle size={12} /> Shortage Risk!
            </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto">
        <button 
            onClick={() => onPresent(subject.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"
        >
            <Plus size={18} /> <span className="text-sm font-bold">Present</span>
        </button>
        
        <button 
            onClick={() => onAbsent(subject.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
        >
            <Minus size={18} /> <span className="text-sm font-bold">Absent</span>
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;