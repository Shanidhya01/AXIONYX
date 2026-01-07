import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onMove, onDelete }) => {
  // Urgency Logic
  const isUrgent = new Date(task.dueDate) < new Date(Date.now() + 86400000 * 2); // Less than 2 days

  return (
    <div className="glass-panel p-4 rounded-xl mb-3 group hover:bg-white/40 dark:hover:bg-black/40 transition-colors">
      
      {/* Header: Subject & Urgency */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
          {task.subject}
        </span>
        {isUrgent && task.status !== 'Done' && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 animate-pulse">
            URGENT
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{task.title}</h4>
      
      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <Calendar size={12} />
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons (Move Left/Right) */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
        <button 
            onClick={() => onDelete(task._id)} // FIXED: using _id
            className="text-gray-400 hover:text-red-500 transition-colors"
        >
            <Trash2 size={16} />
        </button>

        <div className="flex gap-2">
            {/* Move Left (Hide if in first column) */}
            {task.status !== 'To Do' && (
                <button 
                    onClick={() => onMove(task._id, 'prev')} // FIXED: using _id
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    title="Move Back"
                >
                    <ChevronLeft size={18} />
                </button>
            )}

            {/* Move Right (Hide if in last column) */}
            {task.status !== 'Done' && (
                <button 
                    onClick={() => onMove(task._id, 'next')} // FIXED: using _id
                    className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
                    title="Move Forward"
                >
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;