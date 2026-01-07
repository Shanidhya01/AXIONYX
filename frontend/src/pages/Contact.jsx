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
    <div className="mt-10 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-4">
            Get in Touch
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Have a feature request or found a bug? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info (Static) */}
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border-0 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Mail size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">Email Us</h3>
                    <p className="text-sm text-gray-500">support@AXIONYX.os</p>
                </div>
            </div>
            
            <div className="glass-panel p-6 rounded-3xl border-0 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">Campus HQ</h3>
                    <p className="text-sm text-gray-500">New Delhi</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <h3 className="text-2xl font-bold mb-2">Join the Discord</h3>
                <p className="text-blue-100 mb-6 text-sm">Connect with other students and developers building AXIONYX.</p>
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors" onClick={() => { window.open('https://discord.gg/gAP3YBcn', '_blank'); }}>
                    Join Server
                </button>
            </div>
        </div>

        {/* Contact Form (Functional) */}
        <div className="glass-panel p-8 rounded-3xl border-0 shadow-xl relative overflow-hidden">
            
            {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Thanks for reaching out. We'll get back to you shortly.
                    </p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="px-8 py-3 bg-gray-100 dark:bg-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Send Another
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 ml-1">Subject</label>
                        <input 
                            type="text" 
                            required
                            className="w-full glass-input rounded-xl dark:text-white" 
                            placeholder="Bug Report / Feature Request" 
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 ml-1">Message</label>
                        <textarea 
                            required
                            className="w-full glass-input rounded-xl dark:text-white h-40 py-3" 
                            placeholder="Tell us what's on your mind..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <span>Failed to send message. Please try again.</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> Send Message</>}
                    </button>
                </form>
            )}
        </div>

      </div>
    </div>
  );
};

export default Contact;