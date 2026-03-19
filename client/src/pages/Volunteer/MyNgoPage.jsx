import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, Users, Mail, Search, Star, Clock,
    CalendarClock, Check, X, Building2
} from 'lucide-react';
import './MyNgoPage.css';

const NGO_INFO = {
    name: 'Green Earth Foundation',
    logo: '🌿',
    mission: 'Working towards a sustainable future through community-driven environmental and social initiatives.',
    location: 'New Delhi, India',
    founded: '2019',
    totalMembers: 42,
};

const FELLOW_VOLUNTEERS = [
    { id: 1, name: 'Ananya Patel', role: 'Zone Lead', email: 'ananya@greenearth.org', avatar: '👩‍💼', hours: 280, joined: 'Feb 2024', status: 'active', skills: ['Event Planning', 'First Aid'] },
    { id: 2, name: 'Vikram Singh', role: 'Logistics Head', email: 'vikram@greenearth.org', avatar: '👨‍🔧', hours: 240, joined: 'Mar 2024', status: 'active', skills: ['Transport', 'Supply Chain'] },
    { id: 3, name: 'Priya Sharma', role: 'Educator', email: 'priya@greenearth.org', avatar: '👩‍🏫', hours: 186, joined: 'May 2024', status: 'active', skills: ['Teaching', 'Digital Literacy'] },
    { id: 4, name: 'Rahul Verma', role: 'First Aid Lead', email: 'rahul@greenearth.org', avatar: '👨‍⚕️', hours: 154, joined: 'Jun 2024', status: 'active', skills: ['First Aid', 'Emergency Response'] },
    { id: 5, name: 'Sneha Gupta', role: 'Volunteer', email: 'sneha@greenearth.org', avatar: '👩‍🎨', hours: 128, joined: 'Aug 2024', status: 'active', skills: ['Design', 'Photography'] },
    { id: 6, name: 'Arjun Kumar', role: 'Tech Support', email: 'arjun@greenearth.org', avatar: '👨‍💻', hours: 92, joined: 'Oct 2024', status: 'active', skills: ['Tech', 'Data Entry'] },
    { id: 7, name: 'Deepa Nair', role: 'Coordinator', email: 'deepa@greenearth.org', avatar: '👩‍🔬', hours: 76, joined: 'Nov 2024', status: 'inactive', skills: ['Coordination', 'Communication'] },
];

export default function MyNgoPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [scheduleMember, setScheduleMember] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', agenda: '' });
    const [scheduleSent, setScheduleSent] = useState(false);

    const filtered = FELLOW_VOLUNTEERS.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.role.toLowerCase().includes(search.toLowerCase()) ||
        v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSchedule = (e) => {
        e.preventDefault();
        setScheduleSent(true);
        setTimeout(() => {
            setScheduleMember(null);
            setScheduleSent(false);
            setScheduleForm({ date: '', time: '', agenda: '' });
        }, 1800);
    };

    return (
        <div className="my-ngo">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            {/* NGO header */}
            <motion.div className="my-ngo__header" {...fadeUp(0)}>
                <div className="my-ngo__header-info">
                    <span className="my-ngo__logo">{NGO_INFO.logo}</span>
                    <div>
                        <h1>{NGO_INFO.name}</h1>
                        <p className="my-ngo__mission">{NGO_INFO.mission}</p>
                    </div>
                </div>
                <motion.button
                    className="schedule-header-btn"
                    onClick={() => setScheduleMember({ name: 'Team', avatar: '📅', role: 'All Members' })}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <CalendarClock size={16} /> Schedule a Meeting
                </motion.button>
            </motion.div>

            {/* NGO Stats */}
            <div className="my-ngo__stats">
                {[
                    { label: 'Total Members', value: NGO_INFO.totalMembers, icon: Users },
                    { label: 'Founded', value: NGO_INFO.founded, icon: Building2 },
                    { label: 'Active', value: FELLOW_VOLUNTEERS.filter(v => v.status === 'active').length, icon: Check },
                ].map((s, i) => (
                    <motion.div className="my-ngo__stat" key={s.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}>
                        <s.icon size={18} className="my-ngo__stat-icon" />
                        <span className="my-ngo__stat-value">{s.value}</span>
                        <span className="my-ngo__stat-label">{s.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <motion.div className="team-search" {...fadeUp(1)}>
                <Search size={18} className="team-search__icon" />
                <input
                    type="text" placeholder="Search volunteers by name, role, skill..."
                    value={search} onChange={e => setSearch(e.target.value)}
                />
            </motion.div>

            {/* Volunteers list */}
            <h2 className="my-ngo__section-title">Fellow Volunteers ({filtered.length})</h2>
            <div className="team-list">
                {filtered.map((member, i) => (
                    <motion.div
                        key={member.id}
                        className={`team-card ${member.status === 'inactive' ? 'team-card--inactive' : ''}`}
                        {...fadeUp(i + 2)}
                        whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                    >
                        <div className="team-card__avatar">{member.avatar}</div>
                        <div className="team-card__info">
                            <div className="team-card__name">{member.name}</div>
                            <div className="team-card__role">{member.role}</div>
                            <div className="team-card__meta">
                                <span><Mail size={11} /> {member.email}</span>
                                <span><Clock size={11} /> {member.hours}h logged</span>
                                <span>Joined {member.joined}</span>
                            </div>
                            <div className="my-ngo__skills">
                                {member.skills.map(s => (
                                    <span className="my-ngo__skill" key={s}>{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="team-card__actions">
                            <button
                                className="team-card__schedule"
                                onClick={() => setScheduleMember(member)}
                                title="Schedule a meeting"
                            >
                                <CalendarClock size={14} /> Schedule
                            </button>
                            <span className={`member-status member-status--${member.status}`}>
                                {member.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Schedule Meeting Modal */}
            <AnimatePresence>
                {scheduleMember && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => { setScheduleMember(null); setScheduleSent(false); setScheduleForm({ date: '', time: '', agenda: '' }); }}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {scheduleSent ? (
                                <div className="modal-success">
                                    <div className="success-icon"><Check size={32} /></div>
                                    <h3>Meeting Scheduled!</h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        {scheduleMember.name} will receive a meeting invite.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-card__header">
                                        <h3>Schedule a Meeting</h3>
                                        <button className="modal-close" onClick={() => setScheduleMember(null)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="schedule-member-preview">
                                        <span className="schedule-member-preview__avatar">{scheduleMember.avatar}</span>
                                        <div>
                                            <div className="schedule-member-preview__name">{scheduleMember.name}</div>
                                            <div className="schedule-member-preview__role">{scheduleMember.role}</div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSchedule} className="modal-form">
                                        <div className="form-group">
                                            <label className="form-label"><CalendarClock size={14} /> Date</label>
                                            <input
                                                type="date" className="form-input"
                                                value={scheduleForm.date}
                                                onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><CalendarClock size={14} /> Time</label>
                                            <input
                                                type="time" className="form-input"
                                                value={scheduleForm.time}
                                                onChange={e => setScheduleForm(p => ({ ...p, time: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Agenda (optional)</label>
                                            <textarea
                                                className="form-input form-textarea"
                                                placeholder="What's this meeting about?"
                                                rows={3}
                                                value={scheduleForm.agenda}
                                                onChange={e => setScheduleForm(p => ({ ...p, agenda: e.target.value }))}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" className="form-btn form-btn--ghost" onClick={() => setScheduleMember(null)}>Cancel</button>
                                            <button type="submit" className="form-btn form-btn--primary">
                                                <CalendarClock size={14} /> Schedule
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
