import './ImpactMarquee.css';

const IMPACTS = [
    '🐕 1,000+ Stray Dogs Fed',
    '📚 100+ Children Educated',
    '🌳 5,000+ Trees Planted',
    '🍲 10,000+ Meals Served',
    '🏥 200+ Health Camps Organized',
    '👩‍🏫 50+ Skill Workshops Held',
    '🏠 300+ Families Sheltered',
    '💧 80+ Clean Water Projects',
    '♻️ 2 Tons Waste Recycled',
    '🎓 150+ Scholarships Given',
];

export default function ImpactMarquee() {
    // Duplicate items for seamless loop
    const items = [...IMPACTS, ...IMPACTS];

    return (
        <div className="impact-marquee">
            <div className="impact-marquee__track">
                {items.map((text, i) => (
                    <span key={i} className="impact-marquee__item">
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}
