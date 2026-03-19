import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, MapPin, Calendar, Clock, Star, Award, Edit3,
    Building2, Tag, Users, IndianRupee, Briefcase,
    Bell, Shield, Lock, Globe, LogOut, ChevronRight, Settings, Trophy, Camera, Trash2,
    BarChart3, TrendingUp, Flame, Target, Phone
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './ProfilePage.css';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TARGET_SIZE = 512;
const AVATAR_MIN_SIZE = 192;
const AVATAR_PREVIEW_SIZE = 220;
const INITIAL_AVATAR_CROP = { zoom: 1, panX: 0, panY: 0 };

function clampValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toBlob(canvas, type, quality) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert image blob to data URL.'));
        reader.readAsDataURL(blob);
    });
}

function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load selected image.'));
        image.src = url;
    });
}

function getCropMetrics(image, targetSize, zoom) {
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const baseScale = Math.max(targetSize / imageWidth, targetSize / imageHeight);
    const scale = baseScale * zoom;
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    return {
        scaledWidth,
        scaledHeight,
        extraX: Math.max(0, (scaledWidth - targetSize) / 2),
        extraY: Math.max(0, (scaledHeight - targetSize) / 2),
    };
}

function drawCroppedImageToContext(ctx, image, targetSize, crop) {
    const { zoom, panX, panY } = crop;
    const { scaledWidth, scaledHeight, extraX, extraY } = getCropMetrics(image, targetSize, zoom);

    const offsetX = extraX * panX;
    const offsetY = extraY * panY;
    const drawX = (targetSize - scaledWidth) / 2 + offsetX;
    const drawY = (targetSize - scaledHeight) / 2 + offsetY;

    ctx.clearRect(0, 0, targetSize, targetSize);
    ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
}

async function optimizeAvatarImage(image, crop) {

    let outputSize = AVATAR_TARGET_SIZE;
    let outputBlob = null;

    while (outputSize >= AVATAR_MIN_SIZE) {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas is not available in this browser.');
        }

        drawCroppedImageToContext(ctx, image, outputSize, crop);

        let quality = 0.9;
        outputBlob = await toBlob(canvas, 'image/jpeg', quality);

        while (outputBlob && outputBlob.size > MAX_AVATAR_BYTES && quality >= 0.5) {
            quality -= 0.1;
            outputBlob = await toBlob(canvas, 'image/jpeg', quality);
        }

        if (outputBlob && outputBlob.size <= MAX_AVATAR_BYTES) {
            break;
        }

        outputSize = Math.floor(outputSize * 0.8);
    }

    URL.revokeObjectURL(image.src);

    if (!outputBlob) {
        throw new Error('Could not process this image.');
    }

    if (outputBlob.size > MAX_AVATAR_BYTES) {
        throw new Error('This image is too large even after optimization. Please choose another image.');
    }

    const dataUrl = await blobToDataUrl(outputBlob);

    return {
        dataUrl,
        outputBytes: outputBlob.size,
    };
}

const POSTS = {
    ngo: [
        { id: 1, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Clean River Drive 2025', desc: 'Successfully organized a 3-day cleanup drive along the Yamuna. 320 volunteers joined, collected 2.5 tonnes of waste.', date: 'Dec 2025', tags: ['Environment', '320 Volunteers'] },
        { id: 2, type: 'achievement', title: '🏆 Best NGO Award — National Social Impact Forum', desc: 'Recognized for outstanding grassroots work in environmental conservation and community education across 5 states.', date: 'Nov 2025', tags: ['Award', 'National Recognition'] },
        { id: 3, type: 'event', img: '/images/posts/tree_plantation.png', title: 'Tree Plantation Week', desc: 'Planted 5,000+ saplings across 12 cities. Partnered with 8 schools and 3 corporates for the initiative.', date: 'Oct 2025', tags: ['Environment', '5,000 Trees'] },
        { id: 4, type: 'certification', title: '📜 ISO 26000 Social Responsibility Certification', desc: 'Certified for adhering to international standards of social responsibility and ethical practices.', date: 'Sep 2025', tags: ['Certification', 'ISO'] },
        { id: 5, type: 'event', img: '/images/posts/coding_bootcamp.png', title: 'Digital Literacy Camp — Rural Maharashtra', desc: 'Trained 450 students in basic computer skills and internet safety across 6 villages.', date: 'Aug 2025', tags: ['Education', '450 Students'] },
    ],
    volunteer: [
        { id: 1, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Beach Cleanup Rally — Juhu Beach', desc: 'Participated in a 2-day beach cleanup. Helped sort and recycle 800kg of plastic waste along the Mumbai coastline.', date: 'Jan 2026', tags: ['Environment', '800kg Recycled'] },
        { id: 2, type: 'certification', title: '📜 First Aid & CPR Certification — Red Cross', desc: 'Completed 40-hour certified training in emergency first aid, CPR, and AED usage.', date: 'Dec 2025', tags: ['Certification', 'Healthcare'] },
        { id: 3, type: 'achievement', title: '🏅 "First Responder" Badge Earned', desc: 'Awarded for being among the first 10 volunteers to respond to 5+ emergency events in a single quarter.', date: 'Nov 2025', tags: ['Badge', 'Top Performer'] },
        { id: 4, type: 'event', img: '/images/posts/tree_plantation.png', title: 'Teach India — Science Workshop Series', desc: 'Conducted 12 interactive science workshops for underprivileged children. Covered physics, chemistry, and biology experiments.', date: 'Oct 2025', tags: ['Education', '12 Workshops'] },
        { id: 5, type: 'certification', title: '📜 Disaster Management Training — NDMA', desc: 'Certified in disaster response protocols, evacuation procedures, and relief coordination.', date: 'Sep 2025', tags: ['Certification', 'Safety'] },
    ],
    sponsor: [
        { id: 1, type: 'event', img: '/images/posts/coding_bootcamp.png', title: 'Funded: Digital Literacy Project — Batch 1 Graduation', desc: 'Sponsored the coding bootcamp that graduated 50 students. 72% placement rate with 8 full-time offers from tech companies.', date: 'Jan 2026', tags: ['Education', '₹5.2L Funded'] },
        { id: 2, type: 'achievement', title: '🏆 CSR Excellence Award — CII Foundation', desc: 'Recognized for impactful CSR spending with measurable social outcomes across education and healthcare sectors.', date: 'Dec 2025', tags: ['Award', 'CSR Excellence'] },
        { id: 3, type: 'event', img: '/images/posts/health_camp.png', title: 'Rural Health Camp — Jharkhand Expansion', desc: 'Funded mobile health clinics serving 1,800+ patients across 7 villages. Provided BP monitors, glucometers, and medicines.', date: 'Nov 2025', tags: ['Healthcare', '1,800 Patients'] },
        { id: 4, type: 'certification', title: '📜 Platinum Donor Status — Sarvhit Platform', desc: 'Achieved Platinum status for donating over ₹7.5 Lakhs across 12+ verified social impact projects.', date: 'Oct 2025', tags: ['Certification', 'Platinum Tier'] },
        { id: 5, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Clean Water Initiative — Phase 2 Complete', desc: 'Funded 3 borewells providing clean drinking water to 4,500 people across 7 villages in rural Rajasthan.', date: 'Sep 2025', tags: ['Environment', '4,500 Beneficiaries'] },
    ],
};

/* ═══════════════════════════════════════════
   ANALYTICS DATA
   ═══════════════════════════════════════════ */
const ANALYTICS = {
    ngo: {
        monthly: [
            { month: 'Sep', events: 2, volunteers: 28, funds: 22000 },
            { month: 'Oct', events: 3, volunteers: 45, funds: 32000 },
            { month: 'Nov', events: 5, volunteers: 62, funds: 48000 },
            { month: 'Dec', events: 4, volunteers: 51, funds: 41000 },
            { month: 'Jan', events: 6, volunteers: 78, funds: 55000 },
            { month: 'Feb', events: 7, volunteers: 89, funds: 69000 },
        ],
        topEvents: [
            { name: 'Tree Plantation Week', volunteers: 67, funds: '₹1,48,000', rating: 4.8 },
            { name: 'Digital Literacy Camp', volunteers: 35, funds: '₹1,20,000', rating: 4.6 },
            { name: 'Clean River Drive', volunteers: 32, funds: '₹62,000', rating: 4.9 },
            { name: 'Beach Cleanup Saturday', volunteers: 60, funds: '₹30,000', rating: 4.5 },
        ],
        categories: [
            { name: 'Environment', pct: 42, color: 'hsl(160, 84%, 39%)' },
            { name: 'Education', pct: 28, color: 'hsl(38, 92%, 50%)' },
            { name: 'Healthcare', pct: 18, color: 'hsl(263, 70%, 58%)' },
            { name: 'Community', pct: 12, color: 'hsl(200, 70%, 50%)' },
        ],
    },
    volunteer: {
        monthlyHours: [
            { month: 'Sep', hours: 18 },
            { month: 'Oct', hours: 24 },
            { month: 'Nov', hours: 32 },
            { month: 'Dec', hours: 22 },
            { month: 'Jan', hours: 38 },
            { month: 'Feb', hours: 42 },
        ],
        badges: [
            { name: 'First Responder', icon: '🏅', earned: true },
            { name: 'Eco Warrior', icon: '🌍', earned: true },
            { name: 'Teach Champion', icon: '📚', earned: true },
            { name: 'Night Owl', icon: '🦉', earned: true },
            { name: 'Centurion (100h)', icon: '💯', earned: true },
            { name: 'Team Leader', icon: '👑', earned: false },
            { name: 'Marathon (200h)', icon: '🏃', earned: false },
            { name: 'Mentor', icon: '🎓', earned: false },
        ],
        streak: { current: 12, best: 18 },
        skillBreakdown: [
            { skill: 'Teaching', hours: 52, pct: 28 },
            { skill: 'First Aid', hours: 38, pct: 20 },
            { skill: 'Environment', hours: 44, pct: 24 },
            { skill: 'Tech', hours: 30, pct: 16 },
            { skill: 'Other', hours: 22, pct: 12 },
        ],
    },
    sponsor: {
        quarterly: [
            { quarter: "Q1 '25", amount: 120000 },
            { quarter: "Q2 '25", amount: 180000 },
            { quarter: "Q3 '25", amount: 150000 },
            { quarter: "Q4 '25", amount: 200000 },
            { quarter: "Q1 '26", amount: 100000 },
        ],
        projects: [
            { name: 'Digital Literacy', donated: 200000, beneficiaries: 500, icon: '💻' },
            { name: 'Tree Plantation', donated: 150000, beneficiaries: 800, icon: '🌳' },
            { name: 'Rural Health', donated: 100000, beneficiaries: 350, icon: '🏥' },
            { name: 'Clean River', donated: 50000, beneficiaries: 200, icon: '🏞️' },
            { name: 'Beach Cleanup', donated: 30000, beneficiaries: 1200, icon: '🏖️' },
        ],
        impactMetrics: [
            { label: 'Cost per Beneficiary', value: '₹245', change: '-12% vs last Q' },
            { label: 'Projects Completed', value: '8 / 12', change: '67% completion' },
            { label: 'Avg. Impact Score', value: '91', change: '+4 pts vs prev' },
        ],
    },
};

/* ── SVG Line chart helper ── */
function MiniLineChart({ data, dataKey, label, color = 'var(--accent)', height = 180 }) {
    const chartW = 460, padX = 40, padY = 28;
    const plotW = chartW - padX * 2;
    const plotH = height - padY * 2;
    const vals = data.map(d => d[dataKey]);
    const maxV = Math.max(...vals);
    const minV = Math.min(...vals);
    const range = maxV - minV || 1;

    const points = data.map((d, i) => ({
        x: padX + (i / (data.length - 1)) * plotW,
        y: padY + plotH - ((d[dataKey] - minV) / range) * plotH,
        ...d,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${padY + plotH} L${points[0].x},${padY + plotH} Z`;

    const gridCount = 3;
    const gridLines = Array.from({ length: gridCount }, (_, i) => {
        const ratio = i / (gridCount - 1);
        return {
            y: padY + plotH - ratio * plotH,
            label: dataKey === 'funds' || dataKey === 'amount'
                ? `₹${Math.round((minV + ratio * range) / 1000)}k`
                : `${Math.round(minV + ratio * range)}`,
        };
    });

    const gradId = `aGrad_${dataKey}`;

    return (
        <div className="analytics-chart-card">
            <h3>{label}</h3>
            <div className="analytics-chart-wrap">
                <svg viewBox={`0 0 ${chartW} ${height}`} className="analytics-line-chart" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {gridLines.map((g, i) => (
                        <g key={i}>
                            <line x1={padX} y1={g.y} x2={chartW - padX} y2={g.y} stroke="var(--border-subtle)" strokeDasharray="4 4" />
                            <text x={padX - 6} y={g.y + 4} textAnchor="end" className="analytics-chart__grid-label">{g.label}</text>
                        </g>
                    ))}
                    <motion.path d={areaPath} fill={`url(#${gradId})`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                    <motion.path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }} />
                    {points.map((p, i) => (
                        <g key={i}>
                            <motion.circle cx={p.x} cy={p.y} r="4.5" fill="var(--bg-secondary)" stroke={color} strokeWidth="2.5"
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 220 }} />
                            <text x={p.x} y={padY + plotH + 16} textAnchor="middle" className="analytics-chart__x-label">
                                {p.month || p.quarter}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}

/* ── Analytics Tab Main Component ── */
function AnalyticsTab({ role }) {
    const data = ANALYTICS[role];
    if (!data) return null;

    if (role === 'ngo') {
        return (
            <>
                <motion.div className="analytics-metrics" {...fadeUp(2)}>
                    {[
                        { label: 'Events Growth', value: '+250%', sub: 'Sep → Feb', icon: TrendingUp },
                        { label: 'Volunteer Growth', value: '+218%', sub: '28 → 89/mo', icon: Users },
                        { label: 'Fund Growth', value: '+214%', sub: '₹22k → ₹69k/mo', icon: IndianRupee },
                        { label: 'Avg Rating', value: '4.7', sub: 'Across 47 events', icon: Star },
                    ].map((m, i) => (
                        <motion.div className="analytics-metric" key={m.label}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}>
                            <div className="analytics-metric__icon"><m.icon size={20} /></div>
                            <div className="analytics-metric__value">{m.value}</div>
                            <div className="analytics-metric__label">{m.label}</div>
                            <div className="analytics-metric__sub">{m.sub}</div>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div {...fadeUp(3)}>
                    <MiniLineChart data={data.monthly} dataKey="funds" label="Monthly Funds Received" color="var(--accent)" />
                </motion.div>
                <div className="analytics-two-col">
                    <motion.div className="analytics-card" {...fadeUp(4)}>
                        <h3><Star size={16} /> Top Events</h3>
                        <div className="analytics-table">
                            <div className="analytics-table__head">
                                <span>Event</span><span>Volunteers</span><span>Funds</span><span>Rating</span>
                            </div>
                            {data.topEvents.map((ev, i) => (
                                <motion.div className="analytics-table__row" key={ev.name}
                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 240, damping: 22 }}>
                                    <span className="analytics-table__name">{ev.name}</span>
                                    <span>{ev.volunteers}</span>
                                    <span>{ev.funds}</span>
                                    <span className="analytics-table__rating">⭐ {ev.rating}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div className="analytics-card" {...fadeUp(4.5)}>
                        <h3><Target size={16} /> Category Breakdown</h3>
                        <div className="analytics-categories">
                            {data.categories.map((cat, i) => (
                                <div className="analytics-cat" key={cat.name}>
                                    <div className="analytics-cat__header">
                                        <span className="analytics-cat__name">{cat.name}</span>
                                        <span className="analytics-cat__pct">{cat.pct}%</span>
                                    </div>
                                    <div className="analytics-cat__bar-bg">
                                        <motion.div className="analytics-cat__bar-fill"
                                            style={{ background: cat.color }}
                                            initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }}
                                            transition={{ delay: 0.4 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    if (role === 'volunteer') {
        const maxH = Math.max(...data.monthlyHours.map(d => d.hours));
        const totalHours = data.monthlyHours.reduce((s, d) => s + d.hours, 0);
        const earned = data.badges.filter(b => b.earned).length;
        return (
            <>
                <motion.div className="analytics-metrics" {...fadeUp(2)}>
                    {[
                        { label: 'Total Hours', value: `${totalHours}`, sub: 'Last 6 months', icon: Clock },
                        { label: 'Avg / Month', value: `${Math.round(totalHours / 6)}h`, sub: 'Consistency', icon: BarChart3 },
                        { label: 'Active Streak', value: `${data.streak.current} wks`, sub: `Best: ${data.streak.best} wks`, icon: Flame },
                        { label: 'Badges', value: `${earned} / ${data.badges.length}`, sub: `${Math.round(earned / data.badges.length * 100)}% complete`, icon: Award },
                    ].map((m, i) => (
                        <motion.div className="analytics-metric" key={m.label}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}>
                            <div className="analytics-metric__icon"><m.icon size={20} /></div>
                            <div className="analytics-metric__value">{m.value}</div>
                            <div className="analytics-metric__label">{m.label}</div>
                            <div className="analytics-metric__sub">{m.sub}</div>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div className="analytics-chart-card" {...fadeUp(3)}>
                    <h3>Hours per Month</h3>
                    <div className="analytics-bar-chart">
                        {data.monthlyHours.map((d, i) => (
                            <div className="analytics-bar-col" key={d.month}>
                                <span className="analytics-bar-val">{d.hours}h</span>
                                <div className="analytics-bar-track">
                                    <motion.div className="analytics-bar-fill"
                                        initial={{ height: 0 }} animate={{ height: `${(d.hours / maxH) * 100}%` }}
                                        transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                                </div>
                                <span className="analytics-bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <div className="analytics-two-col">
                    <motion.div className="analytics-card" {...fadeUp(4)}>
                        <h3><Tag size={16} /> Skill Breakdown</h3>
                        <div className="analytics-categories">
                            {data.skillBreakdown.map((s, i) => (
                                <div className="analytics-cat" key={s.skill}>
                                    <div className="analytics-cat__header">
                                        <span className="analytics-cat__name">{s.skill}</span>
                                        <span className="analytics-cat__pct">{s.hours}h ({s.pct}%)</span>
                                    </div>
                                    <div className="analytics-cat__bar-bg">
                                        <motion.div className="analytics-cat__bar-fill"
                                            initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                                            transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div className="analytics-card" {...fadeUp(4.5)}>
                        <h3><Award size={16} /> Badge Progress</h3>
                        <div className="analytics-badges">
                            {data.badges.map((b, i) => (
                                <motion.div className={`analytics-badge ${b.earned ? 'analytics-badge--earned' : ''}`}
                                    key={b.name}
                                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}>
                                    <span className="analytics-badge__icon">{b.icon}</span>
                                    <span className="analytics-badge__name">{b.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    if (role === 'sponsor') {
        const maxDonated = Math.max(...data.projects.map(p => p.donated));
        const totalBene = data.projects.reduce((s, p) => s + p.beneficiaries, 0);
        return (
            <>
                <motion.div className="analytics-metrics" {...fadeUp(2)}>
                    {data.impactMetrics.map((m, i) => (
                        <motion.div className="analytics-metric" key={m.label}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}>
                            <div className="analytics-metric__icon"><TrendingUp size={20} /></div>
                            <div className="analytics-metric__value">{m.value}</div>
                            <div className="analytics-metric__label">{m.label}</div>
                            <div className="analytics-metric__sub">{m.change}</div>
                        </motion.div>
                    ))}
                    <motion.div className="analytics-metric"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.34, type: 'spring', stiffness: 260, damping: 24 }}>
                        <div className="analytics-metric__icon"><Users size={20} /></div>
                        <div className="analytics-metric__value">{totalBene.toLocaleString()}</div>
                        <div className="analytics-metric__label">Total Beneficiaries</div>
                        <div className="analytics-metric__sub">Across {data.projects.length} projects</div>
                    </motion.div>
                </motion.div>
                <motion.div {...fadeUp(3)}>
                    <MiniLineChart data={data.quarterly} dataKey="amount" label="Quarterly Donations" color="hsl(263, 70%, 58%)" />
                </motion.div>
                <motion.div className="analytics-card" {...fadeUp(4)}>
                    <h3><Briefcase size={16} /> Funded Projects Breakdown</h3>
                    <div className="analytics-projects">
                        {data.projects.map((p, i) => (
                            <motion.div className="analytics-project" key={p.name}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 240, damping: 22 }}>
                                <span className="analytics-project__icon">{p.icon}</span>
                                <div className="analytics-project__info">
                                    <div className="analytics-project__name">{p.name}</div>
                                    <div className="analytics-project__meta">
                                        ₹{(p.donated / 1000).toFixed(0)}k donated · {p.beneficiaries} beneficiaries
                                    </div>
                                    <div className="analytics-cat__bar-bg">
                                        <motion.div className="analytics-cat__bar-fill"
                                            style={{ background: 'hsl(263, 70%, 58%)' }}
                                            initial={{ width: 0 }} animate={{ width: `${(p.donated / maxDonated) * 100}%` }}
                                            transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </>
        );
    }

    return null;
}

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const role = user?.userType;
    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [avatarError, setAvatarError] = useState('');
    const [avatarHint, setAvatarHint] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const avatarInputRef = useRef(null);
    const avatarPreviewCanvasRef = useRef(null);
    const avatarImageRef = useRef(null);
    const avatarDragStateRef = useRef({ active: false, lastX: 0, lastY: 0, pointerId: null });
    const [avatarCropModal, setAvatarCropModal] = useState({
        open: false,
        sourceUrl: '',
        sourceSizeBytes: 0,
    });
    const [avatarCrop, setAvatarCrop] = useState(INITIAL_AVATAR_CROP);
    const [isApplyingAvatarCrop, setIsApplyingAvatarCrop] = useState(false);
    const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
    const [notifications, setNotifications] = useState({
        events: true, messages: true, updates: false, marketing: false,
    });

    const drawAvatarPreview = (image, crop) => {
        const previewCanvas = avatarPreviewCanvasRef.current;
        if (!previewCanvas) {
            return;
        }

        const context = previewCanvas.getContext('2d');
        if (!context) {
            return;
        }

        drawCroppedImageToContext(context, image, AVATAR_PREVIEW_SIZE, crop);
    };

    const closeAvatarCropModal = () => {
        if (avatarCropModal.sourceUrl) {
            URL.revokeObjectURL(avatarCropModal.sourceUrl);
        }

        avatarImageRef.current = null;
        avatarDragStateRef.current = { active: false, lastX: 0, lastY: 0, pointerId: null };
        setIsDraggingAvatar(false);
        setIsApplyingAvatarCrop(false);
        setAvatarCrop(INITIAL_AVATAR_CROP);
        setAvatarCropModal({
            open: false,
            sourceUrl: '',
            sourceSizeBytes: 0,
        });
    };

    useEffect(() => {
        if (!avatarCropModal.open || !avatarCropModal.sourceUrl) {
            return undefined;
        }

        let cancelled = false;

        loadImageFromUrl(avatarCropModal.sourceUrl)
            .then((image) => {
                if (cancelled) {
                    return;
                }
                avatarImageRef.current = image;
                drawAvatarPreview(image, avatarCrop);
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                setAvatarError('Failed to load image for cropping. Please try another image.');
                setAvatarHint('');
                closeAvatarCropModal();
            });

        return () => {
            cancelled = true;
        };
    }, [avatarCropModal.open, avatarCropModal.sourceUrl]);

    useEffect(() => {
        if (!avatarCropModal.open || !avatarImageRef.current) {
            return;
        }

        drawAvatarPreview(avatarImageRef.current, avatarCrop);
    }, [avatarCropModal.open, avatarCrop]);

    const toggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const startEditing = () => {
        setActiveTab('profile');
        setEditing(true);
        setSaveError('');
        setAvatarError('');
        setAvatarHint('');
        setEditForm({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            bio: user?.bio || '',
            phone: user?.phone || '',
            address: user?.address || '',
            city: user?.city || '',
            state: user?.state || '',
            zipCode: user?.zipCode || '',
            skills: user?.skills || [],
            focusAreas: user?.focusAreas || [],
            profileImage: user?.profileImage || null,
        });
    };

    const cancelEditing = () => {
        closeAvatarCropModal();
        setEditing(false);
        setEditForm({});
        setAvatarError('');
        setAvatarHint('');
    };

    const saveProfile = async () => {
        closeAvatarCropModal();
        setIsSaving(true);
        setSaveError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSaveError('Not authenticated. Please login again.');
                setIsSaving(false);
                return;
            }

            // Prepare update data - map form field names to server field names
            const updateData = {
                firstName: editForm.firstName || user?.firstName,
                lastName: editForm.lastName || user?.lastName,
                bio: editForm.bio || user?.bio,
                phone: editForm.phone || user?.phone,
                address: editForm.address || user?.address,
                city: editForm.city || user?.city,
                state: editForm.state || user?.state,
                zipCode: editForm.zipCode || user?.zipCode,
            };

            if (role === 'volunteer' || role === 'ngo') {
                updateData.skills = editForm.skills || user?.skills || [];
            }

            if (role === 'ngo') {
                updateData.focusAreas = editForm.focusAreas || user?.focusAreas || [];
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const data = await response.json();
            
            // Update localStorage and auth context with new user data
            localStorage.setItem('user', JSON.stringify(data.user));
            updateUser(data.user);

            setEditing(false);
            setEditForm({});
            setAvatarError('');
            setAvatarHint('');
        } catch (error) {
            setSaveError(error.message || 'Failed to save profile');
            console.error('Profile save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const openAvatarPicker = () => {
        avatarInputRef.current?.click();
    };

    const removeAvatar = () => {
        closeAvatarCropModal();
        setAvatarError('');
        setAvatarHint('');
        handleEditChange('avatar', null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            setAvatarError('Please select a valid image file.');
            setAvatarHint('');
            event.target.value = '';
            return;
        }

        if (avatarCropModal.sourceUrl) {
            URL.revokeObjectURL(avatarCropModal.sourceUrl);
        }

        const sourceUrl = URL.createObjectURL(file);

        setAvatarError('');
        setAvatarHint('Adjust crop and click Apply.');
        setAvatarCrop(INITIAL_AVATAR_CROP);
        setAvatarCropModal({
            open: true,
            sourceUrl,
            sourceSizeBytes: file.size,
        });
        event.target.value = '';
    };

    const updateCropValue = (field, rawValue) => {
        const numericValue = Number(rawValue);
        setAvatarCrop((prev) => ({ ...prev, [field]: numericValue }));
    };

    const startAvatarDrag = (event) => {
        if (!avatarImageRef.current || isApplyingAvatarCrop) {
            return;
        }

        const canvas = avatarPreviewCanvasRef.current;
        if (!canvas) {
            return;
        }

        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        avatarDragStateRef.current = {
            active: true,
            lastX: event.clientX,
            lastY: event.clientY,
            pointerId: event.pointerId,
        };
        setIsDraggingAvatar(true);
    };

    const moveAvatarDrag = (event) => {
        const dragState = avatarDragStateRef.current;
        if (!dragState.active || !avatarImageRef.current) {
            return;
        }

        event.preventDefault();
        const deltaX = event.clientX - dragState.lastX;
        const deltaY = event.clientY - dragState.lastY;

        avatarDragStateRef.current = {
            ...dragState,
            lastX: event.clientX,
            lastY: event.clientY,
        };

        setAvatarCrop((prev) => {
            const metrics = getCropMetrics(avatarImageRef.current, AVATAR_PREVIEW_SIZE, prev.zoom);
            const panDeltaX = metrics.extraX > 0 ? deltaX / metrics.extraX : 0;
            const panDeltaY = metrics.extraY > 0 ? deltaY / metrics.extraY : 0;

            return {
                ...prev,
                panX: clampValue(prev.panX + panDeltaX, -1, 1),
                panY: clampValue(prev.panY + panDeltaY, -1, 1),
            };
        });
    };

    const endAvatarDrag = (event) => {
        const dragState = avatarDragStateRef.current;
        if (!dragState.active) {
            return;
        }

        const canvas = avatarPreviewCanvasRef.current;
        if (canvas && dragState.pointerId !== null) {
            canvas.releasePointerCapture?.(dragState.pointerId);
        }

        if (event) {
            event.preventDefault();
        }

        avatarDragStateRef.current = { active: false, lastX: 0, lastY: 0, pointerId: null };
        setIsDraggingAvatar(false);
    };

    const applyAvatarCrop = async () => {
        if (!avatarImageRef.current) {
            setAvatarError('Image is not ready yet. Please try again.');
            return;
        }

        setIsApplyingAvatarCrop(true);
        setAvatarError('');
        setAvatarHint('Applying crop...');

        try {
            const sourceBytes = avatarCropModal.sourceSizeBytes;
            const result = await optimizeAvatarImage(avatarImageRef.current, avatarCrop);

            handleEditChange('avatar', result.dataUrl);
            closeAvatarCropModal();

            const inputKb = Math.round(sourceBytes / 1024);
            const outputKb = Math.round(result.outputBytes / 1024);
            if (sourceBytes > MAX_AVATAR_BYTES || result.outputBytes < sourceBytes) {
                setAvatarHint(`Image optimized from ${inputKb}KB to ${outputKb}KB.`);
            } else {
                setAvatarHint('Crop applied successfully.');
            }
        } catch (error) {
            setAvatarError(error?.message || 'Unable to process this image. Please try another file.');
            setAvatarHint('');
        } finally {
            setIsApplyingAvatarCrop(false);
        }
    };

    const avatarSrc = editing ? editForm.avatar : user?.avatar;
    const avatarLetter = user?.name?.charAt(0) || '?';

    return (
        <div className="profile-page">
            {/* Cover + Avatar */}
            <motion.div className={`profile-cover${editing ? ' profile-cover--editing' : ''}`} {...fadeUp(0)}>
                <div className="profile-cover__gradient" />
                <div className="profile-avatar">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={`${user?.name || 'User'} avatar`} className="profile-avatar__image" />
                    ) : (
                        <span className="profile-avatar__letter">{avatarLetter}</span>
                    )}

                    {editing && (
                        <>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="profile-avatar__file-input"
                            />
                            <button
                                type="button"
                                className="profile-avatar__pencil"
                                onClick={openAvatarPicker}
                                title={editForm.avatar ? 'Change photo' : 'Upload photo'}
                            >
                                <Edit3 size={14} />
                            </button>
                        </>
                    )}
                </div>
                {editing && avatarError && (
                    <p className="profile-avatar__error">{avatarError}</p>
                )}
                <div className="profile-cover__actions">
                    {!editing ? (
                        <>
                            <motion.button
                                className="profile-edit-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startEditing}
                            >
                                <Edit3 size={14} />
                                Edit Profile
                            </motion.button>
                            <motion.button
                                className="profile-edit-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('settings')}
                            >
                                <Settings size={14} />
                                Settings
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button
                                className="profile-edit-btn profile-edit-btn--save"
                                whileHover={{ scale: isSaving ? 1 : 1.05 }}
                                whileTap={{ scale: isSaving ? 1 : 0.95 }}
                                onClick={saveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? '⏳ Saving...' : '✓ Save'}
                            </motion.button>
                            <motion.button
                                className="profile-edit-btn profile-edit-btn--cancel"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={cancelEditing}
                                disabled={isSaving}
                            >
                                ✕ Cancel
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Info */}
            <motion.div className="profile-info" {...fadeUp(1)}>
                {editing ? (
                    <div className="profile-edit-form">
                        {saveError && (
                            <motion.div
                                className="profile-edit-error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px 16px',
                                    marginBottom: '16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    fontSize: '14px'
                                }}
                            >
                                {saveError}
                            </motion.div>
                        )}

                        <div className="profile-edit-row">
                            <div className="profile-edit-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={editForm.firstName}
                                    onChange={e => handleEditChange('firstName', e.target.value)}
                                    placeholder="First name"
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={editForm.lastName}
                                    onChange={e => handleEditChange('lastName', e.target.value)}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="profile-edit-field">
                            <label>Bio</label>
                            <textarea
                                rows={3}
                                value={editForm.bio}
                                onChange={e => handleEditChange('bio', e.target.value)}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="profile-edit-row">
                            <div className="profile-edit-field">
                                <label><Mail size={14} /> Email (Read-only)</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                            </div>
                        </div>

                        <div className="profile-edit-row">
                            <div className="profile-edit-field">
                                <label><MapPin size={14} /> Address</label>
                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={e => handleEditChange('address', e.target.value)}
                                    placeholder="Street address"
                                />
                            </div>
                        </div>

                        <div className="profile-edit-row">
                            <div className="profile-edit-field">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={editForm.city}
                                    onChange={e => handleEditChange('city', e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label>State</label>
                                <input
                                    type="text"
                                    value={editForm.state}
                                    onChange={e => handleEditChange('state', e.target.value)}
                                    placeholder="State"
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    value={editForm.zipCode}
                                    onChange={e => handleEditChange('zipCode', e.target.value)}
                                    placeholder="Zip code"
                                />
                            </div>
                        </div>

                        <div className="profile-edit-field">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={editForm.phone}
                                onChange={e => handleEditChange('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        {(role === 'volunteer' || role === 'ngo') && (
                            <div className="profile-edit-field">
                                <label>{role === 'ngo' ? 'Focus Areas' : 'Skills'}</label>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                    {role === 'ngo' ? 'Select areas your NGO focuses on' : 'Enter skills (comma-separated)'}
                                </p>
                                <input
                                    type="text"
                                    value={Array.isArray(editForm.skills) ? editForm.skills.join(', ') : ''}
                                    onChange={e => handleEditChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="e.g., Teaching, First Aid, Fundraising"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <h1>{user?.firstName} {user?.lastName}</h1>
                        <span className="profile-role-tag">
                            {role === 'ngo' ? '🏛️ Non-Profit Organization' : role === 'volunteer' ? '🤝 Volunteer' : '💎 Sponsor'}
                        </span>
                        <p className="profile-bio">{user?.bio}</p>

                        <div className="profile-meta">
                            <span><Mail size={14} /> {user?.email}</span>
                            {user?.phone && <span><Phone size={14} /> {user?.phone}</span>}
                            {user?.address && <span><MapPin size={14} /> {user?.address}{user?.city ? `, ${user.city}` : ''}</span>}
                            {user?.city && user?.state && <span>{user?.state} {user?.zipCode}</span>}
                        </div>

                        {(role === 'volunteer' || role === 'ngo') && user?.skills && user.skills.length > 0 && (
                            <div className="profile-skills">
                                <h3>{role === 'ngo' ? 'Focus Areas' : 'Skills'}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {user.skills.map((skill, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 12px',
                                            background: 'rgba(var(--accent-rgb), 0.1)',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            border: '1px solid rgba(var(--accent-rgb), 0.2)'
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Tab Switcher */}
            <motion.div className="profile-tabs" {...fadeUp(1.5)}>
                <button
                    className={`profile-tab ${activeTab === 'profile' ? 'profile-tab--active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`profile-tab ${activeTab === 'analytics' ? 'profile-tab--active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <BarChart3 size={14} />
                    Analytics
                </button>
                <button
                    className={`profile-tab ${activeTab === 'settings' ? 'profile-tab--active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={14} />
                    Settings
                </button>
            </motion.div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <>
                    {/* Stats row */}
                    <motion.div className="profile-stats" {...fadeUp(2)}>
                        {role === 'ngo' && (
                        <>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/ngo/hosted-events')}>
                                    <Calendar size={18} />
                                    <span className="profile-stat__value">{user?.eventsHosted}</span>
                                    <span className="profile-stat__label">Events Hosted</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/ngo/manage-team')}>
                                    <Users size={18} />
                                    <span className="profile-stat__value">{user?.volunteersConnected}</span>
                                    <span className="profile-stat__label">Volunteers Connected</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/ngo/reports')}>
                                    <IndianRupee size={18} />
                                    <span className="profile-stat__value">₹{(user?.fundsReceived / 1000).toFixed(0)}k</span>
                                    <span className="profile-stat__label">Funds Received</span>
                                </div>
                            </>
                        )}
                        {role === 'volunteer' && (
                            <>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/volunteer/log-hours')}>
                                    <Clock size={18} />
                                    <span className="profile-stat__value">{user?.hoursLogged}</span>
                                    <span className="profile-stat__label">Hours Logged</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/events')}>
                                    <Calendar size={18} />
                                    <span className="profile-stat__value">{user?.eventsJoined}</span>
                                    <span className="profile-stat__label">Events Joined</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/volunteer/badges')}>
                                    <Award size={18} />
                                    <span className="profile-stat__value">{user?.badgesEarned}</span>
                                    <span className="profile-stat__label">Badges Earned</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/volunteer/my-ngo')}>
                                    <Building2 size={18} />
                                    <span className="profile-stat__value">My NGO</span>
                                    <span className="profile-stat__label">View Team</span>
                                </div>
                            </>
                        )}
                        {role === 'sponsor' && (
                            <>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/sponsor/impact-report')}>
                                    <IndianRupee size={18} />
                                    <span className="profile-stat__value">₹{(user?.totalDonated / 1000).toFixed(0)}k</span>
                                    <span className="profile-stat__label">Total Donated</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/sponsor/browse-projects')}>
                                    <Briefcase size={18} />
                                    <span className="profile-stat__value">{user?.projectsFunded}</span>
                                    <span className="profile-stat__label">Projects Funded</span>
                                </div>
                                <div className="profile-stat profile-stat--clickable" onClick={() => navigate('/app/leaderboard')}>
                                    <Star size={18} />
                                    <span className="profile-stat__value">{user?.impactScore}</span>
                                    <span className="profile-stat__label">Impact Score</span>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Skills / Sectors */}
                    {(role === 'volunteer' && user?.skills?.length > 0) && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Tag size={16} /> Skills</h2>
                            <div className="profile-tags">
                                {user.skills.map(s => (
                                    <span key={s} className="profile-tag">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {(role === 'sponsor' && user?.sectors?.length > 0) && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Building2 size={16} /> Focus Sectors</h2>
                            <div className="profile-tags">
                                {user.sectors.map(s => (
                                    <span key={s} className="profile-tag">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {role === 'ngo' && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Building2 size={16} /> About</h2>
                            <p className="profile-about-text">
                                {user?.bio} We work with local communities to create sustainable change through grassroots action,
                                education programs, and environmental restoration projects across multiple states.
                            </p>
                        </motion.div>
                    )}

                    {/* Heroes of the Month — NGO only */}
                    {role === 'ngo' && (
                        <motion.div className="profile-section heroes-section" {...fadeUp(4)}>
                            <h2><Trophy size={16} /> Heroes of the Month</h2>
                            <div className="heroes-grid">
                                {/* Sponsor Hero — photo right */}
                                <motion.div
                                    className="hero-card hero-card--sponsor"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="hero-card__content">
                                        <span className="hero-card__crown">👑</span>
                                        <span className="hero-card__label">Top Sponsor</span>
                                        <h3 className="hero-card__name">Rajesh Mehta</h3>
                                        <p className="hero-card__org">Apex Technologies Pvt. Ltd.</p>
                                        <p className="hero-card__desc">
                                            Funded 12 social impact projects worth ₹7.5L+ this quarter. Champion of education and healthcare initiatives across rural India.
                                        </p>
                                        <div className="hero-card__stats">
                                            <div className="hero-card__stat">
                                                <IndianRupee size={14} />
                                                <span>₹7.5L Donated</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Briefcase size={14} />
                                                <span>12 Projects</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Star size={14} />
                                                <span>98 Impact Score</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hero-card__avatar hero-card__avatar--sponsor">
                                        <span>RM</span>
                                    </div>
                                </motion.div>

                                {/* Volunteer Hero — photo left */}
                                <motion.div
                                    className="hero-card hero-card--volunteer"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="hero-card__avatar hero-card__avatar--volunteer">
                                        <span>AP</span>
                                    </div>
                                    <div className="hero-card__content">
                                        <span className="hero-card__crown">⭐</span>
                                        <span className="hero-card__label">Top Volunteer</span>
                                        <h3 className="hero-card__name">Ananya Patel</h3>
                                        <p className="hero-card__org">Full-Stack Developer & Educator</p>
                                        <p className="hero-card__desc">
                                            Logged 210+ volunteer hours across 18 events. Led science workshops for underprivileged children and built donation portals for 3 NGOs.
                                        </p>
                                        <div className="hero-card__stats">
                                            <div className="hero-card__stat">
                                                <Clock size={14} />
                                                <span>210 Hours</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Calendar size={14} />
                                                <span>18 Events</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Award size={14} />
                                                <span>5 Badges</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Posts / Activity Feed */}
                    <motion.div className="profile-section" {...fadeUp(4)}>
                        <h2><Calendar size={16} /> Posts & Achievements</h2>
                        <div className="profile-posts">
                            {(POSTS[role] || []).map((post, i) => (
                                <motion.div
                                    key={post.id}
                                    className={`profile-post profile-post--${post.type}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="profile-post__header">
                                        <span className={`profile-post__badge profile-post__badge--${post.type}`}>
                                            {post.type === 'event' ? '📅 Event' : post.type === 'achievement' ? '🏆 Achievement' : '📜 Certification'}
                                        </span>
                                        <span className="profile-post__date">{post.date}</span>
                                    </div>
                                    {post.img && (
                                        <div className="profile-post__img">
                                            <img src={post.img} alt={post.title} loading="lazy" />
                                        </div>
                                    )}
                                    <h3 className="profile-post__title">{post.title}</h3>
                                    <p className="profile-post__desc">{post.desc}</p>
                                    <div className="profile-post__tags">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="profile-post__tag">{tag}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
                <>
                    {/* Account */}
                    <motion.div className="settings-section" {...fadeUp(2)}>
                        <h2><Edit3 size={18} /> Account</h2>
                        <div className="settings-group">
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Display Name</span>
                                    <span className="settings-item__value">{user?.name}</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <Mail size={15} />
                                    <span className="settings-item__label">Email</span>
                                    <span className="settings-item__value">{user?.email}</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <Lock size={15} />
                                    <span className="settings-item__label">Password</span>
                                    <span className="settings-item__value">••••••••</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <Globe size={15} />
                                    <span className="settings-item__label">Language</span>
                                    <span className="settings-item__value">English</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div className="settings-section" {...fadeUp(3)}>
                        <h2><Bell size={18} /> Notifications</h2>
                        <div className="settings-group">
                            {[
                                { key: 'events', label: 'Event updates', desc: 'Get notified about events you joined or host' },
                                { key: 'messages', label: 'Messages', desc: 'Receive message notifications' },
                                { key: 'updates', label: 'Platform updates', desc: 'News about Sarvhit features and improvements' },
                                { key: 'marketing', label: 'Marketing', desc: 'Occasional newsletters and campaigns' },
                            ].map(notif => (
                                <div key={notif.key} className="settings-item">
                                    <div className="settings-item__info">
                                        <span className="settings-item__label">{notif.label}</span>
                                        <span className="settings-item__desc">{notif.desc}</span>
                                    </div>
                                    <label className="settings-toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications[notif.key]}
                                            onChange={() => toggleNotif(notif.key)}
                                        />
                                        <span className="settings-toggle__slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Privacy */}
                    <motion.div className="settings-section" {...fadeUp(4)}>
                        <h2><Shield size={18} /> Privacy</h2>
                        <div className="settings-group">
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Profile visibility</span>
                                    <span className="settings-item__value">Public</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Activity visibility</span>
                                    <span className="settings-item__value">Connections only</span>
                                </div>
                                <button className="settings-item__action"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Danger zone */}
                    <motion.div className="settings-section settings-section--danger" {...fadeUp(5)}>
                        <motion.button
                            className="settings-logout-btn"
                            onClick={logout}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <LogOut size={18} />
                            Log out
                        </motion.button>
                        <button className="settings-delete-btn">
                            Delete account
                        </button>
                    </motion.div>
                </>
            )}

            {/* ── Analytics Tab ── */}
            {activeTab === 'analytics' && <AnalyticsTab role={role} />}


            <AnimatePresence>
                {avatarCropModal.open && (
                    <motion.div
                        className="avatar-crop-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAvatarCropModal}
                    >
                        <motion.div
                            className="avatar-crop-modal__content"
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h3>Adjust Profile Photo</h3>
                            <p>Use zoom and position to frame your avatar.</p>

                            <div className="avatar-crop-modal__preview-wrap">
                                <canvas
                                    ref={avatarPreviewCanvasRef}
                                    width={AVATAR_PREVIEW_SIZE}
                                    height={AVATAR_PREVIEW_SIZE}
                                    className={`avatar-crop-modal__preview${isDraggingAvatar ? ' avatar-crop-modal__preview--dragging' : ''}`}
                                    onPointerDown={startAvatarDrag}
                                    onPointerMove={moveAvatarDrag}
                                    onPointerUp={endAvatarDrag}
                                    onPointerCancel={endAvatarDrag}
                                    style={{ touchAction: 'none' }}
                                />
                                <div className="avatar-crop-modal__grid">
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--v1" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--v2" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--h1" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--h2" />
                                </div>
                            </div>

                            <div className="avatar-crop-modal__controls">
                                <label>
                                    Zoom
                                    <input
                                        type="range"
                                        min="1"
                                        max="2.5"
                                        step="0.01"
                                        value={avatarCrop.zoom}
                                        onChange={(event) => updateCropValue('zoom', event.target.value)}
                                    />
                                </label>
                                <label>
                                    Horizontal
                                    <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.01"
                                        value={avatarCrop.panX}
                                        onChange={(event) => updateCropValue('panX', event.target.value)}
                                    />
                                </label>
                                <label>
                                    Vertical
                                    <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.01"
                                        value={avatarCrop.panY}
                                        onChange={(event) => updateCropValue('panY', event.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="avatar-crop-modal__actions">
                                <button
                                    type="button"
                                    className="avatar-crop-modal__btn avatar-crop-modal__btn--ghost"
                                    onClick={closeAvatarCropModal}
                                    disabled={isApplyingAvatarCrop}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="avatar-crop-modal__btn avatar-crop-modal__btn--primary"
                                    onClick={applyAvatarCrop}
                                    disabled={isApplyingAvatarCrop}
                                >
                                    {isApplyingAvatarCrop ? 'Applying...' : 'Apply'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
