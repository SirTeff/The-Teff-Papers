-- PostgreSQL must resolve the audit action as the moderation_action enum,
-- rather than as text produced by a CASE expression.
create or replace function public.admin_set_margin_featured(
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
  if current_entry.status <> 'approved' then
    raise exception using errcode = '40001', message = 'Only approved Margin entries can be featured.';
  end if;
  if current_entry.featured = p_featured then
    raise exception using errcode = '40001', message = 'Margin entry feature state has already changed.';
  end if;

  if p_featured then
    next_action := 'featured'::public.moderation_action;
  else
    next_action := 'unfeatured'::public.moderation_action;
  end if;

  update public.margin_entries
  set
    featured = p_featured,
    moderated_at = now(),
    moderated_by = clean_actor,
    moderation_note = clean_reason
  where id = p_entry_id;

  insert into public.moderation_events (entry_id, action, actor, reason)
  values (p_entry_id, next_action, clean_actor, clean_reason);

  return query select * from public.margin_entries where id = p_entry_id;
end;
$$;

revoke all on function public.admin_set_margin_featured(uuid, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_set_margin_featured(uuid, boolean, text, text)
  to service_role;
