import {
    LayoutDashboard, CalendarDays, Map, Compass,
    MessageCircle, Users, Sparkles, User, Trophy
} from 'lucide-react';

export function getNavItems(role) {
    if (role === 'ngo') {
        return [
            { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/app/events', label: 'Events', icon: CalendarDays },
            { path: '/app/discover', label: 'Discover', icon: Compass },
            { path: '/app/impact-map', label: 'Impact Map', icon: Map },
            { path: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
            { path: '/app/messages', label: 'Messages', icon: MessageCircle },
            { path: '/app/profile', label: 'Profile', icon: User },
        ];
    }
    return [
        { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/app/events', label: 'Events', icon: CalendarDays },
        { path: '/app/discover', label: 'Discover', icon: Compass },
        { path: '/app/impact-map', label: 'Impact Map', icon: Map },
        { path: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/app/messages', label: 'Messages', icon: MessageCircle },
        { path: '/app/profile', label: 'Profile', icon: User },
    ];
}

// Fallback for breadcrumb lookups (all possible paths)
export const NAV_ITEMS = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/events', label: 'Events', icon: CalendarDays },
    { path: '/app/discover', label: 'Discover', icon: Compass },
    { path: '/app/impact-map', label: 'Impact Map', icon: Map },
    { path: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/app/messages', label: 'Messages', icon: MessageCircle },
    { path: '/app/profile', label: 'Profile', icon: User },
];
