import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, CalendarDays, MapPin, Users, IndianRupee,
    Star, ChevronRight, CheckCircle2, Clock, Search,
    Award, Briefcase
} from 'lucide-react';
import './MyEventsPage.css';

/* ── Role-specific dummy data ── */
const NGO_EVENTS = [
    { id: 'ne-1', name: 'Tree Plantation Week', date: 'Feb 10 – 16, 2026', location: 'Gurugram, Haryana', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', volunteers: 67, funds: 148000, rating: 4.8, category: 'Environment', status: 'completed' },
    { id: 'ne-2', name: 'Digital Literacy Camp', date: 'Jan 20 – 25, 2026', location: 'Dwarka, New Delhi', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', volunteers: 35, funds: 120000, rating: 4.6, category: 'Education', status: 'completed' },
    { id: 'ne-3', name: 'Clean River Drive', date: 'Dec 5, 2025', location: 'Yamuna Ghat, Delhi', image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&q=80', volunteers: 32, funds: 62000, rating: 4.9, category: 'Environment', status: 'completed' },
    { id: 'ne-4', name: 'Beach Cleanup Saturday', date: 'Nov 15, 2025', location: 'Juhu Beach, Mumbai', image: 'https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=600&q=80', volunteers: 60, funds: 30000, rating: 4.5, category: 'Environment', status: 'completed' },
    { id: 'ne-5', name: 'Rural Health Camp', date: 'Oct 8 – 10, 2025', location: 'Ajmer, Rajasthan', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', volunteers: 44, funds: 95000, rating: 4.7, category: 'Healthcare', status: 'completed' },
];

const VOLUNTEER_EVENTS = [
    { id: 've-1', name: 'Tree Plantation Week', date: 'Feb 10 – 16, 2026', location: 'Gurugram, Haryana', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', ngoName: 'Green Earth Foundation', hoursLogged: 22, rating: 4.8, category: 'Environment', role: 'Zone Volunteer', status: 'completed' },
    { id: 've-2', name: 'Clean River Drive', date: 'Dec 5, 2025', location: 'Yamuna Ghat, Delhi', image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&q=80', ngoName: 'Green Earth Foundation', hoursLogged: 8, rating: 4.9, category: 'Environment', role: 'First Aid', status: 'completed' },
    { id: 've-3', name: 'Digital Literacy Camp', date: 'Jan 20 – 25, 2026', location: 'Dwarka, New Delhi', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', ngoName: 'Tech for All', hoursLogged: 18, rating: 4.6, category: 'Education', role: 'Lead Trainer', status: 'completed' },
    { id: 've-4', name: 'Rural Health Camp', date: 'Oct 8 – 10, 2025', location: 'Ajmer, Rajasthan', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', ngoName: 'HealthAid India', hoursLogged: 14, rating: 4.7, category: 'Healthcare', role: 'Medical Volunteer', status: 'completed' },
    { id: 've-5', name: 'Beach Cleanup Saturday', date: 'Nov 15, 2025', location: 'Juhu Beach, Mumbai', image: 'https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=600&q=80', ngoName: 'Ocean Warriors', hoursLogged: 6, rating: 4.5, category: 'Environment', role: 'Volunteer', status: 'completed' },
];

const SPONSOR_EVENTS = [
    { id: 'se-1', name: 'Tree Plantation Week', date: 'Feb 10 – 16, 2026', location: 'Gurugram, Haryana', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', ngoName: 'Green Earth Foundation', amountFunded: 50000, impact: '5,600 saplings planted', category: 'Environment', status: 'completed' },
    { id: 'se-2', name: 'Digital Literacy Camp', date: 'Jan 20 – 25, 2026', location: 'Dwarka, New Delhi', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', ngoName: 'Tech for All', amountFunded: 40000, impact: '142 students trained', category: 'Education', status: 'completed' },
    { id: 'se-3', name: 'Rural Health Camp', date: 'Oct 8 – 10, 2025', location: 'Ajmer, Rajasthan', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', ngoName: 'HealthAid India', amountFunded: 35000, impact: '280 patients treated', category: 'Healthcare', status: 'completed' },
    { id: 'se-4', name: 'Women Empowerment Workshop', date: 'Sep 20, 2025', location: 'Jaipur, Rajasthan', image: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=600&q=80', ngoName: 'Shakti Foundation', amountFunded: 25000, impact: '60 women trained', category: 'Community', status: 'completed' },
];

export default function MyEventsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role || 'ngo';
    const [search, setSearch] = useState('');

    const events = role === 'ngo' ? NGO_EVENTS
        : role === 'volunteer' ? VOLUNTEER_EVENTS
        : SPONSOR_EVENTS;

    const filtered = events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
    );

    const pageTitle = role === 'ngo' ? 'Events Hosted' : role === 'volunteer' ? 'Events Participated' : 'Events Funded';
    const pageDesc = role === 'ngo' ? 'All events organized by your NGO.'
        : role === 'volunteer' ? 'Events you volunteered for.'
        : 'Events you have funded.';

    /* Summary stats */
    const summaryStats = role === 'ngo' ? [
        { label: 'Total Events', value: events.length, icon: CalendarDays },
        { label: 'Total Volunteers', value: events.reduce((s, e) => s + e.volunteers, 0), icon: Users },
        { label: 'Funds Raised', value: `₹${(events.reduce((s, e) => s + e.funds, 0) / 1000).toFixed(0)}k`, icon: IndianRupee },
        { label: 'Avg Rating', value: (events.reduce((s, e) => s + e.rating, 0) / events.length).toFixed(1), icon: Star },
    ] : role === 'volunteer' ? [
        { label: 'Events Joined', value: events.length, icon: CalendarDays },
        { label: 'Total Hours', value: events.reduce((s, e) => s + e.hoursLogged, 0), icon: Clock },
        { label: 'Avg Rating', value: (events.reduce((s, e) => s + e.rating, 0) / events.length).toFixed(1), icon: Star },
        { label: 'Roles Filled', value: new Set(events.map(e => e.role)).size, icon: Award },
    ] : [
        { label: 'Events Funded', value: events.length, icon: CalendarDays },
        { label: 'Total Funded', value: `₹${(events.reduce((s, e) => s + e.amountFunded, 0) / 1000).toFixed(0)}k`, icon: IndianRupee },
        { label: 'NGOs Supported', value: new Set(events.map(e => e.ngoName)).size, icon: Briefcase },
        { label: 'Categories', value: new Set(events.map(e => e.category)).size, icon: Star },
    ];

    return (
        <div className="my-events-page">
            <motion.button className="back-btn" onClick={() => navigate('/app/events')} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back to Events
            </motion.button>

            <motion.div className="my-events-page__header" {...fadeUp(0)}>
                <div>
                    <h1>{pageTitle}</h1>
                    <p>{pageDesc}</p>
                </div>
            </motion.div>

            {/* Summary strip */}
            <div className="my-events__summary">
                {summaryStats.map((s, i) => (
                    <motion.div className="my-events__summary-card" key={s.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}>
                        <s.icon size={18} className="my-events__summary-icon" />
                        <span className="my-events__summary-value">{s.value}</span>
                        <span className="my-events__summary-label">{s.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <motion.div className="my-events__search" {...fadeUp(1)}>
                <Search size={18} className="my-events__search-icon" />
                <input
                    type="text" placeholder="Search events..."
                    value={search} onChange={e => setSearch(e.target.value)}
                />
            </motion.div>

            {/* Event cards */}
            <div className="my-events__list">
                {filtered.map((event, i) => (
                    <motion.div
                        className="my-event-card"
                        key={event.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
                        onClick={() => {
                            if (role === 'ngo') navigate(`/app/ngo/event-report/${event.id.replace('ne-', 'evt-')}`);
                        }}
                    >
                        <div className="my-event-card__img">
                            <img src={event.image} alt={event.name} loading="lazy" />
                            <span className="my-event-card__category">{event.category}</span>
                        </div>
                        <div className="my-event-card__body">
                            <h3 className="my-event-card__name">{event.name}</h3>
                            <div className="my-event-card__meta">
                                <span><CalendarDays size={13} /> {event.date}</span>
                                <span><MapPin size={13} /> {event.location}</span>
                            </div>

                            {/* Role-specific info */}
                            <div className="my-event-card__stats">
                                {role === 'ngo' && (
                                    <>
                                        <span><Users size={13} /> {event.volunteers} volunteers</span>
                                        <span><IndianRupee size={13} /> ₹{(event.funds / 1000).toFixed(0)}k raised</span>
                                        <span><Star size={13} /> {event.rating}</span>
                                    </>
                                )}
                                {role === 'volunteer' && (
                                    <>
                                        <span><Clock size={13} /> {event.hoursLogged}h logged</span>
                                        <span><Award size={13} /> {event.role}</span>
                                        <span><Star size={13} /> {event.rating}</span>
                                        <span className="my-event-card__ngo">{event.ngoName}</span>
                                    </>
                                )}
                                {role === 'sponsor' && (
                                    <>
                                        <span><IndianRupee size={13} /> ₹{(event.amountFunded / 1000).toFixed(0)}k funded</span>
                                        <span className="my-event-card__impact">{event.impact}</span>
                                        <span className="my-event-card__ngo">{event.ngoName}</span>
                                    </>
                                )}
                            </div>

                            <div className="my-event-card__footer">
                                <span className="my-event-card__status">
                                    <CheckCircle2 size={13} /> {event.status}
                                </span>
                                {role === 'ngo' && (
                                    <span className="my-event-card__cta">
                                        View Report <ChevronRight size={14} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="my-events__empty">No events found.</div>
                )}
            </div>
        </div>
    );
}
