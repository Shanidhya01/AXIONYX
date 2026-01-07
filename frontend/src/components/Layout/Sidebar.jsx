import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, ClipboardList, BookOpen, Briefcase, 
  Users, MessageSquare, CircleHelp, X, FileText // <--- Added FileText Icon
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Attendance', path: '/attendance' },
    { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
    { icon: BookOpen, label: 'Study Zone', path: '/study-zone' },
    { icon: Briefcase, label: 'Career', path: '/career' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: FileText, label: 'Resources', path: '/resources' },
  ];

  return (
    <>
      {/* 1. Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 2. The Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen 
          w-72 md:w-64 max-w-[85vw]
          p-4 transition-transform duration-300 ease-in-out
          md:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full glass-panel rounded-2xl flex flex-col p-5 md:p-6 relative overflow-hidden">
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-red-500 transition-colors z-20"
          >
            <X size={24} />
          </button>

          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-8 mt-2 md:mt-0 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 shrink-0">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-white truncate">
              AXIONYX
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
            <style>{`
                nav::-webkit-scrollbar { display: none; }
            `}</style>
            
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 '}
                `}
              >
                {/* Dynamically render the icon component */}
                <item.icon size={20} className="shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}

            {/* DIVIDER FOR SUPPORT LINK */}
            <div className="pt-4 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <NavLink
                    to="/contact"
                    onClick={onClose}
                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap
                    ${isActive 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 '}
                    `}
                >
                    <CircleHelp size={20} className="shrink-0" />
                    <span className="font-medium">Help & Support</span>
                </NavLink>
            </div>
          </nav>

          {/* User Mini Profile */}
          <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-gray-700/50 shrink-0">
              <Link 
                to="/profile" 
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[2px] shadow-md shrink-0">
                     <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : '?'
                        )}
                     </div>
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {user?.name || 'Student'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">View Profile</p>
                  </div>
              </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;