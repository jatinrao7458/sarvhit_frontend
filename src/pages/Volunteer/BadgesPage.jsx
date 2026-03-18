import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import { ArrowLeft, Star, Award, Shield, Zap, Heart, Clock, Trophy, Target, Flame } from 'lucide-react';
import './BadgesPage.css';

const BADGES = [
    { id: 1, name: 'First Steps', desc: 'Joined your first event', icon: '🌱', earned: true, date: 'Jan 15, 2025' },
    { id: 2, name: 'Team Player', desc: 'Completed 5 events', icon: '🤝', earned: true, date: 'Mar 8, 2025' },
    { id: 3, name: 'Century Club', desc: 'Logged 100+ hours', icon: '💯', earned: true, date: 'Jun 20, 2025' },
    { id: 4, name: 'Eco Warrior', desc: 'Joined 3 environment events', icon: '🌍', earned: true, date: 'Aug 3, 2025' },
    { id: 5, name: 'Knowledge Sharer', desc: 'Joined 3 education events', icon: '📚', earned: true, date: 'Sep 14, 2025' },
    { id: 6, name: 'First Responder', desc: 'Joined a healthcare event', icon: '🏥', earned: true, date: 'Nov 22, 2025' },
    { id: 7, name: 'Streak Master', desc: 'Volunteered 4 weeks in a row', icon: '🔥', earned: true, date: 'Jan 5, 2026' },
    { id: 8, name: 'Rising Star', desc: 'Impact score above 70', icon: '⭐', earned: true, date: 'Feb 10, 2026' },
    { id: 9, name: 'Marathon', desc: 'Logged 200+ hours', icon: '🏃', earned: false, progress: 186, goal: 200 },
    { id: 10, name: 'Community Pillar', desc: 'Joined 30 events', icon: '🏛️', earned: false, progress: 23, goal: 30 },
    { id: 11, name: 'All-Rounder', desc: 'Contribute to 5 different causes', icon: '🎯', earned: false, progress: 3, goal: 5 },
    { id: 12, name: 'Legend', desc: 'Logged 500+ hours', icon: '👑', earned: false, progress: 186, goal: 500 },
];

export default function BadgesPage() {
    const navigate = useNavigate();
    const earned = BADGES.filter(b => b.earned);
    const locked = BADGES.filter(b => !b.earned);

    return (
        <div className="badges-page">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="badges__header" {...fadeUp(0)}>
                <h1>My Badges</h1>
                <p>{earned.length} earned · {locked.length} to unlock</p>
            </motion.div>

            {/* Earned */}
            <motion.div className="badges__section" {...fadeUp(1)}>
                <h2><Trophy size={18} /> Earned</h2>
                <div className="badges-grid">
                    {earned.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            className="badge-card badge-card--earned"
                            {...fadeUp(i + 2)}
                            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                        >
                            <div className="badge-card__icon">{badge.icon}</div>
                            <div className="badge-card__name">{badge.name}</div>
                            <div className="badge-card__desc">{badge.desc}</div>
                            <div className="badge-card__date">{badge.date}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Locked */}
            <motion.div className="badges__section" {...fadeUp(2)}>
                <h2><Target size={18} /> In Progress</h2>
                <div className="badges-grid">
                    {locked.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            className="badge-card badge-card--locked"
                            {...fadeUp(i + 10)}
                            whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                        >
                            <div className="badge-card__icon badge-card__icon--locked">{badge.icon}</div>
                            <div className="badge-card__name">{badge.name}</div>
                            <div className="badge-card__desc">{badge.desc}</div>
                            <div className="badge-card__progress">
                                <div className="badge-progress-bar">
                                    <motion.div
                                        className="badge-progress-bar__fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(badge.progress / badge.goal) * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
                                    />
                                </div>
                                <span className="badge-card__progress-text">{badge.progress}/{badge.goal}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
