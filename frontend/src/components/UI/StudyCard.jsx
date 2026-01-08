import React from 'react';
import { Users, MapPin, Clock, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { format, isFuture } from 'date-fns';

const StudyCard = ({ session, onJoin }) => {
  // Check if session is in the future
  const startTime = new Date(session.startTime);
  const isUpcoming = isFuture(startTime);
  const isJoined = session.isJoined || false;

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col h-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl">
      
      {/* STATUS BADGE */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {isJoined && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40 animate-in zoom-in duration-300">
            <CheckCircle2 size={14} className="animate-in zoom-in duration-300" />
            <span className="text-xs font-bold">JOINED</span>
          </div>
        )}
        {isUpcoming ? (
            // UPCOMING BADGE
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                <Calendar size={12} />
                <span className="text-xs font-bold">UPCOMING</span>
            </div>
        ) : (
            // LIVE BADGE
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 shadow-sm">
                <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-green-700 dark:text-green-400">LIVE</span>
            </div>
        )}
      </div>

      {/* Subject Badge */}
      <span className="self-start inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-4 border border-purple-200 dark:border-purple-800 shadow-sm">
        {session.subject}
      </span>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{session.topic}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2 flex-grow">
        {session.description}
      </p>

      {/* Meta Data Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30">
            <Users size={16} className="text-pink-600 dark:text-pink-400" />
          </div>
          <span className="font-medium">{session.participants}/{session.maxParticipants} Joined</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
          </div>
          <span className="font-medium">{session.location}</span>
        </div>
        
        {/* Time Display Logic */}
        <div className="flex items-center gap-2 col-span-2 text-gray-500">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-medium">
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
        disabled={isUpcoming || isJoined}
        className={`w-full glass-btn flex items-center justify-center gap-2 transition-all shadow-md py-3 rounded-xl font-semibold
            ${isUpcoming || isJoined
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'} 
            ${isJoined ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400' : ''}`
        }
      >
        {isJoined ? (
          <>
            <CheckCircle2 size={18} />
            <span>Already Joined</span>
          </>
        ) : (
          <>
            <span>{isUpcoming ? 'Not Started' : 'Join Session'}</span>
            {!isUpcoming && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </>
        )}
      </button>
    </div>
  );
};

export default StudyCard;