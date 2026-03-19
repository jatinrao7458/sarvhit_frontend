import { useAuth } from '../../context/AuthContext';
import { fadeUp } from '../../hooks/useAnimations';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield, Palette, LogOut, ChevronRight,
    Moon, Sun, Globe, Lock, Mail
} from 'lucide-react';
import { useState } from 'react';
import './SettingsPage.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState({
        events: true, messages: true, updates: false, marketing: false,
    });

    const toggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="settings-page">
            <motion.div className="settings__header" {...fadeUp(0)}>
                <h1>Settings</h1>
                <p>Manage your account, notifications, and preferences.</p>
            </motion.div>

            {/* Account */}
            <motion.div className="settings-section" {...fadeUp(1)}>
                <h2><User size={18} /> Account</h2>
                <div className="settings-group">
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <span className="settings-item__label">Display Name</span>
                            <span className="settings-item__value">{user?.name}</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <Mail size={15} />
                            <span className="settings-item__label">Email</span>
                            <span className="settings-item__value">{user?.email}</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <Lock size={15} />
                            <span className="settings-item__label">Password</span>
                            <span className="settings-item__value">••••••••</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <Globe size={15} />
                            <span className="settings-item__label">Language</span>
                            <span className="settings-item__value">English</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div className="settings-section" {...fadeUp(2)}>
                <h2><Bell size={18} /> Notifications</h2>
                <div className="settings-group">
                    {[
                        { key: 'events', label: 'Event updates', desc: 'Get notified about events you joined or host' },
                        { key: 'messages', label: 'Messages', desc: 'Receive message notifications' },
                        { key: 'updates', label: 'Platform updates', desc: 'News about Sarvhit features and improvements' },
                        { key: 'marketing', label: 'Marketing', desc: 'Occasional newsletters and campaigns' },
                    ].map(notif => (
                        <div key={notif.key} className="settings-item">
                            <div className="settings-item__info">
                                <span className="settings-item__label">{notif.label}</span>
                                <span className="settings-item__desc">{notif.desc}</span>
                            </div>
                            <label className="settings-toggle">
                                <input
                                    type="checkbox"
                                    checked={notifications[notif.key]}
                                    onChange={() => toggleNotif(notif.key)}
                                />
                                <span className="settings-toggle__slider" />
                            </label>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Privacy */}
            <motion.div className="settings-section" {...fadeUp(3)}>
                <h2><Shield size={18} /> Privacy</h2>
                <div className="settings-group">
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <span className="settings-item__label">Profile visibility</span>
                            <span className="settings-item__value">Public</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item__info">
                            <span className="settings-item__label">Activity visibility</span>
                            <span className="settings-item__value">Connections only</span>
                        </div>
                        <button className="settings-item__action"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </motion.div>

            {/* Danger zone */}
            <motion.div className="settings-section settings-section--danger" {...fadeUp(4)}>
                <motion.button
                    className="settings-logout-btn"
                    onClick={logout}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <LogOut size={18} />
                    Log out
                </motion.button>
                <button className="settings-delete-btn">
                    Delete account
                </button>
            </motion.div>
        </div>
    );
}
