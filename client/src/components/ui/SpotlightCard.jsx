import { useRef, useCallback, forwardRef } from 'react';
import './SpotlightCard.css';

/**
 * SpotlightCard — wraps any card element to add a Magic-Bento-style
 * cursor-relative border glow.  Tracks mouse position via CSS custom
 * properties, so the heavy lifting is pure CSS (radial-gradient mask).
 *
 * Uses forwardRef so framer-motion (or any parent) can also attach its
 * own ref for layout / AnimatePresence animations.
 */
const SpotlightCard = forwardRef(function SpotlightCard(
    { as: Tag = 'div', className = '', children, spotlightClassName = '', ...rest },
    forwardedRef
) {
    const internalRef = useRef(null);

    // Merge forwarded + internal ref
    const setRef = useCallback(
        (node) => {
            internalRef.current = node;
            if (typeof forwardedRef === 'function') forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
        },
        [forwardedRef]
    );

    const handleMove = useCallback((e) => {
        const el = internalRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--y', `${e.clientY - rect.top}px`);
        el.style.setProperty('--spotlight-opacity', '1');
    }, []);

    const handleLeave = useCallback(() => {
        const el = internalRef.current;
        if (!el) return;
        el.style.setProperty('--spotlight-opacity', '0');
    }, []);

    return (
        <Tag
            ref={setRef}
            className={`spotlight-card ${spotlightClassName} ${className}`.trim()}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            {...rest}
        >
            {children}
        </Tag>
    );
});

export default SpotlightCard;
