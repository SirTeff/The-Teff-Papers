# The Margin — V2.2 Stages A and B architecture

## Purpose and boundary

Stage A adds the secure database foundation for future reader contributions. Stage B adds the private Teff Studio authentication and moderation system. Neither stage changes the public reading experience.

- Teff-authored papers remain Markdown files in `src/content/papers`.
- Supabase PostgreSQL stores interactive content only.
- `MARGIN_ENABLED` defaults to `false`.
- No public Margin UI, submission endpoint, reader account system, Open Desk, or Questions feature exists.
- Teff Studio is reached only by its direct private route and is not linked in public navigation.

## Database model

The additive migration in `supabase/migrations` creates:

- `margin_entries`: plain-text contributions linked to a Markdown paper by `target_type` and stable `target_key` slug.
- `margin_settings`: per-target submission availability; missing settings default to open for future use.
- `moderation_events`: append-oriented moderation audit records with restricted deletion.

`margin_entries.status` is constrained to `pending`, `approved`, `rejected`, `spam`, or `removed`. New entries default to `pending`. `submission_key` is a unique UUID for future idempotent submissions. Body and display-name limits are enforced both in PostgreSQL and the shared application validator.

Expected indexes cover approved entries by target, the future moderation queue, featured approved entries, the idempotency key, and per-entry audit history. The unique constraint supplies the `submission_key` index, so no duplicate index is created.

## Security model

Row Level Security is enabled and forced on all three tables. `anon` and `authenticated` receive no direct table privileges and there are no public table policies. The service role is reserved for server-only, authorized operations.

Public approved-content reads use two fixed `SECURITY DEFINER` functions:

- `get_public_margin_entries`: filters to `status = 'approved'` and returns only rendering-safe fields.
- `get_public_margin_setting`: returns only the `is_open` value.

This function-based projection is intentional. RLS filters rows but does not hide private columns; granting direct approved-row access would still expose moderation notes, administrator identity, and submission keys. The fixed functions keep base tables private and make the public projection explicit.

The privileged secret-key client requires a branded `AdminAuthorization` value. Stage B supplies exactly one factory for that capability. It verifies the current user with Supabase Auth `getUser()` and then checks the normalized, verified email against the server-only `TEFF_STUDIO_ADMIN_EMAILS` allow-list. A session alone is not administrator authorization, and client-provided identity is never accepted.

The Stage B migration adds `SECURITY DEFINER` RPCs for counts, paginated queues, entry detail, event history, status moderation, and feature state. All use an empty `search_path`; execution is revoked from `public`, `anon`, and `authenticated` and granted only to `service_role`. Base-table RLS and the safe approved-only public projection remain unchanged.

Status and feature mutations lock the entry row, validate the current state, update the entry, and append one audit event in the same PostgreSQL transaction. An audit failure rolls the update back. Allowed transitions are `pending` to `approved`, `rejected`, or `spam`; `approved` to `removed`; `removed` to `approved`; and `rejected` or `spam` to `pending`. Only approved entries can be featured. Removal and restoration preserve the original `published_at`.

## Application boundaries

- `src/lib/database/supabase-server.ts`: publishable-key server client for safe public RPC reads.
- `src/lib/database/supabase-admin.ts`: secret-key client gated by the future admin authorization type.
- `src/lib/database/supabase-auth-server.ts`: request-scoped cookie SSR client for login, logout, and verified user checks.
- `src/lib/security/admin-authorization.ts`: sole server-only authorization factory combining verified Supabase identity with the administrator allow-list.
- `src/lib/margin/repository.ts`: the only intended UI-facing data layer. It returns `disabled`, `ready`, or `unavailable` results so a database failure cannot take down a paper.
- `src/lib/margin/admin-repository.ts`: separate privileged data layer; every query and mutation requires `AdminAuthorization`.
- `src/lib/margin/validation.ts`: shared plain-text validation for the future submission pipeline.
- `src/lib/margin/transitions.ts`: central allowed moderation status transitions.
- `src/lib/security/turnstile.ts`: server-only Cloudflare verification utility; it is not active until a future endpoint calls it.
- `src/lib/security/rate-limit.ts`: fail-closed interface for a future durable serverless limiter. No misleading in-memory limiter is included.

Repository errors log the operation, target type, target key, and safe error message. Contribution bodies, moderation notes, tokens, and secrets are not logged.

## Environment variables

Copy `.env.example` to `.env.local` for local integration work. Never commit `.env.local`.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `MARGIN_ENABLED` | Server only | Feature flag; defaults to `false` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Restricted publishable key used by safe server RPC reads |
| `SUPABASE_SECRET_KEY` | Server only | Privileged database operations after authorization |
| `TEFF_STUDIO_ADMIN_EMAILS` | Server only | Comma-separated administrator email allow-list |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Future Turnstile widget configuration |
| `TURNSTILE_SECRET_KEY` | Server only | Server-side Turnstile verification |

With `MARGIN_ENABLED=false`, missing Supabase and Turnstile credentials do not affect the existing public site or its build. Studio is independently available only when its Supabase credentials and administrator allow-list are configured. Missing Studio configuration never enables a public Margin feature.

## Teff Studio routes and ordering

- `/studio/login`: email/password sign-in only; no sign-up or social login.
- `/studio`: independently protected dashboard with server-side moderation counts.
- `/studio/margin`: independently protected 25-item paginated status queue with an optional paper-slug filter.
- `/studio/margin/[id]`: independently protected contribution detail and immutable event history.

Middleware refreshes cookie sessions as a convenience. Every Studio page and Server Action independently calls the trusted authorization pathway. Pending entries are oldest first; all other queues use newest moderation activity first. Mutations revalidate Studio views and the reserved `margin-public` cache tag for Stage C.

## Local database setup

1. Install the Supabase CLI or use `npx supabase`.
2. Start a disposable local Supabase instance.
3. Apply both migrations in timestamp order.
4. Run `supabase/tests/margin_security.sql` and `supabase/tests/studio_moderation_security.sql` against that disposable database.
5. Confirm both transactions complete and roll back without an assertion error.
6. Copy `.env.example` to `.env.local` and set the Supabase URL, publishable key, secret key, and a test administrator email.
7. Start the app, sign in at `/studio/login`, verify each queue transition and sign out.
8. Keep `MARGIN_ENABLED=false`; there is no public consumer in Stage B.

The SQL test verifies that only approved entries reach the public projection, direct anonymous table access is denied, moderation events remain private, duplicate submission keys fail, and invalid statuses fail.

## External production setup

Do not enable the feature until all steps are complete:

1. Create or select the production Supabase project and apply both migrations using a linked Supabase CLI project or the SQL editor.
2. Run both security tests against a disposable/local database, never production.
3. In Supabase Authentication, create the administrator user manually and disable public user sign-ups.
4. Set the Auth Site URL to the production origin. Add the production origin and local development origin (normally `http://localhost:3000`) to allowed redirect URLs.
5. Add the Supabase URL, publishable key, secret key, and `TEFF_STUDIO_ADMIN_EMAILS` to the relevant Vercel environments. The allow-list must match the Auth user's normalized email.
6. Configure Vercel to use Node.js 22 or newer and redeploy.
7. Verify login, persistence, direct unauthorized access, logout, history, and every transition using test entries.
8. Keep `MARGIN_ENABLED=false` until the separately scoped public-read stage is approved.
9. Configure Turnstile and a durable rate limiter only when the public-submission stage begins.

Never prefix the Supabase secret key or Turnstile secret with `NEXT_PUBLIC_`. Supabase's PostgreSQL gateway maps publishable and secret keys onto the low-privilege and privileged database roles used by the migration.

## Stage C boundary

The repository is structurally ready for a separately scoped public read-only Margin stage after both migrations and SQL tests are executed against a real disposable Supabase/PostgreSQL database and the external authentication settings are verified. Stage B intentionally does not add public Margin rendering, submissions, Turnstile UI, active rate limiting, Open Desk, Questions, reader accounts, likes, replies, ratings, or visitor-text editing.

## Dependency security note

Stage A updates Next.js and `eslint-config-next` to the patched 15.5 maintenance release and applies compatible `js-yaml` and `nanoid` fixes. The production audit still reports PostCSS and Sharp advisories inherited through Next.js 15. Resolving those advisories currently requires the breaking Next.js 16.3 upgrade, so that framework migration is intentionally deferred to a separate, tested change rather than being folded into backend infrastructure work.
