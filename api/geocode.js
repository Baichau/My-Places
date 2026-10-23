import { checkAuth } from './_lib.js';

// Proxy to OpenStreetMap Nominatim. Policy: max 1 request/second, identify the app,
// no autocomplete. The UI only calls this when the user presses "Find on map".
export default async function handler(req, res) {
  const denied = checkAuth(req);
  if (denied) return res.status(denied.status).json({ error: denied.error });
  const q = String(req.query.q || '').trim().slice(0, 200);
  if (q.length < 3) return res.status(400).json({ error: 'Type a longer address.' });
  try {
    const r = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(q),
      { headers: { 'User-Agent': 'MyPlaces/1.0 (personal map app)', 'Accept-Language': 'en' } }
    );
    if (!r.ok) throw new Error('geocoder ' + r.status);
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).json(data.map((d) => ({ label: d.display_name, lat: +d.lat, lng: +d.lon })));
  } catch (e) {
    return res.status(502).json({ error: 'Address search is unavailable right now. Pick the spot on the map instead.' });
  }
}
