-- =============================================
-- Wishes Platform — Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================
-- Table: wishes
-- =============================================
create table public.wishes (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  person_name text not null,
  title text not null,
  special_date date,
  message text default '',
  theme text default 'cartoon',
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- Table: wish_media
-- =============================================
create table public.wish_media (
  id uuid default gen_random_uuid() primary key,
  wish_id uuid references public.wishes(id) on delete cascade not null,
  type text not null check (type in ('image', 'audio')),
  file_url text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- =============================================
-- Indexes
-- =============================================
create index idx_wishes_slug on public.wishes(slug);
create index idx_wishes_created_by on public.wishes(created_by);
create index idx_wish_media_wish_id on public.wish_media(wish_id);

-- =============================================
-- Updated_at trigger
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_wishes_updated
  before update on public.wishes
  for each row execute function public.handle_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
alter table public.wishes enable row level security;
alter table public.wish_media enable row level security;

-- Wishes: anyone can read (public wish pages)
create policy "Public can read wishes"
  on public.wishes for select
  using (true);

-- Wishes: only creator can insert
create policy "Authenticated users can create wishes"
  on public.wishes for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Wishes: only creator can update
create policy "Users can update own wishes"
  on public.wishes for update
  to authenticated
  using (auth.uid() = created_by);

-- Wishes: only creator can delete
create policy "Users can delete own wishes"
  on public.wishes for delete
  to authenticated
  using (auth.uid() = created_by);

-- Wish Media: anyone can read (public wish pages)
create policy "Public can read wish_media"
  on public.wish_media for select
  using (true);

-- Wish Media: authenticated users can insert (linked to their wish)
create policy "Authenticated users can insert wish_media"
  on public.wish_media for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wishes
      where id = wish_id and created_by = auth.uid()
    )
  );

-- Wish Media: only wish owner can delete
create policy "Users can delete own wish_media"
  on public.wish_media for delete
  to authenticated
  using (
    exists (
      select 1 from public.wishes
      where id = wish_id and created_by = auth.uid()
    )
  );

-- =============================================
-- Storage Bucket (run separately or via Dashboard)
-- =============================================
-- Create a "wishes" bucket in Supabase Storage Dashboard
-- Set it to PUBLIC access
-- Or run:
-- insert into storage.buckets (id, name, public) values ('wishes', 'wishes', true);
