import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 p-6 md:p-12">
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
                <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">
                Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Effective Date: December 2025</p>
        </div>

        {/* Content */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/20 shadow-xl space-y-8 leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lock size={20} className="text-emerald-500"/> 1. Information We Collect
                </h2>
                <p className="mb-2">We collect information you provide directly to us:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Account information (Name, Email, College, Role)</li>
                    <li>Academic data (Attendance records, Assignment details)</li>
                    <li>Communication data (Chat messages, Community posts)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Data</h2>
                <p>
                    Your data is used exclusively to power the features of AXIONYX: calculating attendance percentages, organizing your tasks, and facilitating campus communication. We do not use your data for profiling or targeted advertising.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Security</h2>
                <p>
                    We implement industry-standard encryption (BCrypt for passwords, JWT for sessions) to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Your Rights</h2>
                <p>
                    You have the right to request a copy of your data or request deletion of your account at any time via the Profile Settings page.
                </p>
            </section>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                    Concerns? Reach out at <a href="mailto:privacy@AXIONYX" className="text-blue-500 hover:underline">privacy@AXIONYX</a>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;