-- ============================================
-- ANJO DA GUARDA - Database Schema
-- Execute este SQL no SQL Editor do seu Supabase
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger para criar profile automaticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- DEVICES TABLE
-- ============================================
create table public.devices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('phone', 'pc', 'tablet')),
  is_third_party boolean default false,
  third_party_email text,
  status text default 'offline' check (status in ('online', 'offline')),
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.devices enable row level security;

create policy "Users can view own devices"
  on public.devices for select
  using (auth.uid() = user_id);

create policy "Users can insert own devices"
  on public.devices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own devices"
  on public.devices for update
  using (auth.uid() = user_id);

create policy "Users can delete own devices"
  on public.devices for delete
  using (auth.uid() = user_id);

-- ============================================
-- RECORDINGS TABLE
-- ============================================
create table public.recordings (
  id uuid default uuid_generate_v4() primary key,
  device_id uuid references public.devices on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('video', 'audio', 'location', 'panic')),
  file_path text,
  location_data jsonb,
  duration integer,
  size bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_downloaded boolean default false
);

alter table public.recordings enable row level security;

create policy "Users can view own recordings"
  on public.recordings for select
  using (auth.uid() = user_id);

create policy "Users can insert own recordings"
  on public.recordings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recordings"
  on public.recordings for update
  using (auth.uid() = user_id);

create policy "Users can delete own recordings"
  on public.recordings for delete
  using (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  plan_type text default 'free_trial' check (plan_type in ('free_trial', 'monthly')),
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

-- Trigger para criar trial gratuito de 3 dias automaticamente
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan_type, status, started_at, expires_at)
  values (
    new.id, 
    'free_trial', 
    'active', 
    now(), 
    now() + interval '3 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();

-- ============================================
-- STORAGE BUCKET FOR RECORDINGS
-- ============================================
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload own recordings"
  on storage.objects for insert
  with check (
    bucket_id = 'recordings' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own recordings"
  on storage.objects for select
  using (
    bucket_id = 'recordings' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own recordings"
  on storage.objects for delete
  using (
    bucket_id = 'recordings' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- IMPORTANTE: CONFIGURAÇÃO DE AUTENTICAÇÃO
-- ============================================
-- Vá em Authentication > URL Configuration e configure:
-- Site URL: URL do seu app (preview ou domínio)
-- Redirect URLs: Adicione as URLs onde o app pode redirecionar após login
