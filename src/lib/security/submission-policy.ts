/** Compare against the request URL, not client-supplied forwarding headers. */
export function hasMismatchedSubmissionOrigin(origin: string | null, requestUrl: string) {
  // Non-browser clients remain supported; Turnstile and rate limits still apply.
  if (origin === null) return false;
  try {
    const supplied = new URL(origin);
    return supplied.origin !== origin || supplied.origin !== new URL(requestUrl).origin;
  } catch {
    return true;
  }
}

export function isMarginTurnstileContext(
  result: { action?: string; hostname?: string },
  expectedHostname: string,
) {
  return result.action === "margin-submit"
    && typeof result.hostname === "string"
    && result.hostname.toLowerCase() === expectedHostname.toLowerCase();
}
