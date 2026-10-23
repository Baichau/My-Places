-- Optional: the API creates this automatically on first request.
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  collection text not null default 'default',
  name text not null,
  category text not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  notes text,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists places_collection_idx on places (collection);
