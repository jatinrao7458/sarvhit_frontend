import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import { useState, useEffect } from 'react';
import eventService from '../../services/eventService';
import {
    ArrowLeft, CalendarDays, Clock, MapPin, Users, IndianRupee,
    Tag, ArrowUpRight, Check, Heart, Share2, X,
    TrendingUp, CheckCircle, Lightbulb, HandHeart, ClipboardList, Loader
} from 'lucide-react';
import './EventDetailPage.css';

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.userType;
    const token = localStorage.getItem('token');

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null); // null | 'pending' | 'joined' | 'loading'
    const [showFund, setShowFund] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [funded, setFunded] = useState(false);
    const [fundSubmitting, setFundSubmitting] = useState(false);
    const [fundError, setFundError] = useState('');

    // Fetch event from API
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await eventService.getEventById(id);
                const ev = response.event;
                setEvent(ev);

                // Check if current user is already in the volunteer list
                if (user && ev.volunteers) {
                    const myEntry = ev.volunteers.find(
                        v => (v.volunteerId?._id || v.volunteerId) === user._id
                    );
                    if (myEntry) {
                        setJoinStatus(myEntry.status); // 'pending' or 'joined'
                    }
                }
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, user]);

    if (loading) {
        return (
            <div className="event-detail">
                <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                    <ArrowLeft size={18} /> Back
                </motion.button>
                <div className="event-detail__empty">
                    <Loader size={24} className="spinning" />
                    <p>Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="event-detail">
                <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                    <ArrowLeft size={18} /> Back
                </motion.button>
                <div className="event-detail__empty">
                    <h2>Event not found</h2>
                    <p>{error || "This event may have been removed or doesn't exist."}</p>
                </div>
            </div>
        );
    }

    const safeFilled = Number(event.filled || 0);
    const safeSpots = Number(event.spots || 0);
    const safeFundRaised = Number(event.fundRaised || 0);
    const safeFundGoal = Number(event.fundGoal || 0);
    const filledPct = safeSpots > 0 ? Math.round((safeFilled / safeSpots) * 100) : 0;
    const fundPctRaw = safeFundGoal > 0 ? Math.round((safeFundRaised / safeFundGoal) * 100) : 0;
    const fundPct = Math.max(0, Math.min(100, fundPctRaw));

    const handleJoin = async () => {
        if (!token) return;
        setJoinStatus('loading');
        try {
            await eventService.joinEventAsVolunteer(id, token);
            setJoinStatus('pending');
        } catch (err) {
            console.error('Error joining event:', err);
            setJoinStatus(null);
        }
    };

    const handleFund = async (e) => {
        e.preventDefault();
        if (!token) {
            setFundError('Please log in again to fund this event.');
            return;
        }

        const amount = Number(fundAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setFundError('Please enter a valid funding amount.');
            return;
        }

        try {
            setFundSubmitting(true);
            setFundError('');

            const response = await eventService.fundEvent(id, amount, token);
            if (!response?.success || !response?.event) {
                throw new Error(response?.message || 'Failed to fund event');
            }

            setEvent(response.event);
            setFunded(true);
            setTimeout(() => {
                setShowFund(false);
                setFunded(false);
                setFundAmount('');
            }, 2000);
        } catch (err) {
            setFundError(err.message || 'Failed to fund event. Please try again.');
        } finally {
            setFundSubmitting(false);
        }
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
                            {event.filled >= event.spots ? 'Full' : event.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
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
                                <span><IndianRupee size={12} /> ₹{(safeFundRaised / 1000).toFixed(0)}k / ₹{(safeFundGoal / 1000).toFixed(0)}k</span>
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
                    {event.purpose && (
                        <motion.div className="event-detail__content-section event-detail__purpose" {...fadeUp(4)}>
                            <h3><Lightbulb size={16} /> Why We're Doing This</h3>
                            <p>{event.purpose}</p>
                        </motion.div>
                    )}

                    {/* Impact Stats */}
                    {event.impactStats && event.impactStats.length > 0 && (
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
                    {event.societyImpact && (
                        <motion.div className="event-detail__content-section event-detail__society" {...fadeUp(6)}>
                            <h3><HandHeart size={16} /> How It Helps Society</h3>
                            <p>{event.societyImpact}</p>
                        </motion.div>
                    )}

                    {/* Highlights & Volunteer Role */}
                    <motion.div className="event-detail__content-section" {...fadeUp(7)}>
                        <h3><CheckCircle size={16} /> What You'll Be Doing</h3>
                        {event.highlights && event.highlights.length > 0 && (
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
                        {/* Volunteer: Join / Pending / Joined / Full */}
                        {role === 'volunteer' && !joinStatus && event.filled < event.spots && (
                            <motion.button
                                className="detail-btn detail-btn--primary"
                                onClick={handleJoin}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Heart size={16} /> Join Event
                            </motion.button>
                        )}
                        {role === 'volunteer' && joinStatus === 'loading' && (
                            <div className="detail-pending">
                                <Loader size={18} className="spinning" /> Sending request...
                            </div>
                        )}
                        {role === 'volunteer' && joinStatus === 'pending' && (
                            <div className="detail-pending">
                                <Clock size={18} /> Pending Approval ⏳
                            </div>
                        )}
                        {role === 'volunteer' && joinStatus === 'joined' && (
                            <div className="detail-joined">
                                <Check size={18} /> You've joined!
                            </div>
                        )}
                        {role === 'volunteer' && event.filled >= event.spots && !joinStatus && (
                            <button className="detail-btn detail-btn--disabled" disabled>
                                Event Full
                            </button>
                        )}

                        {role === 'sponsor' && safeFundRaised < safeFundGoal && (
                            <motion.button
                                className="detail-btn detail-btn--primary"
                                onClick={() => {
                                    setFundError('');
                                    setShowFund(true);
                                }}
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

                    {/* Approved Volunteers List */}
                    {event.volunteers && event.volunteers.filter(v => v.status === 'joined').length > 0 && (
                        <div className="sidebar-info">
                            <h4>Volunteers ({event.volunteers.filter(v => v.status === 'joined').length})</h4>
                            <div className="volunteer-list">
                                {event.volunteers
                                    .filter(v => v.status === 'joined')
                                    .map(v => (
                                        <div key={v.volunteerId?._id || v.volunteerId} className="volunteer-list__item">
                                            <div className="volunteer-list__avatar">
                                                {(v.volunteerId?.firstName || '?')[0]}
                                            </div>
                                            <span>{v.volunteerId?.firstName} {v.volunteerId?.lastName}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
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
                                        <button
                                            className="modal-close"
                                            onClick={() => {
                                                setShowFund(false);
                                                setFundError('');
                                            }}
                                        ><X size={18} /></button>
                                    </div>
                                    <form onSubmit={handleFund} className="modal-form">
                                        <div className="form-group">
                                            <label className="form-label"><IndianRupee size={14} /> Amount (₹)</label>
                                            <input
                                                type="number" className="form-input" placeholder="e.g. 10000"
                                                value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                                required min="100"
                                                disabled={fundSubmitting}
                                            />
                                        </div>
                                        <div className="fund-presets">
                                            {[1000, 5000, 10000, 25000].map(amt => (
                                                <button
                                                    key={amt} type="button"
                                                    className={`fund-preset ${fundAmount === String(amt) ? 'fund-preset--active' : ''}`}
                                                    onClick={() => setFundAmount(String(amt))}
                                                    disabled={fundSubmitting}
                                                >₹{(amt / 1000)}k</button>
                                            ))}
                                        </div>
                                        {fundError && (
                                            <p className="form-help-text" style={{ color: '#ef4444', margin: 0 }}>
                                                {fundError}
                                            </p>
                                        )}
                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="form-btn form-btn--ghost"
                                                onClick={() => {
                                                    setShowFund(false);
                                                    setFundError('');
                                                }}
                                                disabled={fundSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="form-btn form-btn--primary" disabled={fundSubmitting}>
                                                {fundSubmitting ? 'Funding...' : 'Confirm'}
                                            </button>
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
