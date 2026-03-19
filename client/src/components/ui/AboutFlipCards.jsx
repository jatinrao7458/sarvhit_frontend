import { motion } from 'framer-motion';
import { fadeUpVariant as fadeUp, staggerContainer as stagger } from '../../hooks/useAnimations';
import './AboutFlipCards.css';

const ABOUT_CARDS = [
    {
        keyword: 'Connect',
        title: 'Bridge the Gap',
        description:
            'We connect NGOs with passionate volunteers and generous sponsors — creating a unified ecosystem where every stakeholder finds their perfect match.',
    },
    {
        keyword: 'Empower',
        title: 'Fuel Real Change',
        description:
            'From managing events to tracking volunteer hours and channeling funds, Sarvhit empowers every participant with tools that amplify their impact.',
    },
    {
        keyword: 'Transparency',
        title: 'Trust at Every Level',
        description:
            'Every rupee tracked. Every hour logged. Every impact measured. Sarvhit ensures full transparency so sponsors, NGOs, and volunteers trust the process.',
    },
    {
        keyword: 'Scale',
        title: 'Grow Your Reach',
        description:
            'Whether you\'re in one city or thirty-five, Sarvhit scales with you — helping NGOs expand their volunteer base and sponsors discover high-impact projects.',
    },
];

export default function AboutFlipCards() {
    return (
        <motion.section
            className="about-flip"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
        >
            <div className="about-flip__left">
                <motion.span className="about-flip__badge" variants={fadeUp}>
                    Why Sarvhit?
                </motion.span>
                <motion.h2 className="about-flip__heading" variants={fadeUp}>
                    More About <span className="gradient-text">Us</span>
                </motion.h2>
                <motion.p className="about-flip__desc" variants={fadeUp}>
                    We're building the infrastructure for social good — one connection at a time.
                </motion.p>

                {/* Decorative orb */}
                <div className="about-flip__orb-wrap">
                    <div className="about-flip__orb" />
                    <div className="about-flip__ring about-flip__ring--1" />
                    <div className="about-flip__ring about-flip__ring--2" />
                    <div className="about-flip__ring about-flip__ring--3" />
                </div>
            </div>

            <div className="about-flip__grid">
                {ABOUT_CARDS.map((card, i) => (
                    <motion.div
                        key={card.keyword}
                        className="flip-card"
                        variants={fadeUp}
                        custom={i + 1}
                    >
                        <div className="flip-card__inner">
                            {/* Front */}
                            <div className="flip-card__front">
                                <div className="flip-card__pattern" />
                                <span className="flip-card__keyword">{card.keyword}</span>
                            </div>
                            {/* Back */}
                            <div className="flip-card__back">
                                <h3 className="flip-card__title">{card.title}</h3>
                                <p className="flip-card__text">{card.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
