import { after, NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/config/features";
import { getPaperBySlug } from "@/lib/papers";
import { getMarginSettings } from "@/lib/margin/repository";
import {
  MarginSubmissionRepositoryError,
  submitMarginEntry,
} from "@/lib/margin/submission-repository";
import {
  getMarginNotificationErrorCategory,
  sendMarginAdminNotification,
} from "@/lib/margin/notification";
import {
  runMarginNotificationSafely,
  shouldScheduleMarginNotification,
} from "@/lib/margin/notification-core";
import { validateMarginSubmission } from "@/lib/margin/validation";
import {
  createSubmissionRateLimitIdentity,
  databaseSubmissionRateLimiter,
} from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export const runtime = "nodejs";

const MAX_REQUEST_LENGTH = 16_384;
const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;
const SUCCESS_MESSAGE = "Thanks. Your note has been sent for review.";

function response(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function acceptedResponse() {
  return response({ ok: true, message: SUCCESS_MESSAGE }, 202);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasMismatchedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
    const protocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");
    const expectedOrigin = host ? new URL(`${protocol}://${host}`).origin : request.nextUrl.origin;
    return new URL(origin).origin !== expectedOrigin;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  if (!features.marginEnabled || !features.marginSubmissionsEnabled) {
    return response({ ok: false, code: "unavailable", message: "The Margin is not accepting notes right now." }, 404);
  }
  if (hasMismatchedOrigin(request)) {
    return response({ ok: false, code: "origin", message: "This request could not be accepted." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_LENGTH) {
    return response({ ok: false, code: "validation", message: "The note is too large to process." }, 413);
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_REQUEST_LENGTH) {
      return response({ ok: false, code: "validation", message: "The note is too large to process." }, 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return response({ ok: false, code: "validation", message: "The submission could not be read." }, 400);
  }
  if (!isRecord(payload)) {
    return response({ ok: false, code: "validation", message: "The submission could not be read." }, 400);
  }

  const website = typeof payload.website === "string" ? payload.website.trim() : "";
  if (website) return acceptedResponse();

  const validation = validateMarginSubmission(payload);
  if (!validation.success) {
    return response({ ok: false, code: "validation", message: "Please review your note.", issues: validation.issues }, 400);
  }
  const paper = getPaperBySlug(validation.data.targetKey);
  if (!paper) {
    return response({ ok: false, code: "validation", message: "This paper could not be found." }, 400);
  }

  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken.trim() : "";
  if (!turnstileToken || turnstileToken.length > MAX_TURNSTILE_TOKEN_LENGTH) {
    return response({ ok: false, code: "verification", message: "Please complete the verification and try again." }, 400);
  }

  const setting = await getMarginSettings(validation.data.targetType, validation.data.targetKey);
  if (setting.state !== "ready") {
    return response({ ok: false, code: "unavailable", message: "Your note could not be sent right now. Please try again." }, 503);
  }
  if (!setting.data.isOpen) {
    return response({ ok: false, code: "closed", message: "The Margin is not accepting new notes on this paper right now." }, 409);
  }

  let identity: ReturnType<typeof createSubmissionRateLimitIdentity>;
  try {
    identity = createSubmissionRateLimitIdentity(request.headers.get("x-forwarded-for"));
  } catch {
    return response({ ok: false, code: "unavailable", message: "Your note could not be sent right now. Please try again." }, 503);
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, {
    remoteIp: identity.remoteIp,
    idempotencyKey: validation.data.submissionKey,
  });
  if (!turnstile.success || (turnstile.action && turnstile.action !== "margin-submit")) {
    return response({ ok: false, code: "verification", message: "Please complete the verification and try again." }, 400);
  }

  const rateLimit = await databaseSubmissionRateLimiter.check({
    identifierHash: identity.identifierHash,
    targetType: validation.data.targetType,
    targetKey: validation.data.targetKey,
  });
  if (!rateLimit.allowed) {
    if (rateLimit.reason === "limited") {
      return response(
        { ok: false, code: "rate_limited", message: "Too many notes were sent recently. Please try again in a little while." },
        429,
        rateLimit.retryAfterSeconds ? { "Retry-After": String(rateLimit.retryAfterSeconds) } : undefined,
      );
    }
    return response({ ok: false, code: "unavailable", message: "Your note could not be sent right now. Please try again." }, 503);
  }

  try {
    const confirmation = await submitMarginEntry(validation.data);
    if (shouldScheduleMarginNotification(confirmation)) {
      after(() => runMarginNotificationSafely(
        () => sendMarginAdminNotification({
          entryId: confirmation.id,
          paperTitle: paper.title,
          displayName: validation.data.displayName,
          body: validation.data.body,
          createdAt: confirmation.createdAt,
        }),
        (error) => {
          console.error("[margin] administrator notification failed", {
            entryId: confirmation.id,
            category: getMarginNotificationErrorCategory(error),
          });
        },
      ));
    }
    return acceptedResponse();
  } catch (error) {
    if (error instanceof MarginSubmissionRepositoryError && error.code === "closed") {
      return response({ ok: false, code: "closed", message: "The Margin is not accepting new notes on this paper right now." }, 409);
    }
    return response({ ok: false, code: "unavailable", message: "Your note could not be sent right now. Please try again." }, 503);
  }
}
