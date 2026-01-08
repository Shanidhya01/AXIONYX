import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Save, Moon, Sun, Monitor, Camera, LogOut, AlertTriangle, MapPin, Calendar, Briefcase, Users, GraduationCap } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import Modal from '../components/UI/Modal';
import DatePicker from '../components/UI/DatePicker';
import { showSuccess, showError } from '../lib/toast';


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
            showSuccess('Profile updated successfully!');
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            if (onProfileUpdate) onProfileUpdate();
        } else {
            showError('Failed to update profile.');
            setMessage('Failed to update profile.');
        }
    } catch (err) { 
        showError('Error connecting to server.');
        setMessage('Error connecting to server.'); 
    }
  };

  const performLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (passData.new !== passData.confirm) {
        showError("New passwords do not match");
        return setPassError("New passwords do not match");
    }
    if (passData.new.length < 6) {
        showError("Password must be 6+ chars");
        return setPassError("Password must be 6+ chars");
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/changepassword`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
        });
        const data = await res.json();
        if (!res.ok) {
            showError(data.msg || 'Failed');
            setPassError(data.msg || 'Failed');
        } else {
            showSuccess('Password changed successfully!');
            setPassSuccess('Password changed!');
            setPassData({ current: '', new: '', confirm: '' });
            setTimeout(() => { setIsPassModalOpen(false); setPassSuccess(''); }, 1500);
        }
    } catch (err) { 
        showError('Server Error');
        setPassError('Server Error'); 
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;

  return (
    <>
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
        <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-sm">
                    My Profile
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your account settings and preferences</p>
            </div>
            <button onClick={() => setIsLogoutOpen(true)} className="group flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95 border border-red-500/20">
                <LogOut size={18} className="group-hover:rotate-12 transition-transform" /> Logout
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="glass-panel p-8 rounded-3xl border-0 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient bg-[length:200%_auto]"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative group cursor-pointer mb-4 mt-8" onClick={() => fileInputRef.current.click()}>
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-400 via-blue-500 to-purple-500 p-[4px] shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-500 animate-gradient bg-[length:200%_auto]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden relative ring-4 ring-white/50 dark:ring-gray-800/50">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Profile" />
                                ) : (
                                    <span className="text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">{user.name.charAt(0)}</span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Camera size={28} className="text-white drop-shadow-lg"/>
                                        <p className="text-white text-xs font-bold mt-1">Change Photo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white shadow-xl shadow-blue-500/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 ring-4 ring-white dark:ring-gray-800">
                            <Camera size={16} />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">{user.name}</h2>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-blue-500/10 animate-gradient bg-[length:200%_auto] relative z-10">
                        <Briefcase size={14} /> {user.role}
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 relative z-10">
                        <div className="group/stat text-center cursor-default hover:scale-110 transition-transform duration-300">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{user.friends.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"><Users size={14} className="group-hover/stat:scale-125 transition-transform"/> Friends</div>
                        </div>
                        <div className="group/stat text-center cursor-default hover:scale-110 transition-transform duration-300">
                            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">{new Date(user.createdAt).getFullYear()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"><Calendar size={14} className="group-hover/stat:scale-125 transition-transform"/> Joined</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border-0 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group/theme hover:scale-[1.02]">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        Appearance
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['light', 'system', 'dark'].map((t) => (
                            <button key={t} onClick={() => setTheme(t)} className={`group/btn flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${theme === t ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-lg shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                                {t === 'light' && <Sun size={22} className="group-hover/btn:rotate-90 transition-transform duration-500" />}
                                {t === 'dark' && <Moon size={22} className="group-hover/btn:rotate-12 transition-transform duration-500" />}
                                {t === 'system' && <Monitor size={22} className="group-hover/btn:scale-110 transition-transform duration-300" />}
                                <span className="text-[10px] font-bold capitalize tracking-wider">{t}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border-0 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                            <User className="text-blue-500" size={24}/>
                        </div>
                        Personal Details
                    </h3>
                    <span className="text-xs text-gray-400 font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">✏️ All fields editable</span>
                </div>
                
                {message && <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-green-500/20"><div className="p-1.5 bg-green-500/20 rounded-lg"><Save size={18}/></div> {message}</div>}

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

                    <div className="pt-8 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <button type="button" onClick={() => setIsPassModalOpen(true)} className="group px-5 py-2.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold flex items-center gap-2 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border border-transparent hover:border-blue-500/30 hover:scale-105 active:scale-95">
                            <Lock size={18} className="group-hover:rotate-12 transition-transform" /> Change Password
                        </button>
                        <button type="submit" className="group px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-500 hover:via-blue-600 hover:to-purple-500 text-white rounded-xl font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 active:scale-95 flex items-center gap-2 hover:scale-105 animate-gradient bg-[length:200%_auto]">
                            <Save size={20} className="group-hover:rotate-12 transition-transform" /> Save Changes
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