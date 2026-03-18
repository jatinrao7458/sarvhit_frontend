import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNavItems, NAV_ITEMS } from '../../data/navigation';
import { pageTransition } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './AppLayout.css';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const root = document.documentElement;
        if (user?.role === 'ngo') {
            root.style.setProperty('--accent', 'var(--accent-ngo)');
            root.style.setProperty('--accent-soft', 'var(--accent-ngo-soft)');
            root.style.setProperty('--accent-glow', 'var(--accent-ngo-glow)');
        } else if (user?.role === 'volunteer') {
            root.style.setProperty('--accent', 'var(--accent-volunteer)');
            root.style.setProperty('--accent-soft', 'var(--accent-volunteer-soft)');
            root.style.setProperty('--accent-glow', 'var(--accent-volunteer-glow)');
        } else if (user?.role === 'sponsor') {
            root.style.setProperty('--accent', 'var(--accent-sponsor)');
            root.style.setProperty('--accent-soft', 'var(--accent-sponsor-soft)');
            root.style.setProperty('--accent-glow', 'var(--accent-sponsor-glow)');
        }
    }, [user?.role]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const roleLabel = user?.role === 'ngo' ? 'NGO' : user?.role === 'volunteer' ? 'Volunteer' : 'Sponsor';

    return (
        <div className="app-layout">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}
                initial={false}
            >
                <div className="sidebar__header">
                    <div className="sidebar__logo">
                        <span className="sidebar__logo-icon">◈</span>
                        <span className="sidebar__logo-text">sarvhit</span>
                    </div>
                    <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar__role-badge">
                    <span className="role-dot" />
                    {roleLabel}
                </div>

                <nav className="sidebar__nav">
                    {getNavItems(user?.role).map((item) => {
                        // For links with query params, check active state differently
                        const basePath = item.path.split('?')[0];
                        const isQueryLink = item.path.includes('?');
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => {
                                    const active = isQueryLink
                                        ? location.pathname === basePath && location.search === '?' + item.path.split('?')[1]
                                        : isActive;
                                    return `nav-link ${active ? 'nav-link--active' : ''}`;
                                }}
                            >
                                {({ isActive: rawActive }) => {
                                    const active = isQueryLink
                                        ? location.pathname === basePath && location.search === '?' + item.path.split('?')[1]
                                        : rawActive;
                                    return (
                                        <motion.div
                                            className="nav-link__inner"
                                            initial={false}
                                            animate={active ? { x: 4 } : { x: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            {active && (
                                                <motion.div
                                                    className="nav-link__indicator"
                                                    layoutId="nav-indicator"
                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <item.icon
                                                size={20}
                                                strokeWidth={active ? 2.2 : 1.6}
                                                fill={active ? 'var(--accent-soft)' : 'none'}
                                            />
                                            <span>{item.label}</span>
                                        </motion.div>
                                    );
                                }}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__user" onClick={() => navigate('/app/profile')} style={{ cursor: 'pointer' }}>
                        <div className="sidebar__avatar">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="sidebar__user-info">
                            <span className="sidebar__user-name">{user?.name}</span>
                            <span className="sidebar__user-email">{user?.email}</span>
                        </div>
                    </div>
                    <button className="sidebar__logout" onClick={logout}>
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main content */}
            <main className="app-main">
                <header className="app-topbar">
                    <button className="topbar__menu" onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <div className="topbar__breadcrumb">
                        {NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
                    </div>
                </header>
                <div className="app-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            {...pageTransition}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
