import { useParams, useNavigate } from 'react-router-dom';
import { ROLE_DATA } from '../../data/dashboard';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, CalendarDays, MapPin, Tag, TrendingUp,
    Clock, Share2, Heart
} from 'lucide-react';
import './ActivityDetailPage.css';

/* Flatten all activities from every role into a single lookup */
const ALL_ACTIVITIES = Object.values(ROLE_DATA).flatMap(r => r.activity);

export default function ActivityDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = ALL_ACTIVITIES.find(a => a.id === id);

    if (!item) {
        return (
            <div className="activity-detail">
                <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                    <ArrowLeft size={18} /> Back
                </motion.button>
                <motion.div className="activity-detail__empty" {...fadeUp(1)}>
                    <h2>Activity not found</h2>
                    <p>The activity you're looking for doesn't exist or has been removed.</p>
                </motion.div>
            </div>
        );
    }

    const d = item.detail;

    return (
        <div className="activity-detail">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            {/* Hero */}
            <motion.div className="activity-detail__hero" {...fadeUp(0)}>
                <img src={d.image} alt={d.title} className="activity-detail__hero-img" />
                <div className="activity-detail__hero-overlay">
                    <span className="activity-detail__category">{d.category}</span>
                    <h1>{d.title}</h1>
                    <div className="activity-detail__meta">
                        <span><CalendarDays size={14} /> {d.date}</span>
                        <span><MapPin size={14} /> {d.location}</span>
                        <span><Tag size={14} /> {item.type}</span>
                    </div>
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div className="activity-detail__actions" {...fadeUp(1)}>
                <span className="activity-detail__time"><Clock size={14} /> {item.time}</span>
                <div className="activity-detail__action-btns">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Heart size={16} /> Save
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Share2 size={16} /> Share
                    </motion.button>
                </div>
            </motion.div>

            {/* Description */}
            <motion.div className="activity-detail__section" {...fadeUp(2)}>
                <h2>About This Activity</h2>
                <p>{d.description}</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div className="activity-detail__section" {...fadeUp(3)}>
                <h2>Key Numbers</h2>
                <div className="activity-detail__stats">
                    {d.stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="activity-stat"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                        >
                            <div className="activity-stat__value">{s.value}</div>
                            <div className="activity-stat__label">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Impact */}
            <motion.div className="activity-detail__section activity-detail__impact" {...fadeUp(4)}>
                <h2><TrendingUp size={18} /> How It Helped</h2>
                <p>{d.impact}</p>
            </motion.div>

            {/* Timeline */}
            <motion.div className="activity-detail__section" {...fadeUp(5)}>
                <h2>Timeline</h2>
                <div className="activity-detail__timeline">
                    {d.timeline.map((t, i) => (
                        <motion.div
                            key={i}
                            className="timeline-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <div className="timeline-item__marker" />
                            <div className="timeline-item__content">
                                <span className="timeline-item__date">{t.date}</span>
                                <p>{t.event}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
