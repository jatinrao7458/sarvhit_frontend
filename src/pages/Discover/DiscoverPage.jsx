import { useAuth } from '../../context/AuthContext';
import { ENTITIES } from '../../data/discover';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, ArrowUpRight, Heart, Sparkles, Shield,
    Filter, X, Check
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './DiscoverPage.css';

export default function DiscoverPage() {
    const { user } = useAuth();
    const role = user?.role;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tabFromUrl = searchParams.get('tab');

    const defaultTab = tabFromUrl || (role === 'ngo' ? 'volunteers' : 'ngos');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState(defaultTab);

    /* ── Filter state ── */
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showFilterRow, setShowFilterRow] = useState(false);
    const filterRef = useRef(null);
    const searchAreaRef = useRef(null);

    /* Close dropdown / filter row on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false);
            }
            if (searchAreaRef.current && !searchAreaRef.current.contains(e.target)) {
                setShowFilterRow(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const TABS = role === 'ngo'
        ? [{ key: 'volunteers', label: 'Volunteers', icon: Heart }, { key: 'sponsors', label: 'Sponsors', icon: Sparkles }]
        : role === 'volunteer'
            ? [{ key: 'ngos', label: 'NGOs', icon: Shield }, { key: 'sponsors', label: 'Sponsors', icon: Sparkles }]
            : [{ key: 'ngos', label: 'NGOs', icon: Shield }, { key: 'volunteers', label: 'Volunteers', icon: Heart }];

    const SEARCH_LABELS = { ngos: 'NGOs', volunteers: 'Volunteers', sponsors: 'Sponsors' };
    const searchLabel = SEARCH_LABELS[activeTab] || activeTab;

    const pageTitle = role === 'sponsor' ? 'Explore' : 'Discover';

    const items = ENTITIES[activeTab] || [];

    /* ── Derive unique filter values from data ── */
    const categoryField = activeTab === 'ngos' ? 'causes' : activeTab === 'volunteers' ? 'skills' : 'sectors';
    const categoryLabel = activeTab === 'ngos' ? 'Causes' : activeTab === 'volunteers' ? 'Skills' : 'Sectors';

    const uniqueCategories = useMemo(() => {
        const set = new Set();
        items.forEach(item => {
            const arr = item[categoryField];
            if (arr) arr.forEach(v => set.add(v));
        });
        return [...set].sort();
    }, [items, categoryField]);

    const uniqueLocations = useMemo(() => {
        const set = new Set();
        items.forEach(item => { if (item.location) set.add(item.location); });
        return [...set].sort();
    }, [items]);

    /* ── Toggle helpers ── */
    const toggleCategory = (val) => {
        setSelectedCategories(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const toggleLocation = (val) => {
        setSelectedLocations(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedLocations([]);
    };

    const hasActiveFilters = selectedCategories.length > 0 || selectedLocations.length > 0;

    /* ── Filtered results ── */
    const filtered = useMemo(() => {
        return items.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(search.toLowerCase());
            const catArr = item[categoryField] || [];
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(c => catArr.includes(c));
            const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(item.location);
            return nameMatch && categoryMatch && locationMatch;
        });
    }, [items, search, selectedCategories, selectedLocations, categoryField]);

    /* Reset filters on tab change */
    const handleTabChange = (key) => {
        setActiveTab(key);
        setSearch('');
        setSelectedCategories([]);
        setSelectedLocations([]);
        setShowFilters(false);
    };

    const pageDesc = role === 'ngo'
        ? 'Find volunteers and sponsors for your causes.'
        : role === 'volunteer'
            ? 'Find NGOs and causes that match your skills.'
            : 'Find NGOs and projects worth funding.';

    /* ── Animated checkbox renderer ── */
    const renderCheckbox = (label, isChecked, onToggle, key) => (
        <motion.button
            type="button"
            key={key}
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
                {label}
                {isChecked && <span className="skill-checkbox__strike" />}
            </span>
        </motion.button>
    );

    return (
        <div className="discover-page">
            <motion.div className="discover__header" {...fadeUp(0)}>
                <h1>{pageTitle}</h1>
                <p>{pageDesc}</p>
            </motion.div>

            {/* Search + Filters area */}
            <div ref={searchAreaRef}>
                <motion.div className="discover__search" {...fadeUp(1)}>
                    <Search size={18} className="discover__search-icon" />
                    <input
                        type="text"
                        placeholder={`Search ${searchLabel}...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setShowFilterRow(true)}
                    />
                </motion.div>

                {/* Tabs */}
                {!tabFromUrl && (
                    <motion.div className="discover__tabs" {...fadeUp(2)}>
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`discover-tab ${activeTab === tab.key ? 'discover-tab--active' : ''}`}
                                onClick={() => handleTabChange(tab.key)}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Filters — revealed on search click */}
                <AnimatePresence>
                    {(showFilterRow || hasActiveFilters) && (
                        <motion.div
                            className="discover-filters"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: undefined }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Category pills */}
                            <div className="discover-filters__tags">
                                {uniqueCategories.map(cat =>
                                    renderCheckbox(cat, selectedCategories.includes(cat), () => toggleCategory(cat), cat)
                                )}
                            </div>

                            {/* Right side: Clear All + Filters dropdown */}
                            <div className="discover-filters__right">
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
                                        className={`filter-btn ${showFilters ? 'filter-btn--open' : ''} ${selectedLocations.length > 0 ? 'filter-btn--has-active' : ''}`}
                                        onClick={() => setShowFilters(prev => !prev)}
                                    >
                                        <Filter size={16} />
                                        Filters
                                        {selectedLocations.length > 0 && (
                                            <span className="filter-btn__badge">{selectedLocations.length}</span>
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
                                                <div className="filter-dropdown__header">
                                                    <span>Location</span>
                                                    {selectedLocations.length > 0 && (
                                                        <button className="filter-dropdown__clear" onClick={() => setSelectedLocations([])}>
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                {uniqueLocations.map(loc =>
                                                    renderCheckbox(
                                                        loc,
                                                        selectedLocations.includes(loc),
                                                        () => toggleLocation(loc),
                                                        loc
                                                    )
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results count */}
            {hasActiveFilters && (
                <motion.p className="discover-results-count" {...fadeUp(2)}>
                    Showing {filtered.length} of {items.length} {searchLabel.toLowerCase()}
                </motion.p>
            )}

            {/* Grid */}
            <div className="discover__grid">
                <AnimatePresence mode="popLayout">
                    {filtered.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="discover-card"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.04 }}
                            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                            onClick={() => navigate(`/app/discover/${item.type}/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="discover-card__header">
                                <span className="discover-card__icon">{item.icon}</span>
                                <div>
                                    <h3>{item.name}</h3>
                                    <span className="discover-card__location"><MapPin size={12} /> {item.location}</span>
                                </div>
                            </div>

                            {/* NGO specific */}
                            {item.type === 'ngo' && (
                                <>
                                    <div className="discover-card__tags">
                                        {item.causes.map(c => <span key={c} className="discover-tag">{c}</span>)}
                                    </div>
                                    <div className="discover-card__stats">
                                        <span><Star size={13} /> {item.rating}</span>
                                        <span>{item.events} events</span>
                                    </div>
                                </>
                            )}

                            {/* Volunteer specific */}
                            {item.type === 'volunteer' && (
                                <>
                                    <div className="discover-card__tags">
                                        {item.skills.map(s => <span key={s} className="discover-tag">{s}</span>)}
                                    </div>
                                    <div className="discover-card__stats">
                                        <span>{item.badge} {item.hours}h logged</span>
                                    </div>
                                </>
                            )}

                            {/* Sponsor specific */}
                            {item.type === 'sponsor' && (
                                <>
                                    <div className="discover-card__tags">
                                        {item.sectors.map(s => <span key={s} className="discover-tag">{s}</span>)}
                                    </div>
                                    <div className="discover-card__stats">
                                        <span>{item.donated} donated</span>
                                        <span>{item.projects} projects</span>
                                    </div>
                                </>
                            )}

                            <button
                                className="discover-card__connect"
                                onClick={() => navigate(`/app/discover/${item.type}/${item.id}`)}
                            >
                                {role === 'ngo' && item.type === 'volunteer' ? 'Invite' :
                                    role === 'ngo' && item.type === 'sponsor' ? 'Reach Out' :
                                        role === 'volunteer' ? 'View' :
                                            'Connect'}
                                <ArrowUpRight size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <motion.div className="discover__empty" {...fadeUp(2)}>
                    <p>No results found. Try a different search or filter.</p>
                    {hasActiveFilters && (
                        <button className="filter-clear-all" onClick={clearFilters}>
                            <X size={14} /> Clear all filters
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
