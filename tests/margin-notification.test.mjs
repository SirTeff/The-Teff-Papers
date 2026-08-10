import assert from "node:assert/strict";
import test from "node:test";
import {
  MARGIN_NOTIFICATION_PREVIEW_LENGTH,
  buildMarginNotification,
  runMarginNotificationSafely,
  shouldScheduleMarginNotification,
} from "../src/lib/margin/notification-core.ts";

const baseInput = {
  entryId: "30000000-0000-4000-8000-000000000005",
  paperTitle: "A Trusted Paper Title",
  displayName: null,
  body: "A thoughtful reader note that is long enough to be accepted.",
  createdAt: "2026-08-10T08:30:00.000Z",
};

test("only new pending entries schedule a notification", () => {
  assert.equal(shouldScheduleMarginNotification({ duplicate: false, status: "pending" }), true);
  assert.equal(shouldScheduleMarginNotification({ duplicate: true, status: "pending" }), false);
  assert.equal(shouldScheduleMarginNotification({ duplicate: false, status: "approved" }), false);
});

test("notification failures are contained", async () => {
  for (const message of ["missing configuration", "provider unavailable"]) {
    let reported = false;
    const completed = await runMarginNotificationSafely(
      async () => { throw new Error(message); },
      () => { reported = true; },
    );
    assert.equal(completed, false);
    assert.equal(reported, true);
  }
});

test("anonymous and named readers are rendered as plain text", () => {
  const anonymous = buildMarginNotification(baseInput, "https://teffpapers.com");
  assert.match(anonymous.text, /Reader:\nAnonymous reader/);

  const named = buildMarginNotification(
    { ...baseInput, displayName: "Ada <Admin>", body: "<strong>Literal visitor text</strong>" },
    "https://teffpapers.com",
  );
  assert.match(named.text, /Reader:\nAda <Admin>/);
  assert.match(named.text, /Note:\n<strong>Literal visitor text<\/strong>/);
  assert.doesNotMatch(named.text, /<html|<body/i);
});

test("preview whitespace and length are normalized without changing the input body", () => {
  const body = `  ${"word ".repeat(100)}\n\nfinal  `;
  const original = body;
  const message = buildMarginNotification({ ...baseInput, body }, "https://teffpapers.com");
  assert.equal(body, original);
  assert.equal(message.preview.length, MARGIN_NOTIFICATION_PREVIEW_LENGTH);
  assert.equal(message.preview.endsWith("…"), true);
  assert.doesNotMatch(message.preview, /\s{2,}/);
});

test("Studio review URL uses the supplied trusted canonical origin and database entry id", () => {
  const message = buildMarginNotification(baseInput, "https://teffpapers.com");
  assert.equal(
    message.reviewUrl,
    "https://teffpapers.com/studio/margin/30000000-0000-4000-8000-000000000005",
  );
  assert.match(message.text, /Submitted:\n2026-08-10T08:30:00\.000Z/);
  assert.match(message.text, /Status:\nPending/);
});
