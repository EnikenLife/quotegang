-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ign text not null unique,
  mc_uuid text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup using the IGN passed via metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, ign, mc_uuid)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'ign', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'mc_uuid'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Applications
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'cancelled');

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ign text not null,
  mc_uuid text,
  discord_username text not null,
  activity text not null,
  willing_events boolean,
  status application_status not null default 'pending',
  reviewer_message text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security;

-- Only one pending application per user at a time
create unique index applications_one_pending_per_user
  on public.applications(user_id) where status = 'pending';

create index applications_user_created_idx on public.applications(user_id, created_at desc);
create index applications_status_idx on public.applications(status, created_at desc);

create policy "users see own applications" on public.applications
  for select to authenticated using (auth.uid() = user_id);
create policy "admins see non-cancelled applications" on public.applications
  for select to authenticated using (public.has_role(auth.uid(), 'admin') and status <> 'cancelled');
create policy "users insert own applications" on public.applications
  for insert to authenticated with check (auth.uid() = user_id);
create policy "users cancel own pending" on public.applications
  for update to authenticated using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status in ('pending', 'cancelled'));
create policy "admins update applications" on public.applications
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));