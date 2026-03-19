import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Heart, Sparkles, Eye, EyeOff, Check, Plus, X } from 'lucide-react';
import './AuthPage.css';

const COMMON_SKILLS = [
    'First Aid', 'Teaching', 'Event Management', 'Fundraising',
    'Graphic Design', 'Social Media', 'Public Speaking', 'Counseling',
    'Photography', 'Web Development', 'Data Analysis', 'Translation',
];

const NGO_FOCUS_AREAS = [
    'Environment', 'Education', 'Healthcare', 'Poverty Alleviation',
    'Women Empowerment', 'Child Welfare', 'Animal Welfare', 'Disaster Relief',
    'Rural Development', 'Sanitation & Hygiene', 'Mental Health', 'Elderly Care',
];

const ROLES = [
    { id: 'ngo', label: 'NGO', icon: Shield, color: 'var(--accent-ngo)', desc: 'Host events & manage volunteers' },
    { id: 'volunteer', label: 'Volunteer', icon: Heart, color: 'var(--accent-volunteer)', desc: 'Join causes & track impact' },
    { id: 'sponsor', label: 'Sponsor', icon: Sparkles, color: 'var(--accent-sponsor)', desc: 'Fund projects & see results' },
];

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    const [submitError, setSubmitError] = useState('');
    const { login, signup, isLoading } = useAuth();


    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const addCustomSkill = () => {
        const trimmed = customSkill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            setSelectedSkills(prev => [...prev, trimmed]);
            setCustomSkill('');
        }
    };

    const removeSkill = (skill) => {
        setSelectedSkills(prev => prev.filter(s => s !== skill));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        // Validation checks
        if (!role) {
            setSubmitError('Please select a role to continue');
            return;
        }

        if (!email) {
            setSubmitError('Email is required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setSubmitError('Please enter a valid email address');
            return;
        }

        if (!password) {
            setSubmitError('Password is required');
            return;
        }

        if (password.length < 6) {
            setSubmitError('Password must be at least 6 characters long');
            return;
        }

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                if (!name) {
                    setSubmitError('Name is required');
                    return;
                }

                if (name.trim().length < 2) {
                    setSubmitError('Please enter a valid name (at least 2 characters)');
                    return;
                }

                const signupData = {
                    firstName: name.split(' ')[0],
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    email,
                    password,
                    userType: role,
                };

                if (role === 'volunteer' || role === 'ngo') {
                    signupData.skills = selectedSkills;
                }

                result = await signup(signupData);
            }

            if (result.success) {
                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setSubmitError(result.error || 'Authentication failed');
            }
        } catch (err) {
            setSubmitError('An error occurred. Please try again.');
            console.error('Auth error:', err);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-page__bg">
                <div className="auth-bg-orb auth-bg-orb--1" />
                <div className="auth-bg-orb auth-bg-orb--2" />
            </div>

            <motion.button
                className="auth-back"
                onClick={() => navigate('/')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <ArrowLeft size={18} />
                Back
            </motion.button>

            <motion.div
                className="auth-card glass"
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
                <div className="auth-card__header">
                    <h1>{isLogin ? 'Welcome back' : 'Join sarvhit'}</h1>
                    <p>{isLogin ? 'Log in to continue your impact journey.' : 'Pick your role and start making a difference.'}</p>
                </div>

                {/* Role selector */}
                <div className="auth-roles">
                    <span className="auth-roles__label">I am a...</span>
                    <div className="auth-roles__grid">
                        {ROLES.map((r) => (
                            <motion.button
                                key={r.id}
                                className={`auth-role-btn ${role === r.id ? 'auth-role-btn--active' : ''}`}
                                style={{ '--role-color': r.color }}
                                onClick={() => { setRole(r.id); setSelectedSkills([]); setCustomSkill(''); }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <r.icon size={20} />
                                <span className="auth-role-btn__label">{r.label}</span>
                                <span className="auth-role-btn__desc">{r.desc}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                className="auth-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label>Name</label>
                                <input
                                    type="text"
                                    placeholder="Your name or org name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-field__password">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" className="auth-field__toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isLogin && role !== 'sponsor' && (
                            <motion.div
                                className="auth-field auth-skills"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                key={role}
                            >
                                <label>{role === 'ngo' ? 'Focus Areas' : 'Skills'}</label>
                                <div className="auth-skills__grid">
                                    {(role === 'ngo' ? NGO_FOCUS_AREAS : COMMON_SKILLS).map((skill) => {
                                        const isChecked = selectedSkills.includes(skill);
                                        return (
                                            <motion.button
                                                type="button"
                                                key={skill}
                                                className={`skill-checkbox ${isChecked ? 'skill-checkbox--checked' : ''}`}
                                                onClick={() => toggleSkill(skill)}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <div className="skill-checkbox__box">
                                                    {/* SVG border tracer */}
                                                    <svg className="skill-checkbox__border-svg" viewBox="0 0 24 24" fill="none">
                                                        <rect
                                                            className={`skill-checkbox__border-path ${isChecked ? 'skill-checkbox__border-path--active' : ''}`}
                                                            x="1" y="1" width="22" height="22" rx="5"
                                                            strokeWidth="2"
                                                        />
                                                    </svg>
                                                    {/* Fill background */}
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
                                                    {/* Checkmark */}
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
                                                    {skill}
                                                    {isChecked && <span className="skill-checkbox__strike" />}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Custom skill tags */}
                                {selectedSkills.filter(s => !(role === 'ngo' ? NGO_FOCUS_AREAS : COMMON_SKILLS).includes(s)).length > 0 && (
                                    <div className="auth-skills__custom-tags">
                                        {selectedSkills.filter(s => !(role === 'ngo' ? NGO_FOCUS_AREAS : COMMON_SKILLS).includes(s)).map(skill => (
                                            <motion.span
                                                key={skill}
                                                className="skill-tag"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                layout
                                            >
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)}>
                                                    <X size={12} />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </div>
                                )}

                                {/* Custom skill input */}
                                <div className="auth-skills__add">
                                    <input
                                        type="text"
                                        placeholder="Add a custom skill..."
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                                    />
                                    <button type="button" className="auth-skills__add-btn" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {submitError && (
                        <motion.div
                            className="auth-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ 
                                padding: '12px 16px',
                                marginBottom: '16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '14px'
                            }}
                        >
                            {submitError}
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        className="auth-submit"
                        disabled={!role || isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        style={{ '--submit-color': role ? ROLES.find(r => r.id === role)?.color : 'var(--text-muted)' }}
                    >
                        {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Create account')}
                    </motion.button>
                </form>

                <div className="auth-switch">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => {
                        setIsLogin(!isLogin);
                        setSubmitError('');
                        setName('');
                        setEmail('');
                        setPassword('');
                        setSelectedSkills([]);
                        setCustomSkill('');
                    }}>
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
