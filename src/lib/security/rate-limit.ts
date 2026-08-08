import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import {
  MARGIN_SUBMISSION_RATE_LIMIT,
  MARGIN_SUBMISSION_RATE_WINDOW_SECONDS,
} from "@/lib/margin/constants";
import { consumeSubmissionRateLimit } from "@/lib/margin/submission-repository";

export type SubmissionRateLimitContext = {
  identifierHash: string;
  targetType: "paper";
  targetKey: string;
};

export type SubmissionRateLimitDecision =
  | { allowed: true; remaining?: number; resetAt?: number }
  | { allowed: false; reason: "limited" | "not-configured" | "unavailable"; retryAfterSeconds?: number };

export interface SubmissionRateLimiter {
  check(context: SubmissionRateLimitContext): Promise<SubmissionRateLimitDecision>;
}

export function createSubmissionRateLimitIdentity(forwardedFor: string | null) {
  const secret = process.env.MARGIN_RATE_LIMIT_SECRET?.trim();
  if (!secret) throw new Error("Margin submission rate limiting is not configured.");

  const firstForwardedAddress = forwardedFor?.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  const withoutZone = firstForwardedAddress.split("%", 1)[0];
  const mappedAddress = withoutZone.startsWith("::ffff:") ? withoutZone.slice(7) : withoutZone;
  const normalizedIp = isIP(mappedAddress) ? mappedAddress : "unknown-client";

  return {
    identifierHash: createHmac("sha256", secret).update(normalizedIp).digest("hex"),
    remoteIp: normalizedIp === "unknown-client" ? undefined : normalizedIp,
  };
}

export const databaseSubmissionRateLimiter: SubmissionRateLimiter = {
  async check(context) {
    try {
      const result = await consumeSubmissionRateLimit({
        identifierHash: context.identifierHash,
        targetType: context.targetType,
        targetKey: context.targetKey,
        windowSeconds: MARGIN_SUBMISSION_RATE_WINDOW_SECONDS,
        requestLimit: MARGIN_SUBMISSION_RATE_LIMIT,
      });
      if (!result.allowed) {
        return { allowed: false, reason: "limited", retryAfterSeconds: result.retryAfterSeconds };
      }
      return {
        allowed: true,
        remaining: result.remaining,
        resetAt: Date.now() + result.retryAfterSeconds * 1000,
      };
    } catch {
      console.error("[margin] durable submission rate limit unavailable", {
        targetType: context.targetType,
        targetKey: context.targetKey,
      });
      return { allowed: false, reason: "unavailable" };
    }
  },
};
