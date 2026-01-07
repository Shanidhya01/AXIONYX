import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-blue-50 dark:from-[#0a0a0a] dark:via-[#0a0a14] dark:to-[#0a0a1e] text-gray-900 dark:text-white transition-colors duration-500 p-6 md:p-12 relative overflow-hidden">
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[50%] left-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-[20%] right-[25%] w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-[25%] left-[12%] w-2 h-2 bg-emerald-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[45%] right-[18%] w-1 h-1 bg-blue-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[65%] left-[35%] w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[75%] right-[35%] w-2 h-2 bg-teal-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link to="/" className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all mb-6 hover:gap-3">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 backdrop-blur-sm">
                <Lock size={14} className="text-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Your Privacy Matters</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-500 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 drop-shadow-sm animate-gradient bg-[length:200%_auto]">
                Privacy Policy
            </h1>
            <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Effective Date: <span className="text-gray-800 dark:text-gray-200">December 2025</span></p>
            </div>
        </div>

        {/* Content */}
        <div className="relative group animate-in fade-in zoom-in duration-700 delay-200">
            {/* Decorative corner elements */}
            <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-blue-500/30 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-2xl bg-white/70 dark:bg-black/40 space-y-10 leading-relaxed text-gray-700 dark:text-gray-300 ring-1 ring-white/10">
            
            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-300 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-emerald-500/50 group-hover/section:scale-110 transition-all">
                        <Lock size={24} className="text-white animate-pulse"/>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            1. Information We Collect
                            <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-normal">Transparent</span>
                        </h2>
                        <p className="mb-4 text-base">We collect information you provide directly to us:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 group/item">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 group-hover/item:scale-150 transition-transform"></div>
                                <span className="text-base"><strong className="text-gray-900 dark:text-white font-bold">Account information</strong> (Name, Email, College, Role)</span>
                            </li>
                            <li className="flex items-start gap-3 group/item">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover/item:scale-150 transition-transform"></div>
                                <span className="text-base"><strong className="text-gray-900 dark:text-white font-bold">Academic data</strong> (Attendance records, Assignment details)</span>
                            </li>
                            <li className="flex items-start gap-3 group/item">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 group-hover/item:scale-150 transition-transform"></div>
                                <span className="text-base"><strong className="text-gray-900 dark:text-white font-bold">Communication data</strong> (Chat messages, Community posts)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-400 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-blue-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            How We Use Your Data
                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-normal">For You</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            Your data is used exclusively to power the features of <strong className="text-gray-900 dark:text-white font-bold">AXIONYX</strong>: calculating attendance percentages, organizing your tasks, and facilitating campus communication. <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">We do not use your data for profiling or targeted advertising.</span>
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-500 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-cyan-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            Data Security
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-normal">Protected</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            We implement <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded font-medium">industry-standard encryption</span> (BCrypt for passwords, JWT for sessions) to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-600 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-purple-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">4</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            Your Rights
                            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full font-normal">Control</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            You have the right to <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">request a copy of your data or request deletion</span> of your account at any time via the Profile Settings page.
                        </p>
                    </div>
                </div>
            </section>

            <div className="pt-10 mt-10 border-t border-gray-300/50 dark:border-gray-700/50 animate-in fade-in duration-500 delay-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Lock size={14} className="text-emerald-500" />
                        <span className="font-medium">Your privacy is our priority.</span>
                    </p>
                    <a href="mailto:privacy@axionyx.com" className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                        <span>Contact Privacy Team</span>
                        <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;