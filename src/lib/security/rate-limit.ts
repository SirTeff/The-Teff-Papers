import "server-only";

export type SubmissionRateLimitContext = {
  identifier: string;
  targetType: "paper";
  targetKey: string;
};

export type SubmissionRateLimitDecision =
  | { allowed: true; remaining?: number; resetAt?: number }
  | { allowed: false; reason: "limited" | "not-configured"; retryAfterSeconds?: number };

export interface SubmissionRateLimiter {
  check(context: SubmissionRateLimitContext): Promise<SubmissionRateLimitDecision>;
}

// Fail closed until Stage D supplies a durable, serverless-compatible provider.
// An in-memory implementation would provide misleading protection on Vercel.
export const unconfiguredSubmissionRateLimiter: SubmissionRateLimiter = {
  async check() {
    return { allowed: false, reason: "not-configured" };
  },
};
