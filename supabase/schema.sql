-- Aegean building info — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → Run

create table if not exists public.buildings (
  id text primary key,
  published boolean not null default true,
  building_code text,
  phone text,
  email text,
  website text,
  lat double precision,
  lng double precision,
  el jsonb not null default '{}'::jsonb,
  en jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offices (
  id text primary key,
  code text not null default '',
  building_code text not null default '',
  building_id text references public.buildings (id) on delete set null,
  published boolean not null default true,
  kind text not null default 'office'
    check (kind in ('office', 'lab', 'room')),
  phone text,
  email text,
  el jsonb not null default '{}'::jsonb,
  en jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offices_building_id_idx on public.offices (building_id);
create index if not exists offices_building_code_idx on public.offices (building_code);
create index if not exists offices_published_idx on public.offices (published);

alter table public.buildings enable row level security;
alter table public.offices enable row level security;

drop policy if exists "buildings_all" on public.buildings;
drop policy if exists "offices_all" on public.offices;

-- Open read/write (matches current open /admin). Tighten later with auth.
create policy "buildings_all" on public.buildings
  for all
  using (true) with check (true);

create policy "offices_all" on public.offices
  for all
  using (true) with check (true);

grant select, insert, update, delete on public.buildings to anon, authenticated, service_role;
grant select, insert, update, delete on public.offices to anon, authenticated, service_role;
