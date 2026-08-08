-- Teff Studio moderation is intentionally exposed only to the service role.
-- Browser sessions never receive table access or execute these functions.

create function public.admin_get_margin_counts()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'pending', count(*) filter (where status = 'pending'),
    'approved', count(*) filter (where status = 'approved'),
    'rejected', count(*) filter (where status = 'rejected'),
    'spam', count(*) filter (where status = 'spam'),
    'removed', count(*) filter (where status = 'removed')
  )
  from public.margin_entries;
$$;

create function public.admin_list_margin_entries(
  p_status public.margin_status,
  p_limit integer default 25,
  p_offset integer default 0,
  p_target_type public.margin_target_type default null,
  p_target_key text default null
)
returns table (
  id uuid,
  target_type public.margin_target_type,
  target_key text,
  display_name text,
  body text,
  status public.margin_status,
  featured boolean,
  created_at timestamptz,
  moderated_at timestamptz,
  published_at timestamptz,
  moderated_by text,
  moderation_note text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 50 then
    raise exception using errcode = '22023', message = 'Page size must be between 1 and 50.';
  end if;
  if p_offset < 0 then
    raise exception using errcode = '22023', message = 'Offset cannot be negative.';
  end if;
  if p_target_key is not null and (char_length(btrim(p_target_key)) < 1 or char_length(p_target_key) > 200) then
    raise exception using errcode = '22023', message = 'Invalid target key.';
  end if;

  return query
  select
    entry.id,
    entry.target_type,
    entry.target_key,
    entry.display_name,
    entry.body,
    entry.status,
    entry.featured,
    entry.created_at,
    entry.moderated_at,
    entry.published_at,
    entry.moderated_by,
    entry.moderation_note,
    count(*) over () as total_count
  from public.margin_entries as entry
  where entry.status = p_status
    and (p_target_type is null or entry.target_type = p_target_type)
    and (p_target_key is null or entry.target_key = p_target_key)
  order by
    case when p_status = 'pending' then entry.created_at end asc,
    case when p_status <> 'pending' then coalesce(entry.moderated_at, entry.created_at) end desc,
    entry.id
  limit p_limit
  offset p_offset;
end;
$$;

create function public.admin_get_margin_entry(p_entry_id uuid)
returns setof public.margin_entries
language sql
stable
security definer
set search_path = ''
as $$
  select entry.*
  from public.margin_entries as entry
  where entry.id = p_entry_id;
$$;

create function public.admin_get_margin_history(p_entry_id uuid)
returns setof public.moderation_events
language sql
stable
security definer
set search_path = ''
as $$
  select event.*
  from public.moderation_events as event
  where event.entry_id = p_entry_id
  order by event.created_at desc, event.id desc;
$$;

create function public.admin_moderate_margin_entry(
  p_entry_id uuid,
  p_target_status public.margin_status,
  p_actor text,
  p_reason text default null
)
returns setof public.margin_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_entry public.margin_entries%rowtype;
  next_action public.moderation_action;
  clean_actor text := btrim(p_actor);
  clean_reason text := nullif(btrim(p_reason), '');
begin
  if char_length(clean_actor) < 1 or char_length(clean_actor) > 200 then
    raise exception using errcode = '22023', message = 'Invalid moderation actor.';
  end if;
  if clean_reason is not null and char_length(clean_reason) > 2000 then
    raise exception using errcode = '22023', message = 'Moderation reason exceeds 2000 characters.';
  end if;

  select * into current_entry
  from public.margin_entries
  where id = p_entry_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Margin entry not found.';
  end if;

  next_action := case
    when current_entry.status = 'pending' and p_target_status = 'approved' then 'approved'
    when current_entry.status = 'pending' and p_target_status = 'rejected' then 'rejected'
    when current_entry.status = 'pending' and p_target_status = 'spam' then 'marked_spam'
    when current_entry.status = 'approved' and p_target_status = 'removed' then 'removed'
    when current_entry.status = 'removed' and p_target_status = 'approved' then 'restored_approved'
    when current_entry.status in ('rejected', 'spam') and p_target_status = 'pending' then 'restored_pending'
    else null
  end;

  if next_action is null then
    raise exception using errcode = '40001', message = 'Margin entry state changed or transition is not allowed.';
  end if;

  update public.margin_entries
  set
    status = p_target_status,
    featured = case when p_target_status = 'approved' then featured else false end,
    moderated_at = now(),
    moderated_by = clean_actor,
    moderation_note = clean_reason,
    published_at = case
      when p_target_status = 'approved' then coalesce(published_at, now())
      when p_target_status = 'removed' then published_at
      else null
    end
  where id = p_entry_id;

  insert into public.moderation_events (entry_id, action, actor, reason)
  values (p_entry_id, next_action, clean_actor, clean_reason);

  return query select * from public.margin_entries where id = p_entry_id;
end;
$$;

create function public.admin_set_margin_featured(
  p_entry_id uuid,
  p_featured boolean,
  p_actor text,
  p_reason text default null
)
returns setof public.margin_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_entry public.margin_entries%rowtype;
  clean_actor text := btrim(p_actor);
  clean_reason text := nullif(btrim(p_reason), '');
begin
  if char_length(clean_actor) < 1 or char_length(clean_actor) > 200 then
    raise exception using errcode = '22023', message = 'Invalid moderation actor.';
  end if;
  if clean_reason is not null and char_length(clean_reason) > 2000 then
    raise exception using errcode = '22023', message = 'Moderation reason exceeds 2000 characters.';
  end if;

  select * into current_entry
  from public.margin_entries
  where id = p_entry_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Margin entry not found.';
  end if;
  if current_entry.status <> 'approved' then
    raise exception using errcode = '40001', message = 'Only approved Margin entries can be featured.';
  end if;
  if current_entry.featured = p_featured then
    raise exception using errcode = '40001', message = 'Margin entry feature state has already changed.';
  end if;

  update public.margin_entries
  set
    featured = p_featured,
    moderated_at = now(),
    moderated_by = clean_actor,
    moderation_note = clean_reason
  where id = p_entry_id;

  insert into public.moderation_events (entry_id, action, actor, reason)
  values (p_entry_id, case when p_featured then 'featured' else 'unfeatured' end, clean_actor, clean_reason);

  return query select * from public.margin_entries where id = p_entry_id;
end;
$$;

comment on function public.admin_moderate_margin_entry(uuid, public.margin_status, text, text) is
  'Locks an entry, validates its state transition, updates it and appends its audit event atomically.';
comment on function public.admin_set_margin_featured(uuid, boolean, text, text) is
  'Changes approved-entry curation and appends its audit event atomically.';

revoke all on function public.admin_get_margin_counts() from public, anon, authenticated;
revoke all on function public.admin_list_margin_entries(public.margin_status, integer, integer, public.margin_target_type, text) from public, anon, authenticated;
revoke all on function public.admin_get_margin_entry(uuid) from public, anon, authenticated;
revoke all on function public.admin_get_margin_history(uuid) from public, anon, authenticated;
revoke all on function public.admin_moderate_margin_entry(uuid, public.margin_status, text, text) from public, anon, authenticated;
revoke all on function public.admin_set_margin_featured(uuid, boolean, text, text) from public, anon, authenticated;

grant execute on function public.admin_get_margin_counts() to service_role;
grant execute on function public.admin_list_margin_entries(public.margin_status, integer, integer, public.margin_target_type, text) to service_role;
grant execute on function public.admin_get_margin_entry(uuid) to service_role;
grant execute on function public.admin_get_margin_history(uuid) to service_role;
grant execute on function public.admin_moderate_margin_entry(uuid, public.margin_status, text, text) to service_role;
grant execute on function public.admin_set_margin_featured(uuid, boolean, text, text) to service_role;
