import { useState } from 'react';
import { X, Car, Footprints, Bike, Locate, ExternalLink } from 'lucide-react';
import { directionsUrl } from '../utils.js';

const MODES = [['driving', 'Driving', Car], ['walking', 'Walking', Footprints], ['bicycling', 'Cycling', Bike]];

export default function DirectionsPanel({ destination, places, onClose }) {
  const [destId, setDestId] = useState(destination.id);
  const [originType, setOriginType] = useState('me');
  const [originPlace, setOriginPlace] = useState('');
  const [addr, setAddr] = useState('');
  const [mode, setMode] = useState('driving');
  const [pos, setPos] = useState(null);
  const [geo, setGeo] = useState('');

  const dest = places.find((p) => p.id === destId) || destination;
  const from = places.find((p) => p.id === originPlace);

  function locate() {
    setGeo('Looking for your location…');
    if (!navigator.geolocation) return setGeo('This browser can’t share your location. Choose another start.');
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos(`${p.coords.latitude},${p.coords.longitude}`); setGeo('Location found.'); },
      () => { setPos(null); setGeo('Couldn’t get your location. Allow it in the browser, or choose another start.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const origin = originType === 'me' ? pos : originType === 'place' ? (from && `${from.lat},${from.lng}`) : addr.trim();
  const url = origin ? directionsUrl({ origin, destination: `${dest.lat},${dest.lng}`, mode }) : null;

  return (
    <section className="sheet" aria-label="Directions">
      <div className="row between"><h2>Directions</h2><button className="icon" onClick={onClose} aria-label="Close directions"><X size={20} /></button></div>
      <label>Start
        <select value={originType} onChange={(e) => setOriginType(e.target.value)}>
          <option value="me">My current location</option>
          <option value="place">One of my saved places</option>
          <option value="address">Type an address</option>
        </select>
      </label>
      {originType === 'me' && (
        <div>
          <p className="muted small">Your browser will ask to share your location, only to set the start of the route.</p>
          <button className="btn" onClick={locate}><Locate size={16} aria-hidden /> Use my location</button>
          {geo && <p className="small" role="status">{geo}</p>}
        </div>
      )}
      {originType === 'place' && (
        <select value={originPlace} onChange={(e) => setOriginPlace(e.target.value)} aria-label="Starting place">
          <option value="">Choose a starting place…</option>
          {places.filter((p) => p.id !== destId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {originType === 'address' && <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Starting address" aria-label="Starting address" />}
      <label>Destination
        <select value={destId} onChange={(e) => setDestId(e.target.value)}>
          {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <div className="modes" role="radiogroup" aria-label="Travel mode">
        {MODES.map(([id, label, Icon]) => (
          <button key={id} role="radio" aria-checked={mode === id} className={'chip' + (mode === id ? ' on' : '')} onClick={() => setMode(id)}>
            <Icon size={16} aria-hidden /> {label}
          </button>
        ))}
      </div>
      <a className={'btn primary big' + (url ? '' : ' disabled')} href={url || undefined} target="_blank" rel="noopener noreferrer"
        aria-disabled={!url} onClick={(e) => !url && e.preventDefault()}>
        <ExternalLink size={18} aria-hidden /> Open in Google Maps
      </a>
      {!url && <p className="muted small">Choose a start to continue.</p>}
    </section>
  );
}
