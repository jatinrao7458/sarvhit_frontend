/**
 * Shared animation presets for Framer Motion.
 * Replaces the duplicated `fadeUp` / `stagger` helpers across pages.
 */

/** Spring-based fade-up. Use as spread: `{...fadeUp(index)}` */
export const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', stiffness: 220, damping: 22, delay: i * 0.05 },
});

/** Variant form — for `variants` prop with whileInView */

export const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 },
    }),
};

/** Stagger children wrapper variant */
export const staggerContainer = {
    visible: { transition: { staggerChildren: 0.06 } },
};

/** Slide-in from left for list items */
export const slideInLeft = (i = 0) => ({
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 22, delay: i * 0.04 },
});

/** Hover spring config reused for cards */
export const hoverLift = {
    whileHover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } },
};

/** Page transition wrapper config */
export const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { type: 'spring', stiffness: 260, damping: 24 },
};
