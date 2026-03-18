import { useAuth } from '../../context/AuthContext';
import { ENTITIES, DISCOVER_POSTS } from '../../data/discover';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, ArrowUpRight, Heart, Sparkles, Shield,
    Filter, X, Check, ArrowLeft, MessageCircle, ChevronDown,
    ChevronLeft, ChevronRight, Share2, Send
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './DiscoverPage.css';

/* ═══════════════════════════════════════
   EXPLORE TILE — clean, no caption
   ═══════════════════════════════════════ */
function ExploreTile({ post, index, onClick }) {
    const hasImage = !!post.image;

    return (
        <motion.div
            className={`explore-tile ${hasImage ? 'explore-tile--image' : 'explore-tile--text'} explore-tile--${post.author.role}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.03 }}
            whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            onClick={() => onClick(index)}
            layout
        >
            {hasImage ? (
                <>
                    <img src={post.image} alt="" loading="lazy" />
                    {/* Hover overlay with stats */}
                    <div className="explore-tile__overlay">
                        <span><Heart size={16} fill="#fff" /> {post.likes}</span>
                        <span><MessageCircle size={16} fill="#fff" /> {post.comments}</span>
                    </div>
                </>
            ) : (
                /* Text-only tile — show icon + short text */
                <div className="explore-tile__text-body">
                    <span className="explore-tile__icon">{post.author.icon}</span>
                    <p>{post.content.slice(0, 80)}…</p>
                    <div className="explore-tile__overlay explore-tile__overlay--text">
                        <span><Heart size={16} fill="#fff" /> {post.likes}</span>
                        <span><MessageCircle size={16} fill="#fff" /> {post.comments}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   POST DETAIL MODAL — horizontal scroll
   ═══════════════════════════════════════ */
function PostModal({ posts, activeIndex, onClose, onNavigate }) {
    const post = posts[activeIndex];
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState('');
    const scrollRef = useRef(null);

    /* Reset liked state on post change */
    useEffect(() => { setLiked(false); setCommentText(''); }, [activeIndex]);

    /* Keyboard navigation */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && activeIndex < posts.length - 1) onNavigate(activeIndex + 1);
            if (e.key === 'ArrowLeft' && activeIndex > 0) onNavigate(activeIndex - 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [activeIndex, posts.length, onClose, onNavigate]);

    /* Block body scroll */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const likeCount = liked ? post.likes + 1 : post.likes;
    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < posts.length - 1;

    return (
        <motion.div
            className="post-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
        >
            {/* Close button */}
            <button className="post-modal__close" onClick={onClose}><X size={24} /></button>

            {/* Prev arrow */}
            {hasPrev && (
                <button
                    className="post-modal__nav post-modal__nav--prev"
                    onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex - 1); }}
                >
                    <ChevronLeft size={28} />
                </button>
            )}

            {/* Main modal card */}
            <motion.div
                key={post.id}
                className="post-modal"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: Image/content */}
                <div className={`post-modal__media ${post.image ? '' : 'post-modal__media--text'} post-modal__media--${post.author.role}`}>
                    {post.image ? (
                        <img src={post.image} alt="" />
                    ) : (
                        <div className="post-modal__text-content">
                            <span className="post-modal__big-icon">{post.author.icon}</span>
                            <p>{post.content}</p>
                        </div>
                    )}
                </div>

                {/* Right: Details + feedback */}
                <div className="post-modal__details" ref={scrollRef}>
                    {/* Author header */}
                    <div className="post-modal__author">
                        <div className={`post-modal__avatar post-modal__avatar--${post.author.role}`}>
                            {post.author.initials}
                        </div>
                        <div className="post-modal__author-info">
                            <span className="post-modal__author-name">{post.author.name}</span>
                            <span className="post-modal__author-meta">
                                {post.author.role === 'ngo' ? '🏛️ NGO' : post.author.role === 'sponsor' ? '💎 Sponsor' : '🤝 Volunteer'}
                                {' · '}{post.author.location}
                            </span>
                        </div>
                        <span className="post-modal__time">{post.time}</span>
                    </div>

                    {/* Post content */}
                    <div className="post-modal__content-area">
                        <p className="post-modal__content-text">{post.content}</p>
                        <div className="post-modal__tags">
                            {post.tags.map(tag => (
                                <span key={tag} className="post-modal__tag">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Engagement bar */}
                    <div className="post-modal__engagement">
                        <button
                            className={`post-modal__action ${liked ? 'post-modal__action--liked' : ''}`}
                            onClick={() => setLiked(!liked)}
                        >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                            <span>{likeCount}</span>
                        </button>
                        <button className="post-modal__action">
                            <MessageCircle size={18} />
                            <span>{post.feedback?.length || 0}</span>
                        </button>
                        <button className="post-modal__action">
                            <Share2 size={18} />
                        </button>
                    </div>

                    {/* Feedback/comments */}
                    <div className="post-modal__feedback">
                        <h4 className="post-modal__feedback-title">Comments</h4>
                        {(post.feedback || []).map((fb, i) => (
                            <div key={i} className="feedback-item">
                                <div className={`feedback-item__avatar feedback-item__avatar--${fb.role}`}>
                                    {fb.initials}
                                </div>
                                <div className="feedback-item__body">
                                    <div className="feedback-item__header">
                                        <span className="feedback-item__name">{fb.name}</span>
                                        <span className="feedback-item__time">{fb.time}</span>
                                    </div>
                                    <p className="feedback-item__text">{fb.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment input */}
                    <div className="post-modal__comment-input">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            className={`post-modal__send ${commentText.trim() ? 'post-modal__send--active' : ''}`}
                            disabled={!commentText.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Next arrow */}
            {hasNext && (
                <button
                    className="post-modal__nav post-modal__nav--next"
                    onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex + 1); }}
                >
                    <ChevronRight size={28} />
                </button>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   ANIMATED CHECKBOX
   ═══════════════════════════════════════ */
function FilterCheckbox({ label, isChecked, onToggle }) {
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
                {label}
                {isChecked && <span className="skill-checkbox__strike" />}
            </span>
        </motion.button>
    );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function DiscoverPage() {
    const { user } = useAuth();
    const role = user?.role;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tabFromUrl = searchParams.get('tab');

    /* View state */
    const [view, setView] = useState(tabFromUrl ? 'search' : 'explore');
    const [modalIndex, setModalIndex] = useState(null);

    const defaultTab = tabFromUrl || (role === 'ngo' ? 'volunteers' : 'ngos');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState(defaultTab);

    /* Filter state */
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filterLocationOpen, setFilterLocationOpen] = useState(true);
    const [filterSkillOpen, setFilterSkillOpen] = useState(true);
    const filterRef = useRef(null);
    const searchInputRef = useRef(null);

    /* Close filter dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Focus search input when switching to search view */
    useEffect(() => {
        if (view === 'search' && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [view]);

    const TABS = role === 'ngo'
        ? [{ key: 'volunteers', label: 'Volunteers', icon: Heart }, { key: 'sponsors', label: 'Sponsors', icon: Sparkles }]
        : role === 'volunteer'
            ? [{ key: 'ngos', label: 'NGOs', icon: Shield }, { key: 'sponsors', label: 'Sponsors', icon: Sparkles }]
            : [{ key: 'ngos', label: 'NGOs', icon: Shield }, { key: 'volunteers', label: 'Volunteers', icon: Heart }];

    const SEARCH_LABELS = { ngos: 'NGOs', volunteers: 'Volunteers', sponsors: 'Sponsors' };
    const searchLabel = SEARCH_LABELS[activeTab] || activeTab;

    const items = ENTITIES[activeTab] || [];

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
    const activeFilterCount = selectedCategories.length + selectedLocations.length;

    const filtered = useMemo(() => {
        return items.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(search.toLowerCase());
            const catArr = item[categoryField] || [];
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(c => catArr.includes(c));
            const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(item.location);
            return nameMatch && categoryMatch && locationMatch;
        });
    }, [items, search, selectedCategories, selectedLocations, categoryField]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSearch('');
        setSelectedCategories([]);
        setSelectedLocations([]);
        setShowFilters(false);
    };

    const enterSearch = useCallback(() => { setView('search'); }, []);

    const backToExplore = useCallback(() => {
        setView('explore');
        setSearch('');
        setSelectedCategories([]);
        setSelectedLocations([]);
        setShowFilters(false);
    }, []);

    const pageTitle = role === 'sponsor' ? 'Explore' : 'Discover';
    const pageDesc = role === 'ngo'
        ? 'Find volunteers and sponsors for your causes.'
        : role === 'volunteer'
            ? 'Find NGOs and causes that match your skills.'
            : 'Find NGOs and projects worth funding.';

    return (
        <div className="discover-page">
            {/* Post Modal */}
            <AnimatePresence>
                {modalIndex !== null && (
                    <PostModal
                        posts={DISCOVER_POSTS}
                        activeIndex={modalIndex}
                        onClose={() => setModalIndex(null)}
                        onNavigate={(idx) => setModalIndex(idx)}
                    />
                )}
            </AnimatePresence>

            {/* ═══ EXPLORE VIEW ═══ */}
            <AnimatePresence mode="wait">
                {view === 'explore' && (
                    <motion.div
                        key="explore-view"
                        className="explore-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div className="discover__header" {...fadeUp(0)}>
                            <h1>{pageTitle}</h1>
                            <p>{pageDesc}</p>
                        </motion.div>

                        {/* Fake search bar */}
                        <motion.div
                            className="discover__search discover__search--fake"
                            {...fadeUp(1)}
                            onClick={enterSearch}
                        >
                            <Search size={18} className="discover__search-icon" />
                            <span className="discover__search-placeholder">
                                Search people, NGOs, sponsors...
                            </span>
                        </motion.div>

                        {/* Instagram-style grid — no captions */}
                        <div className="explore-grid">
                            {DISCOVER_POSTS.map((post, i) => (
                                <ExploreTile
                                    key={post.id}
                                    post={post}
                                    index={i}
                                    onClick={(idx) => setModalIndex(idx)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══ SEARCH VIEW ═══ */}
                {view === 'search' && (
                    <motion.div
                        key="search-view"
                        className="search-view"
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                    >
                        <div className="search-view__top">
                            <motion.button
                                className="search-view__back"
                                onClick={backToExplore}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft size={20} />
                            </motion.button>

                            <div className="discover__search discover__search--active">
                                <Search size={18} className="discover__search-icon" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={`Search ${searchLabel}...`}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    autoFocus
                                />
                                {search && (
                                    <button className="discover__search-clear" onClick={() => setSearch('')}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Filter button */}
                            <div className="filter-dropdown-wrapper" ref={filterRef}>
                                <motion.button
                                    className={`filter-btn ${showFilters ? 'filter-btn--open' : ''} ${activeFilterCount > 0 ? 'filter-btn--has-active' : ''}`}
                                    onClick={() => setShowFilters(prev => !prev)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    <Filter size={20} />
                                    {activeFilterCount > 0 && (
                                        <span className="filter-btn__badge">{activeFilterCount}</span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showFilters && (
                                        <motion.div
                                            className="filter-dropdown"
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {hasActiveFilters && (
                                                <button className="filter-dropdown__clear-all" onClick={clearFilters}>
                                                    <X size={14} /> Clear all
                                                </button>
                                            )}

                                            <div className="filter-section">
                                                <button
                                                    className="filter-section__header"
                                                    onClick={() => setFilterLocationOpen(prev => !prev)}
                                                >
                                                    <MapPin size={14} />
                                                    <span>Location</span>
                                                    {selectedLocations.length > 0 && (
                                                        <span className="filter-section__count">{selectedLocations.length}</span>
                                                    )}
                                                    <ChevronDown
                                                        size={14}
                                                        className={`filter-section__chevron ${filterLocationOpen ? 'filter-section__chevron--open' : ''}`}
                                                    />
                                                </button>
                                                <AnimatePresence>
                                                    {filterLocationOpen && (
                                                        <motion.div
                                                            className="filter-section__list"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {uniqueLocations.map(loc => (
                                                                <FilterCheckbox
                                                                    key={loc}
                                                                    label={loc}
                                                                    isChecked={selectedLocations.includes(loc)}
                                                                    onToggle={() => toggleLocation(loc)}
                                                                />
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="filter-section">
                                                <button
                                                    className="filter-section__header"
                                                    onClick={() => setFilterSkillOpen(prev => !prev)}
                                                >
                                                    <Sparkles size={14} />
                                                    <span>{categoryLabel}</span>
                                                    {selectedCategories.length > 0 && (
                                                        <span className="filter-section__count">{selectedCategories.length}</span>
                                                    )}
                                                    <ChevronDown
                                                        size={14}
                                                        className={`filter-section__chevron ${filterSkillOpen ? 'filter-section__chevron--open' : ''}`}
                                                    />
                                                </button>
                                                <AnimatePresence>
                                                    {filterSkillOpen && (
                                                        <motion.div
                                                            className="filter-section__list"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {uniqueCategories.map(cat => (
                                                                <FilterCheckbox
                                                                    key={cat}
                                                                    label={cat}
                                                                    isChecked={selectedCategories.includes(cat)}
                                                                    onToggle={() => toggleCategory(cat)}
                                                                />
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {!tabFromUrl && (
                            <motion.div className="discover__tabs" {...fadeUp(1)}>
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

                        {hasActiveFilters && (
                            <motion.p className="discover-results-count" {...fadeUp(2)}>
                                Showing {filtered.length} of {items.length} {searchLabel.toLowerCase()}
                            </motion.p>
                        )}

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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
