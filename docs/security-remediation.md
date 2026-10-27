# Security remediation — owner review required

## Scope and release state

- Local branch: `codex/security-remediation`.
- Base: `c3ae58f3f924e38c2dd2c7fd4e2ae8c5d170043a`, freshly verified against `origin/main`.
- The owner has approved committing this security branch, opening a PR and verifying GitHub CI and its Vercel Preview. No merge or production deployment is authorized.
- The separate local-publication worktree and its uncommitted `what-decides-what-matters.md` are not part of this branch.
- No papers, drafts, editorial guidance, branding, CSS, migrations or existing SQL tests were changed.
- Supabase inspection used advisors and read-only catalog/aggregate queries. No live SQL tests, data writes, permission changes, migrations, credential rotation or production configuration changes were performed.

## Dependency findings and fixes

The baseline lockfile audit reported **six affected package groups: one critical and five high**. The production-only audit reported **five groups: one critical and four high**. Counts are package groups, not counts of individual advisories or proof of exploitation.

| Package | Before | After | Scope and finding |
| --- | --- | --- | --- |
| Next.js | 15.5.23 | 15.5.28, exact pin | Production; critical image/native-library RCE advisories, Windows-specific RCE, high Server Actions DoS and moderate cache issues |
| eslint-config-next | 15.5.23 | 15.5.28, exact pin | Matching development tooling |
| Sharp | 0.34.5 | 0.35.5 | Production optional native dependency; high upstream libvips/libheif/librsvg advisories |
| PostCSS | 8.4.31 | 8.5.32 | Production dependency tree, principally CSS build processing; source-map file-disclosure and stringify advisories |
| source-map-js | 1.2.1 | 1.2.2 | Production dependency tree; source-map processing DoS |
| js-yaml | 3.15.1 / 4.3.1 | 3.15.2 / 4.3.2 | Gray-matter production dependency and development tooling; merge-processing DoS |
| brace-expansion | 1.1.16 / 5.0.7 | 1.1.21 / 5.0.12 | Development-only; CPU, memory and recursion DoS advisories |

Next.js 15.5.28 still pins PostCSS 8.4.31, so `package.json` contains a narrowly scoped override for Next's PostCSS dependency. Both are PostCSS 8 releases; the production build verifies compatibility. Remove/review the override when an upstream maintenance version supplies a patched dependency. Sharp 0.35.5 is within Next.js 15.5.28's declared supported range. No framework major-version upgrade was made.

Compatible dependency resolution also updates Next/SWC platform packages, Sharp native/platform packages and a small number of related transitive patch releases. No unrelated direct application dependency was added or upgraded.

Final full and `--omit=dev` audits both report **zero known vulnerabilities at every severity**. This is a registry-advisory snapshot, not a guarantee against unknown vulnerabilities.

### Exploitability qualifications

The application uses App Router Server Actions, so the high-severity Server Actions advisory is relevant to its deployed feature set. The image RCE advisories depend on native platform/image-processing paths; no live exploit was attempted or demonstrated. The Windows-specific advisory is not evidence that Linux Vercel production was compromised. Repository CSS and Markdown are trusted author-controlled input; PostCSS/YAML dependency classification does not mean the public Margin accepts CSS or YAML.

Primary references:

- https://github.com/vercel/next.js/releases/tag/v15.5.28
- https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r
- https://github.com/advisories/GHSA-p293-qw3h-jr36
- https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- https://github.com/advisories/GHSA-f88m-g3jw-g9cj
- https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
- https://github.com/advisories/GHSA-wq5f-xc86-pv6w
- https://github.com/advisories/GHSA-6g55-p6wh-862q
- https://github.com/advisories/GHSA-fxqj-rqcc-2cmp
- https://github.com/advisories/GHSA-2883-xcg3-v3hh
- https://github.com/advisories/GHSA-68fv-2mgg-jv7q

## Application fixes and preserved boundaries

### Bounded request processing — medium resource-exhaustion hardening

The original route called `request.text()` before checking the body length. A request without a trustworthy Content-Length was fully buffered before rejection. The new reader counts bytes while consuming the stream, cancels immediately above 16,384 bytes, and rejects invalid UTF-8. This is application-level enforcement; Vercel's separate upstream body limits already reduce the possible production impact. Valid form submissions and their existing field limits remain supported.

### Turnstile context — medium anti-abuse hardening

Previously a successful verification without an action was accepted, and the returned hostname was not checked. The route now requires both `action === "margin-submit"` and a hostname matching the request URL. Missing, wrong-action and different-host results fail closed before rate-limit consumption or storage. Cloudflare still performs expiry and single-use checks. Preview and production must each be allowed by the existing widget configuration; no Cloudflare setting or key was changed.

### Origin validation — defense in depth

The original expected origin preferred forwarding headers. It could be influenced in a local request model by supplying a matching foreign Origin and forwarding host. The new comparison uses the request URL rather than those separate headers. This is not reported as a demonstrated Vercel CSRF exploit: Vercel documents forwarding-header normalization. Non-browser requests without Origin remain supported and still require Turnstile and rate limits. Next.js's built-in Server Actions origin checks remain enabled.

### Studio identity — defense in depth

Every protected page and moderation action already reauthorized through Supabase `getUser()` and the server allow-list. The gate now explicitly requires `email_confirmed_at`, matching the documented verified-email policy. A read-only aggregate confirmed that the sole current Auth user has a confirmed email; no email address or credential was returned. No user metadata is trusted for authorization. No account or allow-list was modified.

### Headers

- Global `X-Content-Type-Options: nosniff`.
- Global `Referrer-Policy: strict-origin-when-cross-origin`.
- Studio-only `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` to prevent framing of the administrative interface.
- Disabled the framework's `X-Powered-By` header.
- Existing Vercel HTTPS redirect and HSTS behavior were observed and left unchanged.

This is not a complete script CSP. A nonce-based script policy is deferred because it needs separate compatibility testing with Next.js, analytics and Turnstile. No script/iframe restriction was applied globally that would prevent the public Turnstile widget from loading.

### Existing protections verified

- Server-only service credentials are not passed into public components; missing admin credentials fail closed.
- Moderation actions derive the actor from server authorization, not form fields; middleware is not the authorization boundary.
- Reader names/bodies are React-escaped plain text. Author Markdown is sanitized by the existing remark-html rendering path.
- Public reads return approved entries only and omit private moderation/idempotency fields.
- Submission validation, honeypot handling, pending-only creation, idempotency and plain-text notifications remain intact.
- The durable rate limit remains five attempts per visitor digest and paper per 900 seconds. Failures close submissions without breaking reading.
- The visitor digest relies on a trusted ingress supplying X-Forwarded-For. Vercel documents overwriting it to prevent IP spoofing. A future self-hosted or extra-proxy setup must establish its own trusted-proxy boundary.

## Supabase findings — intentionally unchanged

Read-only inspection of the production project's catalog confirmed:

- All four Margin tables have RLS enabled and forced.
- `anon` and `authenticated` have no direct SELECT/INSERT/UPDATE/DELETE access.
- No table policies exist, intentionally: public access uses fixed projections rather than direct row access.
- Only `get_public_margin_entries` and `get_public_margin_setting` are public executable SECURITY DEFINER read functions.
- Their search paths are empty and their outputs match the intentionally narrow public interface.
- Studio, submission and rate-limit functions deny `anon` and `authenticated`, and allow `service_role`.
- The auto-RLS helper is not publicly executable.

Advisor warnings about publicly executable definer functions and RLS-without-policies describe this intentional design; no broad grants, policies or function moves were introduced to silence them.

Two separate owner actions remain:

1. **PostgreSQL patch level:** live server reports 17.6. Supabase's published 17.11 maintenance release closes security issues. Review available maintenance upgrade, backup/recovery readiness and pgcrypto/extension compatibility before an owner-approved upgrade. This branch does not patch the managed database. See https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes.
2. **Leaked-password protection:** the security advisor reports it disabled. Enable if available on the existing plan and approved by the owner; do not introduce a paid plan automatically. Review MFA for the Studio administrator as an additional control; the app does not currently enforce MFA.

No authenticated production moderation or real reader submission was performed. Preview owner testing is still required.

## GitHub and deployment protection

Observed read-only settings:

- `main` is unprotected; the branch-rules API returns no applicable rules.
- GitHub Preview and Production environments have no protection rules or deployment-branch restrictions.
- Secret scanning and secret-scanning push protection are enabled.
- Dependabot security updates are disabled.
- Actions use read-only default workflow permissions and cannot approve pull requests; all actions are currently allowed.

The security branch has no branch-specific Margin/Supabase/Turnstile/Studio environment variables. Existing Preview configuration is scoped to older feature branches, so this Preview defaults to disabled Margin features and cannot validate authenticated Studio, live submissions or email delivery. The Resend integration's `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` are shared across Production and Preview; full credential isolation is therefore not established. No values were displayed and no environment settings were changed. Owner-approved non-production configuration and authenticated end-to-end testing remain release prerequisites.

The branch prepares `.github/workflows/security.yml`, with read-only contents permission, immutable official checkout/setup-node revisions, no stored deployment credentials, no `pull_request_target`, no deployment step and a disposable PostgreSQL service. It runs a secret-pattern/history scan, both dependency audits, lint, typecheck, all application tests, the existing SQL suites and the production build. Its YAML was parsed locally; the workflow itself has not yet run on GitHub. The Linux PostgreSQL/Sharp environment must pass CI after an approved branch push.

Owner-approved improvements:

1. Require PRs and the successful security check on `main`; block force pushes/deletions and configure bypass deliberately. Require an independent reviewer where another trusted maintainer is available, without creating an unusable solo-owner approval rule.
2. Enable Dependabot security updates and retain push protection. Consider CodeQL for JavaScript/TypeScript using existing free/public-repository capabilities after review.
3. Restrict Actions to trusted, pinned actions and retain read-only tokens.
4. Read-only project verification confirms Vercel deploys Production from `main` and authentication protection covers deployments except custom domains. No deployment checks are configured. GitHub environment approvals alone must not be assumed to gate Vercel's external Git integration. These settings were not changed.
5. Use protected-main merge plus an explicit owner release approval as the production gate. Review any existing-plan Vercel deployment checks; no paid service was provisioned.

## Validation evidence

| Check | Result |
| --- | --- |
| Full npm audit | 0 vulnerabilities |
| Production-only npm audit | 0 vulnerabilities |
| ESLint | Pass |
| TypeScript | Pass |
| New security regression tests | 20 pass |
| Existing notification/database-error tests | 8 pass |
| Existing SQL regression suites | All 3 pass with all 6 unchanged migrations in disposable PGlite PostgreSQL; zero retained test rows |
| Production-mode local build | Pass; 44 generated static pages, 23 baseline papers |
| Public HTTP sweep | All 37 sitemap URLs return 200 on the isolated local build |
| Anonymous Studio access | Dashboard, queue and detail redirect 307 to login; private/no-store responses |
| Studio framing and global headers | Expected headers present on local production-mode responses |
| Server Action CSRF negative check | Forged foreign Origin aborted by Next.js; intentional invalid-request response is HTTP 500, not successful authentication |
| Native Sharp | 0.35.5; PNG processing passed on Windows; libvips 8.18.7, librsvg 2.63.2, libheif 1.23.5 |
| Client bundle secret sentinels | Neither dummy server-secret sentinel appears in `.next/static` |
| High-signal credential scan | No matches in working source and reachable Git history; locations/categories only are reported on a finding |
| Content/design/migration diff | None |

The SQL runtime is a temporary package outside this repository, not a new application dependency. It exercises PostgreSQL role/permission and transactional behavior but is not the complete Supabase Auth/PostgREST platform. Tests ran locally; the live database received only read-only queries.

The credential scanner is a bounded-pattern check, not a forensic guarantee. It does not replace GitHub's provider-backed secret scanning, owner account review or incident response. A historical leak would require separately approved rotation and investigation, not history rewriting in this task.

## Reproduction

```text
npm ci --no-audit --no-fund
npm audit --omit=dev --audit-level=low
npm audit --audit-level=low
npm run lint
npm run typecheck
npm run test:security
npm run test:margin-notifications
npm run test:margin-database-errors
npm run security:secrets
npm run build
```

For SQL tests, use the disposable PostgreSQL configuration in the workflow or `npm run test:sql-security -- --pglite <temporary-package-root>`. The psql path refuses non-loopback hosts, any database other than `teff_security_test`, and environments without the explicit disposable marker. Never supply production connection details.

## Exact release recommendation — not authorization

1. Review this security-only diff and obtain owner approval to commit/push the branch and open a PR. Do not include the separately approved local article or unrelated work.
2. Run the prepared Linux CI and allow a protected Vercel Preview through the existing Git workflow only after approval to push. No environment changes or database migrations are required by this patch.
3. On Preview, use the existing administrator to check login, direct protected routes, logout and moderation. Confirm Turnstile returns the exact action and Preview hostname; with explicit owner approval, submit one labelled test note and verify pending-only storage and email delivery without publishing it. Review Studio directly rather than embedded in an iframe.
4. Obtain explicit production release approval, then merge through a normal reviewed PR into current `main`. Allow Vercel's existing Git integration to deploy that exact merge commit; do not deploy a dirty local checkout.
5. Wait for READY and verify the production alias, every sitemap URL, Studio authorization, server-secret non-exposure, headers and the approved Margin/email smoke test. No production test submission is authorized by this report itself.
6. Monitor runtime errors and auth/submission failures. If a regression occurs, stop further release work and use the existing approved rollback process, noting that rolling back this patch also restores the known dependency vulnerabilities.

**Current gate: security PR and Preview verification approved; production remains unchanged and requires separate explicit release approval.**
