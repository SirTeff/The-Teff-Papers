-- Run against a disposable database after migrations 001 through 005.
-- The transaction always rolls back and leaves no test data.
begin;

set local role anon;

do $$
begin
  begin
    insert into public.margin_entries (target_type, target_key, body, submission_key)
    values ('paper', 'submission-security-test', 'Anonymous direct insert must be denied.', '30000000-0000-4000-8000-000000000001');
    raise exception 'Anonymous role inserted directly into margin_entries.';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.submit_margin_entry(
      'paper', 'submission-security-test', null,
      'Anonymous RPC execution must be denied.',
      '30000000-0000-4000-8000-000000000002'
    );
    raise exception 'Anonymous role executed submit_margin_entry.';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.consume_margin_submission_rate_limit(
      repeat('a', 64), 'paper', 'submission-security-test', 900, 5
    );
    raise exception 'Anonymous role executed the rate-limit RPC.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;

do $$
begin
  begin
    insert into public.margin_entries (target_type, target_key, body, submission_key)
    values ('paper', 'submission-security-test', 'Authenticated direct insert must be denied.', '30000000-0000-4000-8000-000000000003');
    raise exception 'Authenticated role inserted directly into margin_entries.';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.submit_margin_entry(
      'paper', 'submission-security-test', null,
      'Authenticated RPC execution must be denied.',
      '30000000-0000-4000-8000-000000000004'
    );
    raise exception 'Authenticated role executed submit_margin_entry.';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.consume_margin_submission_rate_limit(
      repeat('b', 64), 'paper', 'submission-security-test', 900, 5
    );
    raise exception 'Authenticated role executed the rate-limit RPC.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role service_role;

do $$
declare
  decision record;
  attempt integer;
begin
  for attempt in 1..5 loop
    select * into decision
    from public.consume_margin_submission_rate_limit(
      repeat('c', 64), 'paper', 'submission-security-test', 900, 5
    );
    if decision.allowed is not true then
      raise exception 'Rate limiter rejected permitted attempt %.', attempt;
    end if;
  end loop;

  select * into decision
  from public.consume_margin_submission_rate_limit(
    repeat('c', 64), 'paper', 'submission-security-test', 900, 5
  );
  if decision.allowed is not false or decision.remaining <> 0 or decision.retry_after_seconds < 1 then
    raise exception 'Rate limiter did not reject the over-limit attempt correctly.';
  end if;
end;
$$;

do $$
declare
  first_result record;
  duplicate_result record;
  row_count integer;
  public_count integer;
  conflict_rejected boolean := false;
begin
  select * into first_result
  from public.submit_margin_entry(
    'paper', 'submission-security-test', 'Test reader',
    'A pending contribution used for submission security verification.',
    '30000000-0000-4000-8000-000000000005'
  );

  if first_result.status <> 'pending' or first_result.duplicate is not false then
    raise exception 'New submission was not returned as a non-duplicate pending entry.';
  end if;

  if exists (
    select 1 from public.moderation_events where entry_id = first_result.id
  ) then raise exception 'Submission incorrectly created a moderation event.';
  end if;

  select count(*) into public_count
  from public.get_public_margin_entries('paper', 'submission-security-test');
  if public_count <> 0 then raise exception 'Pending submission appeared in the public projection.'; end if;

  select * into duplicate_result
  from public.submit_margin_entry(
    'paper', 'submission-security-test', 'Test reader',
    'A pending contribution used for submission security verification.',
    '30000000-0000-4000-8000-000000000005'
  );
  if duplicate_result.id <> first_result.id or duplicate_result.duplicate is not true then
    raise exception 'Exact retry was not treated as an idempotent duplicate.';
  end if;

  select count(*) into row_count
  from public.margin_entries
  where submission_key = '30000000-0000-4000-8000-000000000005';
  if row_count <> 1 then raise exception 'Idempotent retry created a second entry.'; end if;

  begin
    perform public.submit_margin_entry(
      'paper', 'submission-security-test', 'Test reader',
      'Different content must conflict for an existing submission key.',
      '30000000-0000-4000-8000-000000000005'
    );
  exception when raise_exception then conflict_rejected := true;
  end;
  if not conflict_rejected then raise exception 'Changed payload reused an existing submission key.'; end if;

  perform public.admin_moderate_margin_entry(
    first_result.id, 'approved', 'submission-security-test-admin', 'Approval visibility check'
  );

  select count(*) into public_count
  from public.get_public_margin_entries('paper', 'submission-security-test')
  where id = first_result.id;
  if public_count <> 1 then raise exception 'Approved submission did not enter the public projection.'; end if;
end;
$$;

insert into public.margin_settings (target_type, target_key, is_open)
values ('paper', 'submission-closed-test', false);

do $$
declare
  closed_rejected boolean := false;
begin
  begin
    perform public.submit_margin_entry(
      'paper', 'submission-closed-test', null,
      'This contribution must be rejected because submissions are closed.',
      '30000000-0000-4000-8000-000000000006'
    );
  exception when raise_exception then closed_rejected := true;
  end;
  if not closed_rejected then raise exception 'Closed Margin accepted a new submission.'; end if;
end;
$$;

reset role;
rollback;
