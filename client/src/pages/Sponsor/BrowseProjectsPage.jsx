import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import {
    ArrowLeft, Search, IndianRupee, Users, MapPin, ArrowUpRight,
    Filter, Tag, TrendingUp, Check
} from 'lucide-react';
import './BrowseProjectsPage.css';

const PROJECTS = [
    { id: 1, title: 'Clean River Drive', org: 'Green Earth Foundation', cause: 'Environment', location: 'Delhi', goal: 80000, raised: 62000, volunteers: 32, icon: '🏞️', impact: 'Clean 12km of riverbank' },
    { id: 2, title: 'Rural Health Camp', org: 'Swasthya Sewa', cause: 'Healthcare', location: 'Maharashtra', goal: 120000, raised: 45000, volunteers: 12, icon: '🏥', impact: 'Free checkups for 500 villagers' },
    { id: 3, title: 'Tree Plantation Week', org: 'Green Earth Foundation', cause: 'Environment', location: 'Gurugram', goal: 200000, raised: 148000, volunteers: 67, icon: '🌳', impact: 'Plant 5,000 trees' },
    { id: 4, title: 'Digital Literacy Program', org: 'TechBridge India', cause: 'Education', location: 'Pune', goal: 150000, raised: 120000, volunteers: 35, icon: '💻', impact: 'Train 200 students in coding' },
    { id: 5, title: 'Women Empowerment Workshop', org: 'Shakti Foundation', cause: 'Community', location: 'Jaipur', goal: 60000, raised: 18000, volunteers: 15, icon: '💪', impact: 'Skill 100 women in entrepreneurship' },
    { id: 6, title: 'Animal Rescue Drive', org: 'Paws India', cause: 'Animal Welfare', location: 'Bangalore', goal: 90000, raised: 42000, volunteers: 20, icon: '🐾', impact: 'Rescue & vaccinate 300 strays' },
];

const CAUSES_FILTER = ['All', 'Environment', 'Education', 'Healthcare', 'Community', 'Animal Welfare'];

export default function BrowseProjectsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeCause, setActiveCause] = useState('All');
    const [fundingProject, setFundingProject] = useState(null);
    const [fundAmount, setFundAmount] = useState('');
    const [funded, setFunded] = useState(false);

    const filtered = PROJECTS.filter(p =>
        (activeCause === 'All' || p.cause === activeCause) &&
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleFund = (e) => {
        e.preventDefault();
        setFunded(true);
        setTimeout(() => { setFundingProject(null); setFunded(false); setFundAmount(''); }, 2000);
    };

    return (
        <div className="browse-projects">
            <motion.button className="back-btn" onClick={() => navigate(-1)} {...fadeUp(0)}>
                <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.div className="browse__header" {...fadeUp(0)}>
                <h1>Browse Projects</h1>
                <p>Discover impactful projects to fund and track where your money goes.</p>
            </motion.div>

            {/* Search */}
            <motion.div className="browse__search" {...fadeUp(1)}>
                <Search size={18} className="browse__search-icon" />
                <input
                    type="text" placeholder="Search projects..."
                    value={search} onChange={e => setSearch(e.target.value)}
                />
            </motion.div>

            {/* Cause Filters */}
            <motion.div className="browse__filters" {...fadeUp(2)}>
                {CAUSES_FILTER.map(c => (
                    <button
                        key={c}
                        className={`filter-tag ${activeCause === c ? 'filter-tag--active' : ''}`}
                        onClick={() => setActiveCause(c)}
                    >{c}</button>
                ))}
            </motion.div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {filtered.map((project, i) => (
                    <motion.div
                        key={project.id}
                        className="project-card"
                        {...fadeUp(i + 3)}
                        whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                    >
                        <div className="project-card__icon">{project.icon}</div>
                        <div className="project-card__body">
                            <div className="project-card__tags">
                                <span className="project-tag"><Tag size={10} /> {project.cause}</span>
                                <span className="project-tag"><MapPin size={10} /> {project.location}</span>
                            </div>
                            <h3>{project.title}</h3>
                            <p className="project-card__org">{project.org}</p>
                            <p className="project-card__impact"><TrendingUp size={12} /> {project.impact}</p>

                            {/* Funding progress */}
                            <div className="project-card__funding">
                                <div className="project-card__funding-header">
                                    <span><IndianRupee size={12} /> ₹{(project.raised / 1000).toFixed(0)}k / ₹{(project.goal / 1000).toFixed(0)}k</span>
                                    <span>{Math.round(project.raised / project.goal * 100)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <motion.div
                                        className="progress-bar__fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(project.raised / project.goal) * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 + i * 0.05 }}
                                    />
                                </div>
                            </div>

                            <div className="project-card__footer">
                                <span className="project-card__volunteers"><Users size={12} /> {project.volunteers} volunteers</span>
                                <motion.button
                                    className="project-card__fund-btn"
                                    onClick={() => setFundingProject(project)}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                >
                                    Fund This <ArrowUpRight size={14} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="browse__empty"><p>No projects found. Try a different search or filter.</p></div>
            )}

            {/* Fund Modal */}
            {fundingProject && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { setFundingProject(null); setFunded(false); }}
                >
                    <motion.div
                        className="modal-card"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {funded ? (
                            <div className="modal-success">
                                <div className="success-icon"><Check size={32} /></div>
                                <h3>Funded!</h3>
                                <p>₹{Number(fundAmount).toLocaleString()} sent to {fundingProject.title}</p>
                            </div>
                        ) : (
                            <>
                                <div className="modal-card__header">
                                    <h3>Fund "{fundingProject.title}"</h3>
                                    <button className="modal-close" onClick={() => setFundingProject(null)}>×</button>
                                </div>
                                <p className="modal-org">{fundingProject.org}</p>
                                <form onSubmit={handleFund} className="modal-form">
                                    <div className="form-group">
                                        <label className="form-label"><IndianRupee size={14} /> Amount (₹)</label>
                                        <input
                                            type="number" className="form-input" placeholder="e.g. 10000"
                                            value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                            required min="100"
                                        />
                                    </div>
                                    <div className="fund-presets">
                                        {[1000, 5000, 10000, 25000].map(amt => (
                                            <button
                                                key={amt} type="button"
                                                className={`fund-preset ${fundAmount === String(amt) ? 'fund-preset--active' : ''}`}
                                                onClick={() => setFundAmount(String(amt))}
                                            >₹{(amt / 1000)}k</button>
                                        ))}
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="form-btn form-btn--ghost" onClick={() => setFundingProject(null)}>Cancel</button>
                                        <button type="submit" className="form-btn form-btn--primary">
                                            <IndianRupee size={14} /> Confirm Funding
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
