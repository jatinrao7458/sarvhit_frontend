import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ENTITIES } from '../../data/discover';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import { useState } from 'react';
import {
    ArrowLeft, MapPin, Star, Users, Clock, Mail, Heart,
    CalendarDays, Calendar, ArrowUpRight, Check, Send, IndianRupee,
    Briefcase, Tag, Building2, Award, Folder
} from 'lucide-react';
import './DiscoverDetailPage.css';

export default function DiscoverDetailPage() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role;

    const allItems = [...(ENTITIES.ngos || []), ...(ENTITIES.volunteers || []), ...(ENTITIES.sponsors || [])];
    const item = allItems.find(i => i.id === Number(id));

    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [messageSent, setMessageSent] = useState(false);

    if (!item) {
        return (
            <div className="discover-detail">
                <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                    <ArrowLeft size={18} /> Back
                </motion.button>
                <div className="discover-detail__empty">
                    <h2>Not found</h2>
                    <p>This profile may have been removed.</p>
                </div>
            </div>
        );
    }

    const handleConnect = () => setConnected(true);
    const handleSendMessage = (e) => {
        e.preventDefault();
        setMessageSent(true);
        setTimeout(() => { setMessageSent(false); setMessage(''); }, 2000);
    };

    const getActionLabel = () => {
        if (role === 'ngo' && item.type === 'volunteer') return 'Invite to Event';
        if (role === 'ngo' && item.type === 'sponsor') return 'Reach Out';
        if (role === 'volunteer') return 'Follow';
        return 'Connect';
    };

    const getRoleLabel = () => {
        if (item.type === 'ngo') return '🏛️ Non-Profit Organization';
        if (item.type === 'volunteer') return '🤝 Volunteer';
        return '💎 Sponsor';
    };

    return (
        <div className="discover-detail">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            {/* Cover + Avatar */}
            <motion.div className="pub-profile-cover" {...fadeUp(0)}>
                <div className="pub-profile-cover__gradient" />
                <div className="pub-profile-avatar">
                    <span className="pub-profile-avatar__emoji">{item.icon}</span>
                </div>
            </motion.div>

            {/* Info */}
            <motion.div className="pub-profile-info" {...fadeUp(1)}>
                <h1>{item.name}</h1>
                <span className="pub-profile-role-tag">{getRoleLabel()}</span>
                {item.bio && <p className="pub-profile-bio">{item.bio}</p>}

                <div className="pub-profile-meta">
                    {item.email && <span><Mail size={14} /> {item.email}</span>}
                    <span><MapPin size={14} /> {item.location}</span>
                    {item.type === 'ngo' && item.founded && <span><Calendar size={14} /> Founded {item.founded}</span>}
                </div>
            </motion.div>

            <div className="pub-profile-layout">
                {/* Main content */}
                <div className="pub-profile-main">
                    {/* Stats row */}
                    <motion.div className="pub-profile-stats" {...fadeUp(2)}>
                        {item.type === 'ngo' && (
                            <>
                                <div className="pub-stat">
                                    <CalendarDays size={18} />
                                    <span className="pub-stat__value">{item.eventsHosted}</span>
                                    <span className="pub-stat__label">Events Hosted</span>
                                </div>
                                <div className="pub-stat">
                                    <Users size={18} />
                                    <span className="pub-stat__value">{item.volunteersConnected}</span>
                                    <span className="pub-stat__label">Volunteers</span>
                                </div>
                                <div className="pub-stat">
                                    <IndianRupee size={18} />
                                    <span className="pub-stat__value">₹{(item.fundsReceived / 1000).toFixed(0)}k</span>
                                    <span className="pub-stat__label">Funds Received</span>
                                </div>
                                <div className="pub-stat">
                                    <Star size={18} />
                                    <span className="pub-stat__value">{item.rating}</span>
                                    <span className="pub-stat__label">Rating</span>
                                </div>
                            </>
                        )}
                        {item.type === 'volunteer' && (
                            <>
                                <div className="pub-stat">
                                    <Clock size={18} />
                                    <span className="pub-stat__value">{item.hoursLogged}</span>
                                    <span className="pub-stat__label">Hours Logged</span>
                                </div>
                                <div className="pub-stat">
                                    <CalendarDays size={18} />
                                    <span className="pub-stat__value">{item.eventsJoined}</span>
                                    <span className="pub-stat__label">Events Joined</span>
                                </div>
                                <div className="pub-stat">
                                    <Award size={18} />
                                    <span className="pub-stat__value">{item.badgesEarned}</span>
                                    <span className="pub-stat__label">Badges Earned</span>
                                </div>
                            </>
                        )}
                        {item.type === 'sponsor' && (
                            <>
                                <div className="pub-stat">
                                    <IndianRupee size={18} />
                                    <span className="pub-stat__value">₹{(item.totalDonated / 1000).toFixed(0)}k</span>
                                    <span className="pub-stat__label">Total Donated</span>
                                </div>
                                <div className="pub-stat">
                                    <Briefcase size={18} />
                                    <span className="pub-stat__value">{item.projectsFunded}</span>
                                    <span className="pub-stat__label">Projects Funded</span>
                                </div>
                                <div className="pub-stat">
                                    <Star size={18} />
                                    <span className="pub-stat__value">{item.impactScore}</span>
                                    <span className="pub-stat__label">Impact Score</span>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Skills / Causes / Sectors */}
                    <motion.div className="pub-profile-section" {...fadeUp(3)}>
                        <h2>
                            {item.type === 'ngo' ? <><Building2 size={16} /> Focus Areas</> :
                                item.type === 'volunteer' ? <><Tag size={16} /> Skills</> :
                                    <><Building2 size={16} /> Focus Sectors</>}
                        </h2>
                        <div className="pub-profile-tags">
                            {item.type === 'ngo' && item.causes?.map(c => <span key={c} className="pub-tag">{c}</span>)}
                            {item.type === 'volunteer' && item.skills?.map(s => <span key={s} className="pub-tag">{s}</span>)}
                            {item.type === 'sponsor' && item.sectors?.map(s => <span key={s} className="pub-tag">{s}</span>)}
                        </div>
                    </motion.div>

                    {/* About — for NGOs */}
                    {item.type === 'ngo' && item.bio && (
                        <motion.div className="pub-profile-section" {...fadeUp(3.5)}>
                            <h2><Building2 size={16} /> About</h2>
                            <p className="pub-about-text">
                                {item.bio} We work with local communities to create sustainable change through grassroots action and partnerships.
                            </p>
                        </motion.div>
                    )}

                    {/* Posts & Achievements */}
                    {item.posts && item.posts.length > 0 && (
                        <motion.div className="pub-profile-section" {...fadeUp(4)}>
                            <h2><Calendar size={16} /> Posts & Achievements</h2>
                            <div className="pub-posts">
                                {item.posts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        className={`pub-post pub-post--${post.type}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <div className="pub-post__header">
                                            <span className={`pub-post__badge pub-post__badge--${post.type}`}>
                                                {post.type === 'event' ? '📅 Event' : post.type === 'achievement' ? '🏆 Achievement' : '📜 Certification'}
                                            </span>
                                            <span className="pub-post__date">{post.date}</span>
                                        </div>
                                        <h3 className="pub-post__title">{post.title}</h3>
                                        <p className="pub-post__desc">{post.desc}</p>
                                        <div className="pub-post__tags">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="pub-post__tag">{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Actions sidebar */}
                <motion.div className="pub-profile-sidebar" {...fadeUp(2)}>
                    <div className="pub-sidebar-card">
                        {!connected ? (
                            <motion.button
                                className="pub-action-btn pub-action-btn--primary"
                                onClick={handleConnect}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Heart size={16} /> {getActionLabel()}
                            </motion.button>
                        ) : (
                            <div className="pub-connected">
                                <Check size={18} /> Connected!
                            </div>
                        )}
                    </div>

                    {/* Quick message */}
                    <div className="pub-sidebar-card">
                        <h4><Mail size={14} /> Send a Message</h4>
                        {messageSent ? (
                            <div className="pub-message-sent">
                                <Check size={16} /> Message sent!
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage}>
                                <textarea
                                    className="pub-message-input"
                                    placeholder={`Write to ${item.name}...`}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={3}
                                    required
                                />
                                <motion.button
                                    type="submit"
                                    className="pub-send-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Send size={14} /> Send
                                </motion.button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
