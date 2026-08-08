create table public.margin_submission_rate_limits (
  identifier_hash text not null,
  target_type public.margin_target_type not null,
  target_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (identifier_hash, target_type, target_key, window_start),
  constraint margin_submission_rate_limits_identifier_hash check (
    identifier_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint margin_submission_rate_limits_target_key check (
    char_length(btrim(target_key)) between 1 and 200
  ),
  constraint margin_submission_rate_limits_request_count check (request_count >= 1)
);

comment on table public.margin_submission_rate_limits is
  'Fixed-window counters keyed by an HMAC identifier. Raw visitor addresses are never stored.';

create index margin_submission_rate_limits_updated_idx
  on public.margin_submission_rate_limits (updated_at);

alter table public.margin_submission_rate_limits enable row level security;
alter table public.margin_submission_rate_limits force row level security;

revoke all on table public.margin_submission_rate_limits from public, anon, authenticated;
grant all on table public.margin_submission_rate_limits to service_role;

create function public.consume_margin_submission_rate_limit(
  p_identifier_hash text,
  p_target_type public.margin_target_type,
  p_target_key text,
  p_window_seconds integer,
  p_request_limit integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_time timestamptz := clock_timestamp();
  current_window timestamptz;
  current_count integer;
begin
  if p_identifier_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid rate-limit identifier.';
  end if;
  if char_length(btrim(p_target_key)) < 1 or char_length(p_target_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid target key.';
  end if;
  if p_window_seconds < 60 or p_window_seconds > 86400 then
    raise exception using errcode = '22023', message = 'Invalid rate-limit window.';
  end if;
  if p_request_limit < 1 or p_request_limit > 100 then
    raise exception using errcode = '22023', message = 'Invalid request limit.';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from current_time) / p_window_seconds) * p_window_seconds
  );

  insert into public.margin_submission_rate_limits (
    identifier_hash,
    target_type,
    target_key,
    window_start,
    request_count,
    created_at,
    updated_at
  ) values (
    p_identifier_hash,
    p_target_type,
    p_target_key,
    current_window,
    1,
    current_time,
    current_time
  )
  on conflict (identifier_hash, target_type, target_key, window_start)
  do update set
    request_count = public.margin_submission_rate_limits.request_count + 1,
    updated_at = excluded.updated_at
  returning request_count into current_count;

  delete from public.margin_submission_rate_limits
  where updated_at < current_time - interval '2 days';

  return query select
    current_count <= p_request_limit,
    greatest(p_request_limit - current_count, 0),
    greatest(
      ceil(extract(epoch from (current_window + make_interval(secs => p_window_seconds) - current_time)))::integer,
      1
    );
end;
$$;

comment on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer) is
  'Atomically consumes one fixed-window submission attempt. The identifier must already be an HMAC digest.';

create function public.submit_margin_entry(
  p_target_type public.margin_target_type,
  p_target_key text,
  p_display_name text,
  p_body text,
  p_submission_key uuid
)
returns table (
  id uuid,
  status public.margin_status,
  created_at timestamptz,
  duplicate boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_entry public.margin_entries%rowtype;
  inserted_entry public.margin_entries%rowtype;
begin
  if exists (
    select 1
    from public.margin_settings as setting
    where setting.target_type = p_target_type
      and setting.target_key = p_target_key
      and setting.is_open = false
  ) then
    raise exception using errcode = 'P0001', message = 'MARGIN_SUBMISSIONS_CLOSED';
  end if;

  insert into public.margin_entries (
    target_type,
    target_key,
    display_name,
    body,
    status,
    featured,
    moderated_at,
    published_at,
    moderated_by,
    moderation_note,
    submission_key
  ) values (
    p_target_type,
    p_target_key,
    p_display_name,
    p_body,
    'pending',
    false,
    null,
    null,
    null,
    null,
    p_submission_key
  )
  on conflict (submission_key) do nothing
  returning * into inserted_entry;

  if found then
    return query select inserted_entry.id, inserted_entry.status, inserted_entry.created_at, false;
    return;
  end if;

  select * into existing_entry
  from public.margin_entries as entry
  where entry.submission_key = p_submission_key
  for update;

  if existing_entry.target_type = p_target_type
    and existing_entry.target_key = p_target_key
    and existing_entry.display_name is not distinct from p_display_name
    and existing_entry.body = p_body
  then
    return query select existing_entry.id, existing_entry.status, existing_entry.created_at, true;
    return;
  end if;

  raise exception using errcode = 'P0001', message = 'SUBMISSION_KEY_CONFLICT';
end;
$$;

comment on function public.submit_margin_entry(public.margin_target_type, text, text, text, uuid) is
  'Creates an immutable pending contribution or returns an exact idempotent duplicate. Never publishes content.';

revoke all on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.submit_margin_entry(public.margin_target_type, text, text, text, uuid)
  from public, anon, authenticated;

grant execute on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer)
  to service_role;
grant execute on function public.submit_margin_entry(public.margin_target_type, text, text, text, uuid)
  to service_role;
