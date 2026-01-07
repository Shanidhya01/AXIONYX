import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 p-6 md:p-12">
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
                <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Terms of Service
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: December 2025</p>
        </div>

        {/* Content */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/20 shadow-xl space-y-8 leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-500"/> 1. Acceptance of Terms
                </h2>
                <p>
                    By accessing and using <strong>AXIONYX</strong> ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Student Responsibilities</h2>
                <p>
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. AXIONYX is an educational tool; academic integrity remains the sole responsibility of the student.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Conduct</h2>
                <p>
                    The "Community" and "Chat" features are designed for academic collaboration. Harassment, hate speech, or the sharing of illegal content will result in immediate termination of your account.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Data Usage</h2>
                <p>
                    We collect data (attendance, study hours) solely to provide analytics features to you. We do not sell your personal academic data to third-party advertisers.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Termination</h2>
                <p>
                    We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
            </section>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                    Questions? Contact us at <a href="mailto:support@AXIONYX" className="text-blue-500 hover:underline">support@AXIONYX</a>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;