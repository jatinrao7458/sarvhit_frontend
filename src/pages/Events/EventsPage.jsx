import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EVENTS, CAUSES } from '../../data/events';
import { fadeUp } from '../../hooks/useAnimations';
import { ProgressBar, FilterTag } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    CalendarDays, MapPin, Users, Clock, Plus, Filter, Search,
    IndianRupee, ArrowUpRight, Tag, X, Check, ChevronDown,
    Sparkles, Leaf, BookOpen, HeartPulse, Globe
} from 'lucide-react';
import './EventsPage.css';

const STATUS_OPTIONS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'full', label: 'Full' },
];

/* Genre icons for filter tags */
const GENRE_ICONS = {
    Environment: '🌿',
    Education: '📚',
    Healthcare: '💊',
    Community: '🤝',
};

/* ── Animated Checkbox (reusable) ── */
function EventCheckbox({ label, isChecked, onToggle, icon }) {
    return (
        <motion.button
            type="button"
            className={`skill-checkbox ${isChecked ? 'skill-checkbox--checked' : ''}`}
            onClick={onToggle}
            whileTap={{ scale: 0.95 }}
        >
            <div className="skill-checkbox__box">
                <svg className="skill-checkbox__border-svg" viewBox="0 0 24 24" fill="none">
                    <rect
                        className={`skill-checkbox__border-path ${isChecked ? 'skill-checkbox__border-path--active' : ''}`}
                        x="1" y="1" width="22" height="22" rx="5"
                        strokeWidth="2"
                    />
                </svg>
                <motion.div
                    className="skill-checkbox__fill"
                    animate={isChecked
                        ? { scale: [0, 1.15, 1], opacity: 1 }
                        : { scale: 0, opacity: 0 }
                    }
                    transition={isChecked
                        ? { duration: 0.35, delay: 0.65, ease: [0.22, 1, 0.36, 1] }
                        : { duration: 0.2 }
                    }
                />
                <AnimatePresence>
                    {isChecked && (
                        <motion.span
                            className="skill-checkbox__check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Check size={12} strokeWidth={3} color="#fff" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <span className="skill-checkbox__label">
                {icon && <span className="skill-checkbox__icon">{icon}</span>}
                {label}
                {isChecked && <span className="skill-checkbox__strike" />}
            </span>
        </motion.button>
    );
}

/* ── Collapsible Filter Section ── */
function FilterSection({ icon: Icon, title, count, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="filter-section">
            <button className="filter-section__header" onClick={() => setOpen(prev => !prev)}>
                {Icon && <Icon size={14} />}
                <span>{title}</span>
                {count > 0 && <span className="filter-section__count">{count}</span>}
                <ChevronDown
                    size={14}
                    className={`filter-section__chevron ${open ? 'filter-section__chevron--open' : ''}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="filter-section__list"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function EventsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = user?.role;

    const [activeCauses, setActiveCauses] = useState([]);
    const [activeStatuses, setActiveStatuses] = useState([]);
    const [activeLocations, setActiveLocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Unique locations from events data ── */
    const uniqueLocations = useMemo(() => {
        const set = new Set();
        EVENTS.forEach(e => {
            if (e.location) set.add(e.location);
        });
        return [...set].sort();
    }, []);

    /* ── Genre list (causes without 'All') ── */
    const genres = CAUSES.filter(c => c !== 'All');

    const toggleCause = (cause) => {
        setActiveCauses(prev =>
            prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
        );
    };

    const toggleStatus = (key) => {
        setActiveStatuses(prev =>
            prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
        );
    };

    const toggleLocation = (loc) => {
        setActiveLocations(prev =>
            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
        );
    };

    const clearFilters = () => {
        setActiveCauses([]);
        setActiveStatuses([]);
        setActiveLocations([]);
    };

    /* ── Filtered events ── */
    const filteredEvents = useMemo(() => {
        return EVENTS.filter(e => {
            const causeMatch = activeCauses.length === 0 || activeCauses.includes(e.cause);
            const statusMatch = activeStatuses.length === 0 || activeStatuses.includes(e.status);
            const locationMatch = activeLocations.length === 0 || activeLocations.includes(e.location);
            const textMatch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.orgName.toLowerCase().includes(searchQuery.toLowerCase());
            return causeMatch && statusMatch && locationMatch && textMatch;
        });
    }, [activeCauses, activeStatuses, activeLocations, searchQuery]);

    const hasActiveFilters = activeCauses.length > 0 || activeStatuses.length > 0 || activeLocations.length > 0 || searchQuery.length > 0;
    const totalActiveFilters = activeCauses.length + activeStatuses.length + activeLocations.length;

    const pageTitle = role === 'ngo' ? 'Manage Events' : role === 'sponsor' ? 'Fund Events' : 'Browse Events';
    const pageDesc = role === 'ngo'
        ? 'Create, edit, and track your events.'
        : role === 'sponsor'
            ? 'Discover projects to fund and see where your money goes.'
            : 'Find events that match your skills and passions.';

    return (
        <div className="events-page">
            <motion.div className="events-page__header" {...fadeUp(0)}>
                <div>
                    <h1>{pageTitle}</h1>
                    <p>{pageDesc}</p>
                </div>
                <div className="events-page__header-actions">
                    <motion.button
                        className="events-page__my-events-btn"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/app/my-events')}
                    >
                        <CalendarDays size={16} />
                        My Events
                    </motion.button>
                    {role === 'ngo' && (
                        <motion.button
                            className="events-page__create-btn"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/ngo/create-event')}
                        >
                            <Plus size={18} />
                            Create Event
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* ── Filters ── */}
            <motion.div className="events-filters" {...fadeUp(1)}>
                {/* Search bar */}
                <div className="events-search">
                    <Search size={18} className="events-search__icon" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="events-search__clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Right side: Clear All + Filters dropdown */}
                <div className="events-filters__right">
                    <AnimatePresence>
                        {hasActiveFilters && (
                            <motion.button
                                className="filter-clear-all"
                                onClick={clearFilters}
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X size={14} /> Clear all
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <div className="filter-dropdown-wrapper" ref={filterRef}>
                        <button
                            className={`filter-btn ${showFilters ? 'filter-btn--open' : ''} ${totalActiveFilters > 0 ? 'filter-btn--has-active' : ''}`}
                            onClick={() => setShowFilters(prev => !prev)}
                        >
                            <Filter size={16} />
                            Filters
                            {totalActiveFilters > 0 && (
                                <span className="filter-btn__badge">{totalActiveFilters}</span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    className="filter-dropdown"
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {/* Clear all within dropdown */}
                                    {hasActiveFilters && (
                                        <button className="filter-dropdown__clear-all" onClick={clearFilters}>
                                            <X size={14} /> Clear all filters
                                        </button>
                                    )}

                                    {/* Genre / Cause section */}
                                    <FilterSection icon={Leaf} title="Genre" count={activeCauses.length}>
                                        {genres.map(cause => (
                                            <EventCheckbox
                                                key={cause}
                                                label={cause}
                                                icon={GENRE_ICONS[cause]}
                                                isChecked={activeCauses.includes(cause)}
                                                onToggle={() => toggleCause(cause)}
                                            />
                                        ))}
                                    </FilterSection>

                                    {/* Location section */}
                                    <FilterSection icon={MapPin} title="Location" count={activeLocations.length}>
                                        {uniqueLocations.map(loc => (
                                            <EventCheckbox
                                                key={loc}
                                                label={loc}
                                                isChecked={activeLocations.includes(loc)}
                                                onToggle={() => toggleLocation(loc)}
                                            />
                                        ))}
                                    </FilterSection>

                                    {/* Status section */}
                                    <FilterSection icon={Clock} title="Status" count={activeStatuses.length}>
                                        {STATUS_OPTIONS.map(opt => (
                                            <EventCheckbox
                                                key={opt.key}
                                                label={opt.label}
                                                isChecked={activeStatuses.includes(opt.key)}
                                                onToggle={() => toggleStatus(opt.key)}
                                            />
                                        ))}
                                    </FilterSection>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Results count */}
            {hasActiveFilters && (
                <motion.p className="events-results-count" {...fadeUp(1)}>
                    Showing {filteredEvents.length} of {EVENTS.length} events
                </motion.p>
            )}

            {/* Events Grid */}
            <div className="events-grid">
                <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, i) => (
                        <motion.div
                            key={event.id}
                            className="event-card"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.04 }}
                            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                            onClick={() => navigate(`/app/events/${event.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="event-card__emoji">{event.image}</div>
                            <div className="event-card__body">
                                <div className="event-card__tags">
                                    <span className={`event-tag event-tag--${event.status}`}>
                                        {event.status === 'full' ? 'Full' : event.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                                    </span>
                                    <span className="event-tag event-tag--cause">
                                        <Tag size={10} />
                                        {event.cause}
                                    </span>
                                </div>

                                <h3 className="event-card__title">{event.title}</h3>
                                <p className="event-card__org">{event.orgName}</p>

                                <div className="event-card__meta">
                                    <span><CalendarDays size={13} /> {event.date}</span>
                                    <span><Clock size={13} /> {event.time}</span>
                                    <span><MapPin size={13} /> {event.location}</span>
                                </div>

                                {/* Volunteer spots bar */}
                                <div className="event-card__progress">
                                    <div className="event-card__progress-header">
                                        <span><Users size={13} /> {event.filled}/{event.spots} volunteers</span>
                                        <span>{Math.round(event.filled / event.spots * 100)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-bar__fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(event.filled / event.spots) * 100}%` }}
                                            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 + i * 0.05 }}
                                        />
                                    </div>
                                </div>

                                {/* Funding bar — visible to sponsors */}
                                {(role === 'sponsor' || role === 'ngo') && (
                                    <div className="event-card__progress event-card__progress--fund">
                                        <div className="event-card__progress-header">
                                            <span><IndianRupee size={13} /> ₹{(event.fundRaised / 1000).toFixed(0)}k / ₹{(event.fundGoal / 1000).toFixed(0)}k</span>
                                            <span>{Math.round(event.fundRaised / event.fundGoal * 100)}%</span>
                                        </div>
                                        <div className="progress-bar progress-bar--fund">
                                            <motion.div
                                                className="progress-bar__fill progress-bar__fill--fund"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(event.fundRaised / event.fundGoal) * 100}%` }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.35 + i * 0.05 }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="event-card__actions">
                                    {role === 'volunteer' && event.status !== 'full' && (
                                        <button className="event-card__btn event-card__btn--primary" onClick={() => navigate(`/app/events/${event.id}`)}>Join Event</button>
                                    )}
                                    {role === 'volunteer' && event.status === 'full' && (
                                        <button className="event-card__btn event-card__btn--disabled" disabled>Full</button>
                                    )}
                                    {role === 'sponsor' && event.fundRaised < event.fundGoal && (
                                        <button className="event-card__btn event-card__btn--primary" onClick={() => navigate(`/app/events/${event.id}`)}>Fund This</button>
                                    )}
                                    {role === 'ngo' && (
                                        <button className="event-card__btn event-card__btn--secondary" onClick={() => navigate(`/app/events/${event.id}`)}>Manage</button>
                                    )}
                                    <button className="event-card__btn event-card__btn--ghost" onClick={() => navigate(`/app/events/${event.id}`)}>
                                        Details <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty state */}
            {filteredEvents.length === 0 && (
                <motion.div className="events-empty" {...fadeUp(2)}>
                    <p>No events match your filters.</p>
                    <button className="filter-clear-all" onClick={clearFilters}>
                        <X size={14} /> Clear all filters
                    </button>
                </motion.div>
            )}
        </div>
    );
}
