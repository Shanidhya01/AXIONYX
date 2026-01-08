import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Heart,
  MessageSquare,
  User,
  ChevronDown,
  Check,
  UploadCloud,
  File,
  Image,
  Send,
  Loader2,
  ArrowRight,
  FileText,
  Download,
  File as FileIcon,
  X,
  Calendar,
  Edit,
  Trash2,
  RotateCw,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../components/UI/Modal";
import { showSuccess, showError } from '../lib/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// --- PostCard Component ---
const PostCard = ({
  post,
  currentUserId,
  onLike,
  onToggleComments,
  onAddComment,
  onEditPost,
  onDeletePost,
  comments,
}) => {
  // CRITICAL FIX: Ensure post.author._id is a string before comparison
  const postAuthorId = post?.author?._id ? post.author._id.toString() : null;

  const isAuthor = postAuthorId === currentUserId;
  const isLiked = !!currentUserId && (post?.likes || []).includes(currentUserId);
  const [commentContent, setCommentContent] = useState("");
  const commentInputRef = useRef(null);
  const postDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onAddComment(post._id, commentContent);
      setCommentContent("");
      if (commentInputRef.current) commentInputRef.current.focus();
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border-0 shadow-lg mb-4 relative">
      {/* Edit/Delete Menu (Author Only) */}
      {isAuthor && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => onEditPost(post)}
            className="p-1 text-gray-500 hover:text-blue-500 rounded-full transition-colors"
            title="Edit Post"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDeletePost(post._id)}
            className="p-1 text-gray-500 hover:text-red-500 rounded-full transition-colors"
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
          {post?.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post?.author?.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            (post?.author?.name || "U").charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-white">
            {post?.author?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={12} /> {postDate}
          </p>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 leading-snug">
        {post.title}
      </h2>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="my-3 max-h-96 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <img
            src={post.imageUrl}
            alt="Post Image"
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked
              ? "text-red-500 font-bold"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart size={18} className={isLiked ? "fill-red-500" : ""} />{" "}
          {post.likes.length}
        </button>
        <button
          onClick={() => onToggleComments(post._id)}
          className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-blue-500 transition-colors"
        >
          <MessageSquare size={18} /> {post.commentCount}
        </button>
      </div>

      {/* Comments Section */}
      {post.showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="font-bold text-gray-800 dark:text-white mb-3">
            Comments ({comments?.length || 0})
          </h4>

          {/* Comment List */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {comments?.map((comment) => (
              <div
                key={comment._id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <p className="text-xs font-bold text-gray-800 dark:text-white mb-1">
                  {comment.author.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">
                Be the first to comment!
              </p>
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 glass-input rounded-xl text-sm"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              ref={commentInputRef}
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMMUNITY COMPONENT ---
const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  // State stores ID as string
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allComments, setAllComments] = useState({});

  // Create/Edit Post Form State
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    tags: "",
    imageFile: null,
    imageUrl: "",
  });
  const [postError, setPostError] = useState("");
  const [contributors, setContributors] = useState([]);
  const imageInputRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    "All",
    "My Posts",
    "ExamHelp",
    "LostFound",
    "Events",
    "StudyGroup",
  ];

  // --- FETCHING LOGIC ---
  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setPosts([]);
      setContributors([]);
      setLoadError("You are not logged in.");
      if (!silent) setLoading(false);
      setIsRefreshing(false);
      return;
    }
    try {
      const [userRes, postRes, contributorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${API_BASE_URL}/api/community/posts`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${API_BASE_URL}/api/community/top-users`, {
          headers: { "x-auth-token": token },
        }),
      ]);

      const userData = await safeJson(userRes);
      const postData = await safeJson(postRes);
      const contributorData = await safeJson(contributorsRes);

      if (!userRes.ok || !postRes.ok || !contributorsRes.ok) {
        setLoadError(
          userData?.msg ||
            postData?.msg ||
            contributorData?.msg ||
            "Failed to load community feed. Please try again."
        );
        setPosts([]);
        setContributors([]);
        return;
      }

      setLoadError("");

      // CRITICAL: Store user ID as string immediately
      setCurrentUserId(userData?._id ? userData._id.toString() : null);

      // Map new post data to maintain existing 'showComments' state (avoid stale closure)
      const normalizedPosts = Array.isArray(postData) ? postData : [];
      setPosts((prev) =>
        normalizedPosts.map((newPost) => {
          const existingPost = prev.find((p) => p._id === newPost._id);
          return {
            ...newPost,
            likes: (newPost.likes || []).map((id) => id.toString()),
            showComments: existingPost ? existingPost.showComments : false,
          };
        })
      );

      setContributors(Array.isArray(contributorData) ? contributorData : []);
    } catch (err) {
      console.error("Failed to fetch community data:", err);
      setLoadError("Could not reach the server. Is the backend running?");
      setPosts([]);
      setContributors([]);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // AUTO-REFRESH TIMER (Every 30 seconds)
    const intervalId = setInterval(() => {
      fetchAllData(true); // Fetch silently in the background
    }, 30000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // --- IMAGE & FORM ACTIONS ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPostError("Image file size too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostForm((prev) => ({
          ...prev,
          imageUrl: reader.result,
          imageFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // --- START SUBMISSION PROTECTION ---
    if (isSubmitting) return; // Prevent concurrent submissions
    setIsSubmitting(true);
    // --- END SUBMISSION PROTECTION ---

    setPostError("");
    if (!postForm.title.trim()) {
      setIsSubmitting(false);
      return setPostError("Post title is required.");
    }
    if (!postForm.content.trim() && !postForm.imageUrl) {
      setIsSubmitting(false);
      return setPostError("Post must contain text or an image.");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setIsSubmitting(false);
      return setPostError("You are not logged in.");
    }
    if (!API_BASE_URL) {
      setIsSubmitting(false);
      return setPostError("Missing VITE_API_BASE_URL configuration.");
    }
    const tagsArray = postForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const payload = {
      title: postForm.title,
      content: postForm.content,
      imageUrl: postForm.imageUrl,
      tags: tagsArray,
    };

    const isEditing = !!editingPost;
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_BASE_URL}/api/community/posts/${editingPost._id}`
      : `${API_BASE_URL}/api/community/posts`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(payload),
      });

      const responseData = await safeJson(res);
      if (!res.ok)
        throw new Error(
          responseData?.msg ||
            responseData?.message ||
            `Failed to ${isEditing ? "update" : "create"} post`
        );

      // Full refresh to ensure updated data is correctly merged
      await fetchAllData(true);

      // Clear form and reset states
      showSuccess(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
      setPostForm({
        title: "",
        content: "",
        tags: "",
        imageFile: null,
        imageUrl: "",
      });
      setEditingPost(null);
      setIsCreateOpen(false);
      setIsEditOpen(false);
    } catch (err) {
      const errorMsg = err.message || "An unknown error occurred.";
      showError(errorMsg);
      setPostError(errorMsg);
    } finally {
      // --- END SUBMISSION PROTECTION ---
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (post) => {
    setPostForm({
      title: post.title,
      content: post.content,
      tags: post.tags.join(", "),
      imageUrl: post.imageUrl,
      imageFile: null,
    });
    setEditingPost(post);
    setIsEditOpen(true);
    setIsCreateOpen(false);
  };

  const handleDeletePost = (postId) => {
    setPostToDeleteId(postId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletion = async () => {
    if (!postToDeleteId) return;

    const postId = postToDeleteId;
    const token = localStorage.getItem("token");

    setIsDeleteModalOpen(false); // Close the modal immediately
    setPostToDeleteId(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/community/posts/${postId}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );

      if (res.ok) {
        // Optimistically remove from view
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        showSuccess('Post deleted successfully!');
      } else {
        const errorData = await safeJson(res);
        const errorMsg = errorData?.msg || errorData?.message || "Failed to delete post";
        showError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete post.";
      showError(errorMsg);
      setPostError(errorMsg);
      console.error("Delete failed:", err);
    }
  };

  // --- LIKE/COMMENT ACTIONS ---

  const handleToggleLike = async (postId) => {
    const userId = currentUserId; // Already a string
    if (!userId) return;

    // Optimistic UI Update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const isLiked = p.likes.includes(userId);
          return {
            ...p,
            likes: isLiked
              ? p.likes.filter((id) => id !== userId)
              : [...p.likes, userId],
          };
        }
        return p;
      })
    );

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/community/posts/${postId}/like`,
        {
          method: "PUT",
          headers: { "x-auth-token": token },
        }
      );

      if (!res.ok) {
        showError('Failed to like post.');
        await fetchAllData(true); // Revert UI if API fails
      }
    } catch (err) {
      showError('Failed to like post.');
      await fetchAllData(true);
      console.error("Like failed:", err);
    }
  };

  const fetchComments = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/community/posts/${postId}/comments`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const commentsData = await safeJson(res);
      if (res.ok) {
        setAllComments((prev) => ({
          ...prev,
          [postId]: Array.isArray(commentsData) ? commentsData : [],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleToggleComments = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, showComments: !p.showComments } : p
      )
    );
    if (!allComments[postId] || allComments[postId].length === 0) {
      fetchComments(postId);
    }
  };

  const handleAddComment = async (postId, content) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/community/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ content }),
        }
      );
      const newComment = await safeJson(res);

      if (!res.ok) {
        const errorMsg = newComment?.msg || newComment?.message || "Failed to add comment";
        showError(errorMsg);
        throw new Error(errorMsg);
      }

      showSuccess('Comment added!');
      setAllComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
      const errorMsg = err.message || "Failed to add comment.";
      showError(errorMsg);
      setPostError(errorMsg);
    }
  };

  // Filtering logic to include 'My Posts' (FINAL FIX)
  const finalFilteredPosts = posts.filter((post) => {
    const matchesTag = filterTag === "All" || post.tags.includes(filterTag);
    const matchesSearch =
      searchQuery === "" ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase());

    // CRITICAL: Get author ID as string
    const postAuthorId = post.author._id.toString();

    let matchesMyPosts = true;

    // If the 'My Posts' filter is active, explicitly check ID equality
    if (filterTag === "My Posts") {
      matchesMyPosts = postAuthorId === currentUserId;
    }

    const matchesCurrentTag =
      filterTag === "My Posts" ? matchesMyPosts : matchesTag;

    return matchesSearch && matchesCurrentTag;
  });

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Global Feed
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discussions, events, and lost & found across all campuses.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fetchAllData(false)}
              disabled={isRefreshing}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-all ${
                isRefreshing
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title="Refresh Feed"
            >
              <RotateCw
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => {
                setIsCreateOpen(true);
                setEditingPost(null);
                setPostForm({
                  title: "",
                  content: "",
                  tags: "",
                  imageFile: null,
                  imageUrl: "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 hover:scale-105"
            >
              <Plus size={20} />
              <span className="font-bold">New Post</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT: Feed & Search (Takes 3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 glass-panel p-4 rounded-xl shadow-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search titles, posts, and tags..."
                  style={{ paddingLeft: "2.5rem" }}
                  className="w-full h-full pl-10 glass-input rounded-xl text-gray-800 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterTag(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                      filterTag === cat
                        ? "bg-purple-600 border-purple-600 text-white shadow-md"
                        : "bg-white/40 dark:bg-gray-800/40 border-white/20 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/60 shadow-sm"
                    }`}
                  >
                    {cat === "All"
                      ? "All"
                      : cat === "My Posts"
                      ? "My Posts"
                      : `#${cat}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="py-20 text-center">
                <Loader2
                  className="animate-spin text-blue-500 mx-auto"
                  size={40}
                />
              </div>
            ) : loadError ? (
              <div className="py-14 text-center glass-panel rounded-2xl">
                <div className="max-w-md mx-auto">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold">
                    {loadError}
                  </div>
                  <button
                    onClick={() => fetchAllData(false)}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {finalFilteredPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={currentUserId}
                    onLike={handleToggleLike}
                    onToggleComments={handleToggleComments}
                    onAddComment={handleAddComment}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    comments={allComments[post._id]}
                  />
                ))}
                {finalFilteredPosts.length === 0 && (
                  <div className="py-20 text-center text-gray-400 glass-panel rounded-2xl">
                    <MessageSquare
                      size={48}
                      className="mx-auto mb-4 opacity-20"
                    />
                    <p>No posts found matching current filters.</p>
                    <p className="text-sm mt-1">
                      Try changing the filter or making a new post!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Quick Links & Stats (Takes 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Repository Link (Resource Repository - Links to /resources) */}
            <div className="glass-panel p-5 rounded-2xl border-0 shadow-lg">
              <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <FileText size={20} className="text-green-500" /> Resource
                Repository
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Access student notes, past papers, and lab manuals shared by
                your peers.
              </p>
              <Link
                to="/resources"
                className="w-full py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 font-bold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
              >
                Browse Files <ArrowRight size={16} />
              </Link>
            </div>

            {/* Top Contributors (Real Logic) */}
            <div className="glass-panel p-5 rounded-2xl border-0 shadow-lg">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-yellow-500" /> Top Contributors
              </h3>
              <div className="space-y-4">
                {contributors.length > 0 ? (
                  contributors.map((c, index) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-3 opacity-80"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                            ${
                                              index === 0
                                                ? "bg-yellow-500 shadow-yellow-500/50"
                                                : index === 1
                                                ? "bg-gray-400"
                                                : "bg-orange-700"
                                            }
                                        `}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.posts} Posts, {c.likes} Likes
                        </div>
                      </div>
                      {/* XP Calculation based on backend aggregation field: totalPosts * 10 + totalLikes */}
                      <div className="text-xs font-mono text-green-500 font-bold">
                        +{c.xp} XP
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No recent contributions.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CREATE/EDIT POST MODAL (Conditional Title) --- */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setEditingPost(null);
          setPostError("");
          setPostForm({
            title: "",
            content: "",
            tags: "",
            imageFile: null,
            imageUrl: "",
          });
        }}
        title={editingPost ? "Edit Post" : "Create New Global Post"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {postError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-bold">
              {postError}
            </div>
          )}

          {/* TITLE INPUT */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Post Title (Required)
            </label>
            <input
              type="text"
              placeholder="e.g., Urgent: Lost ID Card, Study Group for DBMS"
              className="w-full glass-input rounded-xl dark:text-white"
              value={postForm.title}
              onChange={(e) =>
                setPostForm({ ...postForm, title: e.target.value })
              }
              maxLength={150}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Content</label>
            <textarea
              placeholder="What's happening? (Max 1000 chars)"
              className="w-full glass-input rounded-xl dark:text-white h-24 py-3 px-4 resize-none"
              value={postForm.content}
              onChange={(e) =>
                setPostForm({ ...postForm, content: e.target.value })
              }
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {postForm.content.length}/1000
            </p>
          </div>

          {/* Image Preview / Upload */}
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => imageInputRef.current.click()}
              className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-bold shrink-0"
            >
              <Image size={18} />{" "}
              {postForm.imageUrl ? "Change Image" : "Add Photo"}
            </button>
            {postForm.imageUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                <img
                  src={postForm.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPostForm((prev) => ({
                      ...prev,
                      imageUrl: "",
                      imageFile: null,
                    }))
                  }
                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />

          {/* Tags */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Tags (e.g., ExamHelp, Event, LostFound)
            </label>
            <input
              type="text"
              placeholder="Tag1, Tag2, Tag3 (comma separated)"
              className="w-full glass-input rounded-xl dark:text-white"
              value={postForm.tags}
              onChange={(e) =>
                setPostForm({ ...postForm, tags: e.target.value })
              }
            />
          </div>

          {/* --- SUBMIT BUTTON WITH PROTECTION --- */}
          <button
            type="submit"
            disabled={isSubmitting} // Disable when submitting
            className={`w-full py-3 text-white rounded-xl font-bold shadow-lg ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/30"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </span>
            ) : editingPost ? (
              "Save Changes"
            ) : (
              "Post to Feed"
            )}
          </button>
        </form>
      </Modal>
      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="text-center space-y-6 p-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Are you sure you want to delete this post?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This action is permanent and cannot be undone. All comments will
            also be removed.
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
              Yes, Delete Post
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Community;
