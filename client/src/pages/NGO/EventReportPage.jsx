import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, CalendarDays, MapPin, Users, IndianRupee,
    Star, Clock, CheckCircle2, AlertTriangle, Heart,
    TrendingUp, MessageSquare, ThumbsUp
} from 'lucide-react';
import './EventReportPage.css';

/* ── Dummy report data keyed by event id ── */
const REPORTS = {
    'evt-1': {
        name: 'Tree Plantation Week',
        date: 'Feb 10 – 16, 2026',
        location: 'Gurugram, Haryana',
        category: 'Environment',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
        status: 'completed',
        summary: 'A week-long campaign to plant 5,000 saplings across Gurugram. Volunteers worked in 8 designated zones, involving schools, corporate teams, and local communities. The event exceeded its target by 12%.',
        execution: {
            planned: '5,000 saplings across 8 zones',
            actual: '5,600 saplings planted (112% of target)',
            duration: '7 days (10 AM – 5 PM daily)',
            challenges: [
                'Heavy rainfall on Day 3 delayed planting by 4 hours',
                'Zone 5 had rocky soil — required additional tools',
                'Volunteer turnout dipped on weekdays (addressed with evening shifts)',
            ],
            highlights: [
                '3 local schools participated with 200+ students',
                'Corporate partners donated ₹48,000 in tools and supplies',
                'Geo-tagged every sapling for future monitoring',
            ],
        },
        funds: {
            total: 148000,
            breakdown: [
                { category: 'Saplings & Seeds', amount: 52000, pct: 35 },
                { category: 'Tools & Equipment', amount: 29600, pct: 20 },
                { category: 'Transportation', amount: 22200, pct: 15 },
                { category: 'Refreshments', amount: 14800, pct: 10 },
                { category: 'Marketing & Outreach', amount: 11840, pct: 8 },
                { category: 'Miscellaneous', amount: 17560, pct: 12 },
            ],
        },
        volunteers: {
            total: 67,
            hoursLogged: 536,
            topContributors: [
                { name: 'Ananya Patel', hours: 28, role: 'Zone Lead', avatar: 'AP' },
                { name: 'Vikram Singh', hours: 24, role: 'Logistics Head', avatar: 'VS' },
                { name: 'Priya Sharma', hours: 22, role: 'Volunteer', avatar: 'PS' },
                { name: 'Rahul Verma', hours: 20, role: 'First Aid', avatar: 'RV' },
                { name: 'Sneha Gupta', hours: 18, role: 'Volunteer', avatar: 'SG' },
            ],
        },
        rating: 4.8,
        feedback: [
            { name: 'Ananya Patel', avatar: 'AP', rating: 5, comment: 'Incredibly well-organized event! The zone-based approach made it easy to manage large groups. Would love to see a follow-up monitoring drive.', date: 'Feb 17, 2026' },
            { name: 'Vikram Singh', avatar: 'VS', rating: 5, comment: 'Logistics ran smoothly despite the rain on Day 3. The backup plan was executed perfectly. Great leadership by the core team.', date: 'Feb 17, 2026' },
            { name: 'Priya Sharma', avatar: 'PS', rating: 4, comment: 'Really enjoyed planting trees with the school kids! Only suggestion — provide more shade/tents for afternoon sessions, it got quite hot.', date: 'Feb 18, 2026' },
            { name: 'Rahul Verma', avatar: 'RV', rating: 5, comment: 'Glad I could help with first aid. Only 2 minor incidents — both handled quickly. The safety briefing at the start was very helpful.', date: 'Feb 18, 2026' },
            { name: 'Sneha Gupta', avatar: 'SG', rating: 4, comment: 'My first volunteering experience and it was amazing! The team was so welcoming. I just wish we had more water stations in Zone 7.', date: 'Feb 19, 2026' },
            { name: 'Arjun Kumar', avatar: 'AK', rating: 5, comment: 'The geo-tagging system was brilliant! Love that we can track our trees. Felt like real impact, not just a one-day thing.', date: 'Feb 19, 2026' },
        ],
    },
    'evt-2': {
        name: 'Digital Literacy Camp',
        date: 'Jan 20 – 25, 2026',
        location: 'Dwarka, New Delhi',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
        status: 'completed',
        summary: 'A 6-day intensive program teaching basic computer skills, internet safety, and email to 150 underprivileged children across 3 community centers in Dwarka.',
        execution: {
            planned: '150 students across 3 centers',
            actual: '142 students completed the program (95% retention)',
            duration: '6 days (10 AM – 4 PM)',
            challenges: [
                'Power outages at Center 2 on Day 2 and Day 4',
                'Some students had no prior exposure to keyboards',
                'Language barrier with a few students — addressed with bilingual educators',
            ],
            highlights: [
                '92% of students passed the final assessment',
                '18 students expressed interest in advanced coding classes',
                'Partnership with TechBridge India provided 30 refurbished laptops',
            ],
        },
        funds: {
            total: 120000,
            breakdown: [
                { category: 'Equipment & Laptops', amount: 42000, pct: 35 },
                { category: 'Trainer Fees', amount: 30000, pct: 25 },
                { category: 'Venue & Power', amount: 18000, pct: 15 },
                { category: 'Study Materials', amount: 12000, pct: 10 },
                { category: 'Refreshments', amount: 9600, pct: 8 },
                { category: 'Certificates & Misc', amount: 8400, pct: 7 },
            ],
        },
        volunteers: {
            total: 35,
            hoursLogged: 280,
            topContributors: [
                { name: 'Meera Joshi', hours: 24, role: 'Lead Trainer', avatar: 'MJ' },
                { name: 'Amit Sinha', hours: 22, role: 'Tech Support', avatar: 'AS' },
                { name: 'Riya Das', hours: 20, role: 'Educator', avatar: 'RD' },
                { name: 'Karan Mehta', hours: 18, role: 'Mentor', avatar: 'KM' },
                { name: 'Deepa Nair', hours: 16, role: 'Coordinator', avatar: 'DN' },
            ],
        },
        rating: 4.6,
        feedback: [
            { name: 'Meera Joshi', avatar: 'MJ', rating: 5, comment: 'Teaching these kids was incredibly rewarding. Their eagerness to learn made every power outage worth enduring! 🙌', date: 'Jan 26, 2026' },
            { name: 'Amit Sinha', avatar: 'AS', rating: 4, comment: 'Good event overall. Would recommend having a dedicated IT support person per center. I was running between two.', date: 'Jan 27, 2026' },
            { name: 'Riya Das', avatar: 'RD', rating: 5, comment: 'The bilingual approach really worked! Students were much more engaged once we switched to Hindi explanations.', date: 'Jan 27, 2026' },
            { name: 'Karan Mehta', avatar: 'KM', rating: 4, comment: 'Great initiative. Suggestion: extend the program to 10 days next time — the kids need more practice time.', date: 'Jan 28, 2026' },
        ],
    },
};

/* Fallback report for ids without specific data */
const DEFAULT_REPORT = {
    name: 'Event Report',
    date: '2025',
    location: 'India',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    status: 'completed',
    summary: 'This event was successfully completed. A detailed report is being prepared.',
    execution: {
        planned: 'As per event plan',
        actual: 'Completed successfully',
        duration: 'Multiple days',
        challenges: ['Minor logistical delays'],
        highlights: ['Strong community participation', 'Positive volunteer feedback'],
    },
    funds: {
        total: 50000,
        breakdown: [
            { category: 'Operations', amount: 20000, pct: 40 },
            { category: 'Materials', amount: 15000, pct: 30 },
            { category: 'Transportation', amount: 10000, pct: 20 },
            { category: 'Miscellaneous', amount: 5000, pct: 10 },
        ],
    },
    volunteers: {
        total: 30,
        hoursLogged: 180,
        topContributors: [
            { name: 'Volunteer 1', hours: 18, role: 'Lead', avatar: 'V1' },
            { name: 'Volunteer 2', hours: 14, role: 'Support', avatar: 'V2' },
            { name: 'Volunteer 3', hours: 12, role: 'Support', avatar: 'V3' },
        ],
    },
    rating: 4.5,
    feedback: [
        { name: 'Volunteer', avatar: 'VL', rating: 5, comment: 'Great event! Well organized and impactful.', date: '2025' },
        { name: 'Participant', avatar: 'PT', rating: 4, comment: 'Would love to see more events like this in the future.', date: '2025' },
    ],
};

export default function EventReportPage() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const report = REPORTS[eventId] || DEFAULT_REPORT;
    const maxFund = Math.max(...report.funds.breakdown.map(f => f.amount));

    return (
        <div className="event-report">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back to Events
            </motion.button>

            {/* Hero */}
            <motion.div className="event-report__hero" {...fadeUp(0)}>
                <img src={report.image} alt={report.name} />
                <div className="event-report__hero-overlay">
                    <span className="event-report__category">{report.category}</span>
                    <h1>{report.name}</h1>
                    <div className="event-report__hero-meta">
                        <span><CalendarDays size={14} /> {report.date}</span>
                        <span><MapPin size={14} /> {report.location}</span>
                        <span><Star size={14} /> {report.rating} / 5</span>
                    </div>
                </div>
            </motion.div>

            {/* Summary */}
            <motion.div className="report-section" {...fadeUp(1)}>
                <h2>📋 Event Summary</h2>
                <p className="report-section__text">{report.summary}</p>
            </motion.div>

            {/* How it went */}
            <motion.div className="report-section" {...fadeUp(2)}>
                <h2>🚀 How the Event Was Executed</h2>
                <div className="report-execution">
                    <div className="report-exec-row">
                        <div className="report-exec-card">
                            <span className="report-exec-card__label">Planned Target</span>
                            <span className="report-exec-card__value">{report.execution.planned}</span>
                        </div>
                        <div className="report-exec-card report-exec-card--accent">
                            <span className="report-exec-card__label">Actual Result</span>
                            <span className="report-exec-card__value">{report.execution.actual}</span>
                        </div>
                        <div className="report-exec-card">
                            <span className="report-exec-card__label"><Clock size={14} /> Duration</span>
                            <span className="report-exec-card__value">{report.execution.duration}</span>
                        </div>
                    </div>

                    <div className="report-exec-lists">
                        <div className="report-exec-list">
                            <h3><AlertTriangle size={15} /> Challenges Faced</h3>
                            <ul>
                                {report.execution.challenges.map((c, i) => (
                                    <li key={i}>{c}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="report-exec-list report-exec-list--highlights">
                            <h3><Star size={15} /> Highlights</h3>
                            <ul>
                                {report.execution.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Fund Usage */}
            <motion.div className="report-section" {...fadeUp(3)}>
                <h2><IndianRupee size={18} /> Fund Usage — ₹{(report.funds.total / 1000).toFixed(0)}k Total</h2>
                <div className="report-funds">
                    {report.funds.breakdown.map((f, i) => (
                        <div className="report-fund-row" key={f.category}>
                            <div className="report-fund-row__info">
                                <span className="report-fund-row__name">{f.category}</span>
                                <span className="report-fund-row__amount">₹{(f.amount / 1000).toFixed(0)}k ({f.pct}%)</span>
                            </div>
                            <div className="report-fund-row__bar-bg">
                                <motion.div
                                    className="report-fund-row__bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.pct}%` }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Volunteer Contributions */}
            <motion.div className="report-section" {...fadeUp(4)}>
                <h2><Users size={18} /> Volunteer Contributions</h2>
                <div className="report-vol-summary">
                    <div className="report-vol-stat">
                        <Users size={18} />
                        <span className="report-vol-stat__value">{report.volunteers.total}</span>
                        <span className="report-vol-stat__label">Total Volunteers</span>
                    </div>
                    <div className="report-vol-stat">
                        <Clock size={18} />
                        <span className="report-vol-stat__value">{report.volunteers.hoursLogged}</span>
                        <span className="report-vol-stat__label">Total Hours</span>
                    </div>
                    <div className="report-vol-stat">
                        <TrendingUp size={18} />
                        <span className="report-vol-stat__value">{(report.volunteers.hoursLogged / report.volunteers.total).toFixed(1)}h</span>
                        <span className="report-vol-stat__label">Avg per Person</span>
                    </div>
                </div>

                <h3 className="report-subsection-title">Top Contributors</h3>
                <div className="report-contributors">
                    {report.volunteers.topContributors.map((v, i) => (
                        <motion.div className="report-contributor" key={v.name}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 250, damping: 22 }}>
                            <div className="report-contributor__avatar">{v.avatar}</div>
                            <div className="report-contributor__info">
                                <span className="report-contributor__name">{v.name}</span>
                                <span className="report-contributor__role">{v.role}</span>
                            </div>
                            <span className="report-contributor__hours">{v.hours}h</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Volunteer Feedback */}
            <motion.div className="report-section" {...fadeUp(5)}>
                <h2><MessageSquare size={18} /> Volunteer Feedback</h2>
                <div className="report-feedback-list">
                    {report.feedback.map((fb, i) => (
                        <motion.div className="report-feedback" key={fb.name + i}
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 240, damping: 22 }}>
                            <div className="report-feedback__header">
                                <div className="report-feedback__avatar">{fb.avatar}</div>
                                <div className="report-feedback__author">
                                    <span className="report-feedback__name">{fb.name}</span>
                                    <span className="report-feedback__date">{fb.date}</span>
                                </div>
                                <div className="report-feedback__rating">
                                    {Array.from({ length: 5 }, (_, j) => (
                                        <Star key={j} size={13}
                                            fill={j < fb.rating ? 'hsl(38, 92%, 50%)' : 'none'}
                                            color={j < fb.rating ? 'hsl(38, 92%, 50%)' : 'var(--text-muted)'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="report-feedback__comment">{fb.comment}</p>
                            <div className="report-feedback__actions">
                                <button className="report-feedback__action">
                                    <ThumbsUp size={13} /> Helpful
                                </button>
                                <button className="report-feedback__action">
                                    <Heart size={13} /> Thank
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
