import { useAuth } from '../../context/AuthContext';
import { fadeUp } from '../../hooks/useAnimations';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Search } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import './MessagesPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getDisplayName(user) {
    if (!user) return 'Unknown User';
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return full || user.name || user.email || 'Unknown User';
}

function getInitials(name) {
    const parts = (name || '').split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatTime(dateLike) {
    if (!dateLike) return '';
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConversationTime(dateLike) {
    if (!dateLike) return '';
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function MessagesPage() {
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id || user?.userId;

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [search, setSearch] = useState('');
    const [newMsg, setNewMsg] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState('');

    const fetchConversations = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoadingConversations(true);
            const response = await fetch(`${API_BASE_URL}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load conversations');
            }
            setConversations(data.conversations || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    const fetchConversationMessages = useCallback(async (conversationId, silent = false) => {
        const token = localStorage.getItem('token');
        if (!token || !conversationId) return;
        try {
            if (!silent) setLoadingMessages(true);
            const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load messages');
            }
            setMessages(data.conversation?.messages || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load messages');
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!activeConvo && conversations.length > 0) {
            setActiveConvo(conversations[0]._id);
        }
    }, [conversations, activeConvo]);

    useEffect(() => {
        if (!activeConvo) return;
        fetchConversationMessages(activeConvo);
    }, [activeConvo, fetchConversationMessages]);

    const fetchUsersBySearch = useCallback(async (query) => {
        const token = localStorage.getItem('token');
        if (!token || !query.trim()) {
            setUserResults([]);
            return;
        }

        try {
            setLoadingUsers(true);
            const response = await fetch(
                `${API_BASE_URL}/discover/users?search=${encodeURIComponent(query.trim())}&limit=8`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to search users');
            }

            setUserResults(data.users || []);
        } catch (err) {
            setError(err.message || 'Failed to search users');
            setUserResults([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        const trimmed = search.trim();
        if (!trimmed) {
            setUserResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchUsersBySearch(trimmed);
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [search, fetchUsersBySearch]);

    // Keep conversation list synced so recipients see new incoming threads/messages.
    useEffect(() => {
        const interval = setInterval(() => {
            fetchConversations();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Poll active thread for new replies while chat is open.
    useEffect(() => {
        if (!activeConvo) return undefined;
        const interval = setInterval(() => {
            fetchConversationMessages(activeConvo, true);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeConvo, fetchConversationMessages]);

    const conversationItems = useMemo(() => {
        return (conversations || []).map((convo) => {
            const otherUser = (convo.participants || []).find(
                (p) => String(p?._id) !== String(currentUserId)
            ) || (convo.participants || [])[0] || null;

            const name = getDisplayName(otherUser);
            const unreadRaw = convo.unreadCount && currentUserId
                ? (convo.unreadCount[currentUserId] || 0)
                : 0;

            return {
                id: convo._id,
                name,
                role: otherUser?.userType ? String(otherUser.userType).toUpperCase() : 'User',
                avatar: getInitials(name),
                profileImage: otherUser?.profileImage || '',
                lastMsg: convo.lastMessage?.text || 'No messages yet',
                time: formatConversationTime(convo.lastMessage?.timestamp || convo.updatedAt),
                unread: unreadRaw,
                otherUser,
            };
        });
    }, [conversations, currentUserId]);

    const filtered = conversationItems.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const participantIdToConversationId = useMemo(() => {
        const map = new Map();
        (conversationItems || []).forEach((convo) => {
            const participantId = convo.otherUser?._id || convo.otherUser?.id;
            if (participantId) {
                map.set(String(participantId), convo.id);
            }
        });
        return map;
    }, [conversationItems]);

    const searchableUsers = useMemo(() => {
        return (userResults || [])
            .map((u) => {
                const userId = u.userId || u._id;
                const displayName = getDisplayName(u);
                const existingConversationId = participantIdToConversationId.get(String(userId));
                return {
                    id: userId,
                    name: displayName,
                    email: u.email || '',
                    role: u.userType ? String(u.userType).toUpperCase() : 'USER',
                    avatar: getInitials(displayName),
                    profileImage: u.profileImage || '',
                    existingConversationId,
                };
            })
            .filter((u) => u.id && String(u.id) !== String(currentUserId));
    }, [userResults, participantIdToConversationId, currentUserId]);

    const selected = conversationItems.find(c => c.id === activeConvo) || null;

    const chatMessages = useMemo(() => {
        return (messages || []).map((msg) => {
            const senderId = msg?.senderId?._id || msg?.senderId;
            const from = String(senderId) === String(currentUserId) ? 'me' : 'them';
            return {
                id: msg._id || `${senderId}-${msg.createdAt}`,
                from,
                text: msg.text,
                time: formatTime(msg.createdAt),
            };
        });
    }, [messages, currentUserId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConvo) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const messageText = newMsg.trim();
        setNewMsg('');

        try {
            const response = await fetch(`${API_BASE_URL}/messages/${activeConvo}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: messageText }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to send message');
            }
            setMessages(data.conversation?.messages || []);
            fetchConversations();
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to send message');
        }
    };

    const startConversationWithUser = async (targetUserId) => {
        const token = localStorage.getItem('token');
        if (!token || !targetUserId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/messages/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipientId: targetUserId }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to start conversation');
            }

            const newConversationId = data.conversation?._id;
            await fetchConversations();
            if (newConversationId) {
                setActiveConvo(newConversationId);
            }
            setError('');
        } catch (err) {
            setError(err.message || 'Unable to start conversation');
        }
    };

    const handleSelectUser = async (userItem) => {
        if (!userItem?.id) return;

        if (userItem.existingConversationId) {
            setActiveConvo(userItem.existingConversationId);
            return;
        }

        await startConversationWithUser(userItem.id);
    };

    return (
        <div className="messages-page">
            {/* Conversation List */}
            <motion.div className="messages__sidebar" {...fadeUp(0)}>
                <div className="messages__sidebar-header">
                    <h2><MessageCircle size={20} /> Messages</h2>
                </div>
                <div className="messages__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations or people..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {search.trim() && (
                    <div className="messages__user-search-results">
                        {loadingUsers && <p className="message-convo__preview">Searching users...</p>}
                        {!loadingUsers && searchableUsers.map((person) => (
                            <button
                                type="button"
                                key={person.id}
                                className="message-user-result"
                                onClick={() => handleSelectUser(person)}
                            >
                                <div className="message-convo__avatar">
                                    {person.profileImage ? (
                                        <img src={person.profileImage} alt={`${person.name} profile`} className="message-avatar__image" />
                                    ) : (
                                        person.avatar
                                    )}
                                </div>
                                <div className="message-user-result__info">
                                    <span className="message-convo__name">{person.name}</span>
                                    <span className="message-convo__preview">{person.email || person.role}</span>
                                </div>
                                <span className="message-user-result__action">
                                    {person.existingConversationId ? 'Open' : 'Message'}
                                </span>
                            </button>
                        ))}
                        {!loadingUsers && searchableUsers.length === 0 && (
                            <p className="message-convo__preview">No people found.</p>
                        )}
                    </div>
                )}
                <div className="messages__list">
                    {loadingConversations && <p className="message-convo__preview">Loading conversations...</p>}
                    {filtered.map((convo, i) => (
                        <motion.div
                            key={convo.id}
                            className={`message-convo ${activeConvo === convo.id ? 'message-convo--active' : ''}`}
                            onClick={() => setActiveConvo(convo.id)}
                            {...fadeUp(i + 1)}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <div className="message-convo__avatar">
                                {convo.profileImage ? (
                                    <img src={convo.profileImage} alt={`${convo.name} profile`} className="message-avatar__image" />
                                ) : (
                                    convo.avatar
                                )}
                            </div>
                            <div className="message-convo__info">
                                <div className="message-convo__top">
                                    <span className="message-convo__name">{convo.name}</span>
                                    <span className="message-convo__time">{convo.time}</span>
                                </div>
                                <div className="message-convo__bottom">
                                    <span className="message-convo__preview">{convo.lastMsg}</span>
                                    {convo.unread > 0 && (
                                        <span className="message-convo__badge">{convo.unread}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {!loadingConversations && filtered.length === 0 && (
                        <p className="message-convo__preview">No conversations found.</p>
                    )}
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div className="messages__chat" {...fadeUp(1)}>
                {selected ? (
                    <>
                        <div className="messages__chat-header">
                            <div className="messages__chat-avatar">
                                {selected.profileImage ? (
                                    <img src={selected.profileImage} alt={`${selected.name} profile`} className="message-avatar__image" />
                                ) : (
                                    selected.avatar
                                )}
                            </div>
                            <div>
                                <span className="messages__chat-name">{selected.name}</span>
                                <span className="messages__chat-role">{selected.role}</span>
                            </div>
                        </div>

                        <div className="messages__chat-body">
                            {loadingMessages && <p className="message-convo__preview">Loading messages...</p>}
                            {chatMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`chat-bubble ${msg.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="chat-bubble__time">{msg.time}</span>
                                </div>
                            ))}
                        </div>

                        <form className="messages__chat-input" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                            />
                            <button type="submit" className="messages__send-btn">
                                <Send size={18} />
                            </button>
                        </form>
                        {error && <p className="message-convo__preview" style={{ padding: '8px 16px' }}>{error}</p>}
                    </>
                ) : (
                    <div className="messages__empty">
                        <MessageCircle size={48} />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
