import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, Clock, CalendarDays, FileText, Check, Plus, ChevronDown
} from 'lucide-react';
import './LogHoursPage.css';

const RECENT_LOGS = [
    { id: 1, event: 'Clean River Drive', date: 'Feb 24, 2026', hours: 4, status: 'approved', org: 'Green Earth Foundation' },
    { id: 2, event: 'Teach India — Weekend School', date: 'Feb 22, 2026', hours: 3, status: 'approved', org: 'Vidya Foundation' },
    { id: 3, event: 'Tree Plantation Week', date: 'Feb 18, 2026', hours: 5, status: 'pending', org: 'Green Earth Foundation' },
    { id: 4, event: 'Digital Literacy Program', date: 'Feb 15, 2026', hours: 2, status: 'approved', org: 'TechBridge India' },
    { id: 5, event: 'Beach Cleanup Saturday', date: 'Feb 8, 2026', hours: 4, status: 'approved', org: 'Ocean Warriors' },
];

const MY_EVENTS = [
    'Clean River Drive', 'Teach India — Weekend School', 'Tree Plantation Week',
    'Digital Literacy Program', 'Beach Cleanup Saturday', 'Rural Health Camp',
];

export default function LogHoursPage() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState(RECENT_LOGS);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ event: '', date: '', hours: '', notes: '' });
    const [submitted, setSubmitted] = useState(false);

    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);
    const approvedHours = logs.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.hours, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newLog = {
            id: logs.length + 1,
            event: form.event, date: form.date, hours: Number(form.hours),
            status: 'pending', org: 'Event Org',
        };
        setLogs(prev => [newLog, ...prev]);
        setSubmitted(true);
        setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ event: '', date: '', hours: '', notes: '' }); }, 1500);
    };

    return (
        <div className="log-hours">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="log-hours__header" {...fadeUp(0)}>
                <div>
                    <h1>Log Hours</h1>
                    <p>Track your volunteer contributions and impact.</p>
                </div>
                <motion.button
                    className="log-hours__add-btn"
                    onClick={() => setShowForm(!showForm)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <Plus size={16} /> Log New Hours
                </motion.button>
            </motion.div>

            {/* Summary */}
            <div className="log-hours__summary">
                <motion.div className="hour-stat" {...fadeUp(1)}>
                    <Clock size={20} className="hour-stat__icon" />
                    <div className="hour-stat__value">{totalHours}</div>
                    <div className="hour-stat__label">Total Hours</div>
                </motion.div>
                <motion.div className="hour-stat" {...fadeUp(2)}>
                    <Check size={20} className="hour-stat__icon" />
                    <div className="hour-stat__value">{approvedHours}</div>
                    <div className="hour-stat__label">Approved</div>
                </motion.div>
                <motion.div className="hour-stat" {...fadeUp(3)}>
                    <CalendarDays size={20} className="hour-stat__icon" />
                    <div className="hour-stat__value">{logs.length}</div>
                    <div className="hour-stat__label">Entries</div>
                </motion.div>
            </div>

            {/* Log Form */}
            {showForm && (
                <motion.div
                    className="log-form-card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                >
                    {submitted ? (
                        <div className="log-form__success">
                            <div className="success-icon"><Check size={28} /></div>
                            <span>Hours logged!</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="log-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label"><CalendarDays size={14} /> Event</label>
                                    <select
                                        className="form-select" value={form.event}
                                        onChange={e => setForm({ ...form, event: e.target.value })} required
                                    >
                                        <option value="">Select event</option>
                                        {MY_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Clock size={14} /> Hours</label>
                                    <input
                                        type="number" className="form-input" placeholder="e.g. 4"
                                        value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })}
                                        required min="0.5" step="0.5"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label"><CalendarDays size={14} /> Date</label>
                                    <input
                                        type="date" className="form-input"
                                        value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FileText size={14} /> Notes (optional)</label>
                                    <input
                                        type="text" className="form-input" placeholder="What did you do?"
                                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="form-btn form-btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="form-btn form-btn--primary">
                                    <Check size={14} /> Submit
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            )}

            {/* Recent Logs */}
            <motion.div className="log-hours__list-section" {...fadeUp(4)}>
                <h2>Recent Entries</h2>
                <div className="log-list">
                    {logs.map((log, i) => (
                        <motion.div key={log.id} className="log-item" {...fadeUp(i + 5)}>
                            <div className="log-item__info">
                                <div className="log-item__event">{log.event}</div>
                                <div className="log-item__meta">{log.org} · {log.date}</div>
                            </div>
                            <div className="log-item__hours">{log.hours}h</div>
                            <span className={`status-badge status-badge--${log.status}`}>{log.status}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
