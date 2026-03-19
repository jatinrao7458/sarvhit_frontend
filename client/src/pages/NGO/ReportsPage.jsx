import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, TrendingUp, Users, CalendarDays, IndianRupee,
    Download, LineChart, PieChart, ArrowUpRight
} from 'lucide-react';
import './ReportsPage.css';

const MONTHLY_DATA = [
    { month: 'Oct', events: 3, volunteers: 45, funds: 32000 },
    { month: 'Nov', events: 5, volunteers: 62, funds: 48000 },
    { month: 'Dec', events: 4, volunteers: 51, funds: 41000 },
    { month: 'Jan', events: 6, volunteers: 78, funds: 55000 },
    { month: 'Feb', events: 7, volunteers: 89, funds: 69000 },
];

const TOP_EVENTS = [
    { name: 'Clean River Drive', volunteers: 32, funds: '₹62,000', status: 'active' },
    { name: 'Tree Plantation Week', volunteers: 67, funds: '₹1,48,000', status: 'active' },
    { name: 'Digital Literacy Program', volunteers: 35, funds: '₹1,20,000', status: 'ongoing' },
    { name: 'Beach Cleanup Saturday', volunteers: 60, funds: '₹30,000', status: 'completed' },
];

const maxFund = Math.max(...MONTHLY_DATA.map(d => d.funds));
const minFund = Math.min(...MONTHLY_DATA.map(d => d.funds));

export default function ReportsPage() {
    const navigate = useNavigate();

    /* ── Line chart geometry ── */
    const chartW = 500, chartH = 200, padX = 40, padY = 30;
    const plotW = chartW - padX * 2;
    const plotH = chartH - padY * 2;

    const points = MONTHLY_DATA.map((d, i) => ({
        x: padX + (i / (MONTHLY_DATA.length - 1)) * plotW,
        y: padY + plotH - ((d.funds - minFund) / (maxFund - minFund)) * plotH,
        ...d,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${padY + plotH} L${points[0].x},${padY + plotH} Z`;

    /* horizontal grid lines (4 lines) */
    const gridLines = Array.from({ length: 4 }, (_, i) => {
        const ratio = i / 3;
        return {
            y: padY + plotH - ratio * plotH,
            label: `₹${Math.round((minFund + ratio * (maxFund - minFund)) / 1000)}k`,
        };
    });

    return (
        <div className="reports-page">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="reports__header" {...fadeUp(0)}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Track your org's performance and impact over time.</p>
                </div>
                <motion.button
                    className="reports__export-btn"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <Download size={16} /> Export CSV
                </motion.button>
            </motion.div>

            {/* Summary Cards */}
            <div className="reports__summary">
                {[
                    { label: 'Total Events', value: '47', icon: CalendarDays, change: '+12 this quarter' },
                    { label: 'Volunteers Reached', value: '312', icon: Users, change: '+89 this month' },
                    { label: 'Funds Received', value: '₹2,45,000', icon: IndianRupee, change: '+₹69k this month' },
                    { label: 'Impact Score', value: '87', icon: TrendingUp, change: '+5 pts' },
                ].map((item, i) => (
                    <motion.div key={item.label} className="report-stat" {...fadeUp(i + 1)}>
                        <div className="report-stat__icon"><item.icon size={20} /></div>
                        <div className="report-stat__value">{item.value}</div>
                        <div className="report-stat__label">{item.label}</div>
                        <div className="report-stat__change">{item.change}</div>
                    </motion.div>
                ))}
            </div>

            {/* Line Chart Section */}
            <motion.div className="reports__chart-section" {...fadeUp(5)}>
                <h2><LineChart size={18} /> Monthly Funds Received</h2>
                <div className="line-chart-wrap">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="reportAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Grid */}
                        {gridLines.map((g, i) => (
                            <g key={i}>
                                <line x1={padX} y1={g.y} x2={chartW - padX} y2={g.y} stroke="var(--border-subtle)" strokeDasharray="4 4" />
                                <text x={padX - 6} y={g.y + 4} textAnchor="end" className="line-chart__grid-label">{g.label}</text>
                            </g>
                        ))}

                        {/* Area fill */}
                        <motion.path
                            d={areaPath}
                            fill="url(#reportAreaGrad)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        />

                        {/* Line */}
                        <motion.path
                            d={linePath}
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                        />

                        {/* Data points & labels */}
                        {points.map((p, i) => (
                            <g key={p.month} className="line-chart__point-group">
                                <motion.circle
                                    cx={p.x} cy={p.y} r="5"
                                    fill="var(--bg-secondary)"
                                    stroke="var(--accent)"
                                    strokeWidth="2.5"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                                />
                                <text x={p.x} y={p.y - 12} textAnchor="middle" className="line-chart__value">
                                    ₹{(p.funds / 1000).toFixed(0)}k
                                </text>
                                <text x={p.x} y={padY + plotH + 18} textAnchor="middle" className="line-chart__label">
                                    {p.month}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </motion.div>

            {/* Top Events Table */}
            <motion.div className="reports__table-section" {...fadeUp(6)}>
                <h2><PieChart size={18} /> Top Events</h2>
                <div className="reports-table">
                    <div className="reports-table__head">
                        <span>Event</span><span>Volunteers</span><span>Funds</span><span>Status</span>
                    </div>
                    {TOP_EVENTS.map((ev, i) => (
                        <motion.div key={ev.name} className="reports-table__row" {...fadeUp(i + 7)}>
                            <span className="reports-table__name">{ev.name}</span>
                            <span>{ev.volunteers}</span>
                            <span>{ev.funds}</span>
                            <span className={`status-badge status-badge--${ev.status}`}>{ev.status}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
