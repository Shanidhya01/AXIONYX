import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, MapPin, GraduationCap, Briefcase, Github, ChevronDown } from 'lucide-react';
import DatePicker from '../components/UI/DatePicker'; // <--- Import
import { GithubAuthProvider, GoogleAuthProvider, fetchSignInMethodsForEmail, getRedirectResult, linkWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  // Custom Dropdown State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    dob: '', city: '', college: '', role: 'Student' 
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.password) newErrors.password = "Required";
    if (!formData.dob) newErrors.dob = "Required"; // Check Date
    if (!formData.college.trim()) newErrors.college = "Required";
    if (!agreed) newErrors.agreed = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(formData) 
        });
        const data = await res.json();
        
        if (!res.ok) { 
            setServerError(data.msg || 'Registration failed'); 
            setIsLoading(false); 
            return; 
        }
        
        localStorage.setItem('token', data.token);
        if (onLogin) onLogin(); 
        navigate('/dashboard'); 
    } catch (err) { 
        setServerError('Unable to connect. Please check your internet connection.'); 
        setIsLoading(false); 
    }
  };

  const exchangeFirebaseIdTokenForJwt = async (idToken) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();
    if (!res.ok) {
      const details = data?.details ? `\n${data.details}` : '';
      throw new Error((data?.msg || 'Social sign-in failed') + details);
    }

    localStorage.setItem('token', data.token);
    if (onLogin) onLogin();
    navigate('/dashboard');
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return;
        setIsLoading(true);
        const idToken = await result.user.getIdToken();
        await exchangeFirebaseIdTokenForJwt(idToken);
      } catch (err) {
        const message = String(err?.message || '');
        if (message) setServerError(message);
        setIsLoading(false);
      }
    };

    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignup = async () => {
    setServerError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await exchangeFirebaseIdTokenForJwt(idToken);
    } catch (err) {
      const code = err?.code;
      const shouldRedirect = code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/operation-not-supported-in-this-environment';

      if (shouldRedirect) {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          setServerError(String(redirectErr?.message || 'Google sign-in failed. Please try again.'));
          setIsLoading(false);
          return;
        }
      }

      setServerError(String(err?.message || 'Google sign-in failed. Please try again.'));
      setIsLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    setServerError('');
    setIsLoading(true);

    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await exchangeFirebaseIdTokenForJwt(idToken);
    } catch (err) {
      // If the email is already used with another provider (commonly Google), link the accounts.
      if (err?.code === 'auth/account-exists-with-different-credential') {
        try {
          const email = err?.customData?.email;
          const pendingCred = GithubAuthProvider.credentialFromError(err);

          if (!email || !pendingCred) {
            throw new Error('This email is already linked to another sign-in method. Please sign in with the original provider first.');
          }

          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (methods.includes('google.com')) {
            const googleProvider = new GoogleAuthProvider();
            googleProvider.setCustomParameters({ prompt: 'select_account' });

            const googleResult = await signInWithPopup(auth, googleProvider);
            await linkWithCredential(googleResult.user, pendingCred);

            const idToken = await googleResult.user.getIdToken();
            await exchangeFirebaseIdTokenForJwt(idToken);
            return;
          }

          const pretty = methods.length ? methods.join(', ') : 'another provider';
          setServerError(`An account already exists for ${email} using: ${pretty}. Please sign in with that method first, then try GitHub again.`);
          setIsLoading(false);
          return;
        } catch (linkErr) {
          setServerError(String(linkErr?.message || 'Account linking failed. Please sign in with the original provider first.'));
          setIsLoading(false);
          return;
        }
      }

      const code = err?.code;
      const shouldRedirect = code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/operation-not-supported-in-this-environment';

      if (shouldRedirect) {
        try {
          const provider = new GithubAuthProvider();
          provider.addScope('user:email');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          setServerError(String(redirectErr?.message || 'GitHub sign-in failed. Please try again.'));
          setIsLoading(false);
          return;
        }
      }

      setServerError(String(err?.message || 'GitHub sign-in failed. Please try again.'));
      setIsLoading(false);
    }
  };


  const getInputClass = (field) => `w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none text-sm ${errors[field] ? 'bg-red-50/50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 placeholder-red-300' : 'bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-500 focus:bg-white/80 dark:focus:bg-black/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-500 py-10">
      {/* Background Blobs (Same as before) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-l from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl m-4 border border-white/40 dark:border-white/10 backdrop-blur-2xl bg-white/10 dark:bg-black/40">
        <div className="w-full p-8 md:p-12 flex flex-col justify-center relative">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Join the student community.</p>
            </div>
            {serverError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold text-center">{serverError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" className={getInputClass('name')} placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" className={getInputClass('email')} placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                </div>
                {/* 2. Password & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" className={getInputClass('password')} placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    {/* CUSTOM DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                        <button type="button" onClick={() => setIsRoleOpen(!isRoleOpen)} className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 text-sm text-left flex justify-between items-center ${isRoleOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : 'border-white/20 dark:border-white/10'} bg-white/50 dark:bg-black/50 text-gray-800 dark:text-white`}><span>{formData.role}</span><ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} /></button>
                        {isRoleOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {['Student', 'Teacher', 'Admin'].map((role) => (
                                    <button key={role} type="button" onClick={() => { setFormData({ ...formData, role: role }); setIsRoleOpen(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${formData.role === role ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}`}>{role}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* 3. Detailed Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* NEW: CUSTOM CALENDAR */}
                    <DatePicker 
                        value={formData.dob} 
                        onChange={(date) => setFormData({...formData, dob: date})} 
                        error={errors.dob}
                        placeholder="Date of Birth"
                    />
                    <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" className={getInputClass('city')} placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} /></div>
                    <div className="relative"><GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" className={getInputClass('college')} placeholder="College" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} /></div>
                </div>
                {/* Terms */}
                <div className="flex items-start gap-3 mt-4 px-1"><div className="relative flex items-center"><input type="checkbox" id="terms" className="w-5 h-5 border-2 border-gray-400 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}/></div><label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-tight cursor-pointer select-none">I agree to the <Link to="/terms" className="text-blue-500 hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.</label></div>
                {errors.agreed && <p className="text-xs text-red-500 text-center">{errors.agreed}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">{isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}</button>
            </form>
            <div className="mt-6"><div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-2 text-gray-500 rounded-xl">Or join with</span></div></div><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={handleGoogleSignup} className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm"><svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg><span className="text-sm font-bold text-gray-700 dark:text-gray-200">Google</span></button><button onClick={handleGithubSignup} className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm"><Github className="w-5 h-5 text-gray-900 dark:text-white" /><span className="text-sm font-bold text-gray-700 dark:text-gray-200">GitHub</span></button></div></div>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;