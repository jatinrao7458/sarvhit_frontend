import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_DATA } from '../../data/dashboard';
import { SOCIAL_FEED } from '../../data/socialFeed';
import { fadeUp, slideInLeft } from '../../hooks/useAnimations';
import { StatCard, SpotlightCard } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, Bell, Heart, MessageCircle, Share2,
    X, Check, XCircle, Clock, UserCheck, UserX,
    Send, Hash, Image as ImageIcon, Loader, Trash2
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import notificationService from '../../services/notificationService';
import postService from '../../services/postService';
import './DashboardPage.css';

/* ══════════════════════════════════════════
   CREATE POST COMPOSER
   ══════════════════════════════════════════ */
function CreatePostComposer({ user, onPostCreated }) {
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef(null);
    const token = localStorage.getItem('token');

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '');
            if (tag && !tags.includes(tag) && tags.length < 5) {
                setTags([...tags, tag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async () => {
        if (!content.trim() || !token) return;
        setPosting(true);
        setError('');
        try {
            const result = await postService.createPost(content.trim(), tags, null, token);
            setContent('');
            setTags([]);
            setTagInput('');
            if (onPostCreated) onPostCreated(result.post);
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error('Error creating post:', err);
        } finally {
            setPosting(false);
        }
    };

    const initials = `${(user?.firstName || '')[0] || ''}${(user?.lastName || '')[0] || ''}`.toUpperCase() || '?';

    return (
        <SpotlightCard className="create-post">
            <div className="create-post__header">
                <div className={`feed-avatar feed-avatar--${user?.userType || 'volunteer'}`}>
                    {initials}
                </div>
                <textarea
                    ref={textareaRef}
                    className="create-post__input"
                    placeholder="Share something with the community..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={2}
                    maxLength={5000}
                />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="create-post__tags">
                    {tags.map(tag => (
                        <span key={tag} className="create-post__tag">
                            #{tag}
                            <button onClick={() => removeTag(tag)}><X size={10} /></button>
                        </span>
                    ))}
                </div>
            )}

            <div className="create-post__footer">
                <div className="create-post__tools">
                    <div className="create-post__tag-input-wrap">
                        <Hash size={14} />
                        <input
                            type="text"
                            placeholder="Add tags..."
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="create-post__tag-input"
                        />
                    </div>
                </div>
                <motion.button
                    className="create-post__submit"
                    onClick={handleSubmit}
                    disabled={!content.trim() || posting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    {posting ? <Loader size={14} className="spinning" /> : <Send size={14} />}
                    {posting ? 'Posting...' : 'Post'}
                </motion.button>
            </div>
            {error && <p className="create-post__error">{error}</p>}
        </SpotlightCard>
    );
}

/* ══════════════════════════════════════════
   POST CARD (handles both API and static posts)
   ══════════════════════════════════════════ */
function PostAvatar({ initials, role }) {
    return (
        <div className={`feed-avatar feed-avatar--${role}`}>
            {initials}
        </div>
    );
}

function PostCard({ post, index, onAuthorClick, currentUserId, onDelete, onLikeToggle }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commenting, setCommenting] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentCount, setCommentCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const token = localStorage.getItem('token');

    // Determine if this is an API post (has _id) or static post
    const isApiPost = !!post._id;

    // Normalise shape
    const author = isApiPost
        ? {
            id: post.authorId?._id || post.authorId,
            name: `${post.authorId?.firstName || ''} ${post.authorId?.lastName || ''}`.trim() || 'User',
            initials: `${(post.authorId?.firstName || '?')[0]}${(post.authorId?.lastName || '')[0] || ''}`.toUpperCase(),
            role: post.authorRole || 'volunteer',
            location: '',
        }
        : post.author;

    const isOwner = currentUserId && (post.authorId?._id === currentUserId || post.authorId === currentUserId);

    useEffect(() => {
        if (isApiPost) {
            setLiked(post.likedBy?.includes(currentUserId) || false);
            setLikeCount(post.likes || 0);
            setCommentCount(post.comments?.length || 0);
            setShareCount(post.shares || 0);
        } else {
            setLikeCount(post.likes || 0);
            setCommentCount(post.comments || 0);
            setShareCount(post.shares || 0);
        }
    }, [post, currentUserId, isApiPost]);

    const handleLike = async () => {
        if (!isApiPost || !token) {
            setLiked(!liked);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
            return;
        }
        try {
            const result = await postService.likePost(post._id, token);
            setLiked(!liked);
            setLikeCount(result.post?.likes ?? likeCount);
            if (onLikeToggle) onLikeToggle(post._id, result.post);
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim() || !isApiPost || !token) return;
        setCommenting(true);
        try {
            await postService.commentOnPost(post._id, commentText.trim(), token);
            setCommentText('');
            setCommentCount(prev => prev + 1);
        } catch (err) {
            console.error('Error commenting:', err);
        } finally {
            setCommenting(false);
        }
    };

    const handleShare = async () => {
        if (!isApiPost || !token) return;
        try {
            await postService.sharePost(post._id, token);
            setShareCount(prev => prev + 1);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleDelete = async () => {
        if (!isApiPost || !token || !isOwner) return;
        try {
            await postService.deletePost(post._id, token);
            if (onDelete) onDelete(post._id);
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const timeDisplay = isApiPost ? formatTimeAgo(post.createdAt) : post.time;
    const contentText = isApiPost ? post.content : post.content;
    const postTags = isApiPost ? (post.tags || []) : (post.tags || []);
    const postImage = isApiPost ? post.image : post.image;

    const [showCommentBox, setShowCommentBox] = useState(false);

    return (
        <SpotlightCard
            as={motion.div}
            className="feed-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.1 + index * 0.06 }}
        >
            {/* Author header */}
            <div className="feed-card__header" onClick={() => onAuthorClick?.(author)} style={{ cursor: 'pointer' }}>
                <PostAvatar initials={author.initials} role={author.role} />
                <div className="feed-card__author">
                    <span className="feed-card__name">{author.name}</span>
                    <span className="feed-card__meta">
                        {author.role === 'ngo' ? '🏛️ NGO' : author.role === 'sponsor' ? '💎 Sponsor' : '🤝 Volunteer'}
                        {author.location ? ` · ${author.location}` : ''}{' · '}{timeDisplay}
                    </span>
                </div>
                {isOwner && (
                    <button className="feed-card__delete" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="Delete post">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Content */}
            <p className="feed-card__content">{contentText}</p>

            {/* Image */}
            {postImage && (
                <div className="feed-card__image">
                    <img src={postImage} alt="" loading="lazy" />
                </div>
            )}

            {/* Tags */}
            {postTags.length > 0 && (
                <div className="feed-card__tags">
                    {postTags.map(tag => (
                        <span key={tag} className="feed-card__tag">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Engagement bar */}
            <div className="feed-card__engagement">
                <button
                    className={`feed-card__action ${liked ? 'feed-card__action--liked' : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    <span>{likeCount}</span>
                </button>
                <button className="feed-card__action" onClick={() => setShowCommentBox(!showCommentBox)}>
                    <MessageCircle size={16} />
                    <span>{commentCount}</span>
                </button>
                <button className="feed-card__action" onClick={handleShare}>
                    <Share2 size={16} />
                    <span>{shareCount}</span>
                </button>
            </div>

            {/* Inline comment box */}
            <AnimatePresence>
                {showCommentBox && isApiPost && (
                    <motion.div
                        className="feed-card__comment-box"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                            className="feed-card__comment-input"
                        />
                        <button
                            className="feed-card__comment-send"
                            onClick={handleComment}
                            disabled={!commentText.trim() || commenting}
                        >
                            <Send size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </SpotlightCard>
    );
}

function formatTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}

/* ══════════════════════════════════════════
   NOTIFICATION BELL (from prior implementation)
   ══════════════════════════════════════════ */
function NotificationBell({ onNavigate, userType }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actioningId, setActioningId] = useState(null);
    const ref = useRef(null);

    const token = localStorage.getItem('token');

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const [notifRes, countRes] = await Promise.all([
                notificationService.getNotifications(token),
                notificationService.getUnreadCount(token)
            ]);
            setNotifications(notifRes.notifications || []);
            setUnreadCount(countRes.count || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
    useEffect(() => { if (open) fetchNotifications(); }, [open, fetchNotifications]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleApprove = async (notif) => {
        if (!notif.eventId?._id || !notif.senderId?._id) return;
        setActioningId(notif._id);
        try {
            await notificationService.approveVolunteer(notif.eventId._id, notif.senderId._id, token);
            await fetchNotifications();
        } catch (err) { console.error('Error approving:', err); }
        finally { setActioningId(null); }
    };

    const handleReject = async (notif) => {
        if (!notif.eventId?._id || !notif.senderId?._id) return;
        setActioningId(notif._id);
        try {
            await notificationService.rejectVolunteer(notif.eventId._id, notif.senderId._id, token);
            await fetchNotifications();
        } catch (err) { console.error('Error rejecting:', err); }
        finally { setActioningId(null); }
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'join_request': return <Clock size={14} className="notif-type-icon notif-type-icon--request" />;
            case 'join_approved': return <UserCheck size={14} className="notif-type-icon notif-type-icon--approved" />;
            case 'join_rejected': return <UserX size={14} className="notif-type-icon notif-type-icon--rejected" />;
            default: return <Bell size={14} />;
        }
    };

    return (
        <div className="notif-bell" ref={ref}>
            <button className={`notif-bell__btn ${open ? 'notif-bell__btn--active' : ''}`} onClick={() => setOpen(!open)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-bell__badge">{unreadCount}</span>}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div className="notif-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
                        <div className="notif-dropdown__header">
                            <h3>Notifications</h3>
                            <button onClick={() => setOpen(false)}><X size={16} /></button>
                        </div>
                        <div className="notif-dropdown__list">
                            {loading && notifications.length === 0 && (
                                <div className="notif-item notif-item--loading"><p>Loading...</p></div>
                            )}
                            {!loading && notifications.length === 0 && (
                                <div className="notif-item notif-item--empty"><p>No notifications yet</p></div>
                            )}
                            {notifications.map((notif) => (
                                <div key={notif._id}
                                    className={`notif-item ${notif.status === 'unread' ? 'notif-item--unread' : ''} ${notif.status === 'actioned' ? 'notif-item--actioned' : ''}`}>
                                    <div className="notif-item__icon">{getNotifIcon(notif.type)}</div>
                                    <div className="notif-item__content">
                                        <p>{notif.message}</p>
                                        <span className="notif-item__time">{formatTimeAgo(notif.createdAt)}</span>
                                        {notif.type === 'join_request' && notif.status !== 'actioned' && userType === 'ngo' && (
                                            <div className="notif-item__actions">
                                                <button className="notif-action-btn notif-action-btn--approve"
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(notif); }}
                                                    disabled={actioningId === notif._id}>
                                                    <Check size={14} /> {actioningId === notif._id ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button className="notif-action-btn notif-action-btn--reject"
                                                    onClick={(e) => { e.stopPropagation(); handleReject(notif); }}
                                                    disabled={actioningId === notif._id}>
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {notif.status === 'actioned' && notif.type === 'join_request' && (
                                            <span className="notif-item__actioned-badge">Actioned ✓</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════ */
export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const data = ROLE_DATA[user?.userType] || ROLE_DATA.ngo;
    const userName = user?.firstName || user?.name || 'User';

    // Feed state: API posts + static fallback
    const [apiPosts, setApiPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setFeedLoading(true);
                const result = await postService.getFeed(1, 20);
                setApiPosts(result.posts || []);
            } catch (err) {
                console.error('Error fetching feed:', err);
            } finally {
                setFeedLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handlePostCreated = (newPost) => {
        // Prepend the new post to the feed (optimistic)
        setApiPosts(prev => [newPost, ...prev]);
    };

    const handlePostDeleted = (postId) => {
        setApiPosts(prev => prev.filter(p => p._id !== postId));
    };

    // Combine: API posts first, then static as filler
    const feedPosts = apiPosts.length > 0
        ? [...apiPosts, ...SOCIAL_FEED]
        : SOCIAL_FEED;

    const STAT_LINKS = {
        ngo: {
            'Active Events': '/app/events',
            'Volunteers Enrolled': '/app/ngo/manage-team',
            'Funds Received': '/app/ngo/reports',
            'Impact Score': '/app/leaderboard',
        },
        volunteer: {
            'Hours Logged': '/app/volunteer/log-hours',
            'Events Joined': '/app/events',
            'Badges Earned': '/app/volunteer/badges',
            'Impact Score': '/app/leaderboard',
        },
        sponsor: {
            'Total Donated': '/app/sponsor/impact-report',
            'Projects Funded': '/app/sponsor/browse-projects',
            'Tax Receipts': '/app/sponsor/tax-receipts',
            'Impact Score': '/app/leaderboard',
        },
    };

    const links = STAT_LINKS[user?.userType] || {};

    const handleAuthorClick = (author) => {
        if (author.discoverType && author.discoverId) {
            navigate(`/app/discover/${author.discoverType}/${author.discoverId}`, { state: { from: 'dashboard' } });
        } else if (author.id) {
            navigate(`/app/user/${author.id}`, { state: { from: 'dashboard' } });
        }
    };

    return (
        <div className="dashboard">
            <motion.div className="dashboard__header" {...fadeUp(0)}>
                <div className="dashboard__header-left">
                    <h1>Hey, {userName} 👋</h1>
                    <p>{data.greeting}</p>
                </div>
                <NotificationBell onNavigate={navigate} userType={user?.userType} />
            </motion.div>

            {/* Stats Grid */}
            <div className="dashboard__stats">
                {data.stats.map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        stat={stat}
                        index={i + 1}
                        onClick={links[stat.label] ? () => navigate(links[stat.label]) : undefined}
                    />
                ))}
            </div>

            <div className="dashboard__grid">
                {/* Social Feed */}
                <motion.div className="dashboard__feed" {...fadeUp(5)}>
                    <h2>Community Feed</h2>

                    {/* Create Post Composer */}
                    <CreatePostComposer user={user} onPostCreated={handlePostCreated} />

                    <div className="feed-list">
                        {feedLoading && apiPosts.length === 0 && (
                            <div className="feed-loading">
                                <Loader size={20} className="spinning" />
                                <span>Loading feed...</span>
                            </div>
                        )}
                        {feedPosts.map((post, i) => (
                            <PostCard
                                key={post._id || post.id}
                                post={post}
                                index={i}
                                currentUserId={user?._id}
                                onAuthorClick={handleAuthorClick}
                                onDelete={handlePostDeleted}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <SpotlightCard as={motion.div} className="dashboard__section dashboard__section--compact" {...fadeUp(6)}>
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        {data.quickActions.map((action) => (
                            <motion.button
                                key={action.label}
                                className="quick-action-btn"
                                onClick={() => action.path && navigate(action.path)}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                <action.icon size={20} />
                                <span>{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
}
