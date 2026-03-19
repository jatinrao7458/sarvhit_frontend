import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import {
    ArrowLeft, CalendarDays, MapPin, Clock, Users, IndianRupee,
    Tag, Image, FileText, ChevronDown, Plus, X, Check
} from 'lucide-react';
import './CreateEventPage.css';

const CAUSES = ['Environment', 'Education', 'Healthcare', 'Community', 'Animal Welfare', 'Disaster Relief'];

export default function CreateEventPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '', description: '', cause: '', date: '', time: '',
        location: '', spots: '', fundGoal: '', image: '🌍', orgName: user?.firstName + ' ' + user?.lastName,
        purpose: '', societyImpact: '', volunteerRole: '', highlights: [], impactStats: []
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const EMOJIS = ['🌍', '🏞️', '📚', '🏥', '🌳', '💻', '🏖️', '🎨', '🤝', '🎯'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login again.');
                setLoading(false);
                return;
            }

            const eventData = {
                ...form,
                spots: parseInt(form.spots),
                fundGoal: parseInt(form.fundGoal) || 0,
            };

            console.log('Creating event with data:', eventData);
            console.log('Using token:', token.substring(0, 20) + '...');
            
            const response = await eventService.createEvent(eventData, token);
            console.log('Event created successfully:', response);
            setSubmitted(true);
            setTimeout(() => navigate('/app/events'), 1800);
        } catch (err) {
            console.error('Error creating event:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                response: err.response
            });
            
            // Better error messaging
            let errorMsg = err.message;
            if (err.message.includes('Failed to fetch')) {
                errorMsg = 'Cannot connect to server. Make sure the backend is running on port 5005.';
            } else if (err.message.includes('Invalid token')) {
                errorMsg = 'Authentication failed. Please login again.';
            }
            
            setError(errorMsg);
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="create-event">
                <motion.div
                    className="create-event__success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="success-icon">
                        <Check size={40} />
                    </div>
                    <h2>Event Created Successfully! 🎉</h2>
                    <p>Your event is now live. Volunteers and sponsors can discover and join it.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="create-event">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="create-event__header" {...fadeUp(0)}>
                <h1>Create Event</h1>
                <p>Set up a new event for volunteers to discover and join.</p>
            </motion.div>

            <motion.form className="create-event__form" onSubmit={handleSubmit} {...fadeUp(1)}>
                {/* Emoji Picker */}
                <div className="form-section">
                    <label className="form-label">Event Icon</label>
                    <div className="emoji-picker">
                        {EMOJIS.map(e => (
                            <button
                                key={e} type="button"
                                className={`emoji-btn ${form.image === e ? 'emoji-btn--active' : ''}`}
                                onClick={() => update('image', e)}
                            >{e}</button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div className="form-group">
                    <label className="form-label"><FileText size={14} /> Event Title</label>
                    <input
                        type="text" className="form-input" placeholder="e.g. Clean River Drive"
                        value={form.title} onChange={e => update('title', e.target.value)} required
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label"><FileText size={14} /> Description</label>
                    <textarea
                        className="form-textarea" placeholder="Tell volunteers what this event is about..."
                        rows={4} value={form.description} onChange={e => update('description', e.target.value)}
                    />
                </div>

                {/* Two-column row */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label"><Tag size={14} /> Cause</label>
                        <select
                            className="form-select" value={form.cause}
                            onChange={e => update('cause', e.target.value)} required
                        >
                            <option value="">Select cause</option>
                            {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label"><Users size={14} /> Volunteer Spots</label>
                        <input
                            type="number" className="form-input" placeholder="e.g. 50"
                            value={form.spots} onChange={e => update('spots', e.target.value)} required min="1"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label"><CalendarDays size={14} /> Date</label>
                        <input
                            type="date" className="form-input"
                            value={form.date} onChange={e => update('date', e.target.value)} required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label"><Clock size={14} /> Time</label>
                        <input
                            type="time" className="form-input"
                            value={form.time} onChange={e => update('time', e.target.value)} required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label"><MapPin size={14} /> Location</label>
                        <input
                            type="text" className="form-input" placeholder="e.g. Yamuna Ghat, Delhi"
                            value={form.location} onChange={e => update('location', e.target.value)} required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label"><IndianRupee size={14} /> Funding Goal (₹)</label>
                        <input
                            type="number" className="form-input" placeholder="e.g. 80000"
                            value={form.fundGoal} onChange={e => update('fundGoal', e.target.value)} min="0"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="form-btn form-btn--ghost" onClick={() => navigate(-1)} disabled={loading}>
                        Cancel
                    </button>
                    <motion.button
                        type="submit" className="form-btn form-btn--primary"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        <Plus size={16} /> {loading ? 'Publishing...' : 'Publish Event'}
                    </motion.button>
                </div>
                {error && (
                    <motion.div
                        className="form-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <X size={16} /> {error}
                    </motion.div>
                )}
            </motion.form>
        </div>
    );
}
