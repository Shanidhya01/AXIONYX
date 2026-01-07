import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Lock, Mail, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative w-full py-8 mt-auto overflow-hidden bg-gradient-to-br from-gray-50/80 via-white/50 to-blue-50/80 dark:from-gray-950/80 dark:via-black/50 dark:to-blue-950/80 backdrop-blur-xl border-t border-white/20 dark:border-white/10">
      {/* Animated gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-[shimmer_3s_ease-in-out_infinite]"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-4 left-[10%] w-20 h-20 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-4 right-[15%] w-24 h-24 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-5 px-4">
        {/* Built by section with enhanced styling */}
        <div className="flex items-center gap-2 group">
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>Crafted with</span>
            </span>
            <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse fill-red-500/20" style={{animationDelay: '0.5s'}} />
            <span>by</span>
          </p>
          <a 
            href="https://github.com/Shanidhya01" 
            target="_blank" 
            rel="noreferrer" 
            className="relative font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 group-hover:scale-105 animate-gradient bg-[length:200%_auto]"
          >
            Shanidhya
            <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
          </a>
        </div>

        {/* Decorative divider */}
        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

        {/* Legal & Contact Links with enhanced hover effects */}
        <div className="flex items-center gap-6 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          <Link 
            to="/terms" 
            className="group/link relative flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
          >
            <Shield className="w-3.5 h-3.5 group-hover/link:scale-110 group-hover/link:rotate-12 transition-transform duration-300" />
            <span>Terms</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></div>
          </Link>
          
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
          
          <Link 
            to="/privacy" 
            className="group/link relative flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
          >
            <Lock className="w-3.5 h-3.5 group-hover/link:scale-110 group-hover/link:-rotate-12 transition-transform duration-300" />
            <span>Privacy</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></div>
          </Link>
          
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
          
          <Link 
            to="/contact" 
            className="group/link relative flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
          >
            <Mail className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform duration-300" />
            <span>Contact</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></div>
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

        {/* Copyright with enhanced styling */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-bold bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider">
            AXIONYX
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;