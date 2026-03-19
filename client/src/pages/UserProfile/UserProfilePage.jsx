import { useParams, useNavigate } from 'react-router-dom';
import { calculatePoints } from '../../data/leaderboardData';
import { fadeUp } from '../../hooks/useAnimations';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    MapPin, CalendarDays, Clock, Users, IndianRupee,
    Star, TrendingUp, ArrowLeft, Folder
} from 'lucide-react';
import './UserProfilePage.css';

const ROLE_LABEL = { ngo: '🏛️ NGO', volunteer: '🤝 Volunteer', sponsor: '💎 Sponsor' };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function UserProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) {
                setError('Invalid user ID.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/discover/profile/${id}`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.message || 'User not found');
                }

                const data = await response.json();
                setProfile(data.user || null);
            } catch (err) {
                setError(err.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="user-profile user-profile--empty">
                <h2>Loading profile...</h2>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="user-profile user-profile--empty">
                <h2>User not found</h2>
                {error && <p>{error}</p>}
                <button onClick={() => navigate(-1)}>Go back</button>
            </div>
        );
    }

    const role = (profile.userType || '').toLowerCase();
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User';
    const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not specified';
    const tags = role === 'volunteer' ? (profile.skills || []) : (profile.focusAreas || []);
    const badgeCount = Array.isArray(profile.badges) ? profile.badges.length : 0;
    const volunteerHours = profile.volunteerHours || profile.hoursLogged || 0;
    const ngoEvents = profile.eventsHosted || profile.eventCount || 0;
    const volunteerEvents = profile.eventsJoined || profile.eventCount || 0;
    const sponsorProjects = profile.projectsFunded || profile.eventCount || 0;
    const sponsorDonated = profile.totalDonated || profile.sponsorshipAmount || 0;
    const ngoFunds = profile.fundsReceived || 0;
    const connections = Array.isArray(profile.connections) ? profile.connections.length : 0;

    const points = calculatePoints({
        events: ngoEvents || volunteerEvents || sponsorProjects || 0,
        hours: volunteerHours,
        funds: sponsorDonated || ngoFunds || 0,
    });

    return (
        <div className="user-profile">
            {/* Back button */}
            <motion.button
                className="user-profile__back"
                onClick={() => navigate(-1)}
                {...fadeUp(0)}
            >
                <ArrowLeft size={18} />
                Back
            </motion.button>

            {/* Profile Header */}
            <motion.div className="user-profile__card" {...fadeUp(0.5)}>
                <div className={`user-profile__avatar user-profile__avatar--${role || 'volunteer'}`}>
                    {initials || 'U'}
                </div>
                <h1 className="user-profile__name">{fullName}</h1>
                <div className="user-profile__badges">
                    <span className={`user-profile__role user-profile__role--${role || 'volunteer'}`}>
                        {ROLE_LABEL[role] || 'User'}
                    </span>
                    <span className="user-profile__location">
                        <MapPin size={13} />
                        {location}
                    </span>
                </div>
                <p className="user-profile__bio">{profile.bio || 'No bio available.'}</p>

                <div className="user-profile__score">
                    <TrendingUp size={16} />
                    <span className="user-profile__score-value">{points}</span>
                    <span className="user-profile__score-label">Impact Points</span>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="user-profile__stats" {...fadeUp(1)}>
                {role === 'volunteer' && (
                    <>
                        <Stat icon={Clock} label="Hours Logged" value={volunteerHours} />
                        <Stat icon={CalendarDays} label="Events Joined" value={volunteerEvents} />
                        <Stat icon={Star} label="Badges Earned" value={badgeCount} />
                    </>
                )}
                {role === 'ngo' && (
                    <>
                        <Stat icon={CalendarDays} label="Events Hosted" value={ngoEvents} />
                        <Stat icon={Users} label="Connections" value={connections} />
                        <Stat icon={IndianRupee} label="Funds Received" value={`₹${(ngoFunds / 1000).toFixed(0)}k`} />
                    </>
                )}
                {role === 'sponsor' && (
                    <>
                        <Stat icon={IndianRupee} label="Total Donated" value={`₹${(sponsorDonated / 100000).toFixed(1)}L`} />
                        <Stat icon={Folder} label="Projects Funded" value={sponsorProjects} />
                        <Stat icon={TrendingUp} label="Impact Score" value={points} />
                    </>
                )}
            </motion.div>

            {/* Skills / Sectors */}
            {tags.length > 0 && (
                <motion.div className="user-profile__tags-section" {...fadeUp(1.5)}>
                    <h3>{role === 'volunteer' ? 'Skills' : 'Focus Areas'}</h3>
                    <div className="user-profile__tag-list">
                        {tags.map(tag => (
                            <span key={tag} className="user-profile__tag">{tag}</span>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="user-profile__stat">
            <Icon size={18} />
            <span className="user-profile__stat-value">{value}</span>
            <span className="user-profile__stat-label">{label}</span>
        </div>
    );
}
