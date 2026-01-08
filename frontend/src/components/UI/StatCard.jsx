import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl">
      
      {/* Background Glow Effect */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-3xl ${color} transition-all duration-300 group-hover:opacity-30 group-hover:scale-110`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{title}</p>
          <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">{value}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
             {subtitle}
          </p>
        </div>
        
        <div className={`p-3.5 rounded-xl ${color} bg-opacity-20 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
          <Icon size={28} className="text-gray-800 dark:text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;