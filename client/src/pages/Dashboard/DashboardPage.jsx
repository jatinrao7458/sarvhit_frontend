import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_DATA } from '../../data/dashboard';
import { SOCIAL_FEED } from '../../data/socialFeed';
import { fadeUp, slideInLeft } from '../../hooks/useAnimations';
import { StatCard, SpotlightCard } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, Bell, Heart, MessageCircle, Share2,
    X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import './DashboardPage.css';

function PostAvatar({ initials, role }) {
    return (
        <div className={`feed-avatar feed-avatar--${role}`}>
            {initials}
        </div>
    );
}

function PostCard({ post, index, onAuthorClick }) {
    const [liked, setLiked] = useState(false);
    const likeCount = liked ? post.likes + 1 : post.likes;

    return (
        <SpotlightCard
            as={motion.div}
            className="feed-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.1 + index * 0.06 }}
        >
            {/* Author header */}
            <div className="feed-card__header" onClick={() => onAuthorClick(post.author)} style={{ cursor: 'pointer' }}>
                <PostAvatar initials={post.author.initials} role={post.author.role} />
                <div className="feed-card__author">
                    <span className="feed-card__name">{post.author.name}</span>
                    <span className="feed-card__meta">
                        {post.author.role === 'ngo' ? '🏛️ NGO' : post.author.role === 'sponsor' ? '💎 Sponsor' : '🤝 Volunteer'}
                        {' · '}{post.author.location}{' · '}{post.time}
                    </span>
                </div>
            </div>

            {/* Content */}
            <p className="feed-card__content">{post.content}</p>

            {/* Image */}
            {post.image && (
                <div className="feed-card__image">
                    <img src={post.image} alt="" loading="lazy" />
                </div>
            )}

            {/* Tags */}
            <div className="feed-card__tags">
                {post.tags.map(tag => (
                    <span key={tag} className="feed-card__tag">#{tag}</span>
                ))}
            </div>

            {/* Engagement bar */}
            <div className="feed-card__engagement">
                <button
                    className={`feed-card__action ${liked ? 'feed-card__action--liked' : ''}`}
                    onClick={() => setLiked(!liked)}
                >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    <span>{likeCount}</span>
                </button>
                <button className="feed-card__action">
                    <MessageCircle size={16} />
                    <span>{post.comments}</span>
                </button>
                <button className="feed-card__action">
                    <Share2 size={16} />
                    <span>{post.shares}</span>
                </button>
            </div>
        </SpotlightCard>
    );
}

function NotificationBell({ activity, onNavigate }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div className="notif-bell" ref={ref}>
            <button
                className={`notif-bell__btn ${open ? 'notif-bell__btn--active' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <Bell size={20} />
                <span className="notif-bell__badge">{activity.length}</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="notif-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    >
                        <div className="notif-dropdown__header">
                            <h3>Recent Activity</h3>
                            <button onClick={() => setOpen(false)}><X size={16} /></button>
                        </div>
                        <div className="notif-dropdown__list">
                            {activity.map((item, i) => (
                                <div
                                    key={i}
                                    className="notif-item"
                                    onClick={() => { onNavigate(`/app/activity/${item.id}`); setOpen(false); }}
                                >
                                    <div className="notif-item__dot" />
                                    <div className="notif-item__content">
                                        <p>{item.text}</p>
                                        <span>{item.time}</span>
                                    </div>
                                    <ArrowUpRight size={14} className="notif-item__arrow" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const data = ROLE_DATA[user?.userType] || ROLE_DATA.ngo;
    const userName = user?.firstName || user?.name || 'User';

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

    return (
        <div className="dashboard">
            <motion.div className="dashboard__header" {...fadeUp(0)}>
                <div className="dashboard__header-left">
                    <h1>Hey, {userName} 👋</h1>
                    <p>{data.greeting}</p>
                </div>
                <NotificationBell activity={data.activity} onNavigate={navigate} />
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
                    <div className="feed-list">
                        {SOCIAL_FEED.map((post, i) => (
                            <PostCard key={post.id} post={post} index={i} onAuthorClick={(author) => {
                                if (author.discoverType && author.discoverId) {
                                    navigate(`/app/discover/${author.discoverType}/${author.discoverId}`, { state: { from: 'dashboard' } });
                                } else {
                                    navigate(`/app/user/${author.id}`, { state: { from: 'dashboard' } });
                                }
                            }} />
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
