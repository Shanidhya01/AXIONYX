import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Loader2,
  MapPin,
  Check,
  X,
  Minus,
} from "lucide-react";
import StatCard from "../components/UI/StatCard";
import Modal from "../components/UI/Modal";
import PomodoroTimer from "../components/UI/PomodoroTimer";

const Dashboard = ({ user }) => {
  // --- STATE ---
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: 0,
    pendingAssignments: 0,
    studyHours: 0,
  }); // Default 0
  const userName = user?.name || "Student";

  // Refs for Auto-Scrolling
  const activeItemRef = useRef(null);

  // Attendance Pop-up State
  const [pendingClasses, setPendingClasses] = useState([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Pomodoro State
  const modes = {
    focus: { minutes: 25 },
    short: { minutes: 5 },
    long: { minutes: 15 },
  };
  const [timerMode, setTimerMode] = useState("focus");
  const [customMinutes, setCustomMinutes] = useState(modes.focus.minutes);
  const [timeLeft, setTimeLeft] = useState(modes.focus.minutes * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const alarmRef = useRef(new Audio("/sounds/bell.mp3"));

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "x-auth-token": token };

        // Fetch Attendance, Assignments AND Study Stats
        const [subjRes, assignRes, studyRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance`, {
            headers,
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`, {
            headers,
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study-zone/stats`, {
            headers,
          }), // <--- NEW API CALL
        ]);

        const subjects = await subjRes.json();
        const assignments = await assignRes.json();
        const studyStats = await studyRes.json(); // returns { totalHours, totalMinutes }

        if (subjRes.ok && assignRes.ok) {
          const todaysSchedule = processSchedule(subjects);
          // Pass studyStats to calculateStats
          calculateStats(subjects, assignments, studyStats);
          checkAttendanceStatus(todaysSchedule);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    alarmRef.current.loop = true;
  }, []);

  // --- 2. AUTO-SCROLL ---
  useEffect(() => {
    if (!loading && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, schedule]);

  // --- 3. DATA PROCESSING ---
  const processSchedule = (subjects) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const now = new Date();
    const today = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const offset = now.getTimezoneOffset() * 60000;
    const todayStr = new Date(now.getTime() - offset)
      .toISOString()
      .split("T")[0];

    const todaysClasses = subjects.flatMap((sub) =>
      sub.schedule
        .filter((slot) => slot.day === today)
        .map((slot) => {
          const [startH, startM] = slot.startTime.split(":").map(Number);
          const [endH, endM] = slot.endTime.split(":").map(Number);
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;

          let timeStatus = "upcoming";
          if (currentMinutes > endTotal) timeStatus = "past";
          else if (currentMinutes >= startTotal && currentMinutes <= endTotal)
            timeStatus = "live";

          // CHECK HISTORY
          const historyLog = sub.history.find(
            (h) => h.date === todayStr && h.slotId === slot.startTime
          );
          const attendanceStatus = historyLog ? historyLog.status : "pending";

          return {
            id: sub._id,
            subject: sub.name,
            location: slot.room || "TBA",
            startTime: slot.startTime,
            endTime: slot.endTime,
            history: sub.history || [],
            slotId: `${sub._id}-${slot.startTime}`,
            timeStatus,
            attendanceStatus,
          };
        })
    );

    todaysClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSchedule(todaysClasses);
    return todaysClasses;
  };

  const calculateStats = (subjects, assignments, studyStats) => {
    let totalSessions = 0;
    let totalAttended = 0;
    subjects.forEach((s) => {
      totalSessions += s.sessions;
      totalAttended += s.attended;
    });
    const attendancePct =
      totalSessions === 0
        ? 100
        : Math.round((totalAttended / totalSessions) * 100);
    const pendingCount = assignments.filter((a) => a.status !== "Done").length;

    // Use real study hours if available
    const realStudyHours = studyStats ? studyStats.totalHours : 0;

    setStats({
      attendance: attendancePct,
      pendingAssignments: pendingCount,
      studyHours: realStudyHours, // <--- Updated
    });
  };

  // --- 4. MARK ACTIONS ---
  const handleMarkAction = async (cls, status) => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const todayStr = new Date(now.getTime() - offset)
      .toISOString()
      .split("T")[0];

    // Optimistic UI Update
    setSchedule((prev) =>
      prev.map((item) =>
        item.slotId === cls.slotId
          ? { ...item, attendanceStatus: status }
          : item
      )
    );

    // Always send to backend (including cancelled)
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/attendance/mark/${cls.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            status,
            date: todayStr,
            slotTime: cls.startTime,
          }),
        }
      );
    } catch (err) {
      console.error("API Error", err);
    }

    // Remove from pending popup list
    const remaining = pendingClasses.filter((c) => c.slotId !== cls.slotId);
    setPendingClasses(remaining);
    if (remaining.length === 0) setIsCheckInOpen(false);
  };

  // Check-in Popup Logic
  const checkAttendanceStatus = (todaysClasses) => {
    const classesToAsk = todaysClasses.filter((cls) => {
      return cls.timeStatus === "past" && cls.attendanceStatus === "pending";
    });

    if (classesToAsk.length > 0) {
      setPendingClasses(classesToAsk);
      setIsCheckInOpen(true);
    }
  };

  // --- 5. POMODORO ---
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      setIsAlarmRinging(true);
      alarmRef.current.play().catch((e) => console.log("Audio failed", e));
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const toggleTimer = () => {
    if (isAlarmRinging) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsAlarmRinging(false);
      setTimeLeft(modes[timerMode].minutes * 60);
    } else {
      setIsTimerActive(!isTimerActive);
    }
  };

  const resetTimer = () => {
    alarmRef.current.pause();
    setIsAlarmRinging(false);
    setIsTimerActive(false);
    setTimeLeft(modes[timerMode].minutes * 60);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const adjustTime = (delta) => {
    const newMinutes = Math.max(1, Math.min(120, customMinutes + delta));
    setCustomMinutes(newMinutes);
    setTimeLeft(newMinutes * 60);
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl py-1 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hi {user?.name.split(" ")[0] || "Student"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            You have{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              {stats.pendingAssignments} assignments
            </span>{" "}
            pending. Stay focused.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Overall Attendance"
            value={`${stats.attendance}%`}
            subtitle={
              stats.attendance < 75
                ? "Warning: Low Attendance!"
                : "You are safe!"
            }
            icon={CheckCircle}
            color={stats.attendance < 75 ? "bg-red-500" : "bg-green-500"}
          />
          <StatCard
            title="Pending Work"
            value={stats.pendingAssignments}
            subtitle="Assignments remaining"
            icon={AlertTriangle}
            color="bg-orange-500"
          />
          <StatCard
            title="Study Hours"
            value={`${stats.studyHours}`}
            subtitle="Total tracked time"
            icon={TrendingUp}
            color="bg-purple-500"
          />
        </div>

        {/* Smart Scheduler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock size={20} className="text-blue-500" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Today's Schedule</span>
              </h2>
              <span className="text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="relative animate-spin text-blue-500" size={40} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading your schedule...</p>
              </div>
            ) : schedule.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl m-2 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/20">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-4">
                  <Calendar size={48} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No classes scheduled today</p>
                <p className="text-xs text-gray-400 mt-1">Enjoy your free day!</p>
              </div>
            ) : (
              /* Scrollable Wrapper */
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                <div className="relative min-h-full py-2">
                  {/* Vertical Line */}
                  <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-0.5 bg-gradient-to-b from-blue-200 via-purple-300 to-pink-200 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 md:-ml-px opacity-50"></div>

                  <div className="space-y-8">
                    {schedule.map((item, index) => {
                      const isFirstActive =
                        !schedule
                          .slice(0, index)
                          .some(
                            (i) =>
                              i.timeStatus === "live" ||
                              i.timeStatus === "upcoming"
                          ) &&
                        (item.timeStatus === "live" ||
                          item.timeStatus === "upcoming");

                      return (
                        <div
                          key={index}
                          ref={isFirstActive ? activeItemRef : null}
                          className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-500 
                                        ${
                                          item.timeStatus === "past"
                                            ? "opacity-80 grayscale"
                                            : ""
                                        }
                                    `}
                        >
                          {/* Dot / Icon */}
                          <div
                            className={`absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-2 shadow z-10 transition-colors
                                        ${
                                          item.attendanceStatus === "present"
                                            ? "bg-green-500 border-green-600 text-white"
                                            : item.attendanceStatus === "absent"
                                            ? "bg-red-500 border-red-600 text-white"
                                            : item.timeStatus === "live"
                                            ? "bg-blue-100 border-blue-500 text-blue-600 animate-pulse"
                                            : "bg-slate-100 dark:bg-gray-800 border-white text-blue-500"
                                        }
                                    `}
                          >
                            {item.attendanceStatus === "present" ? (
                              <Check size={16} />
                            ) : item.attendanceStatus === "absent" ? (
                              <X size={16} />
                            ) : (
                              <Calendar size={16} />
                            )}
                          </div>

                          {/* Mobile Spacer */}
                          <div className="w-16 md:hidden shrink-0"></div>

                          {/* Card Content */}
                          <div
                            className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl shadow-md transition-all duration-300 border-l-4
                                        ${
                                          item.timeStatus === "live"
                                            ? "border-l-green-500 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 shadow-green-500/20"
                                            : item.timeStatus === "past"
                                            ? "border-l-gray-300 dark:border-l-gray-700"
                                            : "border-l-blue-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
                                        }
                                    `}
                          >
                            <div className="flex justify-between items-start">
                              <h3
                                className={`font-bold text-gray-800 dark:text-white truncate pr-2 ${
                                  item.attendanceStatus === "cancelled"
                                    ? "line-through decoration-gray-400"
                                    : ""
                                }`}
                              >
                                {item.subject}
                              </h3>
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-mono text-gray-500">
                                  {item.startTime}
                                </span>
                                {item.timeStatus === "live" &&
                                  item.attendanceStatus === "pending" && (
                                    <span className="text-[9px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-2 py-0.5 rounded-full animate-pulse mt-1 shadow-md shadow-blue-500/50">
                                      LIVE
                                    </span>
                                  )}

                                {/* STATUS BADGES */}
                                {item.attendanceStatus === "present" && (
                                  <span className="text-[9px] font-bold text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-2 py-0.5 rounded-full mt-1 border border-green-200 dark:border-green-800">
                                    ATTENDED
                                  </span>
                                )}
                                {item.attendanceStatus === "absent" && (
                                  <span className="text-[9px] font-bold text-red-700 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 px-2 py-0.5 rounded-full mt-1 border border-red-200 dark:border-red-800">
                                    MISSED
                                  </span>
                                )}
                                {item.attendanceStatus === "cancelled" && (
                                  <span className="text-[9px] font-bold text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 px-2 py-0.5 rounded-full mt-1 border border-gray-200 dark:border-gray-700">
                                    CANCELLED
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <MapPin size={12} /> {item.location}
                              </div>

                              {/* MANUAL MARKING BUTTONS (Only if pending) */}
                              {item.attendanceStatus === "pending" && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleMarkAction(item, "present")
                                    }
                                    className="p-1.5 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                                    title="Present"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMarkAction(item, "absent")
                                    }
                                    className="p-1.5 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400 hover:from-red-500 hover:to-rose-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                                    title="Absent"
                                  >
                                    <X size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMarkAction(item, "cancelled")
                                    }
                                    className="p-1.5 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-500 dark:text-gray-400 hover:from-gray-400 hover:to-slate-400 hover:text-white transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                                    title="Cancelled"
                                  >
                                    <Minus size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Timer Widget (Unchanged) */}
          <div
            className={`glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center space-y-4 border shadow-xl transition-all duration-300 ${
              isAlarmRinging
                ? "shadow-red-500/50 ring-2 ring-red-500 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-900/20 dark:to-rose-900/10 border-red-300 dark:border-red-800"
                : "border-gray-200/50 dark:border-gray-700/50"
            }`}
          >
            {timeLeft !== modes[timerMode].minutes * 60 || isAlarmRinging ? (
              <div className="flex flex-col items-center w-full animate-in fade-in zoom-in">
                <div
                  className={`text-5xl font-mono font-bold mb-2 tabular-nums ${
                    isAlarmRinging
                      ? "text-red-500 animate-pulse"
                      : isTimerActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>
                {isAlarmRinging && (
                  <div className="text-sm font-bold text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2 animate-bounce">
                    <Volume2 size={16} /> Time's Up!
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={toggleTimer}
                    className={`p-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 ${
                      isAlarmRinging
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-red-500/30"
                        : "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50"
                    }`}
                  >
                    {isAlarmRinging ? (
                      <span className="font-bold px-2">STOP</span>
                    ) : isTimerActive ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-500 dark:text-gray-400 hover:from-gray-200 hover:to-slate-200 dark:hover:from-gray-700 dark:hover:to-slate-700 transition-all shadow-md hover:scale-105 active:scale-95"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setIsTimerOpen(true)}
                  className="text-xs text-gray-500 hover:text-blue-500 underline decoration-dashed"
                >
                  Expand Timer
                </button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                  <TrendingUp
                    size={36}
                    className="text-blue-600 dark:text-blue-300"
                  />
                </div>
                <h3 className="text-xl font-bold dark:text-white">
                  Focus Mode
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stop multitasking. Pick a task and start the timer.
                </p>
                <button
                  onClick={() => setIsTimerOpen(true)}
                  className="w-full glass-btn flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  Start Session{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        title="Focus Timer"
      >
        <PomodoroTimer
          mode={timerMode}
          setMode={(m) => {
            alarmRef.current.pause();
            setIsAlarmRinging(false);
            setTimerMode(m);
            setIsTimerActive(false);
            const newMinutes = modes[m].minutes;
            setCustomMinutes(newMinutes);
            setTimeLeft(newMinutes * 60);
          }}
          timeLeft={timeLeft}
          isActive={isTimerActive}
          setIsActive={toggleTimer}
          onReset={resetTimer}
          isAlarmRinging={isAlarmRinging}
          customMinutes={customMinutes}
          setCustomMinutes={setCustomMinutes}
          onAdjustTime={adjustTime}
        />
      </Modal>

      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Attendance Check-in"
      >
        <div className="space-y-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            Classes from today that have finished. Did you attend?
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            {pendingClasses.map((cls) => (
              <div
                key={cls.slotId}
                className="glass-panel p-4 rounded-xl flex items-center justify-between border-0"
              >
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">
                    {cls.subject}
                  </h4>
                  <span className="text-xs text-gray-500 font-mono">
                    {cls.startTime} - {cls.endTime}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAction(cls, "present")}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 hover:from-green-500 hover:to-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                    title="Attended"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => handleMarkAction(cls, "absent")}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400 hover:from-red-500 hover:to-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                    title="Missed"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => handleMarkAction(cls, "cancelled")}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-500 dark:text-gray-400 hover:from-gray-300 hover:to-slate-300 dark:hover:from-gray-700 dark:hover:to-slate-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                    title="Class Cancelled"
                  >
                    <Minus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pendingClasses.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
              <p className="font-bold">All caught up!</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;
