import { motion } from 'framer-motion';
import { fadeUp } from '../../hooks/useAnimations';
import './PageHeader.css';

export default function PageHeader({ title, description, actions, index = 0 }) {
    return (
        <motion.div className="page-header" {...fadeUp(index)}>
            <div className="page-header__text">
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {actions && <div className="page-header__actions">{actions}</div>}
        </motion.div>
    );
}
