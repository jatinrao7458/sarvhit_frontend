import { useAuth } from '../../context/AuthContext';
import { LOCATIONS, CAUSES_FILTER } from '../../data/locations';
import { SEED_AFFECTED_AREAS, getAreaColor, getAreaLabel, MERGE_RADIUS } from '../../data/affectedAreas';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Layers, AlertTriangle, X, Send, Target, Search, Navigation, Crosshair, ChevronRight, Users, Clock, Calendar, MapPinIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { Fragment, useState, useCallback, useEffect, useRef } from 'react';
import { eventService } from '../../services/eventService';
import { volunteerService } from '../../services/volunteerService';
import 'leaflet/dist/leaflet.css';
import './ImpactMapPage.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Custom icons ── */
const userIcon = new L.DivIcon({
    className: 'map-user-icon',
    html: '<div class="map-user-icon__pulse"></div><div class="map-user-icon__dot"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const personIcon = (color = '#6366f1') => new L.DivIcon({
    className: 'map-person-icon',
    html: `<div class="map-person-icon__ring" style="border-color:${color}"></div><div class="map-person-icon__dot" style="background:${color}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

/* ── Event icon ── */
const eventIcon = (emoji = '🎯') => new L.DivIcon({
    className: 'map-event-icon',
    html: `<div class="map-event-icon__marker"><span class="map-event-icon__emoji">${emoji}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const reportAreaIcon = new L.DivIcon({
    className: 'map-report-area-icon',
    html: '<div class="map-report-area-icon__marker"><span class="map-report-area-icon__emoji">⚠️</span></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});

/* ── Nearby people data ── */
const NEARBY_PEOPLE = [
    { id: 'p1', name: 'Ananya Patel', role: 'Volunteer', avatar: '👩‍💼', lat: 28.6229, lng: 77.2195, online: true, activity: 'Clean River Drive' },
    { id: 'p2', name: 'Vikram Singh', role: 'Volunteer', avatar: '👨‍🔧', lat: 28.6050, lng: 77.2250, online: true, activity: 'Tree Plantation' },
    { id: 'p3', name: 'Priya Sharma', role: 'Coordinator', avatar: '👩‍🏫', lat: 28.6350, lng: 77.1980, online: false, activity: 'Digital Literacy' },
    { id: 'p4', name: 'Rahul Verma', role: 'First Aid Lead', avatar: '👨‍⚕️', lat: 28.5900, lng: 77.2100, online: true, activity: 'Health Camp' },
    { id: 'p5', name: 'Sneha Gupta', role: 'Volunteer', avatar: '👩‍🎨', lat: 19.0800, lng: 72.8800, online: true, activity: 'Beach Cleanup' },
    { id: 'p6', name: 'Arjun Kumar', role: 'Tech Support', avatar: '👨‍💻', lat: 12.9750, lng: 77.5980, online: false, activity: 'Code for Kids' },
    { id: 'p7', name: 'Meera Joshi', role: 'Educator', avatar: '👩‍🔬', lat: 18.5250, lng: 73.8600, online: true, activity: 'Digital Literacy' },
    { id: 'p8', name: 'Deepa Nair', role: 'Volunteer', avatar: '👩‍🌾', lat: 28.4600, lng: 77.0300, online: true, activity: 'Tree Plantation' },
];

const LEGEND_ITEMS = [
    { color: '#22c55e', label: '0–10 reports', severity: 'Low' },
    { color: '#eab308', label: '11–25 reports', severity: 'Moderate' },
    { color: '#f97316', label: '26–50 reports', severity: 'High' },
    { color: '#ef4444', label: '51+ reports', severity: 'Critical' },
];

/* ── Map sub-components ── */
function MapClickHandler({ active, onMapClick }) {
    useMapEvents({ click(e) { if (active) onMapClick(e.latlng); } });
    return null;
}

function FlyToLocation({ coords, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, zoom || 14, { duration: 1.2 });
    }, [coords, zoom, map]);
    return null;
}

function LocateUser({ onLocated }) {
    const map = useMap();
    useEffect(() => {
        map.locate({ setView: false, maxZoom: 14, enableHighAccuracy: true });
        const onFound = (e) => onLocated({ lat: e.latlng.lat, lng: e.latlng.lng });
        map.on('locationfound', onFound);
        return () => map.off('locationfound', onFound);
    }, [map, onLocated]);
    return null;
}

/* ── Search bar (uses Nominatim for geocoding) ── */
function SearchBar({ onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);

    const doSearch = useCallback(async (q) => {
        if (q.length < 3) { setResults([]); return; }
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`);
            const data = await res.json();
            setResults(data.map(d => ({ display: d.display_name, lat: +d.lat, lng: +d.lon })));
        } catch { setResults([]); }
        setLoading(false);
    }, []);

    const handleInput = (val) => {
        setQuery(val);
        setOpen(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 400);
    };

    const pick = (r) => {
        setQuery(r.display.split(',')[0]);
        setOpen(false);
        setResults([]);
        onSelect({ lat: r.lat, lng: r.lng });
    };

    return (
        <div className="map-search">
            <Search size={16} className="map-search__icon" />
            <input
                type="text"
                className="map-search__input"
                placeholder="Search location…"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => results.length && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
            />
            {loading && <span className="map-search__spinner" />}
            <AnimatePresence>
                {open && results.length > 0 && (
                    <motion.div
                        className="map-search__dropdown"
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    >
                        {results.map((r, i) => (
                            <button key={i} className="map-search__result" onMouseDown={() => pick(r)}>
                                <MapPin size={13} />
                                <span>{r.display}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Main component ── */
export default function ImpactMapPage() {
    const { user } = useAuth();
    const userRole = user?.userType || user?.role;
    const [activeCause, setActiveCause] = useState('All');
    const [affectedAreas, setAffectedAreas] = useState(SEED_AFFECTED_AREAS);
    const [placementMode, setPlacementMode] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [pendingCoords, setPendingCoords] = useState(null);
    const [reportForm, setReportForm] = useState({ name: '', cause: 'Environment' });
    const [showPeople, setShowPeople] = useState(true);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [volunteersLoading, setVolunteersLoading] = useState(false);

    // Location state
    const [userLocation, setUserLocation] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);
    const [flyZoom, setFlyZoom] = useState(14);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [sidebarTab, setSidebarTab] = useState('locations'); // locations | people | events

    const canReport = userRole === 'volunteer';

    // Fetch published events
    useEffect(() => {
        const fetchEvents = async () => {
            setEventsLoading(true);
            try {
                const response = await eventService.getAllEvents();
                if (response.events) {
                    setEvents(response.events);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setEventsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Fetch real volunteers
    useEffect(() => {
        const fetchVolunteers = async () => {
            setVolunteersLoading(true);
            try {
                const response = await volunteerService.getAllVolunteers();
                if (response.volunteers) {
                    setVolunteers(response.volunteers);
                }
            } catch (error) {
                console.error('Error fetching volunteers:', error);
                setVolunteers([]);
            } finally {
                setVolunteersLoading(false);
            }
        };
        fetchVolunteers();
    }, []);

    const filtered = activeCause === 'All' ? LOCATIONS : LOCATIONS.filter(l => l.cause === activeCause);
    const filteredAreas = activeCause === 'All' ? affectedAreas : affectedAreas.filter(a => a.cause === activeCause);
    const filteredEvents = activeCause === 'All' ? events : events.filter(e => e.cause === activeCause);

    // Handlers
    const handleMapClick = useCallback((latlng) => {
        setPendingCoords({ lat: latlng.lat, lng: latlng.lng });
        setShowReportModal(true);
        setPlacementMode(false);
    }, []);

    const handleReportSubmit = useCallback((e) => {
        e.preventDefault();
        if (!pendingCoords || !reportForm.name.trim()) return;

        setAffectedAreas(prev => {
            const nearby = prev.find(a =>
                Math.abs(a.lat - pendingCoords.lat) < MERGE_RADIUS &&
                Math.abs(a.lng - pendingCoords.lng) < MERGE_RADIUS
            );
            if (nearby) return prev.map(a => a.id === nearby.id ? { ...a, reports: a.reports + 1 } : a);
            return [...prev, { id: Date.now(), lat: pendingCoords.lat, lng: pendingCoords.lng, name: reportForm.name.trim(), cause: reportForm.cause, reports: 1 }];
        });

        setShowReportModal(false);
        setPendingCoords(null);
        setReportForm({ name: '', cause: 'Environment' });
    }, [pendingCoords, reportForm]);

    const handleModalClose = () => {
        setShowReportModal(false);
        setPendingCoords(null);
        setReportForm({ name: '', cause: 'Environment' });
    };

    const handleUserLocated = useCallback((coords) => {
        setUserLocation(coords);
        // Initial fly to user location
        if (!flyTarget) {
            setFlyTarget(coords);
            setFlyZoom(13);
        }
    }, [flyTarget]);

    const goToMyLocation = () => {
        if (userLocation) {
            setFlyTarget({ ...userLocation, _t: Date.now() });
            setFlyZoom(15);
        }
    };

    const goToPerson = (person) => {
        setSelectedPerson(person);
        setFlyTarget({ lat: person.lat, lng: person.lng, _t: Date.now() });
        setFlyZoom(16);
    };

    const goToLocation = (loc) => {
        setFlyTarget({ lat: loc.lat, lng: loc.lng, _t: Date.now() });
        setFlyZoom(14);
    };

    const goToEvent = (event) => {
        // Parse location string to get coordinates or use default
        // For now, we'll use center of India as fallback
        const lat = event.lat || 28.6139;
        const lng = event.lng || 77.2090;
        setFlyTarget({ lat, lng, _t: Date.now() });
        setFlyZoom(16);
    };

    const handleSearchSelect = (coords) => {
        setFlyTarget({ ...coords, _t: Date.now() });
        setFlyZoom(14);
    };

    // Get emoji for event based on cause
    const getCauseEmoji = (cause) => {
        const emojiMap = {
            'Environment': '🌍',
            'Education': '📚',
            'Healthcare': '🏥',
            'Community': '🤝',
            'Animal Welfare': '🐾',
            'Disaster Relief': '🚨'
        };
        return emojiMap[cause] || '🎯';
    };

    const formatPersonId = (id) => {
        if (!id) return 'N/A';
        const raw = typeof id === 'string' ? id : String(id);
        return raw.length > 14 ? `${raw.slice(0, 6)}...${raw.slice(-4)}` : raw;
    };

    return (
        <div className="impact-map-page impact-map-page--fullscreen">
            {/* Top bar overlay */}
            <div className="map-topbar">
                <div className="map-topbar__left">
                    <SearchBar onSelect={handleSearchSelect} />
                    <div className="map-topbar__filters">
                        {CAUSES_FILTER.map(c => (
                            <button key={c}
                                className={`filter-tag ${activeCause === c ? 'filter-tag--active' : ''}`}
                                onClick={() => setActiveCause(c)}
                            >{c}</button>
                        ))}
                    </div>
                </div>
                <div className="map-topbar__right">
                    {canReport && (
                        <button
                            className={`report-affected-btn ${placementMode ? 'report-affected-btn--active' : ''}`}
                            onClick={() => setPlacementMode(p => !p)}
                        >
                            <AlertTriangle size={14} />
                            {placementMode ? 'Cancel' : 'Report Area'}
                        </button>
                    )}
                </div>
            </div>

            {/* Placement hint */}
            <AnimatePresence>
                {placementMode && (
                    <motion.div className="placement-hint"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        <Target size={16} className="placement-hint__icon" />
                        <span>Click anywhere on the map to place your report</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map */}
            <div className="impact-map__map-wrap impact-map__map-wrap--full">
                <MapContainer
                    center={[22.5, 78.5]}
                    zoom={5}
                    scrollWheelZoom={true}
                    zoomControl={false}
                    className="impact-map__leaflet"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <MapClickHandler active={placementMode} onMapClick={handleMapClick} />
                    <LocateUser onLocated={handleUserLocated} />
                    {flyTarget && <FlyToLocation coords={flyTarget} zoom={flyZoom} />}

                    {/* User's live location */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                            <Popup><div className="map-popup"><strong>📍 You are here</strong></div></Popup>
                        </Marker>
                    )}

                    {/* Nearby people */}
                    {showPeople && (volunteers.length > 0 ? volunteers : NEARBY_PEOPLE).map(p => (
                        <Marker key={p.id} position={[p.lat, p.lng]} icon={personIcon(p.online ? '#22c55e' : '#64748b')}>
                            <Popup>
                                <div className="map-popup map-popup--person">
                                    <div className="map-popup__person-header">
                                        <span className="map-popup__person-avatar">{p.avatar}</span>
                                        <div>
                                            <strong>{p.name}</strong>
                                            <span className="map-popup__person-role">{p.role}</span>
                                        </div>
                                    </div>
                                    <span className={`map-popup__online ${p.online ? 'map-popup__online--yes' : ''}`}>
                                        {p.online ? '● Online' : '○ Offline'}
                                    </span>
                                    <span className="map-popup__activity">Working on: {p.activity}</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Location markers */}
                    {filtered.map(loc => (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                            <Popup>
                                <div className="map-popup">
                                    <strong>{loc.title}</strong>
                                    <span className="map-popup__cause">{loc.cause}</span>
                                    <span>{loc.volunteers} volunteers</span>
                                    <span>{loc.funds} raised</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Event markers */}
                    {filteredEvents.map(event => {
                        // Parse location or use center of India as default
                        const lat = event.lat || 28.6139;
                        const lng = event.lng || 77.2090;
                        const emoji = getCauseEmoji(event.cause);
                        
                        return (
                            <Marker key={event._id} position={[lat, lng]} icon={eventIcon(emoji)}>
                                <Popup>
                                    <div className="map-popup map-popup--event">
                                        <div className="map-popup__event-header">
                                            <span className="map-popup__event-emoji">{emoji}</span>
                                            <strong>{event.title}</strong>
                                        </div>
                                        <span className="map-popup__cause">{event.cause}</span>
                                        <span className="map-popup__event-location">
                                            <MapPin size={12} /> {event.location}
                                        </span>
                                        <span className="map-popup__event-date">
                                            <Calendar size={12} /> {event.date} at {event.time}
                                        </span>
                                        <span className="map-popup__event-spots">
                                            <Users size={12} /> {event.spots} spots available
                                        </span>
                                        <span className="map-popup__event-org">
                                            Organized by: {event.orgName}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Affected areas */}
                    {filteredAreas.map(area => (
                        <Fragment key={area.id}>
                            <Marker position={[area.lat, area.lng]} icon={reportAreaIcon}>
                                <Popup>
                                    <div className="map-popup map-popup--area">
                                        <strong>{area.name}</strong>
                                        <span className="map-popup__cause">{area.cause}</span>
                                        <span className="map-popup__reports">{area.reports} report{area.reports !== 1 ? 's' : ''}</span>
                                        <span className="map-popup__severity" style={{ color: getAreaColor(area.reports) }}>
                                            {getAreaLabel(area.reports)} severity
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                            <Circle
                                center={[area.lat, area.lng]}
                                radius={Math.min(8000 + area.reports * 300, 30000)}
                                pathOptions={{ color: getAreaColor(area.reports), fillColor: getAreaColor(area.reports), fillOpacity: 0.25, weight: 2 }}
                            />
                        </Fragment>
                    ))}
                </MapContainer>

                {/* Map controls */}
                <div className="map-controls">
                    <button className="map-control-btn" onClick={goToMyLocation} title="My Location">
                        <Crosshair size={18} />
                    </button>
                    <button className={`map-control-btn ${showPeople ? 'map-control-btn--active' : ''}`}
                        onClick={() => setShowPeople(p => !p)} title="Toggle People">
                        <Users size={18} />
                    </button>
                </div>

                {/* Legend */}
                <div className="impact-map__legend">
                    <span className="impact-map__legend-title">Affected Areas</span>
                    {LEGEND_ITEMS.map(item => (
                        <div key={item.severity} className="legend-item">
                            <span className="legend-item__dot" style={{ background: item.color }} />
                            <span className="legend-item__label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            <div className="map-sidebar">
                <div className="map-sidebar__tabs">
                    <button className={`map-sidebar__tab ${sidebarTab === 'locations' ? 'map-sidebar__tab--active' : ''}`}
                        onClick={() => setSidebarTab('locations')}>
                        <Layers size={14} /> Locations ({filtered.length})
                    </button>
                    <button className={`map-sidebar__tab ${sidebarTab === 'people' ? 'map-sidebar__tab--active' : ''}`}
                        onClick={() => setSidebarTab('people')}>
                        <Users size={14} /> People ({volunteers.length > 0 ? volunteers.length : NEARBY_PEOPLE.length})
                    </button>
                    <button className={`map-sidebar__tab ${sidebarTab === 'events' ? 'map-sidebar__tab--active' : ''}`}
                        onClick={() => setSidebarTab('events')}>
                        <Calendar size={14} /> Events ({filteredEvents.length})
                    </button>
                </div>

                <div className="map-sidebar__content">
                    {sidebarTab === 'locations' && (
                        <div className="map-sidebar__list">
                            {filtered.map((loc, i) => (
                                <motion.div
                                    key={loc.id}
                                    className="impact-location-card"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 + i * 0.03 }}
                                    onClick={() => goToLocation(loc)}
                                >
                                    <div className="impact-location__top">
                                        <span className="impact-location__title">{loc.title}</span>
                                        <span className={`impact-location__cause impact-location__cause--${loc.cause.toLowerCase()}`}>
                                            {loc.cause}
                                        </span>
                                    </div>
                                    <div className="impact-location__meta">
                                        <span><MapPin size={12} /> {loc.city}</span>
                                        <span>{loc.volunteers} volunteers</span>
                                        <span>{loc.funds}</span>
                                    </div>
                                    <ChevronRight size={14} className="impact-location__chevron" />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {sidebarTab === 'people' && (
                        <div className="map-sidebar__list">
                            {volunteersLoading ? (
                                <div className="map-sidebar__loading">
                                    <span>Loading volunteers...</span>
                                </div>
                            ) : (volunteers.length > 0 ? volunteers : NEARBY_PEOPLE).map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    className="map-person-card"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 + i * 0.03 }}
                                    onClick={() => goToPerson(p)}
                                >
                                    <span className="map-person-card__avatar">{p.avatar}</span>
                                    <div className="map-person-card__info">
                                        <div className="map-person-card__header">
                                            <span className="map-person-card__name">{p.name}</span>
                                            {p.verified && <span className="map-person-card__verified" title="Verified Volunteer">✓</span>}
                                        </div>
                                        <span className="map-person-card__id">ID: {formatPersonId(p.id)}</span>
                                        <span className="map-person-card__role">{p.role}</span>
                                        {p.email && <span className="map-person-card__detail">{p.email}</span>}
                                        {p.city && <span className="map-person-card__detail">{p.city}</span>}
                                        <span className="map-person-card__activity">{p.activity}</span>
                                        {p.hours !== undefined && p.hours > 0 && (
                                            <span className="map-person-card__hours">
                                                <Clock size={11} /> {p.hours} hrs
                                            </span>
                                        )}
                                    </div>
                                    <div className="map-person-card__right">
                                        <span className={`map-person-card__status ${p.online ? 'map-person-card__status--online' : ''}`}>
                                            {p.online ? 'Online' : 'Offline'}
                                        </span>
                                        <Navigation size={14} className="map-person-card__nav" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {sidebarTab === 'events' && (
                        <div className="map-sidebar__list">
                            {eventsLoading ? (
                                <div className="map-sidebar__loading">
                                    <span>Loading events...</span>
                                </div>
                            ) : filteredEvents.length > 0 ? (
                                filteredEvents.map((event, i) => {
                                    const emoji = getCauseEmoji(event.cause);
                                    return (
                                        <motion.div
                                            key={event._id}
                                            className="map-event-card"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 + i * 0.03 }}
                                            onClick={() => goToEvent(event)}
                                        >
                                            <span className="map-event-card__emoji">{emoji}</span>
                                            <div className="map-event-card__info">
                                                <span className="map-event-card__title">{event.title}</span>
                                                <span className="map-event-card__cause">{event.cause}</span>
                                                <span className="map-event-card__location">
                                                    <MapPin size={12} /> {event.location}
                                                </span>
                                                <span className="map-event-card__datetime">
                                                    <Calendar size={12} /> {event.date} • {event.time}
                                                </span>
                                                <span className="map-event-card__org">
                                                    {event.orgName}
                                                </span>
                                            </div>
                                            <div className="map-event-card__right">
                                                <span className="map-event-card__spots">
                                                    {event.spots} spots
                                                </span>
                                                <ChevronRight size={14} className="map-event-card__nav" />
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="map-sidebar__empty">
                                    <span>No events found</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div className="report-modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleModalClose}
                    >
                        <motion.div className="report-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="report-modal__header">
                                <div className="report-modal__title-group">
                                    <AlertTriangle size={18} />
                                    <h3>Report Affected Area</h3>
                                </div>
                                <button className="report-modal__close" onClick={handleModalClose}><X size={18} /></button>
                            </div>
                            <form className="report-modal__form" onSubmit={handleReportSubmit}>
                                <div className="report-modal__coords">
                                    <MapPin size={14} />
                                    <span>{pendingCoords?.lat.toFixed(4)}° N, {pendingCoords?.lng.toFixed(4)}° E</span>
                                </div>
                                <div className="report-modal__field">
                                    <label htmlFor="report-area-name">Area Name</label>
                                    <input id="report-area-name" type="text" placeholder="e.g. Riverside Pollution Zone"
                                        value={reportForm.name} onChange={e => setReportForm(f => ({ ...f, name: e.target.value }))}
                                        required autoFocus
                                    />
                                </div>
                                <div className="report-modal__field">
                                    <label htmlFor="report-cause">Genre Of Service Required</label>
                                    <select id="report-cause" value={reportForm.cause}
                                        onChange={e => setReportForm(f => ({ ...f, cause: e.target.value }))}>
                                        {CAUSES_FILTER.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="report-modal__submit"><Send size={14} /> Submit Report</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
