import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api, getCode, setCode } from './api.js';
import { DEFAULT_CATEGORIES } from './utils.js';
import AppHeader from './components/AppHeader.jsx';
import MapView from './components/MapView.jsx';
import PlaceFilters from './components/PlaceFilters.jsx';
import PlaceDetails from './components/PlaceDetails.jsx';
import PlaceForm from './components/PlaceForm.jsx';
import DirectionsPanel from './components/DirectionsPanel.jsx';

function Unlock({ onDone, error, busy }) {
  const [v, setV] = useState('');
  return (
    <div className="unlock">
      <form className="modal" onSubmit={(e) => { e.preventDefault(); onDone(v.trim()); }}>
        <h2>My Places</h2>
        <p className="muted">Enter your access code to open your map.</p>
        <input type="password" value={v} onChange={(e) => setV(e.target.value)} aria-label="Access code" autoFocus />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={!v.trim() || busy}>{busy ? 'Checking…' : 'Open map'}</button>
      </form>
    </div>
  );
}

export default function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(!!getCode());
  const [booting, setBooting] = useState(!!getCode());
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [locked, setLocked] = useState(!getCode());
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null); // null | { place? }
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(null);
  const [dirTo, setDirTo] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState('');

  const relock = (msg) => { setCode(''); setAuthError(msg); setLocked(true); };
  const load = useCallback(async (code, fromUnlock = false) => {
    setLoading(true); setError(''); if (fromUnlock) setAuthError('');
    try {
      const rows = await api.list(code);
      if (code) setCode(code);
      setPlaces(rows); setLocked(false); setAuthError('');
    } catch (e) {
      if (e.status === 401) relock(fromUnlock ? e.message : 'Please enter your access code again.');
      else if (fromUnlock) setAuthError(e.message);
      else setError(e.message);
    } finally { setLoading(false); setBooting(false); }
  }, []);
  useEffect(() => { if (getCode()) load(); }, [load]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };
  const categories = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...places.map((p) => p.category)])], [places]);
  const visible = useMemo(() => places.filter((p) =>
    filter === 'all' ? true : filter === 'fav' ? p.favorite : p.category === filter.slice(4)), [places, filter]);
  const selected = places.find((p) => p.id === selectedId);

  const select = (p, fly = true) => { setSelectedId(p.id); setDirTo(null); if (fly) setFocus({ lat: p.lat, lng: p.lng, n: Date.now() }); };
  const closeForm = () => { setForm(null); setPicking(false); setPicked(null); };

  async function save(data) {
    const body = { name: data.name, category: data.category, lat: data.lat, lng: data.lng, address: data.address, notes: data.notes, favorite: data.favorite };
    const saved = form.place ? await api.update(form.place.id, body) : await api.create(body);
    setPlaces((ps) => form.place ? ps.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...ps]);
    if (filter !== 'all' && filter !== 'fav' && filter.slice(4) !== saved.category) setFilter('all');
    closeForm(); select(saved); flash('Saved to your places');
  }
  async function toggleFav(p) {
    try {
      const u = await api.update(p.id, { ...p, favorite: !p.favorite });
      setPlaces((ps) => ps.map((x) => (x.id === u.id ? u : x)));
    } catch (e) { e.status === 401 ? relock(e.message) : flash(e.message); }
  }
  async function remove(p) {
    try { await api.remove(p.id); setPlaces((ps) => ps.filter((x) => x.id !== p.id)); setSelectedId(null); flash('Place deleted'); }
    catch (e) { e.status === 401 ? relock(e.message) : flash(e.message); }
  }

  if (booting) return <div className="splash" role="status">Loading your map…</div>;
  if (locked) return <Unlock error={authError} busy={loading} onDone={(c) => load(c, true)} />;

  return (
    <div className="app">
      <AppHeader places={places} onAdd={() => setForm({})} onSelect={(p) => select(p)} />
      <PlaceFilters categories={categories} value={filter} onChange={setFilter} />
      <main className="stage">
        <MapView places={visible} selectedId={selectedId} onSelect={(p) => select(p, false)} focus={focus}
          picking={picking} onPick={(pt) => { setPicked(pt); setPicking(false); }} pickPoint={form ? picked : null} />

        {loading && <div className="banner" role="status">Loading your places…</div>}
        {error && !loading && <div className="banner err" role="alert">{error} <button className="link" onClick={() => load()}>Try again</button></div>}
        {!loading && !error && places.length === 0 && !form && (
          <div className="empty"><MapPin size={22} aria-hidden /><p>Your map is empty.<br />Tap <strong>Add place</strong> to mark your first spot.</p></div>
        )}
        {!loading && places.length > 0 && visible.length === 0 && <div className="banner">No places in this category yet.</div>}
        {picking && (
          <div className="banner pick" role="status">Tap the map to choose the location
            <button className="link" onClick={() => setPicking(false)}>Cancel</button></div>
        )}

        {selected && !dirTo && !form && (
          <PlaceDetails place={selected} onClose={() => setSelectedId(null)} onDirections={setDirTo}
            onEdit={(p) => setForm({ place: p })} onDelete={remove} onToggleFav={toggleFav} />
        )}
        {dirTo && !form && <DirectionsPanel destination={dirTo} places={places} onClose={() => setDirTo(null)} />}
        {form && (
          <PlaceForm key={form.place?.id || 'new'} place={form.place} categories={categories} hidden={picking}
            pickedPoint={picked} onPickMap={() => setPicking(true)} onSave={save} onCancel={closeForm} />
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
    </div>
  );
}
