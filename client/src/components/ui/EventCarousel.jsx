import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './EventCarousel.css';

const EVENTS = [
    {
        id: 1,
        title: 'Clean River Drive',
        location: 'Mumbai, Maharashtra',
        date: 'Jan 2026',
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    },
    {
        id: 2,
        title: 'Tree Plantation Rally',
        location: 'Pune, Maharashtra',
        date: 'Dec 2025',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    },
    {
        id: 3,
        title: 'Food for All Campaign',
        location: 'Delhi, NCR',
        date: 'Nov 2025',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    },
    {
        id: 4,
        title: 'Education Outreach',
        location: 'Jaipur, Rajasthan',
        date: 'Oct 2025',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    },
    {
        id: 5,
        title: 'Health Check-up Camp',
        location: 'Bangalore, Karnataka',
        date: 'Sep 2025',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    },
    {
        id: 6,
        title: 'Women Empowerment Workshop',
        location: 'Chennai, Tamil Nadu',
        date: 'Aug 2025',
        image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80',
    },
    {
        id: 7,
        title: 'Beach Cleanup Drive',
        location: 'Goa',
        date: 'Jul 2025',
        image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
    },
];

function getCardStyle(offset, total) {
    // offset: distance from center (e.g., -2, -1, 0, 1, 2)
    const absOffset = Math.abs(offset);
    const maxVisible = 2;

    if (absOffset > maxVisible) {
        return {
            opacity: 0,
            scale: 0.6,
            x: offset * 280,
            zIndex: 0,
            filter: 'grayscale(100%) brightness(0.5)',
        };
    }

    const scale = 1 - absOffset * 0.15;
    const x = offset * 300;
    const zIndex = maxVisible - absOffset + 1;
    const opacity = 1 - absOffset * 0.15;

    return {
        opacity,
        scale,
        x,
        zIndex,
        filter: absOffset === 0 ? 'grayscale(0%) brightness(1)' : `grayscale(100%) brightness(${0.7 - absOffset * 0.1})`,
    };
}

export default function EventCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const total = EVENTS.length;

    const goNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const goPrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(goNext, 3500);
        return () => clearInterval(timer);
    }, [goNext]);

    const getOffset = (index) => {
        let diff = index - activeIndex;
        // wrap around
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
    };

    return (
        <section className="events-carousel-section">
            <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                Our Journey So Far
            </motion.h2>
            <motion.p
                className="section-subtitle"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                Relive the moments that made a difference. Here are some of our most impactful events.
            </motion.p>

            <div className="events-carousel">
                <button className="events-carousel__arrow events-carousel__arrow--left" onClick={goPrev} aria-label="Previous event">
                    <ChevronLeft size={28} />
                </button>

                <div className="events-carousel__track">
                    {EVENTS.map((event, index) => {
                        const offset = getOffset(index);
                        const style = getCardStyle(offset, total);
                        const isActive = offset === 0;

                        return (
                            <motion.div
                                key={event.id}
                                className={`events-carousel__card ${isActive ? 'events-carousel__card--active' : ''}`}
                                animate={{
                                    x: style.x,
                                    scale: style.scale,
                                    opacity: style.opacity,
                                    zIndex: style.zIndex,
                                    filter: style.filter,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 30,
                                }}
                                onClick={() => setActiveIndex(index)}
                            >
                                <img src={event.image} alt={event.title} className="events-carousel__img" loading="lazy" />
                                <div className="events-carousel__overlay" />
                                <div className="events-carousel__info">
                                    <span className="events-carousel__date">{event.date}</span>
                                    <h3 className="events-carousel__title">{event.title}</h3>
                                    <span className="events-carousel__location">{event.location}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <button className="events-carousel__arrow events-carousel__arrow--right" onClick={goNext} aria-label="Next event">
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Dots */}
            <div className="events-carousel__dots">
                {EVENTS.map((_, i) => (
                    <button
                        key={i}
                        className={`events-carousel__dot ${i === activeIndex ? 'events-carousel__dot--active' : ''}`}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Go to event ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
