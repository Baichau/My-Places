import { useState } from 'react';
import { Search } from 'lucide-react';
import { matches, categoryColor } from '../utils.js';

export default function PlaceSearch({ places, onSelect }) {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const results = term ? places.filter((p) => matches(p, term)).slice(0, 6) : [];
  return (
    <div className="search">
      <Search size={16} aria-hidden />
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search your saved places" aria-label="Search your saved places" />
      {term && (
        <ul className="results">
          {results.length === 0 && <li className="muted pad">No saved place matches “{q.trim()}”.</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button onClick={() => { onSelect(p); setQ(''); }}>
                <span className="dot" style={{ background: categoryColor(p.category) }} />
                <span><strong>{p.name}</strong><small>{p.category}{p.address ? ' · ' + p.address : ''}</small></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
