import { useAuth } from '../../context/AuthContext';
import { fadeUp } from '../../hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, MapPin, Calendar, Clock, Star, Award, Edit3,
    Building2, Tag, Users, IndianRupee, Briefcase,
    Bell, Shield, Lock, Globe, LogOut, ChevronRight, Settings, Trophy, Camera, Trash2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './ProfilePage.css';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TARGET_SIZE = 512;
const AVATAR_MIN_SIZE = 192;
const AVATAR_PREVIEW_SIZE = 220;
const INITIAL_AVATAR_CROP = { zoom: 1, panX: 0, panY: 0 };

function clampValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toBlob(canvas, type, quality) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert image blob to data URL.'));
        reader.readAsDataURL(blob);
    });
}

function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load selected image.'));
        image.src = url;
    });
}

function getCropMetrics(image, targetSize, zoom) {
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const baseScale = Math.max(targetSize / imageWidth, targetSize / imageHeight);
    const scale = baseScale * zoom;
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    return {
        scaledWidth,
        scaledHeight,
        extraX: Math.max(0, (scaledWidth - targetSize) / 2),
        extraY: Math.max(0, (scaledHeight - targetSize) / 2),
    };
}

function drawCroppedImageToContext(ctx, image, targetSize, crop) {
    const { zoom, panX, panY } = crop;
    const { scaledWidth, scaledHeight, extraX, extraY } = getCropMetrics(image, targetSize, zoom);

    const offsetX = extraX * panX;
    const offsetY = extraY * panY;
    const drawX = (targetSize - scaledWidth) / 2 + offsetX;
    const drawY = (targetSize - scaledHeight) / 2 + offsetY;

    ctx.clearRect(0, 0, targetSize, targetSize);
    ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
}

async function optimizeAvatarImage(image, crop) {

    let outputSize = AVATAR_TARGET_SIZE;
    let outputBlob = null;

    while (outputSize >= AVATAR_MIN_SIZE) {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas is not available in this browser.');
        }

        drawCroppedImageToContext(ctx, image, outputSize, crop);

        let quality = 0.9;
        outputBlob = await toBlob(canvas, 'image/jpeg', quality);

        while (outputBlob && outputBlob.size > MAX_AVATAR_BYTES && quality >= 0.5) {
            quality -= 0.1;
            outputBlob = await toBlob(canvas, 'image/jpeg', quality);
        }

        if (outputBlob && outputBlob.size <= MAX_AVATAR_BYTES) {
            break;
        }

        outputSize = Math.floor(outputSize * 0.8);
    }

    URL.revokeObjectURL(image.src);

    if (!outputBlob) {
        throw new Error('Could not process this image.');
    }

    if (outputBlob.size > MAX_AVATAR_BYTES) {
        throw new Error('This image is too large even after optimization. Please choose another image.');
    }

    const dataUrl = await blobToDataUrl(outputBlob);

    return {
        dataUrl,
        outputBytes: outputBlob.size,
    };
}

const POSTS = {
    ngo: [
        { id: 1, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Clean River Drive 2025', desc: 'Successfully organized a 3-day cleanup drive along the Yamuna. 320 volunteers joined, collected 2.5 tonnes of waste.', date: 'Dec 2025', tags: ['Environment', '320 Volunteers'] },
        { id: 2, type: 'achievement', title: '🏆 Best NGO Award — National Social Impact Forum', desc: 'Recognized for outstanding grassroots work in environmental conservation and community education across 5 states.', date: 'Nov 2025', tags: ['Award', 'National Recognition'] },
        { id: 3, type: 'event', img: '/images/posts/tree_plantation.png', title: 'Tree Plantation Week', desc: 'Planted 5,000+ saplings across 12 cities. Partnered with 8 schools and 3 corporates for the initiative.', date: 'Oct 2025', tags: ['Environment', '5,000 Trees'] },
        { id: 4, type: 'certification', title: '📜 ISO 26000 Social Responsibility Certification', desc: 'Certified for adhering to international standards of social responsibility and ethical practices.', date: 'Sep 2025', tags: ['Certification', 'ISO'] },
        { id: 5, type: 'event', img: '/images/posts/coding_bootcamp.png', title: 'Digital Literacy Camp — Rural Maharashtra', desc: 'Trained 450 students in basic computer skills and internet safety across 6 villages.', date: 'Aug 2025', tags: ['Education', '450 Students'] },
    ],
    volunteer: [
        { id: 1, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Beach Cleanup Rally — Juhu Beach', desc: 'Participated in a 2-day beach cleanup. Helped sort and recycle 800kg of plastic waste along the Mumbai coastline.', date: 'Jan 2026', tags: ['Environment', '800kg Recycled'] },
        { id: 2, type: 'certification', title: '📜 First Aid & CPR Certification — Red Cross', desc: 'Completed 40-hour certified training in emergency first aid, CPR, and AED usage.', date: 'Dec 2025', tags: ['Certification', 'Healthcare'] },
        { id: 3, type: 'achievement', title: '🏅 "First Responder" Badge Earned', desc: 'Awarded for being among the first 10 volunteers to respond to 5+ emergency events in a single quarter.', date: 'Nov 2025', tags: ['Badge', 'Top Performer'] },
        { id: 4, type: 'event', img: '/images/posts/tree_plantation.png', title: 'Teach India — Science Workshop Series', desc: 'Conducted 12 interactive science workshops for underprivileged children. Covered physics, chemistry, and biology experiments.', date: 'Oct 2025', tags: ['Education', '12 Workshops'] },
        { id: 5, type: 'certification', title: '📜 Disaster Management Training — NDMA', desc: 'Certified in disaster response protocols, evacuation procedures, and relief coordination.', date: 'Sep 2025', tags: ['Certification', 'Safety'] },
    ],
    sponsor: [
        { id: 1, type: 'event', img: '/images/posts/coding_bootcamp.png', title: 'Funded: Digital Literacy Project — Batch 1 Graduation', desc: 'Sponsored the coding bootcamp that graduated 50 students. 72% placement rate with 8 full-time offers from tech companies.', date: 'Jan 2026', tags: ['Education', '₹5.2L Funded'] },
        { id: 2, type: 'achievement', title: '🏆 CSR Excellence Award — CII Foundation', desc: 'Recognized for impactful CSR spending with measurable social outcomes across education and healthcare sectors.', date: 'Dec 2025', tags: ['Award', 'CSR Excellence'] },
        { id: 3, type: 'event', img: '/images/posts/health_camp.png', title: 'Rural Health Camp — Jharkhand Expansion', desc: 'Funded mobile health clinics serving 1,800+ patients across 7 villages. Provided BP monitors, glucometers, and medicines.', date: 'Nov 2025', tags: ['Healthcare', '1,800 Patients'] },
        { id: 4, type: 'certification', title: '📜 Platinum Donor Status — Sarvhit Platform', desc: 'Achieved Platinum status for donating over ₹7.5 Lakhs across 12+ verified social impact projects.', date: 'Oct 2025', tags: ['Certification', 'Platinum Tier'] },
        { id: 5, type: 'event', img: '/images/posts/river_cleanup.png', title: 'Clean Water Initiative — Phase 2 Complete', desc: 'Funded 3 borewells providing clean drinking water to 4,500 people across 7 villages in rural Rajasthan.', date: 'Sep 2025', tags: ['Environment', '4,500 Beneficiaries'] },
    ],
};

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const role = user?.role;
    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [avatarError, setAvatarError] = useState('');
    const [avatarHint, setAvatarHint] = useState('');
    const avatarInputRef = useRef(null);
    const avatarPreviewCanvasRef = useRef(null);
    const avatarImageRef = useRef(null);
    const avatarDragStateRef = useRef({ active: false, lastX: 0, lastY: 0, pointerId: null });
    const [avatarCropModal, setAvatarCropModal] = useState({
        open: false,
        sourceUrl: '',
        sourceSizeBytes: 0,
    });
    const [avatarCrop, setAvatarCrop] = useState(INITIAL_AVATAR_CROP);
    const [isApplyingAvatarCrop, setIsApplyingAvatarCrop] = useState(false);
    const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
    const [notifications, setNotifications] = useState({
        events: true, messages: true, updates: false, marketing: false,
    });

    const drawAvatarPreview = (image, crop) => {
        const previewCanvas = avatarPreviewCanvasRef.current;
        if (!previewCanvas) {
            return;
        }

        const context = previewCanvas.getContext('2d');
        if (!context) {
            return;
        }

        drawCroppedImageToContext(context, image, AVATAR_PREVIEW_SIZE, crop);
    };

    const closeAvatarCropModal = () => {
        if (avatarCropModal.sourceUrl) {
            URL.revokeObjectURL(avatarCropModal.sourceUrl);
        }

        avatarImageRef.current = null;
        avatarDragStateRef.current = { active: false, lastX: 0, lastY: 0, pointerId: null };
        setIsDraggingAvatar(false);
        setIsApplyingAvatarCrop(false);
        setAvatarCrop(INITIAL_AVATAR_CROP);
        setAvatarCropModal({
            open: false,
            sourceUrl: '',
            sourceSizeBytes: 0,
        });
    };

    useEffect(() => {
        if (!avatarCropModal.open || !avatarCropModal.sourceUrl) {
            return undefined;
        }

        let cancelled = false;

        loadImageFromUrl(avatarCropModal.sourceUrl)
            .then((image) => {
                if (cancelled) {
                    return;
                }
                avatarImageRef.current = image;
                drawAvatarPreview(image, avatarCrop);
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                setAvatarError('Failed to load image for cropping. Please try another image.');
                setAvatarHint('');
                closeAvatarCropModal();
            });

        return () => {
            cancelled = true;
        };
    }, [avatarCropModal.open, avatarCropModal.sourceUrl]);

    useEffect(() => {
        if (!avatarCropModal.open || !avatarImageRef.current) {
            return;
        }

        drawAvatarPreview(avatarImageRef.current, avatarCrop);
    }, [avatarCropModal.open, avatarCrop]);

    const toggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const startEditing = () => {
        setActiveTab('profile');
        setEditing(true);
        setAvatarError('');
        setAvatarHint('');
        setEditForm({
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
            location: user?.location || '',
            avatar: user?.avatar || null,
        });
    };

    const cancelEditing = () => {
        closeAvatarCropModal();
        setEditing(false);
        setEditForm({});
        setAvatarError('');
        setAvatarHint('');
    };

    const saveProfile = () => {
        closeAvatarCropModal();
        updateUser(editForm);
        setEditing(false);
        setEditForm({});
        setAvatarError('');
        setAvatarHint('');
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const openAvatarPicker = () => {
        avatarInputRef.current?.click();
    };

    const removeAvatar = () => {
        closeAvatarCropModal();
        setAvatarError('');
        setAvatarHint('');
        handleEditChange('avatar', null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            setAvatarError('Please select a valid image file.');
            setAvatarHint('');
            event.target.value = '';
            return;
        }

        if (avatarCropModal.sourceUrl) {
            URL.revokeObjectURL(avatarCropModal.sourceUrl);
        }

        const sourceUrl = URL.createObjectURL(file);

        setAvatarError('');
        setAvatarHint('Adjust crop and click Apply.');
        setAvatarCrop(INITIAL_AVATAR_CROP);
        setAvatarCropModal({
            open: true,
            sourceUrl,
            sourceSizeBytes: file.size,
        });
        event.target.value = '';
    };

    const updateCropValue = (field, rawValue) => {
        const numericValue = Number(rawValue);
        setAvatarCrop((prev) => ({ ...prev, [field]: numericValue }));
    };

    const startAvatarDrag = (event) => {
        if (!avatarImageRef.current || isApplyingAvatarCrop) {
            return;
        }

        const canvas = avatarPreviewCanvasRef.current;
        if (!canvas) {
            return;
        }

        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        avatarDragStateRef.current = {
            active: true,
            lastX: event.clientX,
            lastY: event.clientY,
            pointerId: event.pointerId,
        };
        setIsDraggingAvatar(true);
    };

    const moveAvatarDrag = (event) => {
        const dragState = avatarDragStateRef.current;
        if (!dragState.active || !avatarImageRef.current) {
            return;
        }

        event.preventDefault();
        const deltaX = event.clientX - dragState.lastX;
        const deltaY = event.clientY - dragState.lastY;

        avatarDragStateRef.current = {
            ...dragState,
            lastX: event.clientX,
            lastY: event.clientY,
        };

        setAvatarCrop((prev) => {
            const metrics = getCropMetrics(avatarImageRef.current, AVATAR_PREVIEW_SIZE, prev.zoom);
            const panDeltaX = metrics.extraX > 0 ? deltaX / metrics.extraX : 0;
            const panDeltaY = metrics.extraY > 0 ? deltaY / metrics.extraY : 0;

            return {
                ...prev,
                panX: clampValue(prev.panX + panDeltaX, -1, 1),
                panY: clampValue(prev.panY + panDeltaY, -1, 1),
            };
        });
    };

    const endAvatarDrag = (event) => {
        const dragState = avatarDragStateRef.current;
        if (!dragState.active) {
            return;
        }

        const canvas = avatarPreviewCanvasRef.current;
        if (canvas && dragState.pointerId !== null) {
            canvas.releasePointerCapture?.(dragState.pointerId);
        }

        if (event) {
            event.preventDefault();
        }

        avatarDragStateRef.current = { active: false, lastX: 0, lastY: 0, pointerId: null };
        setIsDraggingAvatar(false);
    };

    const applyAvatarCrop = async () => {
        if (!avatarImageRef.current) {
            setAvatarError('Image is not ready yet. Please try again.');
            return;
        }

        setIsApplyingAvatarCrop(true);
        setAvatarError('');
        setAvatarHint('Applying crop...');

        try {
            const sourceBytes = avatarCropModal.sourceSizeBytes;
            const result = await optimizeAvatarImage(avatarImageRef.current, avatarCrop);

            handleEditChange('avatar', result.dataUrl);
            closeAvatarCropModal();

            const inputKb = Math.round(sourceBytes / 1024);
            const outputKb = Math.round(result.outputBytes / 1024);
            if (sourceBytes > MAX_AVATAR_BYTES || result.outputBytes < sourceBytes) {
                setAvatarHint(`Image optimized from ${inputKb}KB to ${outputKb}KB.`);
            } else {
                setAvatarHint('Crop applied successfully.');
            }
        } catch (error) {
            setAvatarError(error?.message || 'Unable to process this image. Please try another file.');
            setAvatarHint('');
        } finally {
            setIsApplyingAvatarCrop(false);
        }
    };

    const avatarSrc = editing ? editForm.avatar : user?.avatar;
    const avatarLetter = user?.name?.charAt(0) || '?';

    return (
        <div className="profile-page">
            {/* Cover + Avatar */}
            <motion.div className={`profile-cover${editing ? ' profile-cover--editing' : ''}`} {...fadeUp(0)}>
                <div className="profile-cover__gradient" />
                <div className="profile-avatar">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={`${user?.name || 'User'} avatar`} className="profile-avatar__image" />
                    ) : (
                        <span className="profile-avatar__letter">{avatarLetter}</span>
                    )}

                    {editing && (
                        <>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="profile-avatar__file-input"
                            />
                            <button
                                type="button"
                                className="profile-avatar__pencil"
                                onClick={openAvatarPicker}
                                title={editForm.avatar ? 'Change photo' : 'Upload photo'}
                            >
                                <Edit3 size={14} />
                            </button>
                        </>
                    )}
                </div>
                {editing && avatarError && (
                    <p className="profile-avatar__error">{avatarError}</p>
                )}
                <div className="profile-cover__actions">
                    {!editing ? (
                        <>
                            <motion.button
                                className="profile-edit-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startEditing}
                            >
                                <Edit3 size={14} />
                                Edit Profile
                            </motion.button>
                            <motion.button
                                className="profile-edit-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('settings')}
                            >
                                <Settings size={14} />
                                Settings
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button
                                className="profile-edit-btn profile-edit-btn--save"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={saveProfile}
                            >
                                ✓ Save
                            </motion.button>
                            <motion.button
                                className="profile-edit-btn profile-edit-btn--cancel"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={cancelEditing}
                            >
                                ✕ Cancel
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Info */}
            <motion.div className="profile-info" {...fadeUp(1)}>
                {editing ? (
                    <div className="profile-edit-form">
                        <div className="profile-edit-field">
                            <label>Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => handleEditChange('name', e.target.value)}
                            />
                        </div>
                        <div className="profile-edit-field">
                            <label>Bio</label>
                            <textarea
                                rows={3}
                                value={editForm.bio}
                                onChange={e => handleEditChange('bio', e.target.value)}
                            />
                        </div>
                        <div className="profile-edit-row">
                            <div className="profile-edit-field">
                                <label><Mail size={14} /> Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => handleEditChange('email', e.target.value)}
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label><MapPin size={14} /> Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={e => handleEditChange('location', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1>{user?.name}</h1>
                        <span className="profile-role-tag">
                            {role === 'ngo' ? '🏛️ Non-Profit Organization' : role === 'volunteer' ? '🤝 Volunteer' : '💎 Sponsor'}
                        </span>
                        <p className="profile-bio">{user?.bio}</p>

                        <div className="profile-meta">
                            <span><Mail size={14} /> {user?.email}</span>
                            <span><MapPin size={14} /> {user?.location}</span>
                            {role === 'ngo' && <span><Calendar size={14} /> Founded {user?.founded}</span>}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Tab Switcher */}
            <motion.div className="profile-tabs" {...fadeUp(1.5)}>
                <button
                    className={`profile-tab ${activeTab === 'profile' ? 'profile-tab--active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`profile-tab ${activeTab === 'settings' ? 'profile-tab--active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={14} />
                    Settings
                </button>
            </motion.div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <>
                    {/* Stats row */}
                    <motion.div className="profile-stats" {...fadeUp(2)}>
                        {role === 'ngo' && (
                            <>
                                <div className="profile-stat">
                                    <Calendar size={18} />
                                    <span className="profile-stat__value">{user?.eventsHosted}</span>
                                    <span className="profile-stat__label">Events Hosted</span>
                                </div>
                                <div className="profile-stat">
                                    <Users size={18} />
                                    <span className="profile-stat__value">{user?.volunteersConnected}</span>
                                    <span className="profile-stat__label">Volunteers Connected</span>
                                </div>
                                <div className="profile-stat">
                                    <IndianRupee size={18} />
                                    <span className="profile-stat__value">₹{(user?.fundsReceived / 1000).toFixed(0)}k</span>
                                    <span className="profile-stat__label">Funds Received</span>
                                </div>
                            </>
                        )}
                        {role === 'volunteer' && (
                            <>
                                <div className="profile-stat">
                                    <Clock size={18} />
                                    <span className="profile-stat__value">{user?.hoursLogged}</span>
                                    <span className="profile-stat__label">Hours Logged</span>
                                </div>
                                <div className="profile-stat">
                                    <Calendar size={18} />
                                    <span className="profile-stat__value">{user?.eventsJoined}</span>
                                    <span className="profile-stat__label">Events Joined</span>
                                </div>
                                <div className="profile-stat">
                                    <Award size={18} />
                                    <span className="profile-stat__value">{user?.badgesEarned}</span>
                                    <span className="profile-stat__label">Badges Earned</span>
                                </div>
                            </>
                        )}
                        {role === 'sponsor' && (
                            <>
                                <div className="profile-stat">
                                    <IndianRupee size={18} />
                                    <span className="profile-stat__value">₹{(user?.totalDonated / 1000).toFixed(0)}k</span>
                                    <span className="profile-stat__label">Total Donated</span>
                                </div>
                                <div className="profile-stat">
                                    <Briefcase size={18} />
                                    <span className="profile-stat__value">{user?.projectsFunded}</span>
                                    <span className="profile-stat__label">Projects Funded</span>
                                </div>
                                <div className="profile-stat">
                                    <Star size={18} />
                                    <span className="profile-stat__value">{user?.impactScore}</span>
                                    <span className="profile-stat__label">Impact Score</span>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Skills / Sectors */}
                    {(role === 'volunteer' && user?.skills?.length > 0) && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Tag size={16} /> Skills</h2>
                            <div className="profile-tags">
                                {user.skills.map(s => (
                                    <span key={s} className="profile-tag">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {(role === 'sponsor' && user?.sectors?.length > 0) && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Building2 size={16} /> Focus Sectors</h2>
                            <div className="profile-tags">
                                {user.sectors.map(s => (
                                    <span key={s} className="profile-tag">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {role === 'ngo' && (
                        <motion.div className="profile-section" {...fadeUp(3)}>
                            <h2><Building2 size={16} /> About</h2>
                            <p className="profile-about-text">
                                {user?.bio} We work with local communities to create sustainable change through grassroots action,
                                education programs, and environmental restoration projects across multiple states.
                            </p>
                        </motion.div>
                    )}

                    {/* Heroes of the Month — NGO only */}
                    {role === 'ngo' && (
                        <motion.div className="profile-section heroes-section" {...fadeUp(4)}>
                            <h2><Trophy size={16} /> Heroes of the Month</h2>
                            <div className="heroes-grid">
                                {/* Sponsor Hero — photo right */}
                                <motion.div
                                    className="hero-card hero-card--sponsor"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="hero-card__content">
                                        <span className="hero-card__crown">👑</span>
                                        <span className="hero-card__label">Top Sponsor</span>
                                        <h3 className="hero-card__name">Rajesh Mehta</h3>
                                        <p className="hero-card__org">Apex Technologies Pvt. Ltd.</p>
                                        <p className="hero-card__desc">
                                            Funded 12 social impact projects worth ₹7.5L+ this quarter. Champion of education and healthcare initiatives across rural India.
                                        </p>
                                        <div className="hero-card__stats">
                                            <div className="hero-card__stat">
                                                <IndianRupee size={14} />
                                                <span>₹7.5L Donated</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Briefcase size={14} />
                                                <span>12 Projects</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Star size={14} />
                                                <span>98 Impact Score</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hero-card__avatar hero-card__avatar--sponsor">
                                        <span>RM</span>
                                    </div>
                                </motion.div>

                                {/* Volunteer Hero — photo left */}
                                <motion.div
                                    className="hero-card hero-card--volunteer"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="hero-card__avatar hero-card__avatar--volunteer">
                                        <span>AP</span>
                                    </div>
                                    <div className="hero-card__content">
                                        <span className="hero-card__crown">⭐</span>
                                        <span className="hero-card__label">Top Volunteer</span>
                                        <h3 className="hero-card__name">Ananya Patel</h3>
                                        <p className="hero-card__org">Full-Stack Developer & Educator</p>
                                        <p className="hero-card__desc">
                                            Logged 210+ volunteer hours across 18 events. Led science workshops for underprivileged children and built donation portals for 3 NGOs.
                                        </p>
                                        <div className="hero-card__stats">
                                            <div className="hero-card__stat">
                                                <Clock size={14} />
                                                <span>210 Hours</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Calendar size={14} />
                                                <span>18 Events</span>
                                            </div>
                                            <div className="hero-card__stat">
                                                <Award size={14} />
                                                <span>5 Badges</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Posts / Activity Feed */}
                    <motion.div className="profile-section" {...fadeUp(4)}>
                        <h2><Calendar size={16} /> Posts & Achievements</h2>
                        <div className="profile-posts">
                            {(POSTS[role] || []).map((post, i) => (
                                <motion.div
                                    key={post.id}
                                    className={`profile-post profile-post--${post.type}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <div className="profile-post__header">
                                        <span className={`profile-post__badge profile-post__badge--${post.type}`}>
                                            {post.type === 'event' ? '📅 Event' : post.type === 'achievement' ? '🏆 Achievement' : '📜 Certification'}
                                        </span>
                                        <span className="profile-post__date">{post.date}</span>
                                    </div>
                                    {post.img && (
                                        <div className="profile-post__img">
                                            <img src={post.img} alt={post.title} loading="lazy" />
                                        </div>
                                    )}
                                    <h3 className="profile-post__title">{post.title}</h3>
                                    <p className="profile-post__desc">{post.desc}</p>
                                    <div className="profile-post__tags">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="profile-post__tag">{tag}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
                <>
                    {/* Account */}
                    <motion.div className="settings-section" {...fadeUp(2)}>
                        <h2><Edit3 size={18} /> Account</h2>
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
                    <motion.div className="settings-section" {...fadeUp(3)}>
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
                    <motion.div className="settings-section" {...fadeUp(4)}>
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
                    <motion.div className="settings-section settings-section--danger" {...fadeUp(5)}>
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
                </>
            )}

            <AnimatePresence>
                {avatarCropModal.open && (
                    <motion.div
                        className="avatar-crop-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAvatarCropModal}
                    >
                        <motion.div
                            className="avatar-crop-modal__content"
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h3>Adjust Profile Photo</h3>
                            <p>Use zoom and position to frame your avatar.</p>

                            <div className="avatar-crop-modal__preview-wrap">
                                <canvas
                                    ref={avatarPreviewCanvasRef}
                                    width={AVATAR_PREVIEW_SIZE}
                                    height={AVATAR_PREVIEW_SIZE}
                                    className={`avatar-crop-modal__preview${isDraggingAvatar ? ' avatar-crop-modal__preview--dragging' : ''}`}
                                    onPointerDown={startAvatarDrag}
                                    onPointerMove={moveAvatarDrag}
                                    onPointerUp={endAvatarDrag}
                                    onPointerCancel={endAvatarDrag}
                                    style={{ touchAction: 'none' }}
                                />
                                <div className="avatar-crop-modal__grid">
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--v1" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--v2" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--h1" />
                                    <div className="avatar-crop-modal__grid-line avatar-crop-modal__grid-line--h2" />
                                </div>
                            </div>

                            <div className="avatar-crop-modal__controls">
                                <label>
                                    Zoom
                                    <input
                                        type="range"
                                        min="1"
                                        max="2.5"
                                        step="0.01"
                                        value={avatarCrop.zoom}
                                        onChange={(event) => updateCropValue('zoom', event.target.value)}
                                    />
                                </label>
                                <label>
                                    Horizontal
                                    <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.01"
                                        value={avatarCrop.panX}
                                        onChange={(event) => updateCropValue('panX', event.target.value)}
                                    />
                                </label>
                                <label>
                                    Vertical
                                    <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.01"
                                        value={avatarCrop.panY}
                                        onChange={(event) => updateCropValue('panY', event.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="avatar-crop-modal__actions">
                                <button
                                    type="button"
                                    className="avatar-crop-modal__btn avatar-crop-modal__btn--ghost"
                                    onClick={closeAvatarCropModal}
                                    disabled={isApplyingAvatarCrop}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="avatar-crop-modal__btn avatar-crop-modal__btn--primary"
                                    onClick={applyAvatarCrop}
                                    disabled={isApplyingAvatarCrop}
                                >
                                    {isApplyingAvatarCrop ? 'Applying...' : 'Apply'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
