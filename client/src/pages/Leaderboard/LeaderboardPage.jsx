import { useAuth } from '../../context/AuthContext';
import { LEADERBOARD, calculatePoints } from '../../data/leaderboardData';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, CalendarDays, IndianRupee, TrendingUp, Flame, Users, Building2, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaderboardPage.css';

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM_ORDER = [1, 0, 2]; // visual: 2nd, 1st, 3rd

const TABS = [
    { key: 'volunteer', label: 'Volunteers', icon: Heart,     emoji: '🤝' },
    { key: 'ngo',       label: 'NGOs',       icon: Building2, emoji: '🏛️' },
    { key: 'sponsor',   label: 'Sponsors',   icon: IndianRupee, emoji: '💎' },
];

function UserAvatar({ initials, role, size = 48, rank }) {
    const roleClass = `lb-avatar--${role}`;
    return (
        <div className={`lb-avatar ${roleClass}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
            {initials}
            {rank <= 3 && (
                <span className="lb-avatar__medal">{MEDAL[rank - 1]}</span>
            )}
        </div>
    );
}

function StatsBreakdown({ events, hours, funds, role, compact = false }) {
    return (
        <div className={`lb-stats ${compact ? 'lb-stats--compact' : ''}`}>
            <span className="lb-stat" title="Events">
                <CalendarDays size={compact ? 12 : 13} />
                {events}
            </span>
            {role !== 'sponsor' && (
                <span className="lb-stat" title="Hours">
                    <Clock size={compact ? 12 : 13} />
                    {hours}h
                </span>
            )}
            {(role === 'sponsor' || role === 'ngo') && funds > 0 && (
                <span className="lb-stat" title={role === 'sponsor' ? 'Donated' : 'Received'}>
                    <IndianRupee size={compact ? 12 : 13} />
                    ₹{funds >= 100000 ? `${(funds / 100000).toFixed(1)}L` : `${(funds / 1000).toFixed(0)}k`}
                </span>
            )}
        </div>
    );
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userRole = user?.role || 'volunteer';
    const [activeTab, setActiveTab] = useState(userRole);

    const handleUserClick = (u) => {
        if (u.discoverType && u.discoverId) {
            navigate(`/app/discover/${u.discoverType}/${u.discoverId}`, { state: { from: 'leaderboard' } });
        } else if (u.userId) {
            navigate(`/app/user/${u.userId}`, { state: { from: 'leaderboard' } });
        }
    };

    const leaderboardUsers = LEADERBOARD[activeTab] || [];
    const top3 = leaderboardUsers.slice(0, 3);
    const rest = leaderboardUsers.slice(3);

    // Current user's points
    const currentUserPoints = user ? calculatePoints({
        events: user.eventsHosted || user.eventsJoined || 0,
        hours: user.hoursLogged || 0,
        funds: user.totalDonated || user.fundsReceived || 0,
    }) : 0;

    return (
        <div className="leaderboard-page">
            {/* Header */}
            <motion.div className="lb-header" {...fadeUp(0)}>
                <div className="lb-header__title">
                    <Trophy size={24} />
                    <h1>Leaderboard</h1>
                </div>
                <p className="lb-header__subtitle">
                    Top contributors ranked by impact score
                </p>
            </motion.div>

            {/* Role Tabs */}
            <motion.div className="lb-tabs" {...fadeUp(0.3)}>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`lb-tab ${activeTab === tab.key ? 'lb-tab--active' : ''} lb-tab--${tab.key}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <span className="lb-tab__emoji">{tab.emoji}</span>
                        <span className="lb-tab__label">{tab.label}</span>
                    </button>
                ))}
            </motion.div>

            {/* Your rank card — only show if viewing your own role */}
            {user && activeTab === userRole && (
                <motion.div className="lb-your-rank" {...fadeUp(0.5)}>
                    <div className="lb-your-rank__left">
                        <Flame size={18} />
                        <span className="lb-your-rank__label">Your Score</span>
                    </div>
                    <div className="lb-your-rank__right">
                        <span className="lb-your-rank__points">{currentUserPoints}</span>
                        <span className="lb-your-rank__unit">pts</span>
                    </div>
                </motion.div>
            )}

            {/* Podium — Top 3 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + '-podium'}
                    className="lb-podium"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                    {PODIUM_ORDER.map((idx, visualPos) => {
                        const u = top3[idx];
                        if (!u) return null;
                        const rank = idx + 1;
                        return (
                            <motion.div
                                key={u.id}
                                className={`lb-podium__slot lb-podium__slot--${rank}`}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 22,
                                    delay: 0.08 + visualPos * 0.1,
                                }}
                                onClick={() => handleUserClick(u)}
                                style={{ cursor: (u.discoverType || u.userId) ? 'pointer' : 'default' }}
                            >
                                <div className={`lb-podium__glow lb-podium__glow--${rank}`} />
                                <UserAvatar
                                    initials={u.initials}
                                    role={u.role}
                                    size={rank === 1 ? 72 : 56}
                                    rank={rank}
                                />
                                <span className="lb-podium__name">{u.name}</span>
                                <span className="lb-podium__points">{u.points.toLocaleString()}</span>
                                <StatsBreakdown events={u.events} hours={u.hours} funds={u.funds} role={u.role} compact />
                                <div className={`lb-podium__pillar lb-podium__pillar--${rank}`} />
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Ranked List — 4th onwards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + '-list'}
                    className="lb-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {rest.map((u, i) => {
                        const rank = i + 4;
                        const isCurrentUser = user?.name === u.name;
                        return (
                            <motion.div
                                key={u.id}
                                className={`lb-row ${isCurrentUser ? 'lb-row--highlight' : ''}`}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 220,
                                    damping: 22,
                                    delay: 0.05 + i * 0.04,
                                }}
                                whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                                onClick={() => handleUserClick(u)}
                                style={{ cursor: (u.discoverType || u.userId) ? 'pointer' : 'default' }}
                            >
                                <span className="lb-row__rank">{rank}</span>
                                <UserAvatar initials={u.initials} role={u.role} size={38} rank={rank} />
                                <div className="lb-row__info">
                                    <span className="lb-row__name">
                                        {u.name}
                                        <span className="lb-row__location">{u.location}</span>
                                    </span>
                                    <StatsBreakdown events={u.events} hours={u.hours} funds={u.funds} role={u.role} compact />
                                </div>
                                <div className="lb-row__score">
                                    <TrendingUp size={14} />
                                    <span>{u.points.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
