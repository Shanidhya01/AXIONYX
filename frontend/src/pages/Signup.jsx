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


  const getInputClass = (field) => `w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none text-sm shadow-sm hover:shadow-md ${errors[field] ? 'bg-red-50/50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 placeholder-red-300 ring-2 ring-red-500/20' : 'bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-500 hover:bg-white/70 dark:hover:bg-black/70 focus:bg-white/80 dark:focus:bg-black/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg focus:shadow-blue-500/10'}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-[#0a0a0a] dark:via-[#0a0a14] dark:to-[#0a0a1e] transition-colors duration-500 py-10">
      
      {/* Floating Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[8%] w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[55%] left-[18%] w-1 h-1 bg-purple-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[35%] right-[12%] w-2 h-2 bg-emerald-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[75%] right-[22%] w-1 h-1 bg-pink-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[25%] left-[65%] w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-l from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
      <div className="group w-full max-w-5xl h-auto md:h-[750px] flex rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl m-4 border border-white/40 dark:border-white/20 backdrop-blur-2xl bg-white/10 dark:bg-black/40 animate-in fade-in zoom-in duration-500 transition-all hover:scale-[1.01] ring-1 ring-white/10">
        
        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-blue-500/90 via-purple-600/90 to-pink-600/90 relative flex-col justify-between p-12 text-white overflow-hidden group/left">
            {/* Animated border shine */}
            <div className="absolute inset-0 opacity-0 group-hover/left:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"></div>
            </div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            {/* Animated mesh gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-pink-500/30 opacity-50 animate-pulse"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 group/logo cursor-default">
                    <div className="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg group-hover/logo:scale-110 group-hover/logo:shadow-white/50 transition-all duration-300 group-hover/logo:bg-white/30">
                        <span className="font-bold text-xl">A</span>
                        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover/logo:opacity-100 group-hover/logo:animate-ping"></div>
                    </div>
                    <span className="text-xl font-bold tracking-wide drop-shadow-lg">AXIONYX</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight mb-4 drop-shadow-xl">
                    Join the Community. <br/> <span className="text-white/90">Start your journey.</span>
                </h1>
                <p className="text-white/70 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Create your account and unlock powerful tools for academic success.
                </p>
            </div>
            <div className="relative z-10 text-xs text-blue-100 opacity-80">Built by Shanidhya</div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative overflow-y-auto">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-[length:200%_auto]"></div>
            
            {/* Progress indicator dots */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-60">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{animationDelay: '0.6s'}}></div>
            </div>
            
            <div className="mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Join the Community</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-sm animate-gradient bg-[length:200%_auto]">Create Account</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Join the student community.</p>
            </div>
            {serverError && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 duration-300">{serverError}</div>}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Section 1: Basic Info */}
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Information</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <input type="text" className={getInputClass('name')} placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        {formData.name && !errors.name && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <input type="email" className={getInputClass('email')} placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        {formData.email && !errors.email && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                </div>
                </div>
                
                {/* Section 2: Security & Role */}
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security & Role</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                    </div>
                {/* 2. Password & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <input type="password" className={getInputClass('password')} placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        {formData.password && !errors.password && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                    {/* CUSTOM DROPDOWN */}
                    <div className="relative group" ref={dropdownRef}>
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <button type="button" onClick={() => setIsRoleOpen(!isRoleOpen)} className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 text-sm text-left flex justify-between items-center shadow-sm hover:shadow-md ${isRoleOpen ? 'ring-2 ring-blue-500/30 border-blue-500 shadow-lg' : 'border-white/20 dark:border-white/10'} bg-white/50 dark:bg-black/50 text-gray-800 dark:text-white hover:bg-white/70 dark:hover:bg-black/70`}><span>{formData.role}</span><ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} /></button>
                        {isRoleOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {['Student', 'Teacher', 'Admin'].map((role) => (
                                    <button key={role} type="button" onClick={() => { setFormData({ ...formData, role: role }); setIsRoleOpen(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${formData.role === role ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}`}>{role}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>
                
                {/* Section 3: Additional Details */}
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Additional Details</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
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
                    <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <input type="text" className={getInputClass('city')} placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                        {formData.city && !errors.city && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                    <div className="relative group">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" size={18} />
                        <input type="text" className={getInputClass('college')} placeholder="College" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} />
                        {formData.college && !errors.college && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    </div>
                </div>
                </div>
                
                {/* Terms */}
                <div className="flex items-start gap-3 mt-4 px-1 group">
                    <div className="relative flex items-center">
                        <input type="checkbox" id="terms" className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-all hover:border-blue-500" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}/>
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 leading-tight cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-300 transition-colors">I agree to the <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Privacy Policy</Link>.</label>
                </div>
                {errors.agreed && <p className="text-xs text-red-500 text-center animate-in fade-in slide-in-from-left-2 mt-2">{errors.agreed}</p>}
                
                {/* Submit Button - Enhanced */}
                <div className="animate-in fade-in zoom-in duration-500 delay-500">
                <button type="submit" disabled={isLoading} className="group/btn relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="animate-pulse">Creating account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
                </div>
            </form>
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300 dark:border-gray-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-3 py-1 text-gray-500 rounded-xl backdrop-blur-sm">Or join with</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={handleGoogleSignup} className="group/google relative flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover/google:opacity-100 transition-opacity duration-300"></div>
                        <svg className="w-5 h-5 relative z-10 group-hover/google:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 relative z-10">Google</span>
                    </button>
                    <button onClick={handleGithubSignup} className="group/github relative flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-purple-500/10 opacity-0 group-hover/github:opacity-100 transition-opacity duration-300"></div>
                        <Github className="w-5 h-5 text-gray-900 dark:text-white relative z-10 group-hover/github:scale-110 group-hover/github:rotate-12 transition-all" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 relative z-10">GitHub</span>
                    </button>
                </div>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;