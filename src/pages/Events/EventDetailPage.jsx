import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EVENTS } from '../../data/events';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import { useState } from 'react';
import {
    ArrowLeft, CalendarDays, Clock, MapPin, Users, IndianRupee,
    Tag, ArrowUpRight, Check, Heart, Share2, X,
    TrendingUp, CheckCircle, Lightbulb, HandHeart, ClipboardList
} from 'lucide-react';
import './EventDetailPage.css';

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role;

    const event = EVENTS.find(e => e.id === Number(id));
    const [joined, setJoined] = useState(false);
    const [showFund, setShowFund] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [funded, setFunded] = useState(false);

    if (!event) {
        return (
            <div className="event-detail">
                <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                    <ArrowLeft size={18} /> Back
                </motion.button>
                <div className="event-detail__empty">
                    <h2>Event not found</h2>
                    <p>This event may have been removed or doesn't exist.</p>
                </div>
            </div>
        );
    }

    const filledPct = Math.round(event.filled / event.spots * 100);
    const fundPct = Math.round(event.fundRaised / event.fundGoal * 100);

    const handleJoin = () => {
        setJoined(true);
    };

    const handleFund = (e) => {
        e.preventDefault();
        setFunded(true);
        setTimeout(() => { setShowFund(false); setFunded(false); setFundAmount(''); }, 2000);
    };

    return (
        <div className="event-detail">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <div className="event-detail__layout">
                {/* Main content */}
                <motion.div className="event-detail__main" {...fadeUp(1)}>
                    <div className="event-detail__emoji">{event.image}</div>

                    <div className="event-detail__tags">
                        <span className={`event-tag event-tag--${event.status}`}>
                            {event.status === 'full' ? 'Full' : event.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                        </span>
                        <span className="event-tag event-tag--cause"><Tag size={10} /> {event.cause}</span>
                    </div>

                    <h1>{event.title}</h1>
                    <p className="event-detail__org">by {event.orgName}</p>

                    <div className="event-detail__meta-grid">
                        <div className="meta-item">
                            <CalendarDays size={16} />
                            <div><span className="meta-label">Date</span><span className="meta-value">{event.date}</span></div>
                        </div>
                        <div className="meta-item">
                            <Clock size={16} />
                            <div><span className="meta-label">Time</span><span className="meta-value">{event.time}</span></div>
                        </div>
                        <div className="meta-item">
                            <MapPin size={16} />
                            <div><span className="meta-label">Location</span><span className="meta-value">{event.location}</span></div>
                        </div>
                        <div className="meta-item">
                            <Users size={16} />
                            <div><span className="meta-label">Volunteers</span><span className="meta-value">{event.filled}/{event.spots}</span></div>
                        </div>
                    </div>

                    {/* Volunteer progress */}
                    <div className="event-detail__progress-section">
                        <h3>Volunteer Spots</h3>
                        <div className="detail-progress">
                            <div className="detail-progress__header">
                                <span>{event.filled}/{event.spots} filled</span>
                                <span>{filledPct}%</span>
                            </div>
                            <div className="progress-bar progress-bar--lg">
                                <motion.div
                                    className="progress-bar__fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${filledPct}%` }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Funding progress */}
                    <div className="event-detail__progress-section">
                        <h3>Funding</h3>
                        <div className="detail-progress">
                            <div className="detail-progress__header">
                                <span><IndianRupee size={12} /> ₹{(event.fundRaised / 1000).toFixed(0)}k / ₹{(event.fundGoal / 1000).toFixed(0)}k</span>
                                <span>{fundPct}%</span>
                            </div>
                            <div className="progress-bar progress-bar--lg progress-bar--fund">
                                <motion.div
                                    className="progress-bar__fill progress-bar__fill--fund"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${fundPct}%` }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.4 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <motion.div className="event-detail__content-section" {...fadeUp(3)}>
                        <h3><ClipboardList size={16} /> About This Event</h3>
                        <p>{event.description}</p>
                    </motion.div>

                    {/* Purpose */}
                    <motion.div className="event-detail__content-section event-detail__purpose" {...fadeUp(4)}>
                        <h3><Lightbulb size={16} /> Why We're Doing This</h3>
                        <p>{event.purpose}</p>
                    </motion.div>

                    {/* Impact Stats */}
                    {event.impactStats && (
                        <motion.div className="event-detail__content-section" {...fadeUp(5)}>
                            <h3><TrendingUp size={16} /> Key Impact Numbers</h3>
                            <div className="event-impact-stats">
                                {event.impactStats.map((s, i) => (
                                    <motion.div
                                        key={s.label}
                                        className="event-impact-stat"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                    >
                                        <div className="event-impact-stat__value">{s.value}</div>
                                        <div className="event-impact-stat__label">{s.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Society Impact */}
                    <motion.div className="event-detail__content-section event-detail__society" {...fadeUp(6)}>
                        <h3><HandHeart size={16} /> How It Helps Society</h3>
                        <p>{event.societyImpact}</p>
                    </motion.div>

                    {/* Highlights & Volunteer Role */}
                    <motion.div className="event-detail__content-section" {...fadeUp(7)}>
                        <h3><CheckCircle size={16} /> What You'll Be Doing</h3>
                        {event.highlights && (
                            <ul className="event-highlights">
                                {event.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        )}
                        {event.volunteerRole && (
                            <div className="event-volunteer-role">
                                <strong>Your Role:</strong> {event.volunteerRole}
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Sidebar actions */}
                <motion.div className="event-detail__sidebar" {...fadeUp(2)}>
                    <div className="sidebar-actions">
                        {role === 'volunteer' && !joined && event.status !== 'full' && (
                            <motion.button
                                className="detail-btn detail-btn--primary"
                                onClick={handleJoin}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Heart size={16} /> Join Event
                            </motion.button>
                        )}
                        {role === 'volunteer' && joined && (
                            <div className="detail-joined">
                                <Check size={18} /> You've joined!
                            </div>
                        )}
                        {role === 'volunteer' && event.status === 'full' && !joined && (
                            <button className="detail-btn detail-btn--disabled" disabled>
                                Event Full
                            </button>
                        )}

                        {role === 'sponsor' && event.fundRaised < event.fundGoal && (
                            <motion.button
                                className="detail-btn detail-btn--primary"
                                onClick={() => setShowFund(true)}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <IndianRupee size={16} /> Fund This Project
                            </motion.button>
                        )}

                        {role === 'ngo' && (
                            <motion.button
                                className="detail-btn detail-btn--secondary"
                                onClick={() => navigate('/app/ngo/create-event')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Edit Event
                            </motion.button>
                        )}

                        <button className="detail-btn detail-btn--ghost">
                            <Share2 size={15} /> Share
                        </button>
                    </div>

                    <div className="sidebar-info">
                        <h4>Organizer</h4>
                        <p>{event.orgName}</p>
                    </div>
                </motion.div>
            </div>

            {/* Fund modal */}
            <AnimatePresence>
                {showFund && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => { setShowFund(false); setFunded(false); }}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {funded ? (
                                <div className="modal-success">
                                    <div className="success-icon"><Check size={32} /></div>
                                    <h3>Funded!</h3>
                                    <p>₹{Number(fundAmount).toLocaleString()} donated to {event.title}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-card__header">
                                        <h3>Fund "{event.title}"</h3>
                                        <button className="modal-close" onClick={() => setShowFund(false)}><X size={18} /></button>
                                    </div>
                                    <form onSubmit={handleFund} className="modal-form">
                                        <div className="form-group">
                                            <label className="form-label"><IndianRupee size={14} /> Amount (₹)</label>
                                            <input
                                                type="number" className="form-input" placeholder="e.g. 10000"
                                                value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                                required min="100"
                                            />
                                        </div>
                                        <div className="fund-presets">
                                            {[1000, 5000, 10000, 25000].map(amt => (
                                                <button
                                                    key={amt} type="button"
                                                    className={`fund-preset ${fundAmount === String(amt) ? 'fund-preset--active' : ''}`}
                                                    onClick={() => setFundAmount(String(amt))}
                                                >₹{(amt / 1000)}k</button>
                                            ))}
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" className="form-btn form-btn--ghost" onClick={() => setShowFund(false)}>Cancel</button>
                                            <button type="submit" className="form-btn form-btn--primary">Confirm</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
