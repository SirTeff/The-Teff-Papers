-- Run against a disposable local Supabase database after both Margin migrations.
-- This transaction always rolls back.
begin;

insert into public.margin_entries (id, target_type, target_key, display_name, body, submission_key)
values
  ('10000000-0000-4000-8000-000000000001', 'paper', 'studio-test', 'First reader', 'A pending contribution used for Studio transition testing.', '20000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002', 'paper', 'studio-test', 'Second reader', 'A pending contribution used for rollback testing only.', '20000000-0000-4000-8000-000000000002');

set local role anon;

do $$
begin
  begin
    perform public.admin_get_margin_counts();
    raise exception 'Anonymous role executed a Studio RPC.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;

do $$
begin
  begin
    perform public.admin_get_margin_entry('10000000-0000-4000-8000-000000000001');
    raise exception 'Authenticated role executed a Studio RPC.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role service_role;

select public.admin_moderate_margin_entry(
  '10000000-0000-4000-8000-000000000001',
  'approved',
  '00000000-0000-4000-8000-000000000001',
  'Approved in test'
);

do $$
declare
  approved_count integer;
  event_count integer;
begin
  select count(*) into approved_count
  from public.get_public_margin_entries('paper', 'studio-test')
  where id = '10000000-0000-4000-8000-000000000001';
  if approved_count <> 1 then raise exception 'Approved entry is absent from the safe public projection.'; end if;

  select count(*) into event_count
  from public.admin_get_margin_history('10000000-0000-4000-8000-000000000001')
  where action = 'approved';
  if event_count <> 1 then raise exception 'Approval did not append exactly one audit event.'; end if;
end;
$$;

select public.admin_set_margin_featured(
  '10000000-0000-4000-8000-000000000001', true,
  '00000000-0000-4000-8000-000000000001', null
);

do $$
begin
  begin
    perform public.admin_set_margin_featured(
      '10000000-0000-4000-8000-000000000002', true,
      '00000000-0000-4000-8000-000000000001', null
    );
    raise exception 'Pending entry was featured.';
  exception when serialization_failure then null;
  end;
end;
$$;

do $$
declare original_published_at timestamptz;
declare restored_published_at timestamptz;
begin
  select published_at into original_published_at
  from public.admin_get_margin_entry('10000000-0000-4000-8000-000000000001');

  perform public.admin_moderate_margin_entry(
    '10000000-0000-4000-8000-000000000001', 'removed',
    '00000000-0000-4000-8000-000000000001', 'Removed in test'
  );

  if exists (
    select 1 from public.get_public_margin_entries('paper', 'studio-test')
    where id = '10000000-0000-4000-8000-000000000001'
  ) then raise exception 'Removed entry remained public.'; end if;

  perform public.admin_moderate_margin_entry(
    '10000000-0000-4000-8000-000000000001', 'approved',
    '00000000-0000-4000-8000-000000000001', 'Restored in test'
  );

  select published_at into restored_published_at
  from public.admin_get_margin_entry('10000000-0000-4000-8000-000000000001');
  if restored_published_at is distinct from original_published_at then
    raise exception 'Remove/restore changed the original publication timestamp.';
  end if;
end;
$$;

do $$
declare before_count integer;
declare after_count integer;
begin
  select count(*) into before_count
  from public.admin_get_margin_history('10000000-0000-4000-8000-000000000001');

  begin
    perform public.admin_moderate_margin_entry(
      '10000000-0000-4000-8000-000000000001', 'approved',
      '00000000-0000-4000-8000-000000000001', 'Invalid second approval'
    );
    raise exception 'A stale or repeated approval was accepted.';
  exception when serialization_failure then null;
  end;

  select count(*) into after_count
  from public.admin_get_margin_history('10000000-0000-4000-8000-000000000001');
  if after_count <> before_count then raise exception 'Rejected transition appended an audit event.'; end if;
end;
$$;

reset role;

create function pg_temp.reject_test_audit_event()
returns trigger language plpgsql as $$
begin
  if new.actor = 'rollback-test' then raise exception 'Synthetic audit failure'; end if;
  return new;
end;
$$;

create trigger reject_test_audit_event
before insert on public.moderation_events
for each row execute function pg_temp.reject_test_audit_event();

set local role service_role;

do $$
declare failed boolean := false;
begin
  begin
    perform public.admin_moderate_margin_entry(
      '10000000-0000-4000-8000-000000000002', 'approved', 'rollback-test', null
    );
  exception when raise_exception then failed := true;
  end;

  if not failed then raise exception 'Synthetic audit failure did not abort moderation.'; end if;

  if (select status from public.admin_get_margin_entry('10000000-0000-4000-8000-000000000002')) <> 'pending' then
    raise exception 'Entry update was not rolled back after audit failure.';
  end if;
end;
$$;

reset role;
rollback;
