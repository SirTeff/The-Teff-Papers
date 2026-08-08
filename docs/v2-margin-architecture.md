# The Margin — V2.2 Stages A–D architecture

## Purpose and boundary

Stage A adds the database foundation, Stage B adds private Studio moderation, Stage C adds approved read-only notes, and Stage D adds the protected public submission gateway. Teff-authored papers remain the primary reading experience.

- Teff-authored papers remain Markdown files in `src/content/papers`.
- Supabase PostgreSQL stores interactive content only.
- `MARGIN_ENABLED` defaults to `false`.
- Approved notes are visible only when `MARGIN_ENABLED=true`.
- Visitor submissions are available only when the separate `MARGIN_SUBMISSIONS_ENABLED=true` contract is fully configured.
- No reader accounts, profiles, replies, reactions, voting, Open Desk, or Questions features exist.
- Teff Studio is reached only by its direct private route and is not linked in public navigation.

## Database model

The additive migration in `supabase/migrations` creates:

- `margin_entries`: plain-text contributions linked to a Markdown paper by `target_type` and stable `target_key` slug.
- `margin_settings`: per-target submission availability; missing settings default to open for future use.
- `moderation_events`: append-oriented moderation audit records with restricted deletion.
- `margin_submission_rate_limits`: fixed-window HMAC counters for the Stage D serverless submission gateway.

`margin_entries.status` is constrained to `pending`, `approved`, `rejected`, `spam`, or `removed`. New entries default to `pending`. `submission_key` is a unique UUID for idempotent submissions. Body and display-name limits are enforced both in PostgreSQL and the shared application validator.

Expected indexes cover approved entries by target, the future moderation queue, featured approved entries, the idempotency key, and per-entry audit history. The unique constraint supplies the `submission_key` index, so no duplicate index is created.

## Security model

Row Level Security is enabled and forced on every interactive table. `anon` and `authenticated` receive no direct table privileges and there are no public table policies. The service role is reserved for narrow server-only operations.

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
- `src/lib/margin/validation.ts`: shared plain-text validation for the submission pipeline.
- `src/lib/margin/submission-repository.ts`: narrowly scoped service-role RPC client for fixed-window rate limiting and pending submission only. It is separate from the branded Studio admin client.
- `src/lib/margin/transitions.ts`: central allowed moderation status transitions.
- `src/lib/security/turnstile.ts`: server-only Cloudflare Turnstile verification.
- `src/lib/security/rate-limit.ts`: HMAC visitor identity and durable database-backed limiter. No raw address or in-memory counter is used.
- `src/app/api/margin/submit/route.ts`: same-origin-aware, no-store public POST gateway. It performs the honeypot, validation, paper lookup, setting check, Turnstile, rate limit, and pending RPC in that order.

Repository errors log the operation, target type, target key, and safe error message. Contribution bodies, moderation notes, tokens, and secrets are not logged.

## Environment variables

Copy `.env.example` to `.env.local` for local integration work. Never commit `.env.local`.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `MARGIN_ENABLED` | Server only | Feature flag; defaults to `false` |
| `MARGIN_SUBMISSIONS_ENABLED` | Server only | Independent visitor-submission flag; defaults to `false` and requires `MARGIN_ENABLED=true` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Restricted publishable key used by safe server RPC reads |
| `SUPABASE_SECRET_KEY` | Server only | Privileged database operations after authorization |
| `TEFF_STUDIO_ADMIN_EMAILS` | Server only | Comma-separated administrator email allow-list |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile widget site key |
| `TURNSTILE_SECRET_KEY` | Server only | Server-side Turnstile verification |
| `MARGIN_RATE_LIMIT_SECRET` | Server only | HMAC-SHA256 key for opaque visitor rate-limit identifiers |

With both flags false, no Margin credentials are required. Read-only Margin requires only the public Supabase URL and publishable key. Enabling submissions additionally requires the Supabase server secret, public Turnstile site key, Turnstile server secret, and rate-limit HMAC secret. Studio remains independently protected by verified authentication, its email allow-list, and branded `AdminAuthorization`.

## Public submission flow

The public form generates its UUID in the browser and sends plain text to `POST /api/margin/submit`. The route rejects oversized or invalid input before external work. A filled honeypot receives the same generic `202 Accepted` response without storage. Valid requests must reference a real Markdown paper and an open `margin_settings` target, then pass Turnstile action `margin-submit` and the durable rate limiter.

The visitor identifier is `HMAC-SHA256(MARGIN_RATE_LIMIT_SECRET, normalized x-forwarded-for)`. Only the 64-character digest is stored; raw addresses, user agents, locations, and fingerprints are not persisted. Missing or invalid addresses share an opaque `unknown-client` digest and therefore fail conservatively.

The fixed-window policy is five verified attempts per visitor digest and paper per 15 minutes. PostgreSQL atomically upserts the counter, so concurrent requests cannot bypass it. Database failure fails submissions closed without affecting public reading.

`submit_margin_entry` checks the authoritative setting again, inserts new entries as `pending`, and returns only minimal confirmation data. Exact UUID/payload retries are idempotent; changed payloads using the same UUID fail. No submission creates a moderation event or invalidates the approved-note cache. Studio approval remains the only publication path.

## Teff Studio routes and ordering

- `/studio/login`: email/password sign-in only; no sign-up or social login.
- `/studio`: independently protected dashboard with server-side moderation counts.
- `/studio/margin`: independently protected 25-item paginated status queue with an optional paper-slug filter.
- `/studio/margin/[id]`: independently protected contribution detail and immutable event history.

Middleware refreshes cookie sessions as a convenience. Every Studio page and Server Action independently calls the trusted authorization pathway. Pending entries are oldest first; all other queues use newest moderation activity first. Mutations revalidate Studio views and the reserved `margin-public` cache tag for Stage C.

## Local database setup

1. Install the Supabase CLI or use `npx supabase`.
2. Start a disposable local Supabase instance.
3. Apply all migrations in timestamp order, including `202608080005_create_margin_submission_gateway.sql`.
4. Run all SQL tests, including `supabase/tests/margin_submission_security.sql`, against that disposable database.
5. Confirm every test transaction completes and rolls back without an assertion error.
6. Copy `.env.example` to `.env.local` and set the Supabase URL, publishable key, secret key, and a test administrator email.
7. Start the app, sign in at `/studio/login`, verify each queue transition and sign out.
8. Keep both Margin flags false outside a specifically approved Preview environment.

The SQL test verifies that only approved entries reach the public projection, direct anonymous table access is denied, moderation events remain private, duplicate submission keys fail, and invalid statuses fail.

## External production setup

Do not enable the feature until all steps are complete:

1. Create or select the target Supabase project and apply all migrations using a linked Supabase CLI project or the SQL editor.
2. Run all security tests against a disposable/local database, never production.
3. In Supabase Authentication, create the administrator user manually and disable public user sign-ups.
4. Set the Auth Site URL to the production origin. Add the production origin and local development origin (normally `http://localhost:3000`) to allowed redirect URLs.
5. Add the Supabase URL, publishable key, secret key, and `TEFF_STUDIO_ADMIN_EMAILS` to the relevant Vercel environments. The allow-list must match the Auth user's normalized email.
6. Configure Vercel to use Node.js 22 or newer and redeploy.
7. Verify login, persistence, direct unauthorized access, logout, history, and every transition using test entries.
8. Create the Turnstile widget for the intended hostname and add its site and secret keys.
9. Generate a high-entropy `MARGIN_RATE_LIMIT_SECRET`; do not reuse another application secret.
10. Enable `MARGIN_ENABLED` first, verify read-only behavior, then enable `MARGIN_SUBMISSIONS_ENABLED` only in the approved environment and test the complete pending-to-Studio flow.

Never prefix the Supabase secret key or Turnstile secret with `NEXT_PUBLIC_`. Supabase's PostgreSQL gateway maps publishable and secret keys onto the low-privilege and privileged database roles used by the migration.

## Stage D boundary

Stage D stops at anonymous, moderated, plain-text submissions. It does not add accounts, profiles, replies, likes, reactions, voting, automatic publication, email collection, Markdown, Open Desk, Questions, or V2.3 functionality. The migration must be applied and tested separately; committing this stage does not apply it to any live database.

## Dependency security note

Stage A updates Next.js and `eslint-config-next` to the patched 15.5 maintenance release and applies compatible `js-yaml` and `nanoid` fixes. The production audit still reports PostCSS and Sharp advisories inherited through Next.js 15. Resolving those advisories currently requires the breaking Next.js 16.3 upgrade, so that framework migration is intentionally deferred to a separate, tested change rather than being folded into backend infrastructure work.
