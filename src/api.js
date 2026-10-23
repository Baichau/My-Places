const KEY = 'myplaces_code';
export const getCode = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setCode = (c) => { try { c ? localStorage.setItem(KEY, c) : localStorage.removeItem(KEY); } catch { /* private mode */ } };

async function req(path, opts = {}, code = getCode()) {
  let r;
  try {
    r = await fetch(path, {
      method: opts.method,
      headers: { 'Content-Type': 'application/json', 'x-access-code': code },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error('No connection. Check your internet and try again.');
  }
  const text = await r.text();
  let d = null;
  try { d = JSON.parse(text); } catch { /* not JSON */ }
  if (!r.ok || d === null) {
    const msg = d?.error || (r.status === 404
      ? 'The server API was not found. Run the app with "npx vercel dev" (or deploy to Vercel), not "npm run dev".'
      : `Server error (${r.status}). Check the Vercel function logs and environment variables.`);
    const e = new Error(msg); e.status = r.status; throw e;
  }
  return d;
}
export const api = {
  list: (code) => req('/api/places', {}, code),
  create: (b) => req('/api/places', { method: 'POST', body: b }),
  update: (id, b) => req('/api/places?id=' + id, { method: 'PUT', body: b }),
  remove: (id) => req('/api/places?id=' + id, { method: 'DELETE' }),
  geocode: (q) => req('/api/geocode?q=' + encodeURIComponent(q)),
};
