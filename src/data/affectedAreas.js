// ── Affected Area Reporting ──
// Seed data and helpers for the volunteer/sponsor "report affected area" feature

export const SEED_AFFECTED_AREAS = [
    { id: 1, lat: 28.6448, lng: 77.2167, name: 'Yamuna Floodplain', cause: 'Environment', reports: 52 },
    { id: 2, lat: 19.0176, lng: 72.8562, name: 'Dharavi Sanitation Zone', cause: 'Healthcare', reports: 38 },
    { id: 3, lat: 12.9352, lng: 77.6245, name: 'Whitefield Air Quality', cause: 'Environment', reports: 14 },
    { id: 4, lat: 26.9124, lng: 75.7873, name: 'Rural Literacy Gap', cause: 'Education', reports: 7 },
    { id: 5, lat: 22.5726, lng: 88.3639, name: 'Hooghly Riverbank Erosion', cause: 'Environment', reports: 28 },
    { id: 6, lat: 17.3850, lng: 78.4867, name: 'Old City Health Access', cause: 'Healthcare', reports: 3 },
];

/**
 * Returns a hex color based on report count thresholds.
 * 0–10  → green   (#22c55e)
 * 11–25 → yellow  (#eab308)
 * 26–50 → orange  (#f97316)
 * 51+   → red     (#ef4444)
 */
export function getAreaColor(reportCount) {
    if (reportCount <= 10) return '#22c55e';
    if (reportCount <= 25) return '#eab308';
    if (reportCount <= 50) return '#f97316';
    return '#ef4444';
}

/**
 * Returns a severity label for the report count.
 */
export function getAreaLabel(reportCount) {
    if (reportCount <= 10) return 'Low';
    if (reportCount <= 25) return 'Moderate';
    if (reportCount <= 50) return 'High';
    return 'Critical';
}

/**
 * Radius in degrees to merge nearby reports into the same area (~5.5 km).
 */
export const MERGE_RADIUS = 0.05;
