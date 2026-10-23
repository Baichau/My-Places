import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

export const COLLECTION = 'default';
const clean = (v) => String(v ?? '').trim().replace(/^["']|["']$/g, '');

export class ConfigError extends Error {}

let _sql;
export function db() {
  if (_sql) return _sql;
  const url = clean(process.env.DATABASE_URL);
  if (!url) throw new ConfigError('DATABASE_URL is not set on the server.');
  return (_sql = neon(url));
}

let ready;
export function init(sql) {
  ready ??= sql`create table if not exists places (
    id uuid primary key default gen_random_uuid(),
    collection text not null default 'default',
    name text not null, category text not null,
    lat double precision not null, lng double precision not null,
    address text, notes text, favorite boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now())`.catch((e) => { ready = undefined; throw e; });
  return ready;
}

const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
// Returns null when allowed, otherwise { status, error }.
export function checkAuth(req) {
  const code = clean(process.env.ACCESS_CODE);
  if (!code) return { status: 500, error: 'ACCESS_CODE is not set on the server.' };
  const given = clean(req.headers['x-access-code']);
  if (!given) return { status: 401, error: 'Enter your access code.' };
  return crypto.timingSafeEqual(h(given), h(code)) ? null : { status: 401, error: 'That access code is not correct.' };
}

export function fail(res, e) {
  console.error(e);
  if (e instanceof ConfigError) return res.status(500).json({ error: e.message });
  return res.status(500).json({ error: 'Could not reach the database. Check DATABASE_URL.' });
}

export function validate(b) {
  if (!b || typeof b !== 'object') return { error: 'Invalid request.' };
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const name = str(b.name, 120), category = str(b.category, 60);
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!name) return { error: 'Please enter a name.' };
  if (!category) return { error: 'Please choose a category.' };
  if (b.lat == null || b.lng == null || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180)
    return { error: 'Please choose a valid location.' };
  return { value: { name, category, lat, lng, address: str(b.address, 300) || null, notes: str(b.notes, 2000) || null, favorite: b.favorite === true } };
}
export const isUuid = (s) => /^[0-9a-f-]{36}$/i.test(String(s));
