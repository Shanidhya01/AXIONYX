import React from 'react';
import { Users, MapPin, Clock, ArrowRight, Calendar } from 'lucide-react';
import { format, isFuture } from 'date-fns';

const StudyCard = ({ session, onJoin }) => {
  // Check if session is in the future
  const startTime = new Date(session.startTime);
  const isUpcoming = isFuture(startTime);

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 flex flex-col h-full">
      
      {/* STATUS BADGE */}
      <div className="absolute top-4 right-4">
        {isUpcoming ? (
            // UPCOMING BADGE
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <Calendar size={12} />
                <span className="text-xs font-bold">UPCOMING</span>
            </div>
        ) : (
            // LIVE BADGE
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-green-600 dark:text-green-400">LIVE</span>
            </div>
        )}
      </div>

      {/* Subject Badge */}
      <span className="self-start inline-block px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold mb-3">
        {session.subject}
      </span>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{session.topic}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
        {session.description}
      </p>

      {/* Meta Data Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-pink-500" />
          <span>{session.participants}/{session.maxParticipants} Joined</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" />
          <span>{session.location}</span>
        </div>
        
        {/* Time Display Logic */}
        <div className="flex items-center gap-2 col-span-2 text-gray-500">
          <Clock size={16} className="text-blue-500" />
          <span>
            {isUpcoming 
                ? `Starts: ${format(startTime, 'MMM dd, h:mm a')}` 
                : `Ends: ${format(new Date(session.endTime), 'h:mm a')}`
            }
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onJoin(session.id)}
        disabled={isUpcoming} // Optional: Disable join if it hasn't started
        className={`w-full glass-btn flex items-center justify-center gap-2 transition-all 
            ${isUpcoming 
                ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                : 'group-hover:bg-blue-600 group-hover:text-white'}`
        }
      >
        <span>{isUpcoming ? 'Not Started' : 'Join Session'}</span>
        {!isUpcoming && <ArrowRight size={18} />}
      </button>
    </div>
  );
};

export default StudyCard;