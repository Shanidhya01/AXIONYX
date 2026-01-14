import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { GithubAuthProvider, GoogleAuthProvider, fetchSignInMethodsForEmail, getRedirectResult, linkWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { showSuccess, showError } from '../lib/toast';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Required';
        if (!formData.password) newErrors.password = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) return;

        if (!API_BASE_URL) {
            const msg = 'Missing VITE_API_BASE_URL configuration.';
            showError(msg);
            setServerError(msg);
            return;
        }

        setIsLoading(true);
        try {
            const base = String(API_BASE_URL).replace(/\/+$/, '');
            const res = await fetch(`${base}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { msg: text };
            }

            if (!res.ok) {
                showError(data?.msg || 'Login failed');
                setServerError(data?.msg || 'Login failed');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            showSuccess('Welcome back! Logging in...');
            if (onLogin) onLogin();
            navigate('/dashboard');
        } catch (err) {
            showError('Unable to connect. Please check your internet connection.');
            setServerError('Unable to connect. Please check your internet connection.');
            setIsLoading(false);
        }
    };

    const exchangeFirebaseIdTokenForJwt = async (idToken) => {
        if (!API_BASE_URL) {
            throw new Error('Missing VITE_API_BASE_URL configuration.');
        }

        const base = String(API_BASE_URL).replace(/\/+$/, '');
        const res = await fetch(`${base}/api/auth/firebase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        const text = await res.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { msg: text };
        }
        if (!res.ok) {
            const details = data?.details ? `\n${data.details}` : '';
            const errorMsg = (data?.msg || 'Social sign-in failed') + details;
            showError(errorMsg);
            throw new Error(errorMsg);
        }

        localStorage.setItem('token', data.token);
        showSuccess('Successfully signed in!');
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
                if (message) {
                    showError(message);
                    setServerError(message);
                }
                setIsLoading(false);
            }
        };

        handleRedirect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleLogin = async () => {
        setServerError('');
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await exchangeFirebaseIdTokenForJwt(idToken);
        } catch (err) {
            if (err?.code === 'auth/account-exists-with-different-credential') {
                try {
                    const email = err?.customData?.email;
                    const pendingCred = GoogleAuthProvider.credentialFromError(err);

                    if (!email || !pendingCred) {
                        throw new Error('This email is already linked to another sign-in method. Please sign in with the original provider first.');
                    }

                    const methods = await fetchSignInMethodsForEmail(auth, email);

                    if (methods.includes('github.com')) {
                        const githubProvider = new GithubAuthProvider();
                        githubProvider.addScope('user:email');

                        const githubResult = await signInWithPopup(auth, githubProvider);
                        await linkWithCredential(githubResult.user, pendingCred);

                        const idToken = await githubResult.user.getIdToken();
                        await exchangeFirebaseIdTokenForJwt(idToken);
                        return;
                    }

                    const pretty = methods.length ? methods.join(', ') : 'another provider';
                    const errorMsg = `An account already exists for ${email} using: ${pretty}. Please sign in with that method first.`;
                    showError(errorMsg);
                    setServerError(errorMsg);
                    setIsLoading(false);
                    return;
                } catch (linkErr) {
                    const errorMsg = String(linkErr?.message || 'Account linking failed. Please sign in with the original provider first.');
                    showError(errorMsg);
                    setServerError(errorMsg);
                    setIsLoading(false);
                    return;
                }
            }

            const code = err?.code;
            const shouldRedirect = code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/operation-not-supported-in-this-environment';

            if (shouldRedirect) {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithRedirect(auth, provider);
                    return;
                } catch (redirectErr) {
                    const errorMsg = String(redirectErr?.message || 'Google sign-in failed. Please try again.');
                    showError(errorMsg);
                    setServerError(errorMsg);
                    setIsLoading(false);
                    return;
                }
            }

            const errorMsg = String(err?.message || 'Google sign-in failed. Please try again.');
            showError(errorMsg);
            setServerError(errorMsg);
            setIsLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setServerError('');
        setIsLoading(true);

        try {
            const provider = new GithubAuthProvider();
            provider.addScope('user:email');

            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await exchangeFirebaseIdTokenForJwt(idToken);
        } catch (err) {
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
                    const errorMsg = `An account already exists for ${email} using: ${pretty}. Please sign in with that method first.`;
                    showError(errorMsg);
                    setServerError(errorMsg);
                    setIsLoading(false);
                    return;
                } catch (linkErr) {
                    const errorMsg = String(linkErr?.message || 'Account linking failed. Please sign in with the original provider first.');
                    showError(errorMsg);
                    setServerError(errorMsg);
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
                    const errorMsg = String(redirectErr?.message || 'GitHub sign-in failed. Please try again.');
                    showError(errorMsg);
                    setServerError(errorMsg);
                    setIsLoading(false);
                    return;
                }
            }

            const errorMsg = String(err?.message || 'GitHub sign-in failed. Please try again.');
            showError(errorMsg);
            setServerError(errorMsg);
            setIsLoading(false);
        }
    };

  const getInputClass = (field) => `
    w-full !pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-300 outline-none backdrop-blur-sm shadow-sm hover:shadow-md
    ${errors[field] 
      ? 'bg-red-50/50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 placeholder-red-300 ring-2 ring-red-500/20' 
      : 'bg-white/60 dark:bg-black/60 border-white/30 dark:border-white/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white/70 dark:hover:bg-black/70 focus:bg-white/80 dark:focus:bg-black/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg focus:shadow-blue-500/10'}
  `;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-[#0a0a0a] dark:via-[#0a0a14] dark:to-[#0a0a1e] transition-colors duration-500">
      
      {/* Floating Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[60%] left-[20%] w-1 h-1 bg-purple-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-emerald-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[80%] right-[25%] w-1 h-1 bg-pink-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 bg-gradient-to-l from-blue-600 to-purple-600 animate-pulse" style={{animationDelay: '1s'}}></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse" style={{animationDelay: '2s'}}></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="group w-full max-w-5xl h-auto md:h-[650px] flex rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl m-4 border border-white/40 dark:border-white/20 backdrop-blur-2xl bg-white/10 dark:bg-black/40 animate-in fade-in zoom-in duration-500 transition-all hover:scale-[1.01] ring-1 ring-white/10">
        
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-emerald-500/90 via-blue-600/90 to-purple-600/90 relative flex-col justify-between p-12 text-white overflow-hidden group/left">
            {/* Animated border shine */}
            <div className="absolute inset-0 opacity-0 group-hover/left:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"></div>
            </div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            {/* Animated mesh gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 via-transparent to-purple-500/30 opacity-50 animate-pulse"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 group/logo cursor-default">
                    <div className="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg group-hover/logo:scale-110 group-hover/logo:shadow-white/50 transition-all duration-300 group-hover/logo:bg-white/30">
                        <span className="font-bold text-xl">A</span>
                        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover/logo:opacity-100 group-hover/logo:animate-ping"></div>
                    </div>
                    <span className="text-xl font-bold tracking-wide drop-shadow-lg">AXIONYX</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight mb-4 drop-shadow-xl">
                    Welcome Back. <br/> <span className="text-white/90">Ready to focus?</span>
                </h1>
                <p className="text-white/70 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Your command center for academic excellence awaits.
                </p>
            </div>
            <div className="relative z-10 text-xs text-blue-100 opacity-80">Built by Shanidhya</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
            {/* Decorative corner accents */}
            <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-blue-500/20 rounded-tr-3xl"></div>
            <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-purple-500/20 rounded-bl-3xl"></div>
            
            <div className="mb-6 relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 drop-shadow-sm">Sign In</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Enter your credentials to access your dashboard.</p>
            </div>

            {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold text-center animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg shadow-red-500/10">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-2">
                        Email Address
                        <span className="text-blue-500 opacity-0 group-focus-within:opacity-100 transition-opacity">✦</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110">
                            <Mail size={20} className={errors.email ? 'text-red-400' : ''} />
                        </div>
                        <input type="email" className={getInputClass('email')} placeholder="student@university.edu" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        {!errors.email && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity animate-pulse"></div>}
                    </div>
                    {errors.email && <p className="text-xs text-red-500 ml-1 animate-in fade-in slide-in-from-left-2 duration-200">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider flex items-center gap-2">
                        Password
                        <span className="text-blue-500 opacity-0 group-focus-within:opacity-100 transition-opacity">✦</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110">
                            <Lock size={20} className={errors.password ? 'text-red-400' : ''} />
                        </div>
                        <input type="password" className={getInputClass('password')} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        {!errors.password && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity animate-pulse"></div>}
                    </div>
                    {errors.password && <p className="text-xs text-red-500 ml-1 animate-in fade-in slide-in-from-left-2 duration-200">{errors.password}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="group/btn relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="animate-pulse">Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            {/* --- SOCIAL LOGIN SECTION --- */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300 dark:border-gray-600"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-3 py-1 text-gray-600 dark:text-gray-400 rounded-xl font-bold backdrop-blur-sm">Or continue with</span></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button type="button" onClick={handleGoogleLogin} className="group/google relative flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover/google:opacity-100 transition-opacity duration-300"></div>
                        <svg className="w-5 h-5 relative z-10 group-hover/google:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 relative z-10">Google</span>
                    </button>
                    <button type="button" onClick={handleGithubLogin} className="group/github relative flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-purple-500/10 opacity-0 group-hover/github:opacity-100 transition-opacity duration-300"></div>
                        <Github className="w-5 h-5 text-gray-900 dark:text-white relative z-10 group-hover/github:scale-110 group-hover/github:rotate-12 transition-all" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 relative z-10">GitHub</span>
                    </button>
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                New to AXIONYX? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline font-bold transition-all hover:translate-x-0.5 inline-block">Create Account →</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;