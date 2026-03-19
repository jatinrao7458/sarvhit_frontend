import { motion } from 'framer-motion';
import './ProgressBar.css';

export default function ProgressBar({ value, total, delay = 0, variant = 'default' }) {
    const pct = total ? Math.round((value / total) * 100) : 0;

    return (
        <div className={`progress-bar ${variant !== 'default' ? `progress-bar--${variant}` : ''}`}>
            <motion.div
                className={`progress-bar__fill ${variant !== 'default' ? `progress-bar__fill--${variant}` : ''}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay }}
            />
        </div>
    );
}
