import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUpVariant as fadeUp, staggerContainer as stagger } from '../../hooks/useAnimations';
import { ArrowRight, Users, Heart, TrendingUp, Globe, Sparkles, Shield } from 'lucide-react';
import CursorParticles from '../../components/ui/CursorParticles';
import CountUp from '../../components/ui/CountUp';
import ImpactMarquee from '../../components/ui/ImpactMarquee';
import EventCarousel from '../../components/ui/EventCarousel';
import AboutFlipCards from '../../components/ui/AboutFlipCards';
import './LandingPage.css';

const STATS = [
    {
        value: '2,400+', label: 'Volunteers Active', icon: Users, area: 'a',
        bg: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80'
    },
    {
        value: '180+', label: 'NGOs Connected', icon: Heart, area: 'b',
        bg: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80'
    },
    {
        value: '₹12Cr+', label: 'Funds Channeled', icon: TrendingUp, area: 'c',
        bg: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80'
    },
    {
        value: '35+', label: 'Cities Covered', icon: Globe, area: 'd',
        bg: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80'
    },
    {
        value: '500+', label: 'Events Hosted', icon: Sparkles, area: 'e',
        bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'
    },
    {
        value: '18,000+', label: 'Volunteer Hours', icon: Users, area: 'f',
        bg: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80'
    },
];

const ROLES = [
    {
        id: 'ngo',
        title: 'For NGOs',
        desc: 'Host events, find volunteers, track your impact — all in one place.',
        color: 'var(--accent-ngo)',
        colorSoft: 'var(--accent-ngo-soft)',
        icon: Shield,
        features: ['Event management', 'Volunteer matching', 'Fund tracking', 'Impact reports'],
    },
    {
        id: 'volunteer',
        title: 'For Volunteers',
        desc: 'Discover causes that matter. Log hours, earn badges, grow your impact.',
        color: 'var(--accent-volunteer)',
        colorSoft: 'var(--accent-volunteer-soft)',
        icon: Heart,
        features: ['Browse events', 'Skill matching', 'Hour logging', 'Badge system'],
    },
    {
        id: 'sponsor',
        title: 'For Sponsors',
        desc: 'Fund projects with confidence. See exactly where your money goes.',
        color: 'var(--accent-sponsor)',
        colorSoft: 'var(--accent-sponsor-soft)',
        icon: Sparkles,
        features: ['Project discovery', 'Impact tracking', 'Tax receipts', 'CSR reporting'],
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            <CursorParticles />
            {/* ── Navbar ── */}
            <motion.nav
                className="landing-nav glass"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className="landing-nav__logo">
                    <span className="landing-nav__icon">◈</span>
                    <span className="landing-nav__text">sarvhit</span>
                </div>
                <div className="landing-nav__links">
                    <a href="#about" className="landing-nav__link" onClick={(e) => { e.preventDefault(); document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
                    <a href="#impact" className="landing-nav__link" onClick={(e) => { e.preventDefault(); document.querySelector('.stats-bento')?.scrollIntoView({ behavior: 'smooth' }); }}>Impact</a>
                    <a href="#roles" className="landing-nav__link" onClick={(e) => { e.preventDefault(); document.querySelector('.roles')?.scrollIntoView({ behavior: 'smooth' }); }}>Roles</a>
                </div>
                <div className="landing-nav__actions">
                    <button className="landing-nav__signin" onClick={() => navigate('/auth')}>
                        Sign In
                    </button>
                    <button className="landing-nav__cta" onClick={() => navigate('/auth')}>
                        Get Started
                        <ArrowRight size={16} />
                    </button>
                </div>
            </motion.nav>

            {/* ── Hero ── */}
            <motion.section
                className="hero"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                <div className="hero__content">
                    <motion.span className="hero__badge" variants={fadeUp} custom={0}>
                        Connecting hearts to hands
                    </motion.span>
                    <motion.h1 className="hero__title" variants={fadeUp} custom={1}>
                        Where good intentions<br />
                        <span className="gradient-text">become real impact</span>
                    </motion.h1>
                    <motion.p className="hero__subtitle" variants={fadeUp} custom={2}>
                        Sarvhit bridges the gap between NGOs, volunteers, and sponsors.
                        One platform. Three perspectives. Unlimited impact.
                    </motion.p>
                    <motion.div className="hero__actions" variants={fadeUp} custom={3}>
                        <button className="btn btn--primary" onClick={() => navigate('/auth')}>
                            Start Making Impact
                            <ArrowRight size={18} />
                        </button>
                        <button className="btn btn--ghost" onClick={() => {
                            document.querySelector('.roles')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            How it works
                        </button>
                    </motion.div>
                </div>

                <motion.div className="hero__visual" variants={fadeUp} custom={2}>
                    <div className="hero__orb hero__orb--1" />
                    <div className="hero__orb hero__orb--2" />
                    <div className="hero__orb hero__orb--3" />
                    <div className="hero__glow" />
                </motion.div>
            </motion.section>

            {/* ── Impact Marquee ── */}
            <ImpactMarquee />

            {/* ── Stats (Bento Grid) ── */}
            <motion.section
                className="stats-bento"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={stagger}
            >
                {STATS.map((s, i) => (
                    <motion.div
                        key={s.label}
                        className="bento-card"
                        variants={fadeUp}
                        custom={i}
                        style={{ gridArea: s.area }}
                    >
                        <img src={s.bg} alt="" className="bento-card__bg" loading="lazy" />
                        <div className="bento-card__overlay" />
                        <div className="bento-card__content">
                            <CountUp value={s.value} duration={2200} className="bento-card__value" />
                            <span className="bento-card__label">{s.label}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            {/* ── Past Events Carousel ── */}
            <EventCarousel />

            {/* ── About Flip Cards ── */}
            <AboutFlipCards />

            {/* ── Role Cards ── */}
            <motion.section
                className="roles"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={stagger}
            >
                <motion.h2 className="section-title" variants={fadeUp}>
                    One platform, built for everyone
                </motion.h2>
                <motion.p className="section-subtitle" variants={fadeUp}>
                    Whether you run an NGO, volunteer on weekends, or fund social projects — Sarvhit gives you a tailored experience.
                </motion.p>
                <div className="roles__grid">
                    {ROLES.map((role, i) => (
                        <motion.div
                            key={role.id}
                            className="role-card"
                            variants={fadeUp}
                            custom={i + 1}
                            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                            style={{ '--card-accent': role.color, '--card-accent-soft': role.colorSoft }}
                            onClick={() => navigate('/auth')}
                        >
                            <div className="role-card__icon-wrap">
                                <role.icon size={28} />
                            </div>
                            <h3 className="role-card__title">{role.title}</h3>
                            <p className="role-card__desc">{role.desc}</p>
                            <ul className="role-card__features">
                                {role.features.map(f => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                            <span className="role-card__link">
                                Join as {role.id === 'ngo' ? 'an NGO' : `a ${role.id}`}
                                <ArrowRight size={14} />
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="landing-footer__inner">
                    <span className="landing-footer__logo">◈ sarvhit</span>
                    <span className="landing-footer__text">Built with care — for the ones who care.</span>
                </div>
            </footer>
        </div>
    );
}
