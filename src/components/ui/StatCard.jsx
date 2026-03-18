import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { fadeUp } from '../../hooks/useAnimations';
import './StatCard.css';

export default function StatCard({ stat, index = 0 }) {
    return (
        <motion.div className="stat-card" {...fadeUp(index)}>
            <div className="stat-card__top">
                <div className="stat-card__icon-wrap">
                    <stat.icon size={20} />
                </div>
                {stat.change && (
                    <span className={`stat-card__change ${stat.up ? 'stat-card__change--up' : ''}`}>
                        {stat.change}
                        <ArrowUpRight size={12} />
                    </span>
                )}
            </div>
            <span className="stat-card__value">{stat.value}</span>
            <span className="stat-card__label">{stat.label}</span>
        </motion.div>
    );
}
