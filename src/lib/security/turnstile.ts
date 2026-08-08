import "server-only";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
};

export type TurnstileVerificationResult =
  | { success: true; challengeTimestamp?: string; hostname?: string; action?: string }
  | { success: false; reason: "invalid-token" | "configuration" | "network" | "invalid-response" | "rejected"; errorCodes?: string[] };

export async function verifyTurnstileToken(
  token: string,
  options: { remoteIp?: string; idempotencyKey?: string; timeoutMs?: number } = {},
): Promise<TurnstileVerificationResult> {
  if (!token.trim()) return { success: false, reason: "invalid-token" };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { success: false, reason: "configuration" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5_000);

  try {
    const formData = new URLSearchParams({ secret, response: token });
    if (options.remoteIp) formData.set("remoteip", options.remoteIp);
    if (options.idempotencyKey) formData.set("idempotency_key", options.idempotencyKey);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return { success: false, reason: "network" };

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || typeof (payload as TurnstileResponse).success !== "boolean") {
      return { success: false, reason: "invalid-response" };
    }

    const result = payload as TurnstileResponse;
    if (!result.success) return { success: false, reason: "rejected", errorCodes: result["error-codes"] };

    return {
      success: true,
      challengeTimestamp: result.challenge_ts,
      hostname: result.hostname,
      action: result.action,
    };
  } catch {
    return { success: false, reason: "network" };
  } finally {
    clearTimeout(timeout);
  }
}
