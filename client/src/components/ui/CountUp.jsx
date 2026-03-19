import { useEffect, useRef, useState } from 'react';

/**
 * Parses a display value like "2,400+", "₹12Cr", "180" into parts:
 *   { prefix, number, suffix, hasCommas }
 */
function parseValue(val) {
    const match = val.match(/^([^\d]*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return { prefix: '', number: 0, suffix: val, hasCommas: false };
    const raw = match[2];
    return {
        prefix: match[1],
        number: parseFloat(raw.replace(/,/g, '')),
        suffix: match[3],
        hasCommas: raw.includes(','),
    };
}

function formatNumber(n, hasCommas) {
    const rounded = Math.round(n);
    if (!hasCommas) return rounded.toString();
    return rounded.toLocaleString('en-IN');
}

/**
 * <CountUp value="2,400+" duration={2000} />
 * Animates from 0 → parsed number with easing, then appends prefix/suffix.
 */
export default function CountUp({ value, duration = 2000, className }) {
    const { prefix, number, suffix, hasCommas } = parseValue(value);
    const [display, setDisplay] = useState(`${prefix}0${suffix}`);
    const ref = useRef(null);
    const hasRun = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasRun.current) {
                    hasRun.current = true;
                    animate();
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    function animate() {
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // ease-out cubic for natural deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * number;

            setDisplay(`${prefix}${formatNumber(current, hasCommas)}${suffix}`);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    return (
        <span ref={ref} className={className}>
            {display}
        </span>
    );
}
