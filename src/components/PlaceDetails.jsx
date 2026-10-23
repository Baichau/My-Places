import { useState } from 'react';
import { Star, Navigation, Pencil, Trash2, X, Bookmark } from 'lucide-react';
import { categoryColor } from '../utils.js';

export default function PlaceDetails({ place, onClose, onDirections, onEdit, onDelete, onToggleFav }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="sheet" aria-label={'Details for ' + place.name}>
      <div className="row between">
        <span className="tag" style={{ '--c': categoryColor(place.category) }}>{place.category}</span>
        <button className="icon" onClick={onClose} aria-label="Close details"><X size={20} /></button>
      </div>
      <div className="row between">
        <h2>{place.name}</h2>
        <button className="icon" onClick={() => onToggleFav(place)} aria-pressed={place.favorite}
          aria-label={place.favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <Star size={22} fill={place.favorite ? '#e0b43a' : 'none'} color={place.favorite ? '#e0b43a' : 'currentColor'} />
        </button>
      </div>
      {place.address && <p className="muted">{place.address}</p>}
      {place.notes && <p className="note">{place.notes}</p>}
      <p className="saved"><Bookmark size={13} aria-hidden /> Saved in your places</p>
      {confirm ? (
        <div className="row confirm">
          <span>Delete “{place.name}”?</span>
          <button className="btn danger" onClick={() => onDelete(place)}>Delete</button>
          <button className="btn" onClick={() => setConfirm(false)}>Keep</button>
        </div>
      ) : (
        <div className="row actions">
          <button className="btn primary grow" onClick={() => onDirections(place)}><Navigation size={18} aria-hidden /> Directions</button>
          <button className="btn" onClick={() => onEdit(place)}><Pencil size={16} aria-hidden /> Edit</button>
          <button className="btn" onClick={() => setConfirm(true)} aria-label="Delete place"><Trash2 size={16} aria-hidden /></button>
        </div>
      )}
    </section>
  );
}
