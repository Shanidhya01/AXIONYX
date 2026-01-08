import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Calculator,
  Calendar,
  ArrowLeft,
  Trash2,
  Save,
  X,
  AlertTriangle,
  ChevronDown,
  Check,
  Plus,
  CheckCircle,
} from "lucide-react";
import SubjectCard from "../components/UI/SubjectCard";
import Modal from "../components/UI/Modal";
import TimePicker from "../components/UI/TimePicker";

const Attendance = () => {
  const [view, setView] = useState("stats");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- TIMETABLE STATE ---
  const defaultSlots = [
    { id: "1", start: "09:00", end: "10:00" },
    { id: "2", start: "10:00", end: "11:00" },
    { id: "3", start: "11:00", end: "12:00" },
    { id: "4", start: "14:00", end: "15:00" },
  ];

  const [timeSlots, setTimeSlots] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [scheduleGrid, setScheduleGrid] = useState({});

  // --- UI STATES ---
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteRowModalOpen, setIsDeleteRowModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isCalcDropdownOpen, setIsCalcDropdownOpen] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Data
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [newSubName, setNewSubName] = useState("");

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "x-auth-token": token };

      const [subRes, slotRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance`, {
          headers,
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/slots`, {
          headers,
        }),
      ]);

      const data = await subRes.json();
      const slotsData = await slotRes.json();

      if (subRes.ok) {
        setSubjects(data);
        const names = [...new Set(data.map((s) => s.name.toUpperCase()))];
        setMySubjects(names);

        const newGrid = {};
        data.forEach((sub) => {
          sub.schedule.forEach((slot) => {
            newGrid[`${slot.day}-${slot.startTime}`] = {
              subject: sub.name.toUpperCase(),
              room: slot.room ? slot.room.toUpperCase() : "",
            };
          });
        });
        setScheduleGrid(newGrid);
      }

      if (slotRes.ok && slotsData.length > 0) {
        setTimeSlots(slotsData);
      } else {
        setTimeSlots(defaultSlots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. ACTIONS ---
  const showSuccessMessage = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getSelectedName = () => {
    const s = subjects.find((sub) => sub._id === selectedSubjectId);
    return s ? s.name : "Select Subject";
  };

  const addTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    let newStart = "15:00";
    let newEnd = "16:00";

    if (lastSlot) {
      const [h] = lastSlot.end.split(":");
      let nextH = parseInt(h);
      newStart = `${nextH}:00`.padStart(5, "0");
      newEnd = `${nextH + 1}:00`.padStart(5, "0");
    }
    setTimeSlots([
      ...timeSlots,
      { id: Date.now().toString(), start: newStart, end: newEnd },
    ]);
  };

  const initiateDeleteRow = (id) => {
    setRowToDelete(id);
    setIsDeleteRowModalOpen(true);
  };

  const confirmDeleteRow = () => {
    if (rowToDelete) {
      setTimeSlots(timeSlots.filter((s) => s.id !== rowToDelete));
      setRowToDelete(null);
      setIsDeleteRowModalOpen(false);
    }
  };

  const updateSlotTime = (id, field, value) => {
    setTimeSlots(
      timeSlots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSubjectToList = () => {
    const upperName = newSubName.trim().toUpperCase();
    if (upperName && !mySubjects.includes(upperName)) {
      setMySubjects([...mySubjects, upperName]);
      setNewSubName("");
      showSuccessMessage(`ADDED "${upperName}"`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubjectToList();
    }
  };

  const updateGridCell = (key, field, value) => {
    setScheduleGrid((prev) => {
      const current = prev[key] || { subject: "Free", room: "" };
      return {
        ...prev,
        [key]: { ...current, [field]: value.toUpperCase() },
      };
    });
  };

  // --- 4. SAVE TO DB ---
  const saveTimetable = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/slots`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slots: timeSlots }),
    });

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/attendance/clear-schedule`,
      {
        method: "DELETE",
        headers: { "x-auth-token": token },
      }
    );

    for (const key in scheduleGrid) {
      const [day, startTime] = key.split("-");
      const cellData = scheduleGrid[key];
      const slot = timeSlots.find((s) => s.start === startTime);

      if (!slot || !cellData || cellData.subject === "Free") continue;

      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/attendance/timetable`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            day,
            startTime: slot.start,
            endTime: slot.end,
            subjectName: cellData.subject,
            room: cellData.room || "",
          }),
        }
      );
    }

    showSuccessMessage("TIMETABLE SAVED!");
    fetchData();
    setTimeout(() => setView("stats"), 1500);
  };

  const handleMark = async (id, status) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub._id !== id) return sub;
        if (status === "present")
          return {
            ...sub,
            sessions: sub.sessions + 1,
            attended: sub.attended + 1,
          };
        if (status === "absent") return { ...sub, sessions: sub.sessions + 1 };
        return sub;
      })
    );

    const token = localStorage.getItem("token");
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/attendance/mark/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ status }),
      }
    );
  };

  const confirmReset = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/reset`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      setSubjects([]);
      setScheduleGrid({});
      setMySubjects([]);
      setTimeSlots(defaultSlots);
      setIsResetModalOpen(false);
      showSuccessMessage("ALL DATA RESET");
    } catch (err) {
      console.error(err);
    }
  };

  const bunkResult = (() => {
    if (!selectedSubjectId) return null;
    const sub = subjects.find((s) => s._id === selectedSubjectId);
    if (!sub) return null;
    const pct = sub.sessions === 0 ? 100 : (sub.attended / sub.sessions) * 100;
    const target = targetPercentage / 100;
    if (pct >= targetPercentage)
      return {
        status: "SAFE",
        text: `You can bunk ${Math.floor(
          sub.attended / target - sub.sessions
        )} classes.`,
      };
    return {
      status: "DANGER",
      text: `Attend ${Math.ceil(
        (target * sub.sessions - sub.attended) / (1 - target)
      )} more classes.`,
    };
  })();

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {view === "stats" ? "Attendance Tracker" : "Timetable Editor"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span className="font-medium">
                {view === "stats"
                  ? "Manage your academic health."
                  : "Configure your weekly schedule."}
              </span>
              {view === "stats" && subjects.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                  {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCalcOpen(true)}
              className="group flex items-center gap-2 px-5 py-3 glass-panel rounded-xl hover:bg-purple-500/10 hover:border-purple-500/30 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              <Calculator
                size={18}
                className="group-hover:text-purple-500 transition-colors"
              />
              <span className="text-sm font-bold group-hover:text-purple-500 transition-colors">
                Bunk Calculator
              </span>
            </button>

            {view === "stats" ? (
              <button
                onClick={() => setView("timetable")}
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Calendar
                  size={18}
                  className="transition-transform group-hover:rotate-12 duration-300"
                />
                <span className="text-sm font-bold">Manage Timetable</span>
              </button>
            ) : (
              <button
                onClick={() => setView("stats")}
                className="group flex items-center gap-2 px-5 py-3 glass-panel rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                <ArrowLeft
                  size={18}
                  className="transition-transform group-hover:-translate-x-1 duration-300"
                />
                <span className="text-sm font-bold">Back to Stats</span>
              </button>
            )}
          </div>
        </div>

        {/* --- VIEW 1: STATS --- */}
        {view === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <div
                key={subject._id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SubjectCard
                  subject={subject}
                  onPresent={() => handleMark(subject._id, "present")}
                  onAbsent={() => handleMark(subject._id, "absent")}
                />
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
                  <Calendar
                    size={56}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No Subjects Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Go to{" "}
                  <span className="font-bold text-blue-600">Manage Timetable</span>{" "}
                  to add subjects and schedule.
                </p>
                <button
                  onClick={() => setView("timetable")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Calendar size={20} /> Get Started
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: GRID EDITOR --- */}
        {view === "timetable" && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            {/* Setup Bar */}
            <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Add a Subject
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    className="glass-input w-full uppercase placeholder:normal-case"
                    placeholder="e.g. HISTORY"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={addSubjectToList}
                    className="p-2 bg-blue-600 text-white rounded-lg"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-sm flex items-center gap-1"
                >
                  <Plus size={16} /> Add Slot
                </button>
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={saveTimetable}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/30"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </div>

            {/* The Grid */}
            <div className="glass-panel rounded-2xl overflow-hidden border-0 shadow-lg overflow-x-auto pb-32">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-3 w-64 border-r border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase text-center">
                      Time
                    </th>
                    {days.map((d) => (
                      <th
                        key={d}
                        className="p-3 min-w-[180px] text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase"
                      >
                        {d.substr(0, 3)}
                      </th>
                    ))}
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {timeSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Time Column */}
                      <td className="p-2 border-r border-gray-100 dark:border-gray-800 align-middle">
                        <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                          <div className="w-24">
                            <TimePicker
                              value={slot.start}
                              onChange={(val) =>
                                updateSlotTime(slot.id, "start", val)
                              }
                            />
                          </div>
                          <span className="text-gray-400 font-bold">-</span>
                          <div className="w-24">
                            <TimePicker
                              value={slot.end}
                              onChange={(val) =>
                                updateSlotTime(slot.id, "end", val)
                              }
                            />
                          </div>
                        </div>
                      </td>

                      {/* Days Columns */}
                      {days.map((day) => {
                        const key = `${day}-${slot.start}`;
                        const cell = scheduleGrid[key] || {
                          subject: "Free",
                          room: "",
                        };
                        const isOpen = activeDropdown === key;

                        return (
                          <td key={key} className="p-1 relative align-middle">
                            <div
                              className={`flex flex-col min-h-[50px] justify-center items-center rounded-xl transition-all p-2 border-2 
                                                  ${
                                                    cell.subject !== "Free"
                                                      ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm"
                                                      : "border-dashed border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5"
                                                  }`}
                            >
                              <button
                                onClick={() =>
                                  setActiveDropdown(isOpen ? null : key)
                                }
                                className={`w-full relative flex items-center justify-center gap-1
                                                        ${
                                                          cell.subject ===
                                                          "Free"
                                                            ? "py-1"
                                                            : ""
                                                        }`}
                              >
                                <span
                                  className={`text-[18px] font-bold truncate text-center ${
                                    cell.subject !== "Free"
                                      ? "text-blue-700 dark:text-blue-300 px-4"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {cell.subject === "Free"
                                    ? "Free"
                                    : cell.subject}
                                </span>

                                {cell.subject !== "Free" && (
                                  <ChevronDown
                                    size={14}
                                    className="text-gray-400 opacity-50 absolute right-0"
                                  />
                                )}
                              </button>

                              {/* Venue Input */}
                              {cell.subject !== "Free" && (
                                <div className="w-full mt-1">
                                  <input
                                    type="text"
                                    placeholder="VENUE"
                                    className="w-full text-center text-[12px] font-bold uppercase bg-transparent text-gray-400 placeholder-gray-300/50 outline-none focus:text-blue-500"
                                    value={cell.room}
                                    onChange={(e) =>
                                      updateGridCell(
                                        key,
                                        "room",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* Dropdown Menu */}
                            {isOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute top-full left-0 z-20 w-full min-w-[140px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in fade-in zoom-in-95">
                                  <div
                                    onClick={() => {
                                      setScheduleGrid((prev) => ({
                                        ...prev,
                                        [key]: { subject: "Free", room: "" },
                                      }));
                                      setActiveDropdown(null);
                                    }}
                                    className="px-3 py-2 text-xs font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-2"
                                  >
                                    <X size={12} /> Clear Slot
                                  </div>
                                  {mySubjects.map((sub) => (
                                    <div
                                      key={sub}
                                      onClick={() => {
                                        updateGridCell(key, "subject", sub);
                                        setActiveDropdown(null);
                                      }}
                                      className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg cursor-pointer text-center"
                                    >
                                      {sub}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </td>
                        );
                      })}

                      {/* Delete Row Button */}
                      <td className="p-2 align-middle text-center border-l border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => initiateDeleteRow(slot.id)}
                          className="p-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                          title="Delete Row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50/30 dark:bg-white/5">
                <button
                  onClick={addTimeSlot}
                  className="text-sm font-bold text-gray-500 hover:text-blue-500 flex items-center gap-2 transition-colors"
                >
                  <PlusCircle size={20} /> Add Lecture Row
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      <Modal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        title="Bunk Calculator"
      >
        <div className="space-y-6">
          <div className="relative">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block font-medium">
              Select Subject
            </label>
            <button
              onClick={() => setIsCalcDropdownOpen(!isCalcDropdownOpen)}
              className="w-full flex justify-between items-center glass-input rounded-xl py-3 text-left transition-all active:scale-[0.98]"
            >
              <span
                className={
                  selectedSubjectId
                    ? "text-gray-800 dark:text-white font-medium"
                    : "text-gray-400"
                }
              >
                {getSelectedName()}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-500 transition-transform duration-300 ${
                  isCalcDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCalcDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-xl z-50 custom-scrollbar max-h-48 overflow-y-auto">
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {subjects.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => {
                        setSelectedSubjectId(s._id);
                        setIsCalcDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
                                        ${
                                          selectedSubjectId === s._id
                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                            : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                                        }
                                    `}
                    >
                      <span className="font-medium">{s.name}</span>
                      {selectedSubjectId === s._id && <Check size={16} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Target Percentage
              </label>
              <span className="font-bold text-blue-500">
                {targetPercentage}%
              </span>
            </div>
            <input
              type="range"
              className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="100"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
            />
          </div>

          {bunkResult && (
            <div
              className={`p-4 rounded-xl border animate-in slide-in-from-bottom-2 ${
                bunkResult.status === "SAFE"
                  ? "bg-green-500/10 border-green-500/30 text-green-600"
                  : "bg-red-500/10 border-red-500/30 text-red-600"
              }`}
            >
              <h3 className="font-bold text-lg mb-1">
                {bunkResult.status === "SAFE" ? "You are Safe!" : "Warning!"}
              </h3>
              <p className="text-sm font-medium">{bunkResult.text}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* 2. Custom Reset Warning Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Timetable"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Are you absolutely sure?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This will delete <b>ALL</b> your subjects, schedule, and attendance
            records.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReset}
              className="py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
            >
              Yes, Delete Everything
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Delete Row Confirmation Modal */}
      <Modal
        isOpen={isDeleteRowModalOpen}
        onClose={() => setIsDeleteRowModalOpen(false)}
        title="Delete Row"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Delete this time slot?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Classes assigned to this row will be hidden.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setIsDeleteRowModalOpen(false)}
              className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteRow}
              className="py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. SUCCESS POP-UP */}
      {showSuccess && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 shadow-2xl border-l-4 border-l-green-500 bg-white/90 dark:bg-black/90">
            <div className="p-2 bg-green-500/20 text-green-600 rounded-full">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">
                Success
              </h4>
              <p className="text-xs text-gray-500">{successMsg}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Attendance;
