import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Layout, Users, Zap, 
  CheckCircle, Clock, Calendar, Shield, Cpu, Heart 
} from 'lucide-react';

import Footer from "../components/Layout/Footer"

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900 dark:text-white bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500">
      
      {/* 1. TECHNICAL GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:2px_2px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      {/* Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
            A
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">AXIONYX</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            Login
          </Link>
          <Link to="/signup" className="group px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2">
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 max-w-6xl mx-auto pt-20 pb-32 px-6 text-center">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 hover:scale-105 transition-all cursor-default backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-lg shadow-blue-500/50"></span>
          </span>
          AXIONYX is Live
        </div>

        {/* Tagline */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <p className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            The Student Command Center
          </p>
        </div>

        {/* Massive Headline */}
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent drop-shadow-2xl">Your All-in-One</span> <br />
          <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            Academic Hub.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
          Stop juggling apps. AXIONYX is the high-performance operating system designed for engineering students to <span className="text-blue-600 dark:text-blue-400 font-bold">track</span>, <span className="text-purple-600 dark:text-purple-400 font-bold">study</span>, and <span className="text-emerald-600 dark:text-emerald-400 font-bold">succeed</span>.
        </p>

        {/* Stats & Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold">B</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold">C</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="font-semibold">Trusted by <span className="text-blue-600 dark:text-blue-400">1000+</span> students</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <Zap className="text-yellow-500" size={18} />
            <span>Real-time sync</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <Shield className="text-blue-500" size={18} />
            <span>100% Free Forever</span>
          </div>
        </div>

        {/* Quick Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold backdrop-blur-sm">
            📊 Smart Attendance
          </div>
          <div className="px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold backdrop-blur-sm">
            ⚡ Pomodoro Timer
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold backdrop-blur-sm">
            💬 Live Chat
          </div>
          <div className="px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-bold backdrop-blur-sm">
            📝 Kanban Boards
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex flex-col md:flex-row gap-4">
                <Link to="/signup" className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.05] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Initialize System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                
                <a href="#features" className="group w-full md:w-auto px-8 py-4 glass-panel rounded-2xl font-bold hover:bg-white/50 dark:hover:bg-white/10 transition-all border border-white/30 dark:border-white/20 hover:border-blue-500/50 hover:scale-[1.02] backdrop-blur-xl shadow-lg hover:shadow-xl">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">View Modules</span>
                </a>
            </div>
            
        </div>

        {/* --- 3D FLOATING MOCKUP --- */}
        <div className="mt-24 relative max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500 group">
            {/* The Main "Screen" */}
            <div className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl hover:shadow-3xl relative z-10 bg-white/5 dark:bg-black/40 backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-blue-500/30">
                <div className="bg-gray-50 dark:bg-[#0A0A0A] rounded-2xl h-[300px] md:h-[500px] flex flex-col overflow-hidden relative ring-1 ring-gray-200/50 dark:ring-gray-800/50">
                    
                    {/* Mock Header */}
                    <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="mx-auto w-1/3 h-2 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                    </div>

                    {/* Mock Body */}
                    <div className="flex-1 p-6 grid grid-cols-3 gap-4">
                        {/* Sidebar Mock */}
                        <div className="col-span-1 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl h-full animate-pulse shadow-inner"></div>
                        {/* Main Content Mock */}
                        <div className="col-span-2 space-y-4">
                            <div className="h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30 w-full relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl shadow-md"></div>
                                <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl shadow-md"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Notification */}
                    <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-2xl border border-green-500/30 bg-white/80 dark:bg-black/60 backdrop-blur-xl">
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-500 rounded-lg shadow-lg shadow-green-500/20"><CheckCircle size={16}/></div>
                        <div>
                            <div className="text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">Assignment Submitted</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Just now</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Glow Effect behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 -z-10 animate-pulse"></div>
            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-[4rem] blur-[100px] opacity-10 -z-20"></div>
        </div>
      </div>

      {/* --- BENTO GRID FEATURES --- */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              System Modules
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to dominate your academic life, unified in one powerful platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Big Card 1: Attendance */}
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] cursor-default">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                        <Shield size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Bunk Defense System</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                        Advanced algorithms calculate exactly how many classes you can skip while staying above 75%. Safe zone monitoring included.
                    </p>
                </div>
                {/* Decoration */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5 group-hover:opacity-10 transition-all duration-500 text-blue-500">
                    <Shield size={200} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Card 2: Study */}
            <div className="group glass-panel p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-500 bg-gradient-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                    <Users size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Study Zones</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Real-time multiplayer lobbies. Find peers studying the same subject instantly.
                </p>
            </div>

            {/* Card 3: Assignments */}
            <div className="group glass-panel p-8 rounded-3xl hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02] cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/20">
                    <Layout size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">Kanban TaskFlow</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Visual assignment tracking. Move tasks from "To Do" to "Done" with satisfying drag mechanics.
                </p>
            </div>

            {/* Big Card 4: Career */}
            <div className="md:col-span-2 group glass-panel p-8 rounded-3xl hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.02] cursor-default">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                        <Cpu size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Placement OS</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                        Track every application, OA, and interview. Manage your career trajectory like a pro.
                    </p>
                </div>
                 <div className="absolute right-[-20px] bottom-[-20px] opacity-5 group-hover:opacity-10 transition-all duration-500 text-emerald-500">
                    <Cpu size={200} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-20 bg-gradient-to-b from-white/30 to-white/50 dark:from-black/30 dark:to-black/50 backdrop-blur-xl">
        <Footer/>
      </footer>

    </div>
  );
};

export default Landing;