import { Leaf, Plus } from 'lucide-react';
import PlaceSearch from './PlaceSearch.jsx';

export default function AppHeader({ places, onAdd, onSelect }) {
  return (
    <header className="header">
      <div className="brand"><Leaf size={20} aria-hidden /> <h1>My Places</h1></div>
      <button className="btn primary add" onClick={onAdd}><Plus size={18} aria-hidden /> Add place</button>
      <PlaceSearch places={places} onSelect={onSelect} />
    </header>
  );
}
