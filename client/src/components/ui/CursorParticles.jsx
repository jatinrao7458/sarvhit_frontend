import { useEffect, useRef } from 'react';
import './CursorParticles.css';

/* ── colour palette (matching reference video) ── */
const COLORS = [
    { r: 0, g: 210, b: 255 },    // electric cyan
    { r: 255, g: 40, b: 150 },   // hot pink / magenta
    { r: 255, g: 180, b: 30 },   // bright amber / yellow
    { r: 160, g: 80, b: 255 },   // vivid purple
    { r: 80, g: 255, b: 180 },   // mint / teal
    { r: 255, g: 100, b: 60 },   // coral / orange
];

const PARTICLE_COUNT = 120;
const RADIUS = 366;           // outer scatter limit (scaled to keep density with 120 particles)
const INNER_RADIUS = 150;     // empty zone around cursor
const EASE = 0.08;            // inertia lerp factor (lower = more trail)
function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = INNER_RADIUS + Math.random() * (RADIUS - INNER_RADIUS);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
        /* fixed offset relative to cursor (no orbit) */
        angle,
        dist,
        /* current rendered position (starts off-screen) */
        x: -200,
        y: -200,
        /* per-particle tweak */
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.5,
        color,
        /* small local jitter */
        driftPhase: Math.random() * Math.PI * 2,
        driftRadius: 4 + Math.random() * 8,       // small radial breathing
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.001 + Math.random() * 0.002,
        wobbleAmt: 3 + Math.random() * 6,          // tiny sideways jitter
        /* speed multiplier for following cursor */
        speed: 0.03 + Math.random() * 0.06,
    };
}

export default function CursorParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let mouse = { x: -300, y: -300 };
        let smoothMouse = { x: -300, y: -300 };
        let animId;

        /* ── particles array ── */
        const particles = Array.from({ length: PARTICLE_COUNT }, createParticle);

        /* ── resize handler ── */
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        /* ── mouse tracking ── */
        const onMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', onMove);

        /* ── animation loop ── */
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /* smooth cursor position (gives the trailing effect) */
            smoothMouse.x += (mouse.x - smoothMouse.x) * EASE;
            smoothMouse.y += (mouse.y - smoothMouse.y) * EASE;

            const now = performance.now();

            for (const p of particles) {
                /* heartbeat: double-pulse rhythm (expand → contract → expand → rest) */
                const beatPhase = (now * 0.002) % (Math.PI * 2);
                const beat = (Math.pow(Math.sin(beatPhase), 17) + Math.pow(Math.sin(beatPhase + 0.4), 17)) * 25;

                /* wave: ripples outward based on angle, creating undulation */
                const wave = Math.sin(p.angle * 3 - now * 0.001) * 30;

                /* small local jitter */
                const drift = Math.sin(now * 0.0015 + p.driftPhase) * p.driftRadius;
                const wobble = Math.sin(now * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmt;

                const effectiveDist = p.dist + beat + wave + drift;
                const tx = smoothMouse.x + Math.cos(p.angle) * effectiveDist + Math.cos(p.angle + 1.57) * wobble;
                const ty = smoothMouse.y + Math.sin(p.angle) * effectiveDist + Math.sin(p.angle + 1.57) * wobble;

                /* ease toward target (individual speed → spread) */
                p.x += (tx - p.x) * p.speed;
                p.y += (ty - p.y) * p.speed;

                /* pulsing alpha */
                const pulse = 0.7 + 0.3 * Math.sin(now * 0.002 + p.driftPhase);
                const a = p.alpha * pulse;

                /* draw glow */
                ctx.save();
                ctx.globalAlpha = a;
                ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${a})`;
                ctx.shadowBlur = 12 + p.size * 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${a})`;
                ctx.fill();
                ctx.restore();
            }

            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);

        /* ── cleanup ── */
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="cursor-particles-canvas" />;
}
