import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, slideInLeft } from '../../hooks/useAnimations';
import {
    ArrowLeft, Users, Mail, Shield, Search, Plus,
    MoreHorizontal, UserPlus, UserMinus, Star, Check, X
} from 'lucide-react';
import './ManageTeamPage.css';

const TEAM_MEMBERS = [
    { id: 1, name: 'Aarav Patel', role: 'Admin', email: 'aarav@greenearth.org', avatar: '🧑‍💼', hours: 240, joined: 'Jan 2024', status: 'active' },
    { id: 2, name: 'Meera Singh', role: 'Coordinator', email: 'meera@greenearth.org', avatar: '👩‍🔬', hours: 186, joined: 'Mar 2024', status: 'active' },
    { id: 3, name: 'Rahul Kumar', role: 'Volunteer Lead', email: 'rahul@greenearth.org', avatar: '👨‍🏫', hours: 154, joined: 'Jun 2024', status: 'active' },
    { id: 4, name: 'Priya Sharma', role: 'Event Manager', email: 'priya@greenearth.org', avatar: '👩‍💻', hours: 128, joined: 'Aug 2024', status: 'active' },
    { id: 5, name: 'Vikram Joshi', role: 'Field Volunteer', email: 'vikram@greenearth.org', avatar: '🧑‍🌾', hours: 92, joined: 'Oct 2024', status: 'inactive' },
];

const ROLES = ['Admin', 'Coordinator', 'Volunteer Lead', 'Event Manager', 'Field Volunteer'];

export default function ManageTeamPage() {
    const navigate = useNavigate();
    const [members, setMembers] = useState(TEAM_MEMBERS);
    const [search, setSearch] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('');
    const [inviteSent, setInviteSent] = useState(false);

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleInvite = (e) => {
        e.preventDefault();
        setInviteSent(true);
        setTimeout(() => { setShowInvite(false); setInviteSent(false); setInviteEmail(''); setInviteRole(''); }, 1500);
    };

    const toggleMemberStatus = (id) => {
        setMembers(prev => prev.map(m =>
            m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
        ));
    };

    return (
        <div className="manage-team">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="manage-team__header" {...fadeUp(0)}>
                <div>
                    <h1>Manage Team</h1>
                    <p>{members.filter(m => m.status === 'active').length} active members · {members.length} total</p>
                </div>
                <motion.button
                    className="invite-btn"
                    onClick={() => setShowInvite(true)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <UserPlus size={16} /> Invite Member
                </motion.button>
            </motion.div>

            {/* Search */}
            <motion.div className="team-search" {...fadeUp(1)}>
                <Search size={18} className="team-search__icon" />
                <input
                    type="text" placeholder="Search members..."
                    value={search} onChange={e => setSearch(e.target.value)}
                />
            </motion.div>

            {/* Members List */}
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
                            <div className="team-card__name">
                                {member.name}
                                {member.role === 'Admin' && <Star size={12} className="team-card__star" />}
                            </div>
                            <div className="team-card__role">{member.role}</div>
                            <div className="team-card__meta">
                                <span><Mail size={11} /> {member.email}</span>
                                <span>{member.hours}h logged</span>
                                <span>Joined {member.joined}</span>
                            </div>
                        </div>
                        <div className="team-card__actions">
                            <span className={`member-status member-status--${member.status}`}>
                                {member.status}
                            </span>
                            <button
                                className="team-card__toggle"
                                onClick={() => toggleMemberStatus(member.id)}
                                title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                                {member.status === 'active' ? <UserMinus size={15} /> : <UserPlus size={15} />}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInvite && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowInvite(false)}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {inviteSent ? (
                                <div className="modal-success">
                                    <div className="success-icon"><Check size={32} /></div>
                                    <h3>Invite Sent!</h3>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-card__header">
                                        <h3>Invite Team Member</h3>
                                        <button className="modal-close" onClick={() => setShowInvite(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleInvite} className="modal-form">
                                        <div className="form-group">
                                            <label className="form-label"><Mail size={14} /> Email</label>
                                            <input
                                                type="email" className="form-input"
                                                placeholder="colleague@org.com"
                                                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><Shield size={14} /> Role</label>
                                            <select
                                                className="form-select" value={inviteRole}
                                                onChange={e => setInviteRole(e.target.value)} required
                                            >
                                                <option value="">Select role</option>
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" className="form-btn form-btn--ghost" onClick={() => setShowInvite(false)}>Cancel</button>
                                            <button type="submit" className="form-btn form-btn--primary">
                                                <UserPlus size={14} /> Send Invite
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
