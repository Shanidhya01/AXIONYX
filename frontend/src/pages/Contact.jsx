import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const Contact = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // --- HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setStatus('loading');

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify({
                type: 'contact_form', // You can handle this in the backend
                subject: formData.subject,
                message: formData.message
            })
        });

        if (res.ok) {
            setStatus('success');
            setFormData({ subject: '', message: '' }); // Clear form
        } else {
            setStatus('error');
        }
    } catch (err) {
        console.error(err);
        setStatus('error');
    }
  };

  return (
    <div className="mt-10 max-w-5xl mx-auto pb-10 relative">
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[20%] w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-[15%] left-[30%] w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-[25%] right-[25%] w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[45%] left-[20%] w-1 h-1 bg-purple-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[70%] right-[35%] w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[80%] left-[40%] w-2 h-2 bg-pink-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        {/* Animated badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">We're Here to Help</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-sm animate-gradient bg-[length:200%_auto]">
            Get in Touch
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-lg font-medium">
            Have a feature request or found a bug? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Contact Info (Static) */}
        <div className="flex items-start">
            <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl flex items-center gap-4 hover:scale-[1.02] transition-all group backdrop-blur-2xl bg-white/70 dark:bg-black/40 animate-in fade-in slide-in-from-left-4 duration-500 delay-200 w-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Mail size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">Email Us</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400 font-medium">support@AXIONYX.os</p>
                </div>
            </div>
        </div>

        {/* Contact Form (Functional) */}
        <div className="relative group animate-in fade-in zoom-in duration-700 delay-500">
            {/* Decorative corner elements */}
            <div className="absolute -top-3 -left-3 w-20 h-20 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-3 -right-3 w-20 h-20 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="glass-panel p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl hover:shadow-3xl backdrop-blur-2xl bg-white/70 dark:bg-black/40 relative overflow-hidden ring-1 ring-white/10 transition-all">
            
            {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 animate-bounce">
                            <CheckCircle size={48} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
                        Thanks for reaching out. We'll get back to you shortly.
                    </p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="group/btn relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        <span className="relative z-10">Send Another</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-2">
                            Subject
                            <span className="text-blue-500 opacity-0 group-focus-within:opacity-100 transition-opacity">✦</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                className="w-full glass-input rounded-xl dark:text-white py-3.5 px-4 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm hover:shadow-md focus:shadow-lg" 
                                placeholder="Bug Report / Feature Request" 
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />
                            {formData.subject && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                        </div>
                    </div>
                    
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-2">
                            Message
                            <span className="text-blue-500 opacity-0 group-focus-within:opacity-100 transition-opacity">✦</span>
                        </label>
                        <div className="relative">
                            <textarea 
                                required
                                className="w-full glass-input rounded-xl dark:text-white h-40 py-3.5 px-4 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm hover:shadow-md focus:shadow-lg resize-none" 
                                placeholder="Tell us what's on your mind..."
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            ></textarea>
                            {formData.message && <div className="absolute right-4 top-4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                        </div>
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <span className="font-medium">Failed to send message. Please try again.</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="group/btn relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
                    >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            {status === 'loading' ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Send Message</span>
                                </>
                            )}
                        </span>
                    </button>
                </form>
            )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;