import assert from "node:assert/strict";
import test from "node:test";
import { describeMarginDatabaseError } from "../src/lib/margin/database-error.ts";

test("preserves safe Supabase error details without collapsing plain objects", () => {
  assert.deepEqual(
    describeMarginDatabaseError({ code: "PGRST002", message: "Database connection unavailable" }),
    {
      type: "DatabaseError",
      code: "PGRST002",
      message: "Database connection unavailable",
    },
  );
});

test("redacts URLs and bounds logged database messages", () => {
  const result = describeMarginDatabaseError({
    message: `Request to https://example.supabase.co/rest/v1/rpc failed ${"x".repeat(300)}`,
  });

  assert.doesNotMatch(result.message, /example\.supabase\.co/u);
  assert.match(result.message, /\[redacted-url\]/u);
  assert.ok(result.message.length <= 240);
});

test("uses a stable fallback for unknown thrown values", () => {
  assert.deepEqual(
    describeMarginDatabaseError("connection failed"),
    { type: "UnknownDatabaseError", message: "Database request failed." },
  );
});
