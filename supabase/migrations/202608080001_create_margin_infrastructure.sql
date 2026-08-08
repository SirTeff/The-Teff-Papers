create extension if not exists pgcrypto;

create type public.margin_target_type as enum ('paper');
comment on type public.margin_target_type is
  'Stage A supports paper. Add future target types with additive enum migrations.';

create type public.margin_status as enum ('pending', 'approved', 'rejected', 'spam', 'removed');

create type public.moderation_action as enum (
  'approved',
  'rejected',
  'marked_spam',
  'removed',
  'restored_pending',
  'restored_approved',
  'featured',
  'unfeatured'
);

create table public.margin_entries (
  id uuid primary key default gen_random_uuid(),
  target_type public.margin_target_type not null,
  target_key text not null,
  display_name text,
  body text not null,
  status public.margin_status not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  published_at timestamptz,
  moderated_by text,
  moderation_note text,
  submission_key uuid not null,
  constraint margin_entries_submission_key_unique unique (submission_key),
  constraint margin_entries_target_key_length check (char_length(btrim(target_key)) between 1 and 200),
  constraint margin_entries_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  ),
  constraint margin_entries_body_length check (
    char_length(btrim(body)) >= 20 and char_length(body) <= 1200
  ),
  constraint margin_entries_published_state check (
    published_at is null or status in ('approved', 'removed')
  ),
  constraint margin_entries_featured_state check (
    featured = false or status = 'approved'
  )
);

comment on table public.margin_entries is
  'Interactive Margin contributions only. Teff-authored papers remain in Markdown.';
comment on column public.margin_entries.body is
  'Plain text only. Rendering code must never treat this value as HTML or Markdown.';
comment on column public.margin_entries.moderation_note is
  'Private administrative context. Never expose through public projections.';
comment on column public.margin_entries.submission_key is
  'Caller-provided UUID used to make future submission retries idempotent.';

create table public.margin_settings (
  target_type public.margin_target_type not null,
  target_key text not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (target_type, target_key),
  constraint margin_settings_target_key_length check (char_length(btrim(target_key)) between 1 and 200)
);

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null,
  action public.moderation_action not null,
  actor text not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint moderation_events_entry_fk foreign key (entry_id)
    references public.margin_entries (id)
    on update restrict
    on delete restrict,
  constraint moderation_events_actor_not_blank check (char_length(btrim(actor)) between 1 and 200),
  constraint moderation_events_reason_length check (reason is null or char_length(reason) <= 2000)
);

comment on table public.moderation_events is
  'Append-oriented administrative audit trail. Entry deletion is restricted to preserve history.';

create function public.set_margin_settings_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger margin_settings_set_updated_at
before update on public.margin_settings
for each row execute function public.set_margin_settings_updated_at();

-- Supports rendering approved entries for one paper in publication order.
create index margin_entries_target_status_idx
  on public.margin_entries (target_type, target_key, status, published_at desc, created_at desc);

-- Supports the future Studio moderation queue.
create index margin_entries_status_created_idx
  on public.margin_entries (status, created_at asc);

-- Partial index keeps the future curated-homepage lookup small.
create index margin_entries_featured_idx
  on public.margin_entries (published_at desc)
  where featured = true and status = 'approved';

create index moderation_events_entry_created_idx
  on public.moderation_events (entry_id, created_at desc);

-- The submission_key unique constraint already provides the idempotency index.

alter table public.margin_entries enable row level security;
alter table public.margin_entries force row level security;
alter table public.margin_settings enable row level security;
alter table public.margin_settings force row level security;
alter table public.moderation_events enable row level security;
alter table public.moderation_events force row level security;

-- No public table policies are created. Anonymous and authenticated clients cannot
-- select arbitrary columns or rows; safe reads use the fixed projection functions below.
revoke all on table public.margin_entries from anon, authenticated;
revoke all on table public.margin_settings from anon, authenticated;
revoke all on table public.moderation_events from anon, authenticated;

grant all on table public.margin_entries to service_role;
grant all on table public.margin_settings to service_role;
grant all on table public.moderation_events to service_role;

revoke all on type public.margin_target_type from public;
revoke all on type public.margin_status from public;
revoke all on type public.moderation_action from public;
grant usage on type public.margin_target_type to anon, authenticated, service_role;
grant usage on type public.margin_status to service_role;
grant usage on type public.moderation_action to service_role;

create function public.get_public_margin_entries(
  p_target_type public.margin_target_type,
  p_target_key text
)
returns table (
  id uuid,
  target_type public.margin_target_type,
  target_key text,
  display_name text,
  body text,
  created_at timestamptz,
  published_at timestamptz,
  featured boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    entry.id,
    entry.target_type,
    entry.target_key,
    entry.display_name,
    entry.body,
    entry.created_at,
    entry.published_at,
    entry.featured
  from public.margin_entries as entry
  where entry.target_type = p_target_type
    and entry.target_key = p_target_key
    and entry.status = 'approved'
  order by entry.published_at desc nulls last, entry.created_at desc, entry.id;
$$;

comment on function public.get_public_margin_entries(public.margin_target_type, text) is
  'Only public projection for Margin entries. Excludes moderation, status and idempotency fields.';

create function public.get_public_margin_setting(
  p_target_type public.margin_target_type,
  p_target_key text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select setting.is_open
      from public.margin_settings as setting
      where setting.target_type = p_target_type
        and setting.target_key = p_target_key
    ),
    true
  );
$$;

comment on function public.get_public_margin_setting(public.margin_target_type, text) is
  'Returns only whether future submissions are open; settings rows remain private.';

revoke all on function public.set_margin_settings_updated_at() from public;
revoke all on function public.get_public_margin_entries(public.margin_target_type, text) from public;
revoke all on function public.get_public_margin_setting(public.margin_target_type, text) from public;

grant execute on function public.get_public_margin_entries(public.margin_target_type, text)
  to anon, authenticated, service_role;
grant execute on function public.get_public_margin_setting(public.margin_target_type, text)
  to anon, authenticated, service_role;
