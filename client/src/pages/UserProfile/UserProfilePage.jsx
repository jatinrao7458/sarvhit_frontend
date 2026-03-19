import { useParams, useNavigate } from 'react-router-dom';
import { USER_PROFILES } from '../../data/userProfiles';
import { calculatePoints } from '../../data/leaderboardData';
import { fadeUp } from '../../hooks/useAnimations';
import { motion } from 'framer-motion';
import {
    MapPin, CalendarDays, Clock, Users, IndianRupee,
    Star, TrendingUp, Briefcase, ArrowLeft, Folder
} from 'lucide-react';
import './UserProfilePage.css';

const ROLE_LABEL = { ngo: '🏛️ NGO', volunteer: '🤝 Volunteer', sponsor: '💎 Sponsor' };

export default function UserProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const profile = USER_PROFILES[id];

    if (!profile) {
        return (
            <div className="user-profile user-profile--empty">
                <h2>User not found</h2>
                <button onClick={() => navigate(-1)}>Go back</button>
            </div>
        );
    }

    const points = calculatePoints({
        events: profile.eventsHosted || profile.eventsJoined || 0,
        hours: profile.hoursLogged || 0,
        funds: profile.totalDonated || profile.fundsReceived || 0,
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
                <div className={`user-profile__avatar user-profile__avatar--${profile.role}`}>
                    {profile.initials}
                </div>
                <h1 className="user-profile__name">{profile.name}</h1>
                <div className="user-profile__badges">
                    <span className={`user-profile__role user-profile__role--${profile.role}`}>
                        {ROLE_LABEL[profile.role]}
                    </span>
                    <span className="user-profile__location">
                        <MapPin size={13} />
                        {profile.location}
                    </span>
                </div>
                <p className="user-profile__bio">{profile.bio}</p>

                <div className="user-profile__score">
                    <TrendingUp size={16} />
                    <span className="user-profile__score-value">{points}</span>
                    <span className="user-profile__score-label">Impact Points</span>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="user-profile__stats" {...fadeUp(1)}>
                {profile.role === 'volunteer' && (
                    <>
                        <Stat icon={Clock} label="Hours Logged" value={profile.hoursLogged} />
                        <Stat icon={CalendarDays} label="Events Joined" value={profile.eventsJoined} />
                        <Stat icon={Star} label="Badges Earned" value={profile.badgesEarned} />
                    </>
                )}
                {profile.role === 'ngo' && (
                    <>
                        <Stat icon={CalendarDays} label="Events Hosted" value={profile.eventsHosted} />
                        <Stat icon={Users} label="Volunteers" value={profile.volunteersConnected} />
                        <Stat icon={IndianRupee} label="Funds Received" value={`₹${(profile.fundsReceived / 1000).toFixed(0)}k`} />
                    </>
                )}
                {profile.role === 'sponsor' && (
                    <>
                        <Stat icon={IndianRupee} label="Total Donated" value={`₹${(profile.totalDonated / 100000).toFixed(1)}L`} />
                        <Stat icon={Folder} label="Projects Funded" value={profile.projectsFunded} />
                        <Stat icon={TrendingUp} label="Impact Score" value={profile.impactScore} />
                    </>
                )}
            </motion.div>

            {/* Skills / Sectors */}
            {(profile.skills || profile.sectors) && (
                <motion.div className="user-profile__tags-section" {...fadeUp(1.5)}>
                    <h3>{profile.skills ? 'Skills' : 'Focus Sectors'}</h3>
                    <div className="user-profile__tag-list">
                        {(profile.skills || profile.sectors).map(tag => (
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
