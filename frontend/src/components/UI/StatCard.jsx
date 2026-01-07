import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      
      {/* Background Glow Effect */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${color}`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
             {subtitle}
          </p>
        </div>
        
        <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-sm`}>
          <Icon size={24} className="text-gray-800 dark:text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;