import { Star } from 'lucide-react';

export default function PlaceFilters({ categories, value, onChange }) {
  const chip = (id, label, icon) => (
    <button key={id} className={'chip' + (value === id ? ' on' : '')} aria-pressed={value === id} onClick={() => onChange(id)}>
      {icon}{label}
    </button>
  );
  return (
    <nav className="filters" aria-label="Filter by category">
      {chip('all', 'All saved places')}
      {chip('fav', 'Favorites', <Star size={14} aria-hidden />)}
      {categories.map((c) => chip('cat:' + c, c))}
    </nav>
  );
}
