import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Coffee,
  ChevronDown,
  Check,
  X,
  Users,
  Loader2,
} from "lucide-react";
import StudyCard from "../components/UI/StudyCard";
import Modal from "../components/UI/Modal";
import DatePicker from "../components/UI/DatePicker";
import TimePicker from "../components/UI/TimePicker";
import { showSuccess, showError } from '../lib/toast';

// Helper to get current user ID from JWT token
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

const StudyZone = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [newSession, setNewSession] = useState({
    subject: "",
    topic: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    maxParticipants: 5,
  });

  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState(null); // Popup state

  const categories = [
    "All",
    "Computer Science",
    "Mathematics",
    "Physics",
    "History",
  ];
  const subjectOptions = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "History",
    "Engineering",
    "Literature",
  ];

  // Close dropdown on outside click / Esc
  useEffect(() => {
    if (!isDropdownOpen) return;

    const onMouseDown = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isDropdownOpen]);

  // --- 1. FETCH ---
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/study-zone`,
        { headers: { "x-auth-token": token } }
      );
      const data = await res.json();
      if (res.ok) setSessions(data);
      else showError('Failed to load study sessions.');
    } catch (err) {
      console.error(err);
      showError('Error loading study sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. JOIN LOGIC (With Popup) ---
  const handleJoin = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/study-zone/join/${id}`,
        {
          method: "PUT",
          headers: { "x-auth-token": token },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, participants: [...s.participants, "me"] } : s
          )
        );
        showSuccess('You have joined the session!');
        setModalMessage({
          title: "Success!",
          msg: "You have joined the session.",
          type: "success",
        });
      } else {
        if (res.status === 400 && data.msg === "Already joined") {
          showError('You are already in this session.');
          setModalMessage({
            title: "Already Joined",
            msg: "You are already in this session.",
            type: "info",
          });
        } else {
          showError(data.msg || 'Failed to join');
          setModalMessage({
            title: "Error",
            msg: data.msg || "Failed to join",
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
      showError('Error joining session.');
    }
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

    const startDateTime = new Date(
      `${newSession.date}T${newSession.startTime}`
    );
    const endDateTime = new Date(`${newSession.date}T${newSession.endTime}`);
    if (endDateTime <= startDateTime)
      endDateTime.setDate(endDateTime.getDate() + 1);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/study-zone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            ...newSession,
            startTime: startDateTime,
            endTime: endDateTime,
          }),
        }
      );

      if (res.ok) {
        showSuccess('Study session created successfully!');
        fetchSessions();
        setIsCreateOpen(false);
        setNewSession({
          subject: "",
          topic: "",
          location: "",
          date: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "11:00",
          maxParticipants: 5,
        });
        setErrors({});
      } else {
        showError('Failed to create session.');
      }
    } catch (err) {
      console.error(err);
      showError('Error creating session.');
    }
  };

  const handleStartTimeChange = (timeStr) => {
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h);
    let nextHour = (hour + 1) % 24;
    setNewSession({
      ...newSession,
      startTime: timeStr,
      endTime: `${nextHour.toString().padStart(2, "0")}:${m}`,
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesCategory = filter === "All" || session.subject === filter;
    const query = searchQuery.toLowerCase();
    return (
      matchesCategory &&
      (session.topic.toLowerCase().includes(query) ||
        session.subject.toLowerCase().includes(query))
    );
  });

  const getInputClass = (field) =>
    `w-full glass-input rounded-xl dark:text-white transition-all ${
      errors[field] ? "border-red-500 ring-2 ring-red-500/20 bg-red-500/5" : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
    }`;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Study Zone
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
              </span>
              <span className="font-semibold">{sessions.length}</span> active sessions
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
            <span className="font-bold">Host Session</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search topics, subjects..."
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all duration-300 ${
                  filter === cat
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 hover:shadow-md"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="relative animate-spin text-blue-500" size={48} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading study sessions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {filteredSessions.map((session, index) => {
              const currentUserId = getCurrentUserId();
              const isJoined = currentUserId && session.participants?.some(
                p => {
                  const participantId = typeof p === 'string' ? p : p._id;
                  return participantId === currentUserId;
                }
              );
              
              return (
                <div
                  key={session._id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <StudyCard
                    session={{
                      ...session,
                      id: session._id,
                      participants: session.participants
                        ? session.participants.length
                        : 0,
                      host: session.host ? session.host.name : "Unknown",
                      isJoined,
                    }}
                    onJoin={handleJoin}
                  />
                </div>
              );
            })}
            {filteredSessions.length === 0 && (
              <div className="col-span-full py-24">
                <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50">
                  <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl">
                    <Coffee size={56} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Active Sessions</h3>
                    <p className="text-gray-500 dark:text-gray-400">Be the first to start a study session!</p>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus size={20} /> Host First Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsDropdownOpen(false);
          setErrors({});
        }}
        title="Host Study Session"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Topic
            </label>
            <input
              type="text"
              placeholder="e.g., Data Structures Review"
              className={getInputClass("topic")}
              value={newSession.topic}
              onChange={(e) => {
                setNewSession({ ...newSession, topic: e.target.value });
                setErrors({ ...errors, topic: "" });
              }}
            />
            {errors.topic && (
              <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                <X size={12} />{errors.topic}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Subject
              </label>
              {isCustomSubject ? (
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter custom subject"
                    className={getInputClass("subject")}
                    value={newSession.subject}
                    onChange={(e) =>
                      setNewSession({ ...newSession, subject: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    className={`flex justify-between items-center w-full px-4 py-2.5 text-left transition-all ${getInputClass(
                      "subject"
                    )} hover:border-blue-400 dark:hover:border-blue-600`}
                  >
                    <span className={newSession.subject ? "text-gray-800 dark:text-white" : "text-gray-400"}>
                      {newSession.subject || "Select subject..."}
                    </span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {subjectOptions.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setNewSession({ ...newSession, subject: opt });
                            setIsDropdownOpen(false);
                            setErrors({ ...errors, subject: "" });
                          }}
                          className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {opt}
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setIsCustomSubject(true);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 text-blue-600 dark:text-blue-400 cursor-pointer border-t border-gray-200 dark:border-gray-700 mt-1 pt-2 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} /> Add Custom Subject
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Library Room 301"
                className={getInputClass("location")}
                value={newSession.location}
                onChange={(e) => {
                  setNewSession({ ...newSession, location: e.target.value });
                  setErrors({ ...errors, location: "" });
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Start Time
              </label>
              <TimePicker
                value={newSession.startTime}
                onChange={handleStartTimeChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                End Time
              </label>
              <TimePicker
                value={newSession.endTime}
                onChange={(t) => setNewSession({ ...newSession, endTime: t })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              Max Students
            </label>
            <input
              type="number"
              min="2"
              max="50"
              className="w-full glass-input rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20"
              value={newSession.maxParticipants}
              onChange={(e) =>
                setNewSession({
                  ...newSession,
                  maxParticipants: Number(e.target.value),
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">Choose between 2-50 participants</p>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 mt-6 hover:scale-[1.02] active:scale-95 hover:shadow-xl"
          >
            Schedule Session
          </button>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={!!modalMessage}
        onClose={() => setModalMessage(null)}
        title={modalMessage?.title || "Notification"}
      >
        <div className="text-center space-y-6 p-4">
          <div
            className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
              modalMessage?.type === "success"
                ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 shadow-green-500/20"
                : modalMessage?.type === "error"
                ? "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400 shadow-red-500/20"
                : "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 shadow-blue-500/20"
            } animate-in zoom-in-50 duration-300`}
          >
            {modalMessage?.type === "success" ? (
              <Check size={40} className="animate-in zoom-in duration-500" strokeWidth={3} />
            ) : modalMessage?.type === "error" ? (
              <X size={40} className="animate-in zoom-in duration-500" strokeWidth={3} />
            ) : (
              <Users size={40} className="animate-in zoom-in duration-500" strokeWidth={2.5} />
            )}
          </div>
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
              {modalMessage?.msg}
            </p>
          </div>
          <button
            onClick={() => setModalMessage(null)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 font-bold hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default StudyZone;
