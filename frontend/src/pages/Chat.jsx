import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  Send,
  MessageSquare,
  Loader2,
  User,
  Hash,
  Menu,
  X,
  Search,
  UserPlus,
  Check,
  UserMinus,
  Plus,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Modal from "../components/UI/Modal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const activeRoomRef = useRef(null);
  const userRef = useRef(null);
  const [socketStatus, setSocketStatus] = useState("disconnected");

  const [activeRoom, setActiveRoom] = useState(null);
  const [activeRoomName, setActiveRoomName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  const [unreadRooms, setUnreadRooms] = useState(() => {
    const saved = localStorage.getItem("chat_unread");
    return saved ? JSON.parse(saved) : {};
  });

  const [lastActivity, setLastActivity] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("chats");

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [modalMessage, setModalMessage] = useState(null);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!API_BASE_URL) {
      setSocketStatus("error");
      return;
    }

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");
    const onConnectError = () => setSocketStatus("error");

    setSocketStatus("connecting");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
      socketRef.current = null;
      joinedRoomsRef.current = new Set();
    };
  }, []);

  const joinRoom = (roomId) => {
    if (!roomId) return;
    const socket = socketRef.current;
    if (!socket) return;
    if (joinedRoomsRef.current.has(roomId)) return;
    joinedRoomsRef.current.add(roomId);
    socket.emit("join_room", roomId);
  };

  const reconnectSocket = () => {
    const socket = socketRef.current;
    if (!socket) return;
    try {
      setSocketStatus("connecting");
      socket.connect();
    } catch (e) {
      setSocketStatus("error");
      console.error("Reconnect failed", e);
    }
  };

  useEffect(() => {
    localStorage.setItem("chat_unread", JSON.stringify(unreadRooms));
  }, [unreadRooms]);

  const refreshSocialData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [meRes, socialRes, groupsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/social`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/groups`, {
          headers: { "x-auth-token": token },
        }),
      ]);
      const meData = (await safeJson(meRes)) || {};
      const socialData = (await safeJson(socialRes)) || {};
      const groupsData = (await safeJson(groupsRes)) || [];

      if (meRes.ok) {
        setUnreadRooms(meData.unread || {});
        setUser(meData);
      }
      let activityMap = meData.lastActivity || {};
      if (groupsRes.ok) {
        setMyGroups(groupsData || []);
        groupsData.forEach((g) => {
          if (g.lastMessageAt) activityMap[g.roomId] = g.lastMessageAt;
        });
      }
      if (socialRes.ok) {
        setFriends(socialData.friends || []);
        setRequests(socialData.requests || []);
        setSentRequests(socialData.sent || []);
      }
      setLastActivity(activityMap);
    } catch (err) {
      console.error("Auto-refresh failed", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const meRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
          { headers: { "x-auth-token": token } }
        );
        const meData = (await safeJson(meRes)) || {};
        if (meRes.ok) {
          setUser(meData);
          joinRoom("general");
        }
        await refreshSocialData();
      } catch (err) {
        console.error(err);
      }
    };
    init();
    const interval = setInterval(refreshSocialData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;

    joinRoom("general");
    friends.forEach((f) => joinRoom([user._id, f._id].sort().join("_")));
    myGroups.forEach((g) => joinRoom(g.roomId));

    const socket = socketRef.current;
    if (!socket) return;

    const handleNewGroup = (newGroup) => {
      setMyGroups((prev) => {
        if (prev.find((g) => g._id === newGroup._id)) return prev;
        joinRoom(newGroup.roomId);
        return [...prev, newGroup];
      });
    };

    const handleGroupDeleted = (deletedRoomId) => {
      setMyGroups((prev) => prev.filter((g) => g.roomId !== deletedRoomId));
      setActiveRoom((prev) => (prev === deletedRoomId ? null : prev));
      setActiveRoomName((prevName) =>
        activeRoomRef.current === deletedRoomId ? "" : prevName
      );
    };

    const handleReceive = (data) => {
      const currentUser = userRef.current;
      let msgRoom = data.room;
      if (!msgRoom && data.sender && currentUser)
        msgRoom = [currentUser._id, data.sender._id].sort().join("_");

      const currentActiveRoom = activeRoomRef.current;
      if (msgRoom === currentActiveRoom) {
        setMessageList((list) => [...list, data]);
        scrollToBottom();
      } else if (msgRoom) {
        setUnreadRooms((prev) => ({
          ...prev,
          [msgRoom]: (prev[msgRoom] || 0) + 1,
        }));
      }

      if (msgRoom)
        setLastActivity((prev) => ({ ...prev, [msgRoom]: Date.now() }));
    };

    socket.on("group_created", handleNewGroup);
    socket.on("group_deleted", handleGroupDeleted);
    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("group_created", handleNewGroup);
      socket.off("group_deleted", handleGroupDeleted);
      socket.off("receive_message", handleReceive);
    };
  }, [user, friends, myGroups]);

  const getSortedList = (list, type) => {
    return [...list].sort((a, b) => {
      let idA, idB;
      if (type === "group") {
        idA = a.roomId;
        idB = b.roomId;
      } else {
        idA = user ? [user._id, a._id].sort().join("_") : a._id;
        idB = user ? [user._id, b._id].sort().join("_") : b._id;
      }
      const timeA = new Date(lastActivity[idA] || 0).getTime();
      const timeB = new Date(lastActivity[idB] || 0).getTime();
      return timeB - timeA;
    });
  };
  const sortedGroups = getSortedList(myGroups, "group");
  const sortedFriends = getSortedList(friends, "friend");

  const fetchHistory = async (roomId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessageList([]);
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat?room=${roomId}`,
        { headers: { "x-auth-token": token } }
      );
      const data = await safeJson(res);
      if (res.ok) {
        setMessageList(Array.isArray(data) ? data : []);
        scrollToBottom();
      } else {
        setMessageList([]);
        setModalMessage({
          title: "Unable to Load Chat",
          msg:
            data?.msg ||
            data?.message ||
            "Could not fetch chat history. Please try again.",
          type: "error",
        });
      }
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/read/${roomId}`,
        { method: "PUT", headers: { "x-auth-token": token } }
      );
    } catch (err) {
      console.error(err);
      setModalMessage({
        title: "Network Error",
        msg: "Could not reach the server. Check if backend is running.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRoom) {
      fetchHistory(activeRoom);
      setUnreadRooms((prev) => {
        const newState = { ...prev };
        delete newState[activeRoom];
        return newState;
      });
    }
  }, [activeRoom]);

  const switchRoom = (roomId, roomName) => {
    setActiveRoom(roomId);
    setActiveRoomName(roomName);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };
  const startDM = (friend) => {
    const roomID = [user._id, friend._id].sort().join("_");
    switchRoom(roomID, friend.name);
  };
  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ name: newGroupName }),
        }
      );
      if (res.ok) {
        setIsCreateGroupOpen(false);
        setNewGroupName("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/groups/${
          groupToDelete.roomId
        }`,
        { method: "DELETE", headers: { "x-auth-token": token } }
      );
      if (res.ok) {
        setGroupToDelete(null);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const sendMessage = async () => {
    const trimmed = currentMessage.trim();
    if (!trimmed || !user || !activeRoom) return;

    if (socketStatus !== "connected") {
      setModalMessage({
        title: "Not Connected",
        msg: "You're offline from chat. Reconnect and try again.",
        type: "error",
      });
      return;
    }

    {
      const messageData = {
        room: activeRoom,
        author: user.name,
        userId: user._id,
        message: trimmed,
      };
      socketRef.current?.emit("send_message", messageData);
      setMessageList((list) => [
        ...list,
        {
          content: trimmed,
          sender: { _id: user._id, name: user.name },
          createdAt: new Date().toISOString(),
        },
      ]);
      setLastActivity((prev) => ({ ...prev, [activeRoom]: Date.now() }));
      setCurrentMessage("");
      scrollToBottom();
    }
  };
  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/search?q=${query}`,
        { headers: { "x-auth-token": token } }
      );
      const data = await safeJson(res);
      setSearchResults(Array.isArray(data) ? data : []);
    } else {
      setSearchResults([]);
    }
  };
  const sendRequest = async (targetUser) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/request/${
        targetUser._id
      }`,
      { method: "POST", headers: { "x-auth-token": token } }
    );
    if (res.ok) {
      setSentRequests([...sentRequests, targetUser]);
      setModalMessage({
        title: "Request Sent",
        msg: `Friend request sent to ${targetUser.name}!`,
        type: "success",
      });
      refreshSocialData();
    }
  };
  const acceptRequest = async (senderId) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/accept`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ senderId }),
    });
    refreshSocialData();
    setModalMessage({
      title: "Connected",
      msg: "You are now friends!",
      type: "success",
    });
  };
  const declineRequest = async (senderId) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/decline`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ senderId }),
    });
    refreshSocialData();
  };
  const initiateRemoveFriend = (e, friend) => {
    e.stopPropagation();
    setFriendToRemove(friend);
  };
  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/friends/${
        friendToRemove._id
      }`,
      { method: "DELETE", headers: { "x-auth-token": token } }
    );
    if (res.ok) {
      setFriends(friends.filter((f) => f._id !== friendToRemove._id));
      if (activeRoom && activeRoom.includes(friendToRemove._id))
        setActiveRoom(null);
      refreshSocialData();
      setFriendToRemove(null);
    }
  };
  const getButtonStatus = (targetId) => {
    if (friends.some((f) => f._id === targetId)) return "friend";
    if (sentRequests.some((r) => r._id === targetId)) return "sent";
    if (requests.some((r) => r._id === targetId)) return "received";
    return "add";
  };

  const groupRoomIds = new Set(myGroups.map((g) => g.roomId));
  const canSend =
    !!activeRoom && !!user && !!currentMessage.trim() && socketStatus === "connected";

  return (
    <>
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); } `}</style>
      <div className="h-[calc(100vh-100px)] flex gap-6 animate-in fade-in duration-500 overflow-hidden pb-6 pl-1 pr-1 relative">
        <div
          className={`absolute inset-y-0 left-0 md:relative z-30 w-full md:w-80 h-full glass-panel rounded-2xl flex flex-col border-0 shadow-xl transition-transform duration-300 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-500" /> Connect
              </h2>
              <button
                className="md:hidden p-2"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {["chats", "search", "requests"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg capitalize relative ${
                    view === tab
                      ? "bg-white dark:bg-gray-700 shadow text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                  {tab === "requests" && requests.length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 min-h-0">
            {view === "chats" && (
              <>
                <div>
                  <div className="flex justify-between items-center px-2 mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Groups
                    </h3>
                    <button
                      onClick={() => setIsCreateGroupOpen(true)}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> New
                    </button>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => switchRoom("general", "General Chat")}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        activeRoom === "general"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Hash size={18} /> General Chat
                      </span>
                      {unreadRooms["general"] > 0 && (
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-md shadow-red-500/50 shrink-0"></div>
                      )}
                    </button>
                    {sortedGroups.map((group) => {
                      const isAdmin = user && group.admin === user._id;
                      return (
                        <div
                          key={group._id}
                          className="group/item relative flex items-center"
                        >
                          <button
                            onClick={() => switchRoom(group.roomId, group.name)}
                            className={`flex-1 text-left px-3 ${
                              isAdmin ? "pr-9" : ""
                            } py-2 rounded-xl flex items-center justify-between transition-colors ${
                              activeRoom === group.roomId
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            <span className="flex items-center gap-3 truncate">
                              <Hash size={18} /> {group.name}
                            </span>
                            {unreadRooms[group.roomId] > 0 && (
                              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-md shadow-red-500/50 shrink-0"></div>
                            )}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupToDelete(group);
                              }}
                              className="absolute right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Friends
                  </h3>
                  <div className="space-y-1">
                    {sortedFriends.map((friend) => {
                      const dmRoomId = user
                        ? [user._id, friend._id].sort().join("_")
                        : null;
                      const isUnread = dmRoomId && unreadRooms[dmRoomId] > 0;
                      return (
                        <div
                          key={friend._id}
                          className="group/item relative flex items-center"
                        >
                          <button
                            onClick={() => startDM(friend)}
                            className={`flex-1 text-left px-3 pr-10 py-2 rounded-xl flex items-center justify-between transition-colors ${
                              activeRoom && activeRoom.includes(friend._id)
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              {/* UPDATED AVATAR LOGIC */}
                              {friend.avatar ? (
                                <img
                                  src={friend.avatar}
                                  alt={friend.name}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {friend.name[0]}
                                </div>
                              )}
                              <span className="truncate">{friend.name}</span>
                            </div>
                            {isUnread && (
                              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-md shadow-red-500/50 shrink-0"></div>
                            )}
                          </button>
                          <button
                            onClick={(e) => initiateRemoveFriend(e, friend)}
                            className="absolute right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            title="Unfriend"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      );
                    })}
                    {friends.length === 0 && (
                      <div className="text-xs text-gray-400 px-3 italic">
                        No friends yet. Search users to connect!
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {view === "search" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Find students..."
                    className="w-full pl-9 glass-input rounded-xl text-sm py-2"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                {searchResults.map((u) => {
                  const status = getButtonStatus(u._id);
                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                            {u.name[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                      {status === "add" && (
                        <button
                          onClick={() => sendRequest(u)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <UserPlus size={16} />
                        </button>
                      )}
                      {status === "sent" && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                      {status === "friend" && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <Check size={12} /> Friend
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {view === "requests" && (
              <div className="space-y-2">
                {requests.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-4">
                    No pending requests
                  </div>
                ) : (
                  requests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                      <span className="text-sm font-bold">{req.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(req._id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(req._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 glass-panel rounded-2xl flex flex-col shadow-xl border-0 overflow-hidden relative">
          {/* Chat Header (No change needed here, just context) */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {activeRoom ? (
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  {activeRoom.includes("_") ? (
                    <User size={18} />
                  ) : (
                    <Hash size={18} />
                  )}
                  {activeRoomName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{" "}
                    Live
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      socketStatus === "connected"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30"
                        : socketStatus === "connecting"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30"
                        : socketStatus === "error"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30"
                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
                    }`}
                  >
                    {socketStatus === "connected"
                      ? "Connected"
                      : socketStatus === "connecting"
                      ? "Connecting…"
                      : socketStatus === "error"
                      ? "Connection error"
                      : "Disconnected"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="font-bold text-gray-500">Chats</div>
            )}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-gray-50/50 dark:bg-black/20">
            {activeRoom && socketStatus !== "connected" && (
              <div
                className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 shadow-sm ${
                  socketStatus === "error"
                    ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-200"
                    : socketStatus === "connecting"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-200"
                    : "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="text-sm font-medium">
                  {socketStatus === "connecting"
                    ? "Connecting to chat server…"
                    : socketStatus === "error"
                    ? "Chat connection failed."
                    : "Disconnected from chat server."}
                </div>
                <button
                  onClick={reconnectSocket}
                  className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-sm font-bold border border-white/60 dark:bg-black/20 dark:hover:bg-black/30 dark:border-white/10"
                >
                  Reconnect
                </button>
              </div>
            )}
            {activeRoom ? (
              loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : (
                messageList.map((msg, index) => {
                  const isMe = user && msg?.sender?._id === user._id;

                  const showSenderName =
                    !isMe &&
                    (activeRoom === "general" || groupRoomIds.has(activeRoom));

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (activeRoom === "general" || groupRoomIds.has(activeRoom)) && (
                        <div className="mr-2 mt-1 shrink-0">
                          {msg.sender?.avatar ? (
                            <img
                              src={msg.sender.avatar}
                              alt={msg.sender?.name || "User"}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {(msg.sender?.name || "U")[0]}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-1.5 shadow-sm relative ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                        }`}
                      >
                        {/* Display Sender Name conditionally */}
                        {showSenderName && (
                          <div className="text-[10px] font-bold opacity-60 mb-1">
                            {msg.sender?.name || "Unknown"}
                          </div>
                        )}

                        {/* Inner Container to put text and time inline */}
                        <div className="flex items-end gap-2">
                          {/* Message Content */}
                          <p
                            className="text-sm leading-snug break-words"
                            style={{ marginBottom: 0 }}
                          >
                            {msg.content}
                          </p>

                          {/* Timestamp */}
                          <div
                            className={`text-[9px] whitespace-nowrap ${
                              isMe ? "opacity-80" : "opacity-60"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // EMPTY STATE
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                <MessageSquare size={64} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                  Select a Chat
                </h3>
                <p className="max-w-xs mt-2 text-sm opacity-70">
                  Choose a friend or group from the sidebar to start chatting.
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                >
                  View Chats
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area (No change needed) */}
          {activeRoom && (
            <div className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 glass-input rounded-xl px-4 py-3 focus:ring-2 ring-blue-500/50 dark:text-white"
                  placeholder={`Message ${activeRoomName}...`}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
        <Modal
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          title="Create New Group"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Group Name
              </label>
              <input
                type="text"
                className="w-full glass-input rounded-xl mt-1"
                placeholder="e.g. Exam Prep"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <button
              onClick={createGroup}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={!!modalMessage}
          onClose={() => setModalMessage(null)}
          title={modalMessage?.title || "Notification"}
        >
          <div className="text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                modalMessage?.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {modalMessage?.type === "success" ? (
                <Check size={32} />
              ) : (
                <X size={32} />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {modalMessage?.msg}
            </p>
            <button
              onClick={() => setModalMessage(null)}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={!!friendToRemove}
          onClose={() => setFriendToRemove(null)}
          title="Remove Friend"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Unfriend {friendToRemove?.name}?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                History will be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFriendToRemove(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveFriend}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={!!groupToDelete}
          onClose={() => setGroupToDelete(null)}
          title="Delete Group"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Delete "{groupToDelete?.name}"?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setGroupToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGroup}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Chat;
