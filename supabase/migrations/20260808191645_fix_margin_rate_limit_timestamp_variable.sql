create or replace function public.consume_margin_submission_rate_limit(
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
  now_at timestamptz := clock_timestamp();
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
    floor(extract(epoch from now_at) / p_window_seconds) * p_window_seconds
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
    now_at,
    now_at
  )
  on conflict (identifier_hash, target_type, target_key, window_start)
  do update set
    request_count = public.margin_submission_rate_limits.request_count + 1,
    updated_at = excluded.updated_at
  returning request_count into current_count;

  delete from public.margin_submission_rate_limits
  where updated_at < now_at - interval '2 days';

  return query select
    current_count <= p_request_limit,
    greatest(p_request_limit - current_count, 0),
    greatest(
      ceil(extract(epoch from (current_window + make_interval(secs => p_window_seconds) - now_at)))::integer,
      1
    );
end;
$$;

comment on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer) is
  'Atomically consumes one fixed-window submission attempt. The identifier must already be an HMAC digest.';

revoke execute on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.consume_margin_submission_rate_limit(text, public.margin_target_type, text, integer, integer)
  to service_role;
