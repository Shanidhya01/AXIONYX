import React, { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  ChevronDown,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";
import Modal from "../components/UI/Modal";
import DatePicker from "../components/UI/DatePicker";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const Career = () => {
  // --- STATE ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    status: "Applied",
    link: "",
  });

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const statusDropdownRef = useRef(null);
  const statusOptions = [
    "Applied",
    "OA Received",
    "Interview",
    "Offer",
    "Rejected",
  ];

  // --- 1. FETCH DATA ---
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setJobs([]);
        setLoadError("You are not logged in.");
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/api/career`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await safeJson(res);
      if (!res.ok) {
        setJobs([]);
        setLoadError(
          data?.msg ||
            data?.message ||
            "Failed to load applications. Please try again."
        );
        return;
      }
      setLoadError("");
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setJobs([]);
      setLoadError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!isStatusDropdownOpen) return;

    const onMouseDown = (e) => {
      if (!statusDropdownRef.current) return;
      if (!statusDropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsStatusDropdownOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isStatusDropdownOpen]);

  // --- 2. STATS LOGIC ---
  const stats = {
    total: jobs.length,
    interviews: jobs.filter((j) =>
      ["Interview", "OA Received"].includes(j.status)
    ).length,
    offers: jobs.filter((j) => j.status === "Offer").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  // --- 3. HANDLERS ---
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentJobId(null);
    setFormData({
      company: "",
      role: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      status: "Applied",
      link: "",
    });
    setErrors({});
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setIsEditing(true);
    setCurrentJobId(job._id);
    setFormData({
      company: job.company,
      role: job.role,
      location: job.location,
      date: job.date.split("T")[0],
      status: job.status,
      link: job.link,
    });
    setErrors({});
    setSaveError("");
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();

    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");

    // Validation
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = "Required";
    if (!formData.role.trim()) newErrors.role = "Required";
    if (!formData.date) newErrors.date = "Required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSaveError("You are not logged in.");
        return;
      }
      if (!API_BASE_URL) {
        setSaveError("Missing VITE_API_BASE_URL configuration.");
        return;
      }

      const url = isEditing
        ? `${API_BASE_URL}/api/career/${currentJobId}`
        : `${API_BASE_URL}/api/career`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(formData),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        setSaveError(
          data?.msg ||
            data?.message ||
            "Could not save the application. Please try again."
        );
        return;
      }

      await fetchJobs();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setSaveError("Network error. Could not reach server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this application?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/career/${id}` ,{
          method: "DELETE",
          headers: { "x-auth-token": token },
        });
        if (res.ok) setJobs(jobs.filter((j) => j._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Offer":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Rejected":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Interview":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "OA Received":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  const getInputClass = (field) => `
    w-full glass-input rounded-xl dark:text-white transition-all
    ${errors[field] ? "border-red-500 ring-2 ring-red-500/20 bg-red-500/5" : ""}
  `;

  const filteredJobs = jobs.filter(
    (job) =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Career & Placements
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your journey to the dream job.
            </p>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <b>{stats.total}</b> Applied
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <b>{stats.interviews}</b> In Progress
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <b>{stats.offers}</b> Offers
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span className="font-bold">Track Application</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search companies, roles..."
            className="w-full pl-10 glass-input rounded-xl text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border-0 shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : loadError ? (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold">
                  {loadError}
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchJobs();
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="p-6 font-medium">Company</th>
                    <th className="p-6 font-medium">Role</th>
                    <th className="p-6 font-medium">Date Applied</th>
                    <th className="p-6 font-medium">Status</th>
                    <th className="p-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredJobs.map((job) => (
                    <tr
                      key={job._id}
                      className="group hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white">
                              {job.company}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={10} /> {job.location || "Remote"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-gray-700 dark:text-gray-300 font-medium">
                        {job.role}
                      </td>
                      <td className="p-6 text-gray-500 dark:text-gray-400 text-sm tabular-nums">
                        {new Date(job.date).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status === "Applied" && <Clock size={12} />}
                          {job.status === "Offer" && <CheckCircle size={12} />}
                          {job.status === "Rejected" && <XCircle size={12} />}
                          {(job.status === "Interview" ||
                            job.status === "OA Received") && (
                            <AlertCircle size={12} />
                          )}
                          {job.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.link && (
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}

                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(job._id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredJobs.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No applications found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsStatusDropdownOpen(false);
          setSaveError("");
          setErrors({});
        }}
        title={isEditing ? "Edit Application" : "Track Application"}
      >
        <form onSubmit={handleSaveJob} className="space-y-4" noValidate>
          {saveError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-bold">
              {saveError}
            </div>
          )}
          {/* Company */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Company</label>
            <div className="relative">
              <Building
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="e.g. Google"
                className={`pl-10 ${getInputClass("company")}`}
                value={formData.company}
                onChange={(e) => {
                  setFormData({ ...formData, company: e.target.value });
                  setErrors({ ...errors, company: "" });
                }}
              />
            </div>
            {errors.company && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.company}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Role</label>
            <input
              type="text"
              placeholder="e.g. Frontend Intern"
              className={getInputClass("role")}
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                setErrors({ ...errors, role: "" });
              }}
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote"
                className="w-full glass-input rounded-xl dark:text-white"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Date Applied
              </label>
              <div
                className={`rounded-xl transition-all ${
                  errors.date
                    ? "border border-red-500 ring-2 ring-red-500/20"
                    : ""
                }`}
              >
                <DatePicker
                  value={formData.date}
                  onChange={(date) => {
                    setFormData({ ...formData, date: date });
                    setErrors({ ...errors, date: "" });
                  }}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Dropdown */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Status</label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  aria-expanded={isStatusDropdownOpen}
                  className="w-full flex justify-between items-center glass-input rounded-xl py-2 transition-all active:scale-[0.98]"
                >
                  <span className="text-gray-800 dark:text-white font-medium">
                    {formData.status}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform duration-300 ${
                      isStatusDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        onClick={() => {
                          setFormData({ ...formData, status: status });
                          setIsStatusDropdownOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                      >
                        <span>{status}</span>
                        {formData.status === status && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Link */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Job Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full glass-input rounded-xl dark:text-white"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full glass-btn mt-4 rounded-xl ${
              isSaving ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Saving...
              </span>
            ) : isEditing ? (
              "Update Application"
            ) : (
              "Save Application"
            )}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default Career;
