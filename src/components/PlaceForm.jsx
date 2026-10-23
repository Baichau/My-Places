import { useEffect, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { api } from '../api.js';

const COORDS = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

export default function PlaceForm({ place, categories, hidden, pickedPoint, onPickMap, onSave, onCancel }) {
  const [f, setF] = useState({
    name: place?.name || '', category: place?.category || categories[0] || '',
    address: place?.address || '', notes: place?.notes || '', favorite: !!place?.favorite,
    lat: place?.lat ?? null, lng: place?.lng ?? null,
  });
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => { if (pickedPoint) setF((s) => ({ ...s, lat: pickedPoint.lat, lng: pickedPoint.lng })); }, [pickedPoint]);

  async function find() {
    setErr(''); setHits([]);
    const m = f.address.match(COORDS);
    if (m) { set('lat', +m[1]); set('lng', +m[2]); return; }
    setBusy(true);
    try {
      const r = await api.geocode(f.address);
      if (!r.length) setErr('No match found. Try a fuller address or pick the spot on the map.');
      setHits(r);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!f.name.trim()) return setErr('Please enter a name.');
    if (!f.category.trim()) return setErr('Please choose a category.');
    if (f.lat == null) return setErr('Please set a location: pick it on the map or find an address.');
    setBusy(true);
    try { await onSave(f); } catch (e2) { setErr(e2.message); setBusy(false); }
  }

  return (
    <div className={'overlay' + (hidden ? ' hide' : '')}>
      <form className="modal" onSubmit={submit} aria-label={place ? 'Edit place' : 'Add place'}>
        <div className="row between">
          <h2>{place ? 'Edit place' : 'Add place'}</h2>
          <button type="button" className="icon" onClick={onCancel} aria-label="Cancel"><X size={20} /></button>
        </div>
        <label>Place name
          <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={120} required autoFocus />
        </label>
        <label>Category
          <input list="cats" value={f.category} onChange={(e) => set('category', e.target.value)} maxLength={60}
            placeholder="Choose or type a new one" />
          <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label>Address or coordinates
          <div className="row">
            <input value={f.address} onChange={(e) => set('address', e.target.value)} maxLength={300}
              placeholder="Street, city, or 41.64, 41.63" />
            <button type="button" className="btn" onClick={find} disabled={busy || f.address.trim().length < 3}>
              <Search size={16} aria-hidden /> Find
            </button>
          </div>
        </label>
        {hits.length > 0 && (
          <ul className="hits">
            {hits.map((h, i) => (
              <li key={i}><button type="button" onClick={() => { setF((s) => ({ ...s, lat: h.lat, lng: h.lng, address: h.label })); setHits([]); }}>{h.label}</button></li>
            ))}
          </ul>
        )}
        <div className="row between loc">
          <span className={f.lat == null ? 'muted' : 'ok'}>
            <MapPin size={15} aria-hidden /> {f.lat == null ? 'No location chosen yet' : `Location set (${f.lat.toFixed(5)}, ${f.lng.toFixed(5)})`}
          </span>
          <button type="button" className="btn" onClick={onPickMap}>Pick on map</button>
        </div>
        <label>Note (optional)
          <textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} maxLength={2000} />
        </label>
        <label className="check"><input type="checkbox" checked={f.favorite} onChange={(e) => set('favorite', e.target.checked)} /> Favorite</label>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="row end">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
