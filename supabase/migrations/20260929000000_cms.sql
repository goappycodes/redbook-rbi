-- RedBook Intelligence CMS
-- Everything specific to the page lives here. Public visitors read with the
-- publishable key; only allowlisted, email-confirmed editors can write.

-- ---------------------------------------------------------------------------
-- Editors
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins: editors read" on public.admins;
create policy "admins: editors read" on public.admins
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Page content: one row per section, JSON shaped by src/lib/content/types.ts
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.site_content enable row level security;

drop policy if exists "site_content: public read" on public.site_content;
create policy "site_content: public read" on public.site_content
  for select to anon, authenticated using (true);
drop policy if exists "site_content: editors write" on public.site_content;
create policy "site_content: editors write" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Every save keeps the version it replaced, so an edit can be undone.
create table if not exists public.site_content_revisions (
  id         bigint generated always as identity primary key,
  key        text not null,
  data       jsonb not null,
  saved_at   timestamptz not null,
  saved_by   uuid references auth.users (id) on delete set null
);
create index if not exists site_content_revisions_key_idx
  on public.site_content_revisions (key, id desc);
alter table public.site_content_revisions enable row level security;

drop policy if exists "revisions: editors read" on public.site_content_revisions;
create policy "revisions: editors read" on public.site_content_revisions
  for select to authenticated using (public.is_admin());

create or replace function public.site_content_before_update()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.data is distinct from old.data then
    insert into public.site_content_revisions (key, data, saved_at, saved_by)
    values (old.key, old.data, old.updated_at, old.updated_by);
  end if;
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

drop trigger if exists site_content_before_update on public.site_content;
create trigger site_content_before_update
  before update on public.site_content
  for each row execute function public.site_content_before_update();

-- ---------------------------------------------------------------------------
-- The RedBook Index: one JSON payload per upload, one published at a time
-- ---------------------------------------------------------------------------
create table if not exists public.index_datasets (
  id           uuid primary key default gen_random_uuid(),
  year         text not null,
  label        text,
  payload      jsonb not null,
  status       text not null default 'draft'
               check (status in ('draft', 'published', 'archived')),
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) on delete set null default auth.uid(),
  published_at timestamptz
);
create unique index if not exists index_datasets_one_published
  on public.index_datasets ((true)) where status = 'published';
alter table public.index_datasets enable row level security;

drop policy if exists "index_datasets: public read published" on public.index_datasets;
create policy "index_datasets: public read published" on public.index_datasets
  for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "index_datasets: editors write" on public.index_datasets;
create policy "index_datasets: editors write" on public.index_datasets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.publish_index_dataset(dataset_id uuid)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from public.index_datasets where id = dataset_id) then
    raise exception 'dataset not found';
  end if;
  update public.index_datasets set status = 'archived'
    where status = 'published' and id <> dataset_id;
  update public.index_datasets set status = 'published', published_at = now()
    where id = dataset_id;
end;
$$;
grant execute on function public.publish_index_dataset(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Form submissions: the four capture points
-- ---------------------------------------------------------------------------
create table if not exists public.form_submissions (
  id         bigint generated always as identity primary key,
  source     text not null check (source in ('contribute', 'contact', 'newshub', 'request_index')),
  email      text not null check (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  first_name text check (char_length(first_name) <= 200),
  last_name  text check (char_length(last_name) <= 200),
  company    text check (char_length(company) <= 200),
  position   text check (char_length(position) <= 200),
  referrer   text check (char_length(referrer) <= 1000),
  page_url   text check (char_length(page_url) <= 1000),
  utm        jsonb,
  user_agent text check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists form_submissions_created_idx on public.form_submissions (created_at desc);
alter table public.form_submissions enable row level security;

-- Visitors may add a row but never read one back.
drop policy if exists "form_submissions: anyone inserts" on public.form_submissions;
create policy "form_submissions: anyone inserts" on public.form_submissions
  for insert to anon, authenticated with check (true);
drop policy if exists "form_submissions: editors read" on public.form_submissions;
create policy "form_submissions: editors read" on public.form_submissions
  for select to authenticated using (public.is_admin());
drop policy if exists "form_submissions: editors delete" on public.form_submissions;
create policy "form_submissions: editors delete" on public.form_submissions
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Media: the `rbi` bucket. Public read (it holds the page's images),
-- editor-only write.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('rbi', 'rbi', true)
on conflict (id) do update set public = true;

drop policy if exists "rbi: public read" on storage.objects;
create policy "rbi: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'rbi');
drop policy if exists "rbi: editors insert" on storage.objects;
create policy "rbi: editors insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'rbi' and public.is_admin());
drop policy if exists "rbi: editors update" on storage.objects;
create policy "rbi: editors update" on storage.objects
  for update to authenticated using (bucket_id = 'rbi' and public.is_admin());
drop policy if exists "rbi: editors delete" on storage.objects;
create policy "rbi: editors delete" on storage.objects
  for delete to authenticated using (bucket_id = 'rbi' and public.is_admin());
