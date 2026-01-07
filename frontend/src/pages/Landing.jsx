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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">AXIONYX</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 max-w-6xl mx-auto pt-20 pb-32 px-6 text-center">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          AXIONYX is Live
        </div>

        {/* Massive Headline */}
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Engineer Your <br />
          <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Academic Success.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Stop juggling apps. AXIONYX is the high-performance operating system designed for engineering students to track, study, and succeed.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex flex-col md:flex-row gap-4">
                <Link to="/signup" className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                    Initialize System <ArrowRight size={20} />
                </Link>
                
                <a href="#features" className="w-full md:w-auto px-8 py-4 glass-panel rounded-2xl font-bold hover:bg-white/50 dark:hover:bg-white/10 transition-all border border-white/20 dark:border-white/10">
                    View Modules
                </a>
            </div>
            
        </div>

        {/* --- 3D FLOATING MOCKUP --- */}
        <div className="mt-24 relative max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
            {/* The Main "Screen" */}
            <div className="glass-panel p-2 rounded-3xl border border-white/20 shadow-2xl relative z-10 bg-white/5 dark:bg-black/40 backdrop-blur-xl">
                <div className="bg-gray-50 dark:bg-[#0A0A0A] rounded-2xl h-[300px] md:h-[500px] flex flex-col overflow-hidden relative">
                    
                    {/* Mock Header */}
                    <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
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
                        <div className="col-span-1 bg-gray-200 dark:bg-gray-800/50 rounded-xl h-full animate-pulse"></div>
                        {/* Main Content Mock */}
                        <div className="col-span-2 space-y-4">
                            <div className="h-32 bg-blue-500/10 rounded-xl border border-blue-500/20 w-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-gray-200 dark:bg-gray-800/50 rounded-xl"></div>
                                <div className="h-24 bg-gray-200 dark:bg-gray-800/50 rounded-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Notification */}
                    <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-xl border border-white/20">
                        <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><CheckCircle size={16}/></div>
                        <div>
                            <div className="text-xs font-bold dark:text-white">Assignment Submitted</div>
                            <div className="text-[10px] text-gray-500">Just now</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Glow Effect behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[3rem] blur-3xl opacity-20 -z-10"></div>
        </div>
      </div>

      {/* --- BENTO GRID FEATURES --- */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            System Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Big Card 1: Attendance */}
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Bunk Defense System</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Advanced algorithms calculate exactly how many classes you can skip while staying above 75%. Safe zone monitoring included.
                    </p>
                </div>
                {/* Decoration */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield size={200} />
                </div>
            </div>

            {/* Card 2: Study */}
            <div className="glass-panel p-8 rounded-3xl hover:border-purple-500/30 transition-all bg-gradient-to-br from-purple-500/5 to-transparent">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Study Zones</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Real-time multiplayer lobbies. Find peers studying the same subject instantly.
                </p>
            </div>

            {/* Card 3: Assignments */}
            <div className="glass-panel p-8 rounded-3xl hover:border-orange-500/30 transition-all">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                    <Layout size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Kanban TaskFlow</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Visual assignment tracking. Move tasks from "To Do" to "Done" with satisfying drag mechanics.
                </p>
            </div>

            {/* Big Card 4: Career */}
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl hover:border-emerald-500/30 transition-all relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Cpu size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Placement OS</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Track every application, OA, and interview. Manage your career trajectory like a pro.
                    </p>
                </div>
                 <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cpu size={200} />
                </div>
            </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-20 bg-white/30 dark:bg-black/30 backdrop-blur-xl">
        <Footer/>
      </footer>

    </div>
  );
};

export default Landing;