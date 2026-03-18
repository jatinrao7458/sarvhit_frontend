import { useAuth } from '../../context/AuthContext';
import { LOCATIONS, CAUSES_FILTER } from '../../data/locations';
import { SEED_AFFECTED_AREAS, getAreaColor, getAreaLabel, MERGE_RADIUS } from '../../data/affectedAreas';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Layers, AlertTriangle, X, Send, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import './ImpactMapPage.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Color Legend Data ──
const LEGEND_ITEMS = [
    { color: '#22c55e', label: '0–10 reports', severity: 'Low' },
    { color: '#eab308', label: '11–25 reports', severity: 'Moderate' },
    { color: '#f97316', label: '26–50 reports', severity: 'High' },
    { color: '#ef4444', label: '51+ reports', severity: 'Critical' },
];

// ── Map click handler (must be a child of MapContainer) ──
function MapClickHandler({ active, onMapClick }) {
    useMapEvents({
        click(e) {
            if (active) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

export default function ImpactMapPage() {
    const { user } = useAuth();
    const [activeCause, setActiveCause] = useState('All');

    // Affected-area state
    const [affectedAreas, setAffectedAreas] = useState(SEED_AFFECTED_AREAS);
    const [placementMode, setPlacementMode] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [pendingCoords, setPendingCoords] = useState(null);
    const [reportForm, setReportForm] = useState({ name: '', cause: 'Environment' });

    const canReport = user?.role === 'volunteer' || user?.role === 'sponsor';

    // Filter locations
    const filtered = activeCause === 'All'
        ? LOCATIONS
        : LOCATIONS.filter(l => l.cause === activeCause);

    // Filter affected areas by active cause
    const filteredAreas = activeCause === 'All'
        ? affectedAreas
        : affectedAreas.filter(a => a.cause === activeCause);

    // ── Handlers ──
    const handleMapClick = useCallback((latlng) => {
        setPendingCoords({ lat: latlng.lat, lng: latlng.lng });
        setShowReportModal(true);
        setPlacementMode(false);
    }, []);

    const handleReportSubmit = useCallback((e) => {
        e.preventDefault();
        if (!pendingCoords || !reportForm.name.trim()) return;

        setAffectedAreas(prev => {
            // Check if an existing area is close enough to merge
            const nearby = prev.find(a =>
                Math.abs(a.lat - pendingCoords.lat) < MERGE_RADIUS &&
                Math.abs(a.lng - pendingCoords.lng) < MERGE_RADIUS
            );

            if (nearby) {
                return prev.map(a =>
                    a.id === nearby.id ? { ...a, reports: a.reports + 1 } : a
                );
            }

            // New area
            return [...prev, {
                id: Date.now(),
                lat: pendingCoords.lat,
                lng: pendingCoords.lng,
                name: reportForm.name.trim(),
                cause: reportForm.cause,
                reports: 1,
            }];
        });

        // Reset
        setShowReportModal(false);
        setPendingCoords(null);
        setReportForm({ name: '', cause: 'Environment' });
    }, [pendingCoords, reportForm]);

    const handleModalClose = () => {
        setShowReportModal(false);
        setPendingCoords(null);
        setReportForm({ name: '', cause: 'Environment' });
    };

    return (
        <div className="impact-map-page">
            <motion.div className="impact-map__header" {...fadeUp(0)}>
                <div>
                    <h1>Impact Map</h1>
                    <p>See where the change is happening across India.</p>
                </div>

                {canReport && (
                    <button
                        className={`report-affected-btn ${placementMode ? 'report-affected-btn--active' : ''}`}
                        onClick={() => setPlacementMode(p => !p)}
                    >
                        <AlertTriangle size={16} />
                        {placementMode ? 'Cancel Placement' : 'Report Affected Area'}
                    </button>
                )}
            </motion.div>

            {/* Placement-mode hint banner */}
            <AnimatePresence>
                {placementMode && (
                    <motion.div
                        className="placement-hint"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Target size={16} className="placement-hint__icon" />
                        <span>Click anywhere on the map to place your report</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div className="impact-map__filters" {...fadeUp(1)}>
                {CAUSES_FILTER.map(c => (
                    <button
                        key={c}
                        className={`filter-tag ${activeCause === c ? 'filter-tag--active' : ''}`}
                        onClick={() => setActiveCause(c)}
                    >
                        {c}
                    </button>
                ))}
            </motion.div>

            <div className="impact-map__layout">
                {/* Map */}
                <motion.div className="impact-map__map-wrap" {...fadeUp(2)}>
                    <MapContainer
                        center={[22.5, 78.5]}
                        zoom={5}
                        scrollWheelZoom={true}
                        className="impact-map__leaflet"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* Click handler for placement mode */}
                        <MapClickHandler active={placementMode} onMapClick={handleMapClick} />

                        {/* Existing location markers */}
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

                        {/* Affected area circle overlays */}
                        {filteredAreas.map(area => (
                            <Circle
                                key={area.id}
                                center={[area.lat, area.lng]}
                                radius={Math.min(8000 + area.reports * 300, 30000)}
                                pathOptions={{
                                    color: getAreaColor(area.reports),
                                    fillColor: getAreaColor(area.reports),
                                    fillOpacity: 0.25,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div className="map-popup map-popup--area">
                                        <strong>{area.name}</strong>
                                        <span className="map-popup__cause">{area.cause}</span>
                                        <span className="map-popup__reports">
                                            {area.reports} report{area.reports !== 1 ? 's' : ''}
                                        </span>
                                        <span
                                            className="map-popup__severity"
                                            style={{ color: getAreaColor(area.reports) }}
                                        >
                                            {getAreaLabel(area.reports)} severity
                                        </span>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}
                    </MapContainer>

                    {/* Color legend */}
                    <div className="impact-map__legend">
                        <span className="impact-map__legend-title">Affected Areas</span>
                        {LEGEND_ITEMS.map(item => (
                            <div key={item.severity} className="legend-item">
                                <span
                                    className="legend-item__dot"
                                    style={{ background: item.color }}
                                />
                                <span className="legend-item__label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Sidebar list */}
                <motion.div className="impact-map__sidebar" {...fadeUp(3)}>
                    <div className="impact-sidebar__header">
                        <Layers size={16} />
                        <span>{filtered.length} locations</span>
                    </div>
                    <div className="impact-sidebar__list">
                        {filtered.map((loc, i) => (
                            <motion.div
                                key={loc.id}
                                className="impact-location-card"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 + i * 0.04 }}
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
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Report Modal ── */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        className="report-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleModalClose}
                    >
                        <motion.div
                            className="report-modal"
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
                                <button className="report-modal__close" onClick={handleModalClose}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form className="report-modal__form" onSubmit={handleReportSubmit}>
                                <div className="report-modal__coords">
                                    <MapPin size={14} />
                                    <span>
                                        {pendingCoords?.lat.toFixed(4)}° N, {pendingCoords?.lng.toFixed(4)}° E
                                    </span>
                                </div>

                                <div className="report-modal__field">
                                    <label htmlFor="report-area-name">Area Name</label>
                                    <input
                                        id="report-area-name"
                                        type="text"
                                        placeholder="e.g. Riverside Pollution Zone"
                                        value={reportForm.name}
                                        onChange={e => setReportForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="report-modal__field">
                                    <label htmlFor="report-cause">Cause Category</label>
                                    <select
                                        id="report-cause"
                                        value={reportForm.cause}
                                        onChange={e => setReportForm(f => ({ ...f, cause: e.target.value }))}
                                    >
                                        {CAUSES_FILTER.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="report-modal__submit">
                                    <Send size={14} />
                                    Submit Report
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
