import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, TrendingUp, IndianRupee, Users, Folder,
    LineChart, PieChart, Download, ArrowUpRight, MapPin
} from 'lucide-react';
import './ImpactReportPage.css';

const FUNDED_PROJECTS = [
    { name: 'Clean River Drive', org: 'Green Earth Foundation', donated: 50000, beneficiaries: 200, status: 'active', icon: '🏞️' },
    { name: 'Tree Plantation Week', org: 'Green Earth Foundation', donated: 150000, beneficiaries: 800, status: 'active', icon: '🌳' },
    { name: 'Digital Literacy Program', org: 'TechBridge India', donated: 200000, beneficiaries: 500, status: 'completed', icon: '💻' },
    { name: 'Rural Health Camp', org: 'Swasthya Sewa', donated: 100000, beneficiaries: 350, status: 'active', icon: '🏥' },
    { name: 'Beach Cleanup Saturday', org: 'Ocean Warriors', donated: 30000, beneficiaries: 1200, status: 'completed', icon: '🏖️' },
];

const IMPACT_METRICS = [
    { label: 'Total Donated', value: '₹7,50,000', icon: IndianRupee, change: '+₹1.2L this quarter' },
    { label: 'Beneficiaries Reached', value: '3,050', icon: Users, change: '+420 this month' },
    { label: 'Projects Funded', value: '12', icon: Folder, change: '5 active' },
    { label: 'Impact Score', value: '94', icon: TrendingUp, change: 'Top 5%' },
];

const QUARTERLY_DONATION = [
    { quarter: 'Q1 25', amount: 120000 },
    { quarter: 'Q2 25', amount: 180000 },
    { quarter: 'Q3 25', amount: 150000 },
    { quarter: 'Q4 25', amount: 200000 },
    { quarter: 'Q1 26', amount: 100000 },
];

const maxAmt = Math.max(...QUARTERLY_DONATION.map(d => d.amount));
const minAmt = Math.min(...QUARTERLY_DONATION.map(d => d.amount));

export default function ImpactReportPage() {
    const navigate = useNavigate();

    /* ── Line chart geometry ── */
    const chartW = 500, chartH = 200, padX = 40, padY = 30;
    const plotW = chartW - padX * 2;
    const plotH = chartH - padY * 2;

    const points = QUARTERLY_DONATION.map((d, i) => ({
        x: padX + (i / (QUARTERLY_DONATION.length - 1)) * plotW,
        y: padY + plotH - ((d.amount - minAmt) / (maxAmt - minAmt)) * plotH,
        ...d,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${padY + plotH} L${points[0].x},${padY + plotH} Z`;

    const gridLines = Array.from({ length: 4 }, (_, i) => {
        const ratio = i / 3;
        return {
            y: padY + plotH - ratio * plotH,
            label: `₹${Math.round((minAmt + ratio * (maxAmt - minAmt)) / 1000)}k`,
        };
    });

    return (
        <div className="impact-report">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="impact-report__header" {...fadeUp(0)}>
                <div>
                    <h1>Impact Report</h1>
                    <p>See exactly where your funds go and the difference they make.</p>
                </div>
                <motion.button
                    className="impact-report__export"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <Download size={16} /> Download Report
                </motion.button>
            </motion.div>

            {/* Metrics */}
            <div className="impact-report__metrics">
                {IMPACT_METRICS.map((m, i) => (
                    <motion.div key={m.label} className="impact-metric" {...fadeUp(i + 1)}>
                        <div className="impact-metric__icon"><m.icon size={20} /></div>
                        <div className="impact-metric__value">{m.value}</div>
                        <div className="impact-metric__label">{m.label}</div>
                        <div className="impact-metric__change">{m.change}</div>
                    </motion.div>
                ))}
            </div>

            {/* Line Chart */}
            <motion.div className="impact-report__chart" {...fadeUp(5)}>
                <h2><LineChart size={18} /> Quarterly Donations</h2>
                <div className="line-chart-wrap">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="impactAreaGrad" x1="0" y1="0" x2="0" y2="1">
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
                            fill="url(#impactAreaGrad)"
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
                            <g key={p.quarter} className="line-chart__point-group">
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
                                    ₹{(p.amount / 1000).toFixed(0)}k
                                </text>
                                <text x={p.x} y={padY + plotH + 18} textAnchor="middle" className="line-chart__label">
                                    {p.quarter}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </motion.div>

            {/* Funded Projects */}
            <motion.div className="impact-report__projects" {...fadeUp(6)}>
                <h2><PieChart size={18} /> Funded Projects</h2>
                <div className="funded-list">
                    {FUNDED_PROJECTS.map((p, i) => (
                        <motion.div key={p.name} className="funded-item" {...fadeUp(i + 7)}>
                            <span className="funded-item__icon">{p.icon}</span>
                            <div className="funded-item__info">
                                <div className="funded-item__name">{p.name}</div>
                                <div className="funded-item__org">{p.org}</div>
                            </div>
                            <div className="funded-item__donated">₹{(p.donated / 1000).toFixed(0)}k</div>
                            <div className="funded-item__beneficiaries">
                                <Users size={12} /> {p.beneficiaries}
                            </div>
                            <span className={`status-badge status-badge--${p.status}`}>{p.status}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
