import React, { useState, useEffect } from 'react';
import { Search, Plus, Coffee, ChevronDown, Check, X, Users, Loader2 } from 'lucide-react';
import StudyCard from '../components/UI/StudyCard';
import Modal from '../components/UI/Modal';
import DatePicker from '../components/UI/DatePicker';
import TimePicker from '../components/UI/TimePicker';

const StudyZone = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [newSession, setNewSession] = useState({ 
    subject: '', topic: '', location: '', 
    date: new Date().toISOString().split('T')[0], 
    startTime: '10:00', endTime: '11:00', maxParticipants: 5
  });
  
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState(null); // Popup state

  const categories = ['All', 'Computer Science', 'Mathematics', 'Physics', 'History'];
  const subjectOptions = ['Computer Science', 'Mathematics', 'Physics', 'History', 'Engineering', 'Literature'];

  // --- 1. FETCH ---
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study-zone`, { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (res.ok) setSessions(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. JOIN LOGIC (With Popup) ---
  const handleJoin = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study-zone/join/${id}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        
        const data = await res.json();

        if (res.ok) {
            setSessions(prev => prev.map(s => 
                s._id === id ? { ...s, participants: [...s.participants, 'me'] } : s
            ));
            setModalMessage({ title: 'Success!', msg: 'You have joined the session.', type: 'success' });
        } else {
            if (res.status === 400 && data.msg === 'Already joined') {
                setModalMessage({ title: 'Already Joined', msg: 'You are already in this session.', type: 'info' });
            } else {
                setModalMessage({ title: 'Error', msg: data.msg || "Failed to join", type: 'error' });
            }
        }
    } catch (err) { console.error(err); }
  };

  // --- 3. CREATE ---
  const handleCreate = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newSession.topic.trim()) newErrors.topic = "Required";
    if (!newSession.subject.trim()) newErrors.subject = "Required";
    if (!newSession.location.trim()) newErrors.location = "Required";
    if (!newSession.date) newErrors.date = "Required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const startDateTime = new Date(`${newSession.date}T${newSession.startTime}`);
    const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);
    if (endDateTime <= startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study-zone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ ...newSession, startTime: startDateTime, endTime: endDateTime })
        });

        if (res.ok) {
            fetchSessions();
            setIsCreateOpen(false);
            setNewSession({ subject: '', topic: '', location: '', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', maxParticipants: 5 });
            setErrors({});
        }
    } catch (err) { console.error(err); }
  };

  const handleStartTimeChange = (timeStr) => {
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    let nextHour = (hour + 1) % 24;
    setNewSession({ ...newSession, startTime: timeStr, endTime: `${nextHour.toString().padStart(2, '0')}:${m}` });
  };

  const filteredSessions = sessions.filter(session => {
    const matchesCategory = filter === 'All' || session.subject === filter;
    const query = searchQuery.toLowerCase();
    return matchesCategory && (session.topic.toLowerCase().includes(query) || session.subject.toLowerCase().includes(query));
  });

  const getInputClass = (field) => `w-full glass-input rounded-xl dark:text-white transition-all ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''}`;

  return (
    <>
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Study Zone</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> {sessions.length} active sessions
          </p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all active:scale-95 hover:scale-105">
          <Plus size={18} /> <span className="font-bold">Host Session</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search topics..." className="w-full pl-10 glass-input rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>
        <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border ${filter === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/40 dark:bg-gray-800/40 border-white/20 text-gray-600 dark:text-gray-300'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32}/></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-1">
            {filteredSessions.map(session => (
            <StudyCard 
                key={session._id} 
                session={{
                    ...session, 
                    id: session._id,
                    participants: session.participants ? session.participants.length : 0, // <--- FIX HERE
                    host: session.host ? session.host.name : 'Unknown'
                }} 
                onJoin={handleJoin}
            />
            ))}
            {filteredSessions.length === 0 && <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400"><Coffee size={48} className="mb-4 opacity-50" /><p>No active sessions found.</p></div>}
        </div>
      )}
    </div>

    {/* Host Modal */}
    <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Host Study Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="text-sm text-gray-500 mb-1 block">Topic</label><input type="text" className={getInputClass('topic')} value={newSession.topic} onChange={e => {setNewSession({...newSession, topic: e.target.value}); setErrors({...errors, topic: ''});}}/>{errors.topic && <p className="text-xs text-red-500 mt-1 ml-1">{errors.topic}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-500 mb-1 block">Subject</label>
                {isCustomSubject ? (
                    <div className="relative"><input type="text" className={getInputClass('subject')} value={newSession.subject} onChange={e => setNewSession({...newSession, subject: e.target.value})}/><button type="button" onClick={() => setIsCustomSubject(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button></div>
                ) : (
                    <div className="relative"><button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex justify-between items-center w-full px-4 py-2 text-left ${getInputClass('subject')}`}><span>{newSession.subject || "Select..."}</span><ChevronDown size={18} /></button>
                        {isDropdownOpen && <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white/90 dark:bg-black/90 border border-gray-200 z-50">{subjectOptions.map(opt => <div key={opt} onClick={() => {setNewSession({...newSession, subject: opt}); setIsDropdownOpen(false);}} className="px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">{opt}</div>)}<div onClick={() => {setIsCustomSubject(true); setIsDropdownOpen(false);}} className="px-3 py-2 text-blue-600 cursor-pointer border-t">+ Add Custom</div></div>}
                    </div>
                )}
             </div>
             <div><label className="text-sm text-gray-500 mb-1 block">Location</label><input type="text" className={getInputClass('location')} value={newSession.location} onChange={e => setNewSession({...newSession, location: e.target.value})}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="text-sm text-gray-500 mb-1 block">Start</label><TimePicker value={newSession.startTime} onChange={handleStartTimeChange}/></div>
             <div><label className="text-sm text-gray-500 mb-1 block">End</label><TimePicker value={newSession.endTime} onChange={(t) => setNewSession({...newSession, endTime: t})}/></div>
          </div>
          <div><label className="text-sm text-gray-500 mb-1 block flex items-center gap-2"><Users size={16}/> Max Students</label><input type="number" min="2" max="50" className="w-full glass-input" value={newSession.maxParticipants} onChange={e => setNewSession({...newSession, maxParticipants: Number(e.target.value)})}/></div>
          <button type="submit" className="w-full glass-btn mt-4 rounded-xl">Schedule Session</button>
        </form>
    </Modal>

    {/* Feedback Modal */}
    <Modal isOpen={!!modalMessage} onClose={() => setModalMessage(null)} title={modalMessage?.title || 'Notification'}>
        <div className="text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${modalMessage?.type === 'success' ? 'bg-green-100 text-green-600' : modalMessage?.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {modalMessage?.type === 'success' ? <Check size={32}/> : modalMessage?.type === 'error' ? <X size={32}/> : <Users size={32}/>}
            </div>
            <p className="text-gray-600 dark:text-gray-300">{modalMessage?.msg}</p>
            <button onClick={() => setModalMessage(null)} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 transition-colors">Close</button>
        </div>
    </Modal>
    </>
  );
};

export default StudyZone;