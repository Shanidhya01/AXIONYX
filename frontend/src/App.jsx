import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import PageTransition from './components/Layout/PageTransition';
import useTheme from './hooks/useTheme';
import { Menu, Zap } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import StudyZone from './pages/StudyZone';
import Career from './pages/Career';
import Community from './pages/Community';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const AnimatedRoutes = ({ user, fetchUser }) => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><Dashboard user={user} /></PageTransition>} />      <Route path="/attendance" element={<PageTransition><Attendance /></PageTransition>} />
      <Route path="/assignments" element={<PageTransition><Assignments /></PageTransition>} />
      <Route path="/study-zone" element={<PageTransition><StudyZone /></PageTransition>} />
      <Route path="/career" element={<PageTransition><Career /></PageTransition>} />
      <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
      <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
      <Route path="/profile" element={<PageTransition><Profile onProfileUpdate={fetchUser} /></PageTransition>} />
      <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
      <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
      
      {/* Legal Pages for Logged In Users */}
      <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
      <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

  const fetchUser = async (isLoginAction = false) => {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, { method: 'GET', headers: { 'x-auth-token': token }, credentials: 'include' });
            const data = await res.json();
            
            if (res.ok) {
                setUser(data);
                
                if (isLoginAction) {
                    setShowWelcomeAnimation(true);
                    setTimeout(() => {
                        setIsAuthenticated(true);
                        setShowWelcomeAnimation(false);
                    }, 2500);
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } catch (err) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    fetchUser(true);
  };

  if (isLoading) return null;

  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      {/* 1. ANIMATION OVERLAY */}
      {showWelcomeAnimation && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#050505] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-bounce">
                    <Zap size={48} className="text-white" />
                </div>
                <div className="absolute -inset-4 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
            </div>
            <h1 className="mt-8 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 fade-in duration-700">
                Initializing AXIONYX...
            </h1>
            <p className="text-gray-500 mt-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
                Welcome back, {user?.name || 'Student'}
            </p>
        </div>
      )}

      {/* 2. MAIN LOGIC */}
      {!isAuthenticated ? (
        !showWelcomeAnimation && (
            <div className="relative min-h-screen transition-colors duration-300">
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#050505]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-400/30 dark:bg-purple-600/20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-400/30 dark:bg-blue-500/10"></div>
            </div>

            <Routes>
                <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login onLogin={login} /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup onLogin={login} /></PageTransition>} />
                <Route path="/oauth-success" element={<OAuthSuccess onLogin={login} />} />
                <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </div>
        )
      ) : (
        !showWelcomeAnimation && (
            <div className="relative min-h-screen flex transition-colors duration-300 overflow-x-hidden">
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#050505]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-400/40 dark:bg-purple-600/30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-400/40 dark:bg-blue-500/20"></div>
            </div>

            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} user={user} />

            <main className="flex-1 md:ml-64 min-h-screen w-full transition-all duration-300">
                <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <header className="md:hidden flex justify-between items-center mb-6 sticky top-0 z-40 py-2">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 glass-panel rounded-lg text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"><Menu size={24} /></button>
                </header>

                <AnimatedRoutes user={user} fetchUser={fetchUser} />
                </div>
            </main>
            </div>
        )
      )}
    </Router>
  );
}

export default App;