import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const migrations = fs.readdirSync("supabase/migrations").filter((name) => name.endsWith(".sql")).sort();
const tests = ["margin_security.sql", "studio_moderation_security.sql", "margin_submission_security.sql"];
const bootstrap = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
`;

if (process.argv[2] === "--pglite") {
  const runtime = process.argv[3];
  if (!runtime) throw new Error("Provide the temporary PGlite package root.");
  const require = createRequire(path.resolve(runtime, "package.json"));
  const { PGlite } = require("@electric-sql/pglite");
  const { pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto");
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(bootstrap);
    for (const name of migrations) await db.exec(fs.readFileSync(path.join("supabase/migrations", name), "utf8"));
    for (const name of tests) {
      await db.exec(fs.readFileSync(path.join("supabase/tests", name), "utf8"));
      console.log(`PASS ${name} (disposable in-memory PostgreSQL)`);
    }
    const result = await db.query("select (select count(*) from public.margin_entries) + (select count(*) from public.moderation_events) + (select count(*) from public.margin_submission_rate_limits) + (select count(*) from public.margin_settings) as retained_rows");
    assert.equal(Number(result.rows[0].retained_rows), 0);
    console.log(`PASS ${migrations.length} unchanged migrations; all test rows rolled back`);
  } finally {
    await db.close();
  }
} else {
  // Never consume DATABASE_URL or allow this destructive test setup on a remote DB.
  if (process.env.SECURITY_TEST_DATABASE !== "disposable"
      || !["127.0.0.1", "localhost", "::1"].includes(process.env.PGHOST)
      || process.env.PGDATABASE !== "teff_security_test") {
    throw new Error("SQL tests require SECURITY_TEST_DATABASE=disposable, a loopback PGHOST and PGDATABASE=teff_security_test. Never run against Supabase.");
  }
  const input = [bootstrap, ...migrations.map((name) => fs.readFileSync(path.join("supabase/migrations", name), "utf8")), ...tests.map((name) => fs.readFileSync(path.join("supabase/tests", name), "utf8"))].join("\n");
  const result = spawnSync("psql", ["-X", "--set", "ON_ERROR_STOP=1", "--quiet"], { input, encoding: "utf8", env: process.env });
  if (result.error) throw new Error("A local psql client is required, or use --pglite with a temporary runtime.");
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${migrations.length} migrations and ${tests.length} SQL security suites on disposable local PostgreSQL`);
  }
}
