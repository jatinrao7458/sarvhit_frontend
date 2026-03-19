import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, CalendarDays, Users, IndianRupee, MapPin,
    Star, ChevronRight, Clock, CheckCircle2
} from 'lucide-react';
import './HostedEventsPage.css';

const HOSTED_EVENTS = [
    {
        id: 'evt-1',
        name: 'Tree Plantation Week',
        date: 'Feb 10 – 16, 2026',
        location: 'Gurugram, Haryana',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80',
        status: 'completed',
        volunteers: 67,
        funds: 148000,
        rating: 4.8,
        category: 'Environment',
    },
    {
        id: 'evt-2',
        name: 'Digital Literacy Camp',
        date: 'Jan 20 – 25, 2026',
        location: 'Dwarka, New Delhi',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
        status: 'completed',
        volunteers: 35,
        funds: 120000,
        rating: 4.6,
        category: 'Education',
    },
    {
        id: 'evt-3',
        name: 'Clean River Drive',
        date: 'Dec 5, 2025',
        location: 'Yamuna Ghat, Delhi',
        image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&q=80',
        status: 'completed',
        volunteers: 32,
        funds: 62000,
        rating: 4.9,
        category: 'Environment',
    },
    {
        id: 'evt-4',
        name: 'Beach Cleanup Saturday',
        date: 'Nov 15, 2025',
        location: 'Juhu Beach, Mumbai',
        image: 'https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=600&q=80',
        status: 'completed',
        volunteers: 60,
        funds: 30000,
        rating: 4.5,
        category: 'Environment',
    },
    {
        id: 'evt-5',
        name: 'Rural Health Camp',
        date: 'Oct 8 – 10, 2025',
        location: 'Ajmer, Rajasthan',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
        status: 'completed',
        volunteers: 44,
        funds: 95000,
        rating: 4.7,
        category: 'Healthcare',
    },
    {
        id: 'evt-6',
        name: 'Women Empowerment Workshop',
        date: 'Sep 20, 2025',
        location: 'Jaipur, Rajasthan',
        image: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=600&q=80',
        status: 'completed',
        volunteers: 28,
        funds: 45000,
        rating: 4.4,
        category: 'Community',
    },
];

export default function HostedEventsPage() {
    const navigate = useNavigate();

    const totalVolunteers = HOSTED_EVENTS.reduce((s, e) => s + e.volunteers, 0);
    const totalFunds = HOSTED_EVENTS.reduce((s, e) => s + e.funds, 0);
    const avgRating = (HOSTED_EVENTS.reduce((s, e) => s + e.rating, 0) / HOSTED_EVENTS.length).toFixed(1);

    return (
        <div className="hosted-events">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="hosted-events__header" {...fadeUp(0)}>
                <div>
                    <h1>Events Hosted</h1>
                    <p>All events organized by your NGO with performance reports.</p>
                </div>
            </motion.div>

            {/* Summary strip */}
            <div className="hosted-events__summary">
                {[
                    { label: 'Total Events', value: HOSTED_EVENTS.length, icon: CalendarDays },
                    { label: 'Volunteers', value: totalVolunteers, icon: Users },
                    { label: 'Funds Used', value: `₹${(totalFunds / 1000).toFixed(0)}k`, icon: IndianRupee },
                    { label: 'Avg Rating', value: avgRating, icon: Star },
                ].map((s, i) => (
                    <motion.div className="hosted-summary-card" key={s.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}>
                        <s.icon size={18} className="hosted-summary-card__icon" />
                        <span className="hosted-summary-card__value">{s.value}</span>
                        <span className="hosted-summary-card__label">{s.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Event cards */}
            <div className="hosted-events__list">
                {HOSTED_EVENTS.map((event, i) => (
                    <motion.div
                        className="hosted-event-card"
                        key={event.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 240, damping: 22 }}
                        onClick={() => navigate(`/app/ngo/event-report/${event.id}`)}
                    >
                        <div className="hosted-event-card__img">
                            <img src={event.image} alt={event.name} loading="lazy" />
                            <span className="hosted-event-card__category">{event.category}</span>
                        </div>
                        <div className="hosted-event-card__body">
                            <h3 className="hosted-event-card__name">{event.name}</h3>
                            <div className="hosted-event-card__meta">
                                <span><CalendarDays size={13} /> {event.date}</span>
                                <span><MapPin size={13} /> {event.location}</span>
                            </div>
                            <div className="hosted-event-card__stats">
                                <span><Users size={13} /> {event.volunteers} volunteers</span>
                                <span><IndianRupee size={13} /> ₹{(event.funds / 1000).toFixed(0)}k raised</span>
                                <span><Star size={13} /> {event.rating}</span>
                            </div>
                            <div className="hosted-event-card__footer">
                                <span className="hosted-event-card__status">
                                    <CheckCircle2 size={13} /> {event.status}
                                </span>
                                <span className="hosted-event-card__cta">
                                    View Report <ChevronRight size={14} />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
