import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-[#0a0a0a] dark:via-[#0a0a14] dark:to-[#0a0a1e] text-gray-900 dark:text-white transition-colors duration-500 p-6 md:p-12 relative overflow-hidden">
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[15%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-[20%] left-[20%] w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-purple-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[70%] left-[30%] w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[80%] right-[40%] w-2 h-2 bg-pink-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link to="/" className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all mb-6 hover:gap-3">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Legal Documentation</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 drop-shadow-sm animate-gradient bg-[length:200%_auto]">
                Terms of Service
            </h1>
            <div className="flex items-center gap-3 text-sm">
                <ShieldCheck size={16} className="text-blue-500" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Last updated: <span className="text-gray-800 dark:text-gray-200">December 2025</span></p>
            </div>
        </div>

        {/* Content */}
        <div className="relative group animate-in fade-in zoom-in duration-700 delay-200">
            {/* Decorative corner elements */}
            <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-2xl bg-white/70 dark:bg-black/40 space-y-10 leading-relaxed text-gray-700 dark:text-gray-300 ring-1 ring-white/10">
            
            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-300 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-blue-500/50 group-hover/section:scale-110 transition-all">
                        <ShieldCheck size={24} className="text-white animate-pulse"/>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            1. Acceptance of Terms
                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-normal">Required</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            By accessing and using <strong className="text-gray-900 dark:text-white font-bold">AXIONYX</strong> ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-400 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-purple-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">Student Responsibilities</h2>
                        <p className="text-base leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. <strong className="text-gray-900 dark:text-white font-bold">AXIONYX</strong> is an educational tool; academic integrity remains the sole responsibility of the student.
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-500 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-emerald-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            User Conduct
                            <span className="text-xs px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-normal">Important</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            The "Community" and "Chat" features are designed for academic collaboration. <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium">Harassment, hate speech, or the sharing of illegal content</span> will result in immediate termination of your account.
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-600 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-cyan-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">4</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                            Data Usage
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-normal">Privacy Protected</span>
                        </h2>
                        <p className="text-base leading-relaxed">
                            We collect data (attendance, study hours) solely to provide analytics features to you. <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">We do not sell your personal academic data to third-party advertisers.</span>
                        </p>
                    </div>
                </div>
            </section>

            <section className="group/section animate-in fade-in slide-in-from-left-4 duration-500 delay-700 hover:translate-x-2 transition-transform">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover/section:shadow-pink-500/50 group-hover/section:scale-110 transition-all">
                        <span className="text-white font-bold text-xl">5</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">Termination</h2>
                        <p className="text-base leading-relaxed">
                            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </div>
                </div>
            </section>

            <div className="pt-10 mt-10 border-t border-gray-300/50 dark:border-gray-700/50 animate-in fade-in duration-500 delay-1000">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="font-medium">Questions? We're here to help.</span>
                    </p>
                    <a href="mailto:support@axionyx.com" className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                        <span>Contact Support</span>
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

export default Terms;