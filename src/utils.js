export const DEFAULT_CATEGORIES = ['Vegan cafes', 'Gas stations'];
const PALETTE = ['#4f9a68', '#d08a3c', '#5b8bc4', '#b5628a', '#8a7bc4', '#c25b4e', '#3f9a9a', '#8d8d3a'];
export function categoryColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
export const matches = (p, q) =>
  [p.name, p.category, p.address, p.notes].some((v) => (v || '').toLowerCase().includes(q));

export function directionsUrl({ origin, destination, mode }) {
  const u = new URL('https://www.google.com/maps/dir/');
  u.searchParams.set('api', '1');
  if (origin) u.searchParams.set('origin', origin);
  u.searchParams.set('destination', destination);
  u.searchParams.set('travelmode', mode);
  return u.toString();
}
