import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onMove, onDelete }) => {
  // Urgency Logic
  const isUrgent = new Date(task.dueDate) < new Date(Date.now() + 86400000 * 2); // Less than 2 days

  return (
    <div className="glass-panel p-4 rounded-xl mb-3 group hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:shadow-lg">
      
      {/* Header: Subject & Urgency */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
          {task.subject}
        </span>
        {isUrgent && task.status !== 'Done' && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse shadow-md shadow-red-500/50">
            URGENT
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 text-base">{task.title}</h4>
      
      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <Calendar size={12} />
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons (Move Left/Right) */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <button 
            onClick={() => onDelete(task._id)} // FIXED: using _id
            className="text-gray-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 active:scale-95"
        >
            <Trash2 size={16} />
        </button>

        <div className="flex gap-2">
            {/* Move Left (Hide if in first column) */}
            {task.status !== 'To Do' && (
                <button 
                    onClick={() => onMove(task._id, 'prev')} // FIXED: using _id
                    className="p-1.5 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 hover:from-gray-200 hover:to-slate-200 dark:hover:from-gray-700 dark:hover:to-slate-700 text-gray-700 dark:text-gray-300 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                    title="Move Back"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
            )}

            {/* Move Right (Hide if in last column) */}
            {task.status !== 'Done' && (
                <button 
                    onClick={() => onMove(task._id, 'next')} // FIXED: using _id
                    className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 text-blue-700 dark:text-blue-400 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                    title="Move Forward"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;