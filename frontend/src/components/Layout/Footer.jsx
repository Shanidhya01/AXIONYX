import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Lock, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-gray-800 text-center bg-transparent">
      <div className="flex flex-col items-center gap-3">
        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          Built by 
          <a href="https://github.com/Shanidhya01" target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">
            Shanidhya
          </a>
        </p>

        {/* Legal & Contact Links */}
        <div className="flex items-center gap-6 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          <Link to="/terms" className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <Shield size={12} /> Terms
          </Link>
          <Link to="/privacy" className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <Lock size={12} /> Privacy
          </Link>
          <Link to="/contact" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Mail size={12} /> Contact
          </Link>
        </div>

        <p className="text-[10px] text-gray-300">© {new Date().getFullYear()} AXIONYX</p>
      </div>
    </footer>
  );
};

export default Footer;