import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { GithubAuthProvider, GoogleAuthProvider, fetchSignInMethodsForEmail, getRedirectResult, linkWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

    const exchangeFirebaseIdTokenForJwt = async (idToken) => {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/firebase`, {
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
                            setServerError(`An account already exists for ${email} using: ${pretty}. Please sign in with that method first.`);
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
                            setServerError(`An account already exists for ${email} using: ${pretty}. Please sign in with that method first.`);
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
                    setIsLoading(false);
                    return;
                }
            }

            setServerError(String(err?.message || 'GitHub sign-in failed. Please try again.'));
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setServerError('');
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            await exchangeFirebaseIdTokenForJwt(idToken);
            // If the email is already used with another provider (commonly Google), link the accounts.
            if (err?.code === 'auth/account-exists-with-different-credential') {
                try {
                    const email = err?.customData?.email;
                    const pendingCred = GithubAuthProvider.credentialFromError(err);

                    if (!email || !pendingCred) {
                        throw new Error('This email is already linked to another sign-in method. Please sign in with the original provider first.');
                    }

                    const methods = await fetchSignInMethodsForEmail(auth, email);

                    // Most common case in this app: existing Google account.
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

        } catch (err) {
            // Some browsers/privacy settings block popups/3p storage. Fall back to redirect.
            const code = err?.code;
            const shouldRedirect = code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/operation-not-supported-in-this-environment';

            if (shouldRedirect) {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithRedirect(auth, provider);
                    return; // redirect will happen
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

  const getInputClass = (field) => `
    w-full !pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none
    ${errors[field] 
      ? 'bg-red-50/50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 placeholder-red-300' 
      : 'bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-500 focus:bg-white/80 dark:focus:bg-black/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}
  `;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-500">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-l from-blue-600 to-purple-600"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="w-full max-w-5xl h-auto md:h-[650px] flex rounded-3xl overflow-hidden shadow-2xl m-4 border border-white/40 dark:border-white/10 backdrop-blur-2xl bg-white/10 dark:bg-black/40 animate-in fade-in zoom-in duration-500">
        
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-emerald-500/90 to-blue-600/90 relative flex-col justify-between p-12 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                        <span className="font-bold text-xl">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-wide">AXIONYX</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight mb-4">
                    Welcome Back. <br/> Ready to focus?
                </h1>
            </div>
            <div className="relative z-10 text-xs text-blue-100 opacity-80">Built by Shanidhya</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your credentials to access your dashboard.</p>
            </div>

            {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold text-center">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={20} className={errors.email ? 'text-red-400' : ''} />
                        </div>
                        <input type="email" className={getInputClass('email')} placeholder="student@university.edu" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={20} className={errors.password ? 'text-red-400' : ''} />
                        </div>
                        <input type="password" className={getInputClass('password')} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</a>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                </button>
            </form>

            {/* --- SOCIAL LOGIN SECTION --- */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-2 text-gray-500 rounded-xl">Or continue with</span></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Google</span>
                    </button>
                    <button onClick={handleGithubLogin} className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                        <Github className="w-5 h-5 text-gray-900 dark:text-white" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">GitHub</span>
                    </button>
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                New to AXIONYX? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors">Create Account</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;