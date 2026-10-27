import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { remark } from "remark";
import html from "remark-html";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypeScript } from "./helpers/load-typescript.mjs";
import { findSecrets } from "../scripts/security/scan-secrets.mjs";

const bodyModule = () => loadTypeScript("src/lib/security/request-body.ts");
const policy = () => loadTypeScript("src/lib/security/submission-policy.ts");
const adminEmail = "security-admin@example.test";

function authorization(user, error = null, environment = { TEFF_STUDIO_ADMIN_EMAILS: adminEmail }) {
  return loadTypeScript("src/lib/security/admin-authorization.ts", {
    environment,
    mocks: { "@/lib/database/supabase-auth-server": { createSupabaseAuthServerClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error }) } }) } },
  });
}

test("Studio rejects absent, invalid, non-admin and unconfirmed identities", async () => {
  for (const user of [null, { id: "reader", email: "reader@example.test", email_confirmed_at: "2026-01-01" }, { id: "admin", email: adminEmail, email_confirmed_at: null }]) {
    const auth = authorization(user);
    await assert.rejects(auth.createAdminAuthorization(), (error) => ["unauthenticated", "unauthorized"].includes(error.code));
  }
  await assert.rejects(authorization({ id: "admin", email: adminEmail }, new Error("invalid token")).createAdminAuthorization(), (e) => e.code === "unauthenticated");
});

test("Studio authorizes only a confirmed allowlisted getUser identity", async () => {
  const auth = authorization({ id: "verified-admin", email: ` ${adminEmail.toUpperCase()} `, email_confirmed_at: "2026-01-01" });
  const result = await auth.createAdminAuthorization();
  assert.equal(result.actorId, "verified-admin");
  assert.equal(result.email, adminEmail);
  await assert.rejects(authorization({ id: "admin", email: adminEmail, email_confirmed_at: "2026-01-01" }, null, {}).createAdminAuthorization(), (e) => e.code === "configuration");
});

test("admin Supabase configuration fails closed without its server secret", () => {
  const env = loadTypeScript("src/lib/database/environment.ts", { environment: { NEXT_PUBLIC_SUPABASE_URL: "https://example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key" } });
  assert.throws(() => env.getAdminSupabaseConfiguration(), /SUPABASE_SECRET_KEY/);
  assert.equal(env.getSupabaseAuthConfiguration().publishableKey, "test-public-key");
});

test("origin checks reject foreign, opaque and malformed origins", () => {
  const { hasMismatchedSubmissionOrigin: check } = policy();
  const url = "https://teffpapers.com/api/margin/submit";
  assert.equal(check("https://teffpapers.com", url), false);
  assert.equal(check(null, url), false);
  for (const origin of ["https://attacker.example", "null", "", "https://teffpapers.com/path", "https://teffpapers.com.attacker.example"]) assert.equal(check(origin, url), true);
});

test("Turnstile context requires an exact action and matching hostname", () => {
  const { isMarginTurnstileContext: check } = policy();
  assert.equal(check({ action: "margin-submit", hostname: "TEFFPAPERS.COM" }, "teffpapers.com"), true);
  for (const value of [{}, { action: "margin-submit" }, { hostname: "teffpapers.com" }, { action: "other", hostname: "teffpapers.com" }, { action: "margin-submit", hostname: "attacker.example" }]) assert.equal(check(value, "teffpapers.com"), false);
});

test("request reader enforces bytes, cancels oversized streams and rejects invalid UTF-8", async () => {
  const { readLimitedRequestBody, RequestBodyTooLargeError } = bodyModule();
  assert.equal(await readLimitedRequestBody(new Request("https://example.test", { method: "POST", body: "hello" }), 5), "hello");
  await assert.rejects(readLimitedRequestBody(new Request("https://example.test", { method: "POST", body: "ééé" }), 5), (e) => e instanceof RequestBodyTooLargeError);
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(6)); }, cancel() { cancelled = true; } });
  await assert.rejects(readLimitedRequestBody(new Request("https://example.test", { method: "POST", body: stream, duplex: "half" }), 5), (e) => e instanceof RequestBodyTooLargeError);
  assert.equal(cancelled, true);
  await assert.rejects(readLimitedRequestBody(new Request("https://example.test", { method: "POST", body: new Uint8Array([0xff]) }), 5));
});

test("Turnstile verification fails closed and never accepts a client assertion alone", async () => {
  const configure = (fetch, environment = { TURNSTILE_SECRET_KEY: "test-only-secret" }) => loadTypeScript("src/lib/security/turnstile.ts", { environment, globals: { fetch } });
  let called = false;
  const missing = configure(() => { called = true; }, {});
  assert.equal((await missing.verifyTurnstileToken("token")).success, false);
  assert.equal(called, false);
  for (const payload of [{}, { success: false, "error-codes": ["timeout-or-duplicate"] }]) {
    const verifier = configure(async () => Response.json(payload));
    assert.equal((await verifier.verifyTurnstileToken("token")).success, false);
  }
  const network = configure(async () => { throw new Error("network unavailable"); });
  assert.equal((await network.verifyTurnstileToken("token")).reason, "network");
  const valid = configure(async (url, options) => {
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.equal(options.method, "POST");
    assert.equal(options.cache, "no-store");
    return Response.json({ success: true, action: "margin-submit", hostname: "teffpapers.com" });
  });
  assert.equal((await valid.verifyTurnstileToken("token")).success, true);
});

const validInput = { targetType: "paper", targetKey: "why-personal-ai-needs-memory", displayName: "Test reader", body: "A diagnostic fixture used only in memory, never sent to Supabase.", submissionKey: "30000000-0000-4000-8000-000000000005", turnstileToken: "fixture" };

function gateway(options = {}) {
  const state = { writes: 0, rateChecks: 0, verifications: 0, after: [] };
  class RepositoryError extends Error {}
  const route = loadTypeScript("src/app/api/margin/submit/route.ts", { mocks: {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) }, after: (callback) => state.after.push(callback) },
    "@/lib/config/features": { features: { marginEnabled: true, marginSubmissionsEnabled: true, ...options.features } },
    "@/lib/papers": { getPaperBySlug: (slug) => slug === validInput.targetKey ? { title: "Fixture paper" } : undefined },
    "@/lib/margin/repository": { getMarginSettings: async () => options.setting ?? { state: "ready", data: { isOpen: true } } },
    "@/lib/margin/submission-repository": { MarginSubmissionRepositoryError: RepositoryError, submitMarginEntry: async () => { state.writes++; return { id: "fixture", status: "pending", duplicate: false, createdAt: "2026-01-01", ...options.confirmation }; } },
    "@/lib/margin/notification": { getMarginNotificationErrorCategory: () => "fixture", sendMarginAdminNotification: async () => undefined },
    "@/lib/security/rate-limit": { createSubmissionRateLimitIdentity: () => ({ identifierHash: "a".repeat(64) }), databaseSubmissionRateLimiter: { check: async () => { state.rateChecks++; return options.rate ?? { allowed: true }; } } },
    "@/lib/security/turnstile": { verifyTurnstileToken: async () => { state.verifications++; return options.turnstile ?? { success: true, action: "margin-submit", hostname: "teffpapers.com" }; } },
  } });
  return { state, async post(payload = validInput, headers = {}) {
    const request = new Request("https://teffpapers.com/api/margin/submit", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://teffpapers.com", ...headers }, body: typeof payload === "string" ? payload : JSON.stringify(payload) });
    Object.defineProperty(request, "nextUrl", { value: new URL(request.url) });
    return route.POST(request);
  } };
}

test("submission rejects origin spoofing through forwarding headers", async () => {
  const g = gateway();
  assert.equal((await g.post(validInput, { Origin: "https://attacker.example", "x-forwarded-host": "attacker.example", "x-forwarded-proto": "https" })).status, 403);
  assert.equal(g.state.writes, 0);
  assert.equal(g.state.verifications, 0);
});

test("disabled, oversized, malformed and honeypot requests cannot write", async () => {
  assert.equal((await gateway({ features: { marginEnabled: false } }).post()).status, 404);
  const g = gateway();
  assert.equal((await g.post("x".repeat(16_385))).status, 413);
  assert.equal((await g.post("{" )).status, 400);
  assert.equal((await g.post({ ...validInput, website: "bot.example" })).status, 202);
  assert.equal(g.state.writes, 0);
});

test("closed, unavailable and invalid requests fail before storage", async () => {
  assert.equal((await gateway({ setting: { state: "ready", data: { isOpen: false } } }).post()).status, 409);
  assert.equal((await gateway({ setting: { state: "unavailable" } }).post()).status, 503);
  for (const extra of [{ body: "short" }, { targetKey: "../studio" }, { submissionKey: "invalid" }, { turnstileToken: "" }, { displayName: "invalid\nname" }]) {
    const g = gateway();
    assert.equal((await g.post({ ...validInput, ...extra })).status, 400);
    assert.equal(g.state.writes, 0);
  }
});

test("missing or wrong Turnstile bindings cannot consume limits or write", async () => {
  for (const turnstile of [{ success: false }, { success: true }, { success: true, action: "other", hostname: "teffpapers.com" }, { success: true, action: "margin-submit", hostname: "another.example" }]) {
    const g = gateway({ turnstile });
    assert.equal((await g.post()).status, 400);
    assert.equal(g.state.rateChecks, 0);
    assert.equal(g.state.writes, 0);
  }
});

test("durable rate-limit failure is closed and limits retain Retry-After", async () => {
  const limited = gateway({ rate: { allowed: false, reason: "limited", retryAfterSeconds: 900 } });
  const response = await limited.post();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "900");
  assert.equal(limited.state.writes, 0);
  const unavailable = gateway({ rate: { allowed: false, reason: "unavailable" } });
  assert.equal((await unavailable.post()).status, 503);
  assert.equal(unavailable.state.writes, 0);
});

test("successful submissions remain pending; duplicate retries do not notify", async () => {
  const g = gateway();
  const response = await g.post();
  assert.equal(response.status, 202);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(g.state.writes, 1);
  assert.equal(g.state.after.length, 1);
  const duplicate = gateway({ confirmation: { duplicate: true } });
  assert.equal((await duplicate.post()).status, 202);
  assert.equal(duplicate.state.after.length, 0);
});

test("rate-limit identities normalize mapped IPv4 and never expose raw addresses", () => {
  const limiter = loadTypeScript("src/lib/security/rate-limit.ts", { environment: { MARGIN_RATE_LIMIT_SECRET: "test-only-hmac-key" }, mocks: { "@/lib/margin/submission-repository": { consumeSubmissionRateLimit: async () => undefined } } });
  const a = limiter.createSubmissionRateLimitIdentity("192.0.2.1");
  const b = limiter.createSubmissionRateLimitIdentity("::ffff:192.0.2.1");
  assert.equal(a.identifierHash, b.identifierHash);
  assert.match(a.identifierHash, /^[0-9a-f]{64}$/);
  assert.equal(limiter.createSubmissionRateLimitIdentity("invalid").remoteIp, undefined);
  assert.throws(() => loadTypeScript("src/lib/security/rate-limit.ts", { mocks: { "@/lib/margin/submission-repository": {} } }).createSubmissionRateLimitIdentity("192.0.2.1"), /not configured/);
});

test("approved reader names and bodies are escaped, not interpreted as HTML", async () => {
  const component = loadTypeScript("src/components/margin/PublicMargin.tsx", { mocks: {
    "@/lib/config/features": { features: { marginEnabled: true, marginSubmissionsEnabled: false } },
    "@/lib/margin/public-cache": { getCachedApprovedMarginEntries: async () => ({ state: "ready", data: [{ id: "fixture", displayName: "<img src=x onerror=alert(1)>", body: "<script>alert(1)</script>", createdAt: "2026-01-01", featured: false }] }) },
    "@/lib/margin/repository": { getMarginSettings: async () => null },
    "./MarginSubmissionForm": { MarginSubmissionForm: () => null },
  } });
  const markup = renderToStaticMarkup(await component.PublicMargin({ slug: "fixture" }));
  assert.ok(markup.includes("&lt;script&gt;"));
  assert.ok(markup.includes("&lt;img"));
  assert.ok(!markup.includes("<script>"));
  assert.ok(!markup.includes("<img"));
});

test("Markdown sanitization removes active HTML and dangerous URL schemes", async () => {
  const result = String(await remark().use(html).process('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[link](javascript:alert%281%29)'));
  assert.doesNotMatch(result, /<script|onerror=|href="javascript:/i);
});

test("every Studio moderation action reauthorizes before reaching its repository", () => {
  const source = fs.readFileSync("src/app/studio/margin/actions.ts", "utf8");
  assert.ok(source.indexOf("await createAdminAuthorization()") < source.indexOf("await operation("));
  for (const file of ["src/app/studio/page.tsx", "src/app/studio/margin/page.tsx", "src/app/studio/margin/[id]/page.tsx"]) assert.match(fs.readFileSync(file, "utf8"), /await requireStudioAuthorization\(\)/);
});

test("direct moderation calls cannot bypass authorization or supply the actor", async () => {
  let writes = 0;
  let deny = true;
  const names = ["approveMarginEntry", "rejectMarginEntry", "markMarginEntrySpam", "removeMarginEntry", "restoreApprovedMarginEntry", "returnMarginEntryToPending", "featureMarginEntry", "unfeatureMarginEntry"];
  const repository = Object.fromEntries(names.map((name) => [name, async (auth, id) => {
    writes++;
    assert.equal(auth.actorId, "verified-server-actor");
    assert.equal(id, "30000000-0000-4000-8000-000000000005");
  }]));
  const actions = loadTypeScript("src/app/studio/margin/actions.ts", { mocks: {
    "next/cache": { revalidatePath() {}, revalidateTag() {} },
    "next/navigation": { redirect() { throw new Error("unexpected redirect"); } },
    "@/lib/margin/admin-repository": repository,
    "@/lib/security/admin-authorization": { createAdminAuthorization: async () => {
      if (deny) throw new Error("authentication required");
      return { actorId: "verified-server-actor" };
    } },
  } });
  const form = new FormData();
  form.set("id", "30000000-0000-4000-8000-000000000005");
  form.set("actorId", "attacker-supplied-actor");
  for (const action of Object.values(actions)) await assert.rejects(action(form), /authentication required/);
  assert.equal(writes, 0);
  deny = false;
  for (const action of Object.values(actions)) await action(form);
  assert.equal(writes, 8);
});

test("the secret scanner reports location and category without returning values", () => {
  const credential = "sb_secret_" + "x".repeat(32);
  const findings = findSecrets(`first line\n${credential}`);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].line, 2);
  assert.ok(!JSON.stringify(findings).includes(credential));
});

test("rate-limit policy stays at five attempts per fifteen minutes", () => {
  const constants = loadTypeScript("src/lib/margin/constants.ts");
  assert.equal(constants.MARGIN_SUBMISSION_RATE_LIMIT, 5);
  assert.equal(constants.MARGIN_SUBMISSION_RATE_WINDOW_SECONDS, 900);
});
