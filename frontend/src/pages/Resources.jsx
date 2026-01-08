import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, FileText, Download, Heart, User, 
    ChevronDown, Check, UploadCloud, File, Loader2, Image, Send, ArrowUp, RotateCw, Edit, Trash2, AlertTriangle, X
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import { showSuccess, showError } from '../lib/toast';

// Helper for input styling validation
const getInputClass = (errors, field) => `
    w-full glass-input rounded-xl dark:text-white transition-all
    ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''}
`;

// Helper function to render file icons
const renderFileIcon = (fileType) => {
    const type = fileType ? fileType.toLowerCase() : 'link';

    switch (type) {
        case 'pdf':
            return <FileText size={24} />;
        case 'image':
            return <Image size={24} />;
        case 'link':
        case 'drive link':
            return <File size={24} />;
        default:
            return <File size={24} />;
    }
};

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [contributors, setContributors] = useState([]); 
    const [requests, setRequests] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false); 

    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // UPLOAD/EDIT STATES
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    
    // DELETE STATES
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [resourceToDeleteId, setResourceToDeleteId] = useState(null);
    const [isRequestDeleteModalOpen, setIsRequestDeleteModalOpen] = useState(false);
    const [requestToDeleteId, setRequestToDeleteId] = useState(null); 

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    // Form States
    // Simplified state to only handle link (URL) input
    const [newResource, setNewResource] = useState({ title: '', subject: '', link: '' }); 
    const [newRequest, setNewRequest] = useState({ title: '', subject: '' });
    const [errors, setErrors] = useState({});

    const categories = ['All', 'Computer Science', 'Mathematics', 'Electronics', 'Physics', 'Mechanics'];
    const subjectOptions = categories.filter(c => c !== 'All');

    // --- FETCHING LOGIC ---
    const fetchResources = async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true); 

        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);
        try {
            const [userRes, resRes, contributorsRes, requestsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, { headers: { 'x-auth-token': token } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources${filter !== 'All' ? `?subject=${filter}` : ''}`, { headers: { 'x-auth-token': token } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/top-users`, { headers: { 'x-auth-token': token } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests?limit=100`, { headers: { 'x-auth-token': token } })
            ]);

            const userData = await userRes.json();
            const resData = await resRes.json();
            const contributorsData = await contributorsRes.json();
            const requestsData = await requestsRes.json();

            setCurrentUserId(userData._id.toString()); 
            
            const safeResData = resData.map(r => ({
                ...r,
                likes: r.likes.map(id => id.toString()),
                author: { ...r.author, _id: r.author._id.toString() } 
            }));
            
            const safeRequestsData = requestsData.map(r => ({
                ...r,
                upvotes: r.upvotes.map(id => id.toString())
            }));

            setResources(safeResData);
            setContributors(contributorsData);
            setRequests(safeRequestsData);

        } catch (err) {
            console.error("Failed to fetch resources:", err);
            if (!silent) showError('Failed to load resources. Please refresh.');
        } finally {
            if (!silent) setLoading(false);
            setIsRefreshing(false);
        }
    };
    
    // Initial Load, Filter Change, AND AUTO-REFRESH TIMER 
    useEffect(() => {
        fetchResources();

        const intervalId = setInterval(() => {
            fetchResources(true); 
        }, 30000); 

        return () => clearInterval(intervalId);
    }, [filter]);

    // --- RESOURCE INTERACTION LOGIC ---
    const handleLike = async (resourceId) => {
        const token = localStorage.getItem('token');
        
        // Optimistic update
        setResources(prev => prev.map(res => {
            if (res._id === resourceId) {
                const isLiked = res.likes.includes(currentUserId);
                return {
                    ...res,
                    likes: isLiked 
                        ? res.likes.filter(id => id !== currentUserId) 
                        : [...res.likes, currentUserId]
                };
            }
            return res;
        }));

        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/${resourceId}/like`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            console.error("Like failed, reverting UI:", err);
            showError('Failed to like resource.');
            await fetchResources();
        }
    };
    
    // DOWNLOAD LOGIC (Finalized: Opens Public URL)
    const handleDownload = async (resourceId) => {
        const token = localStorage.getItem('token');
        
        try {
            // 1. Trigger backend to increment download count and get the fileUrl
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/${resourceId}/download`, {
                method: 'PUT', // PUT increments the count on the backend
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            
            if (data.fileUrl) {
                
                // --- CRITICAL FIX: Add target="_blank" ---
                const link = document.createElement('a');
                link.href = data.fileUrl;
                link.setAttribute('download', ''); 
                link.setAttribute('target', '_blank'); // <--- THIS FORCES A NEW TAB
                
                // Append to body, click, and remove instantly
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // --- END NEW DOWNLOAD METHOD ---

                // Optimistically update download count in UI
                setResources(prev => prev.map(r => 
                    r._id === resourceId ? { ...r, downloads: r.downloads + 1 } : r
                ));
                showSuccess('Download started!');
            } else {
                showError("Download failed: The resource link is missing or invalid.");
                alert("Download failed: The resource link is missing or invalid. Ensure the link is publicly accessible.");
            }
        } catch (err) {
            console.error("Download failure:", err);
            showError("A network error occurred during download.");
            alert("A network error occurred during download.");
        }
    };

    // --- UPLOAD/EDIT LOGIC ---

    const handleEditResource = (resource) => {
        setNewResource({
            title: resource.title,
            subject: resource.subject,
            // Use fileUrl for the link input
            link: resource.fileUrl || '', 
        });
        setEditingResource(resource);
        setIsEditOpen(true);
    };
    
    // Handles BOTH Create and Edit submission
    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const isEditing = !!editingResource;
        const newErrors = {};
        
        if (!newResource.title.trim()) newErrors.title = "Title is required";
        if (!newResource.subject.trim()) newErrors.subject = "Subject is required";
        if (!newResource.link.trim()) newErrors.link = "File link/URL is required"; 

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';

            // Standardized payload to only send the link and use 'Link' as fileType
            const payload = { 
                title: newResource.title,
                subject: newResource.subject,
                fileType: 'Link', // Standardized for backend
                fileUrl: newResource.link
            };

            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `/api/resources/${editingResource._id}` : '/api/resources';

            const res = await fetch(`${apiBase}${url}`, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                // Backend might return plain text on errors; don't assume JSON.
                let msg = `Failed to ${isEditing ? 'update' : 'upload'} resource`;
                try {
                    const text = await res.text();
                    if (text) {
                        try {
                            const parsed = JSON.parse(text);
                            msg = parsed?.msg || msg;
                        } catch {
                            msg = text;
                        }
                    }
                } catch {
                    // ignore
                }
                throw new Error(msg);
            }
            
            // Close modals and reset forms
            showSuccess(isEditing ? 'Resource updated successfully!' : 'Resource uploaded successfully!');
            setIsUploadOpen(false);
            setIsEditOpen(false);
            setEditingResource(null);
            setNewResource({ title: '', subject: '', link: '' });
            setErrors({});
            await fetchResources();

        } catch (err) {
            showError(err.message);
            alert(err.message);
            console.error("Resource Submission Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- DELETE LOGIC ---
    const handleDeleteResource = (resourceId) => {
        setResourceToDeleteId(resourceId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeletion = async () => {
        if (!resourceToDeleteId) return;

        const token = localStorage.getItem('token');
        const resourceId = resourceToDeleteId;
        
        setIsDeleteModalOpen(false); 
        setResourceToDeleteId(null);
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/${resourceId}`, { 
                method: 'DELETE', 
                headers: { 'x-auth-token': token } 
            });

            if (res.ok) {
                setResources(prev => prev.filter(r => r._id !== resourceId));
                showSuccess('Resource deleted successfully!');
            } else {
                const errorData = await res.json();
                showError(errorData.msg || 'Failed to delete resource');
                throw new Error(errorData.msg || 'Failed to delete resource');
            }
        } catch (err) {
            showError(`Error deleting resource: ${err.message}`);
            alert(`Error deleting resource: ${err.message}`);
            console.error("Delete failed:", err);
        }
    };


    // --- REQUEST LOGIC ---
    const handleRequestResource = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const newErrors = {};
        if (!newRequest.title.trim()) newErrors.requestTitle = "Title is required";
        if (!newRequest.subject.trim()) newErrors.requestSubject = "Subject is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(newRequest)
            });

            if (!res.ok) {
                const errorData = await res.json();
                showError(errorData.msg || 'Failed to submit request');
                throw new Error(errorData.msg || 'Failed to submit request');
            }
            
            showSuccess('Request submitted successfully!');
            setIsRequestModalOpen(false);
            setNewRequest({ title: '', subject: '' });
            setErrors({});
            await fetchResources();

        } catch (err) {
            showError(err.message);
            alert(err.message);
            console.error("Request Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpvoteRequest = async (requestId) => {
        const token = localStorage.getItem('token');
        
        // Optimistic update
        setRequests(prev => prev.map(req => {
            if (req._id === requestId) {
                const isUpvoted = req.upvotes.includes(currentUserId);
                return {
                    ...req,
                    upvotes: isUpvoted 
                        ? req.upvotes.filter(id => id !== currentUserId) 
                        : [...req.upvotes, currentUserId]
                };
            }
            return req;
        }));

        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests/${requestId}/upvote`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            console.error("Upvote failed, reverting UI:", err);
            showError('Failed to upvote request.');
            await fetchResources();
        }
    };
    
    const handleFulfillRequest = async (requestId) => {
        const token = localStorage.getItem('token');

        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests/${requestId}/fulfill`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            showSuccess('Request marked as fulfilled!');
            await fetchResources();
        } catch (err) {
            console.error("Fulfill failed:", err);
            showError("Failed to mark request as fulfilled.");
            alert("Failed to mark request as fulfilled.");
        }
    };
    
    const handleDeleteRequest = (requestId) => {
        setRequestToDeleteId(requestId);
        setIsRequestDeleteModalOpen(true);
    };
    
    const confirmRequestDeletion = async () => {
        if (!requestToDeleteId) return;

        const token = localStorage.getItem('token');
        const requestId = requestToDeleteId;
        
        setIsRequestDeleteModalOpen(false); 
        setRequestToDeleteId(null);
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests/${requestId}`, { 
                method: 'DELETE', 
                headers: { 'x-auth-token': token } 
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r._id !== requestId));
                showSuccess('Request deleted successfully!');
            } else {
                const errorData = await res.json();
                showError(errorData.msg || 'Failed to delete request');
                throw new Error(errorData.msg || 'Failed to delete request');
            }
        } catch (err) {
            showError(`Error deleting request: ${err.message}`);
            alert(`Error deleting request: ${err.message}`);
            console.error("Delete request failed:", err);
        }
    };


    // --- VIEW LOGIC ---
    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <>
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* Header (Untouched) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-sm">
                        Resource Repository
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Shared notes, papers, and guides from the community.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchResources(false)}
                        disabled={isRefreshing}
                        className={`group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 border ${
                            isRefreshing 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-transparent'
                            : 'bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        }`}
                        title="Refresh Feed"
                    >
                        <RotateCw size={18} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} /> 
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <button 
                        onClick={() => { setIsUploadOpen(true); setEditingResource(null); setNewResource({ title: '', subject: '', link: '' }); }}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-500 hover:via-blue-600 hover:to-purple-500 text-white rounded-xl shadow-xl shadow-blue-500/35 transition-all duration-300 active:scale-95 hover:scale-105 animate-gradient bg-[length:200%_auto]"
                    >
                        <UploadCloud size={20} className="group-hover:translate-y-[-1px] transition-transform" />
                        <span className="font-bold">Upload Resource</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* LEFT: Feed & Filters (Takes 3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Toolbar (Search and Filters - Fixed) */}
                    <div className="flex flex-col md:flex-row gap-4 glass-panel p-5 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-2xl bg-white/60 dark:bg-black/30 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Search notes, papers..." 
                                // Use a high-value, explicit inline padding to override all CSS conflicts
                                style={{ paddingLeft: '2.5rem' }} 
                                className="w-full h-full glass-input rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={20} />

                        </div>
                        
                        {/* Categories/Subject Filters (Untouched) */}
                        <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/30 dark:bg-black/20">
                            {categories.map(cat => (
                                <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border hover:scale-105 active:scale-95 ${
                                    filter === cat 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white shadow-lg shadow-purple-500/25' 
                                    : 'bg-white/50 dark:bg-gray-800/30 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/50 shadow-sm'
                                }`}
                                >
                                {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resources List */}
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={40} /></div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredResources.map(res => {
                                const isLiked = res.likes.includes(currentUserId);
                                const isAuthor = res.author._id === currentUserId; 
                                
                                return (
                                    <div key={res._id} className="group glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/50 dark:hover:bg-gray-900/40 transition-all duration-300 flex flex-col md:flex-row gap-4 items-start md:items-center relative hover:scale-[1.01]">
                                        
                                        {/* Icon Box */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/15 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0 group-hover:scale-110 transition-transform">
                                            {renderFileIcon(res.fileType)}
                                        </div>
                                        

                                        {/* Content - MODIFIED TO HOLD ICONS SAFELY */}
                                        <div className="flex-1 min-w-0">
                                            
                                            {/* Top Line: Subject, Date, AND ICONS */}
                                            <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                                                <div className="flex items-center flex-wrap gap-2">
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-500/15 to-blue-500/15 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                                                        {res.subject}
                                                    </span>
                                                    <span className="text-xs font-mono text-gray-400">
                                                        {new Date(res.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Edit/Delete Buttons (Author Only) */}
                                                {isAuthor && (
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={() => handleEditResource(res)} 
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full transition-colors hover:bg-blue-500/10" 
                                                            title="Edit Resource"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteResource(res._id)} 
                                                            className="p-1.5 text-gray-500 hover:text-red-600 rounded-full transition-colors hover:bg-red-500/10" 
                                                            title="Delete Resource"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}

                                            </div>

                                            {/* Title - Now completely safe from overlap */}
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                {res.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Uploaded by <span className="font-medium text-gray-700 dark:text-gray-300">{res.author.name}</span>
                                            </p>
                                        </div>

                                        {/* Actions (Download Button) */}
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-200/50 pt-3 md:pt-0">
                                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                                <button 
                                                    onClick={() => handleLike(res._id)}
                                                    className={`group/like flex items-center gap-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500 font-bold' : ''}`}
                                                >
                                                    <Heart size={18} className={isLiked ? 'fill-red-500' : ''}/> <span className="group-hover/like:font-bold transition-all">{res.likes.length}</span>
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <Download size={18} /> {res.downloads}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDownload(res._id)}
                                                className="group/btn px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95"
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    Download
                                                    <Download size={16} className="group-hover/btn:translate-y-[-1px] transition-transform" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {filteredResources.length === 0 && !loading && (
                                <div className="py-20 text-center text-gray-400 glass-panel rounded-2xl">
                                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No resources found for the selected subject or search query.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* RIGHT COLUMN (Untouched) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Top Contributors (REAL DATA) */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-yellow-500"/> Top Contributors
                        </h3>
                        <div className="space-y-4">
                            {contributors.length > 0 ? (
                                contributors.map((c, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                            ${index === 0 ? 'bg-yellow-500 shadow-yellow-500/50' : index === 1 ? 'bg-gray-400' : 'bg-orange-700'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{c.name}</div>
                                            <div className="text-xs text-gray-500">{c.uploads} Uploads</div>
                                        </div>
                                        <div className="text-xs font-mono text-green-500 font-bold">
                                            +{c.xp} XP
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No resources uploaded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Request Resource Button */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">Need Help?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Can't find what you are looking for? Request a resource.
                        </p>
                        <button 
                            onClick={() => setIsRequestModalOpen(true)}
                            className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-white/60 dark:hover:bg-black/50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        >
                            Request Resource
                        </button>
                    </div>
                    
                    {/* Resource Requests Board (NEW) */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <ArrowUp size={20} className="text-red-500"/> Top Requests
                        </h3>
                        <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                            {requests.length > 0 ? (
                                requests.map(req => {
                                    const isUpvoted = req.upvotes.includes(currentUserId);
                                    const isRequester = req.requester._id.toString() === currentUserId;
                                    
                                    return (
                                        <div key={req._id} className="group p-3.5 bg-gray-50/80 dark:bg-gray-800/70 rounded-xl relative border border-white/40 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                                            
                                            {/* Management Buttons (Requester Only) */}
                                            {isRequester && (
                                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                    <button 
                                                        onClick={() => handleFulfillRequest(req._id)}
                                                        className="p-1 text-xs text-green-500 hover:text-green-700 rounded-full transition-colors"
                                                        title="Mark as Fulfilled"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRequest(req._id)}
                                                        className="p-1 text-xs text-gray-500 hover:text-red-500 rounded-full transition-colors"
                                                        title="Delete Request"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{req.subject}</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{req.title}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>Requested by {req.requester.name}</span>
                                                <button 
                                                    onClick={() => handleUpvoteRequest(req._id)}
                                                    className={`flex items-center gap-1 font-bold transition-colors ${isUpvoted ? 'text-red-500' : 'hover:text-red-500'}`}
                                                >
                                                    <ArrowUp size={14} className={isUpvoted ? 'fill-red-500' : ''}/> {req.upvotes.length}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500">No active resource requests.</p>
                            )}
                        </div>
                    </div>
                    
                    
                </div>

            </div>
        </div>

        {/* --- UPLOAD/EDIT MODAL (Combined) --- */}
        <Modal 
            isOpen={isUploadOpen || isEditOpen} 
            onClose={() => { setIsUploadOpen(false); setIsEditOpen(false); setEditingResource(null); setIsSubjectDropdownOpen(false); }} 
            title={isEditOpen ? "Edit Resource" : "Upload Resource"}
        >
            <form onSubmit={handleResourceSubmit} className="space-y-4" noValidate>
                
                {/* Title (Untouched) */}
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Data Structures Notes Unit 1" 
                        className={getInputClass(errors, 'title')}
                        value={newResource.title}
                        onChange={e => {
                            setNewResource({...newResource, title: e.target.value});
                            setErrors({...errors, title: ''});
                        }}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
                </div>

                {/* Subject Dropdown (Untouched) */}
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">Subject</label>
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                            className={`flex justify-between items-center text-left px-4 py-2 ${getInputClass(errors, 'subject')}`}
                        >
                            <span className={newResource.subject ? "text-gray-800 dark:text-white" : "text-gray-400"}>
                                {newResource.subject || "Select Subject or Type Custom Name"}
                            </span>
                            <ChevronDown size={18} className="text-gray-500" />
                        </button>

                        {isSubjectDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-xl z-50 animate-in fade-in zoom-in-95 custom-scrollbar max-h-60 overflow-y-auto">
                                
                                {/* Custom Subject Input */}
                                <input
                                    type="text"
                                    placeholder="Type custom subject name..."
                                    className="w-full px-3 py-2 mb-2 glass-input rounded-lg text-sm"
                                    value={newResource.subject}
                                    onChange={e => {
                                        setNewResource({...newResource, subject: e.target.value});
                                        setErrors({...errors, subject: ''});
                                    }}
                                />
                                
                                <div className='border-t border-gray-100/30 dark:border-gray-700/50 pt-2'>
                                    {subjectOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => {
                                                setNewResource({...newResource, subject: opt});
                                                setErrors({...errors, subject: ''});
                                                setIsSubjectDropdownOpen(false);
                                            }}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                                        >
                                            {opt}
                                            {newResource.subject === opt && <Check size={14} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.subject && <p className="text-xs text-red-500 mt-1 ml-1">{errors.subject}</p>}
                </div>

                {/* NOTE: File Type Dropdown is now REMOVED as per request to simplify to link only */}
                
                {/* Link / File Input (FINAL SIMPLIFIED INPUT) */}
                <div>
                    {/* Dynamic Label */}
                    <label className="text-sm text-gray-500 mb-1 block">
                        Resource Link (Secure Public URL)
                    </label>
                    
                    <input 
                        type="url" 
                        placeholder="Enter external link (e.g., Drive, Dropbox, public PDF)" 
                        className={getInputClass(errors, 'link')}
                        value={newResource.link}
                        onChange={e => {
                            setNewResource({...newResource, link: e.target.value});
                            setErrors({...errors, link: ''});
                        }}
                    />
                    {errors.link && <p className="text-xs text-red-500 mt-1 ml-1">{errors.link}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-3 mt-4 rounded-xl font-bold transition-all shadow-lg ${
                        isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed flex items-center justify-center text-white' 
                            : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-500 hover:via-blue-600 hover:to-purple-500 active:scale-95 shadow-blue-500/30 text-white hover:shadow-xl hover:shadow-blue-500/40'
                    }`}
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin text-white" /> : (isEditOpen ? 'Save Changes' : 'Upload to Repository')}
                </button>
            </form>
        </Modal>
        
        {/* --- RESOURCE REQUEST MODAL (NEW) --- */}
        <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request a New Resource">
            <form onSubmit={handleRequestResource} className="space-y-4" noValidate>
                
                {/* Request Title (Untouched) */}
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">What resource do you need?</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Discrete Math 2024 Final Paper" 
                        className={getInputClass(errors, 'requestTitle')}
                        value={newRequest.title}
                        onChange={e => {
                            setNewRequest({...newRequest, title: e.target.value});
                            setErrors({...errors, requestTitle: ''});
                        }}
                    />
                    {errors.requestTitle && <p className="text-xs text-red-500 mt-1 ml-1">{errors.requestTitle}</p>}
                </div>

                {/* Request Subject (Untouched) */}
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">Subject</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Computer Science" 
                        className={getInputClass(errors, 'requestSubject')}
                        value={newRequest.subject}
                        onChange={e => {
                            setNewRequest({...newRequest, subject: e.target.value});
                            setErrors({...errors, requestSubject: ''});
                        }}
                    />
                    {errors.requestSubject && <p className="text-xs text-red-500 mt-1 ml-1">{errors.requestSubject}</p>}
                </div>

                <p className="text-xs text-gray-500 pt-2">Your request will appear on the resource board where other students can upvote it, showing demand.</p>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-3 mt-4 rounded-xl font-bold transition-all shadow-lg ${
                        isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed flex items-center justify-center text-white' 
                            : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 active:scale-95 shadow-red-500/30 text-white hover:shadow-xl hover:shadow-red-500/40'
                    }`}
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin text-white" /> : 'Submit Request'}
                </button>
            </form>
        </Modal>

        {/* --- DELETE CONFIRMATION MODAL (RESOURCE) --- */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
            <div className="text-center space-y-6 p-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Are you sure you want to delete this resource?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)} 
                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDeletion} 
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                    >
                        Yes, Delete Resource
                    </button>
                </div>
            </div>
        </Modal>

        {/* --- DELETE CONFIRMATION MODAL (REQUEST) --- */}
        <Modal isOpen={isRequestDeleteModalOpen} onClose={() => setIsRequestDeleteModalOpen(false)} title="Delete Request">
            <div className="text-center space-y-6 p-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delete this resource request?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Only the original requester can delete the request. This action is permanent.
                </p>
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setIsRequestDeleteModalOpen(false)} 
                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmRequestDeletion} 
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                    >
                        Yes, Delete Request
                    </button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default Resources;