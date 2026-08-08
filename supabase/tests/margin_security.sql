-- Run against a disposable local Supabase database after applying migrations.
-- The transaction is always rolled back; no test contribution is retained.
begin;

insert into public.margin_entries (
  target_type,
  target_key,
  display_name,
  body,
  status,
  published_at,
  submission_key
)
values
  ('paper', 'margin-security-test', 'Approved reader', 'Approved contribution used only for the security test.', 'approved', now(), '00000000-0000-4000-8000-000000000001'),
  ('paper', 'margin-security-test', 'Pending reader', 'Pending contribution used only for the security test.', 'pending', null, '00000000-0000-4000-8000-000000000002'),
  ('paper', 'margin-security-test', 'Rejected reader', 'Rejected contribution used only for the security test.', 'rejected', null, '00000000-0000-4000-8000-000000000003'),
  ('paper', 'margin-security-test', 'Spam reader', 'Spam contribution used only for the security test.', 'spam', null, '00000000-0000-4000-8000-000000000004'),
  ('paper', 'margin-security-test', 'Removed reader', 'Removed contribution used only for the security test.', 'removed', now(), '00000000-0000-4000-8000-000000000005');

do $$
declare
  public_count integer;
begin
  select count(*) into public_count
  from public.get_public_margin_entries('paper', 'margin-security-test');

  if public_count <> 1 then
    raise exception 'Public projection returned % rows instead of one approved row.', public_count;
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.margin_entries (
      target_type,
      target_key,
      body,
      submission_key
    ) values (
      'paper',
      'margin-security-test',
      'This duplicate idempotency key must be rejected.',
      '00000000-0000-4000-8000-000000000001'
    );
    raise exception 'Duplicate submission_key was accepted.';
  exception
    when unique_violation then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.margin_entries (
      target_type,
      target_key,
      body,
      status,
      submission_key
    ) values (
      'paper',
      'margin-security-test',
      'This invalid status must be rejected by the enum.',
      'not-a-status',
      '00000000-0000-4000-8000-000000000006'
    );
    raise exception 'Invalid Margin status was accepted.';
  exception
    when invalid_text_representation then null;
  end;
end;
$$;

set local role anon;

do $$
declare
  public_count integer;
begin
  select count(*) into public_count
  from public.get_public_margin_entries('paper', 'margin-security-test');

  if public_count <> 1 then
    raise exception 'Anonymous projection did not return exactly one approved row.';
  end if;

  begin
    perform 1 from public.margin_entries;
    raise exception 'Anonymous role could read private Margin rows.';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.moderation_events;
    raise exception 'Anonymous role could read moderation events.';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
