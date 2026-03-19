import './FilterTag.css';

export default function FilterTag({ label, active = false, onClick }) {
    return (
        <button
            className={`filter-tag ${active ? 'filter-tag--active' : ''}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
