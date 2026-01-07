import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Save, Moon, Sun, Monitor, Camera, LogOut, AlertTriangle, MapPin, Calendar, Briefcase, Users, GraduationCap } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import Modal from '../components/UI/Modal';
import DatePicker from '../components/UI/DatePicker';

const Profile = ({ onProfileUpdate }) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState({ 
      name: '', email: '', college: '', bio: '', avatar: '', 
      city: '', dob: '', role: 'Student', friends: [] 
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, { headers: { 'x-auth-token': token } });
        const data = await res.json();
        if (res.ok) {
            setUser({
                name: data.name || '',
                email: data.email || '',
                college: data.college || '',
                bio: data.bio || '',
                avatar: data.avatar || '',
                city: data.city || '',
                dob: data.dob ? data.dob.split('T')[0] : '', 
                role: data.role || 'Student',
                friends: data.friends || [],
                createdAt: data.createdAt
            });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        // 1. Size Validation (Max 2MB)
        if (file.size > 2 * 1024 * 1024) { 
            alert("File size too large (Max 2MB)");
            return;
        }
        
        // 2. Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            // 3. Update User State (Shows preview immediately)
            setUser(prev => ({ ...prev, avatar: reader.result })); 
        };
        reader.readAsDataURL(file);
        }
    };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/updatedetails`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ 
                name: user.name, 
                college: user.college, 
                bio: user.bio,
                city: user.city,
                dob: user.dob,
                avatar: user.avatar 
            })
        });
        if (res.ok) {
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            if (onProfileUpdate) onProfileUpdate();
        } else {
            setMessage('Failed to update profile.');
        }
    } catch (err) { setMessage('Error connecting to server.'); }
  };

  const performLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (passData.new !== passData.confirm) return setPassError("New passwords do not match");
    if (passData.new.length < 6) return setPassError("Password must be 6+ chars");
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/changepassword`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
        });
        const data = await res.json();
        if (!res.ok) setPassError(data.msg || 'Failed');
        else {
            setPassSuccess('Password changed!');
            setPassData({ current: '', new: '', confirm: '' });
            setTimeout(() => { setIsPassModalOpen(false); setPassSuccess(''); }, 1500);
        }
    } catch (err) { setPassError('Server Error'); }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;

  return (
    <>
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                My Profile
            </h1>
            <button onClick={() => setIsLogoutOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold shadow-sm">
                <LogOut size={18} /> Logout
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-8 rounded-3xl border-0 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                    
                    <div className="relative group cursor-pointer mb-4 mt-8" onClick={() => fileInputRef.current.click()}>
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[3px] shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-400">{user.name.charAt(0)}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white"/>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Camera size={14} />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <Briefcase size={12} /> {user.role}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{user.friends.length}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center justify-center gap-1"><Users size={12}/> Friends</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{new Date(user.createdAt).getFullYear()}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center justify-center gap-1"><Calendar size={12}/> Joined</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border-0 shadow-xl">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Appearance</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['light', 'system', 'dark'].map((t) => (
                            <button key={t} onClick={() => setTheme(t)} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${theme === t ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}>
                                {t === 'light' && <Sun size={20} />}
                                {t === 'dark' && <Moon size={20} />}
                                {t === 'system' && <Monitor size={20} />}
                                <span className="text-[10px] font-bold capitalize">{t}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border-0 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <User className="text-blue-500"/> Personal Details
                    </h3>
                    <span className="text-xs text-gray-400 italic">All fields are editable</span>
                </div>
                
                {message && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><Save size={16}/> {message}</div>}

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                            <div className="relative">
                                {/* FIX: Input First */}
                                <input type="text" style={{ paddingLeft: '3rem' }} className="w-full glass-input rounded-xl dark:text-white" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
                                {/* FIX: Icon Second + pointer-events-none */}
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email (Read Only)</label>
                            <div className="relative">
                                {/* FIX: Input First */}
                                <input type="email" disabled style={{ paddingLeft: '3rem' }} className="w-full glass-input rounded-xl dark:text-white opacity-60 cursor-not-allowed bg-gray-50 dark:bg-black/20" value={user.email} />
                                {/* FIX: Icon Second + pointer-events-none */}
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 relative z-20">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date of Birth</label>
                            <DatePicker value={user.dob} onChange={(date) => setUser({...user, dob: date})} placeholder="Select Date" />
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">City</label>
                            <div className="relative">
                                {/* FIX: Input First */}
                                <input type="text" style={{ paddingLeft: '3rem' }} className="w-full glass-input rounded-xl dark:text-white" value={user.city} onChange={(e) => setUser({...user, city: e.target.value})} placeholder="City" />
                                {/* FIX: Icon Second + pointer-events-none */}
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">College</label>
                            <div className="relative">
                                {/* FIX: Input First */}
                                <input type="text" style={{ paddingLeft: '3rem' }} className="w-full glass-input rounded-xl dark:text-white" value={user.college} onChange={(e) => setUser({...user, college: e.target.value})} placeholder="University Name" />
                                {/* FIX: Icon Second + pointer-events-none */}
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 relative z-0">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio</label>
                        <textarea className="w-full glass-input rounded-xl dark:text-white h-32 py-3 px-4 resize-none" placeholder="Tell us about yourself..." value={user.bio} onChange={(e) => setUser({...user, bio: e.target.value})} />
                    </div>

                    <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <button type="button" onClick={() => setIsPassModalOpen(true)} className="px-4 py-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold flex items-center gap-2 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10">
                            <Lock size={16} /> Change Password
                        </button>
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div>

        <Modal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} title="Change Password">
            <form onSubmit={handleChangePassword} className="space-y-4">
                {passError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm">{passError}</div>}
                {passSuccess && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm">{passSuccess}</div>}
                <div><label className="text-sm text-gray-500 mb-1 block">Current Password</label><input type="password" style={{ paddingLeft: '1rem' }} className="w-full glass-input rounded-xl dark:text-white" value={passData.current} onChange={(e) => setPassData({...passData, current: e.target.value})} /></div>
                <div><label className="text-sm text-gray-500 mb-1 block">New Password</label><input type="password" style={{ paddingLeft: '1rem' }} className="w-full glass-input rounded-xl dark:text-white" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} /></div>
                <div><label className="text-sm text-gray-500 mb-1 block">Confirm Password</label><input type="password" style={{ paddingLeft: '1rem' }} className="w-full glass-input rounded-xl dark:text-white" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} /></div>
                <button type="submit" className="w-full glass-btn mt-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 border-none">Update Password</button>
            </form>
        </Modal>

        <Modal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} title="Confirm Logout">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce"><AlertTriangle size={32} /></div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Are you sure you want to leave?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">You will need to sign in again to access your dashboard.</p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={() => setIsLogoutOpen(false)} className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={performLogout} className="py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors">Logout</button>
                </div>
            </div>
        </Modal>
      </>
  );
};

export default Profile;