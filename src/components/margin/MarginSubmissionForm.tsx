"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MARGIN_BODY_MAX_LENGTH, MARGIN_BODY_MIN_LENGTH, MARGIN_NAME_MAX_LENGTH } from "@/lib/margin/constants";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type SubmissionStatus = { kind: "idle" | "success" | "error"; message: string };

export function MarginSubmissionForm({ slug, siteKey }: { slug: string; siteKey: string }) {
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [submissionKey, setSubmissionKey] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>({ kind: "idle", message: "" });
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const successfulResetRef = useRef(false);

  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !widgetContainerRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
      sitekey: siteKey,
      action: "margin-submit",
      size: "flexible",
      callback: (token: string) => {
        setTurnstileToken(token);
        if (successfulResetRef.current) {
          successfulResetRef.current = false;
          return;
        }
        setStatus((current) => current.kind === "error" ? { kind: "idle", message: "" } : current);
      },
      "expired-callback": () => {
        setTurnstileToken("");
        if (successfulResetRef.current) return;
        setStatus({ kind: "error", message: "Verification expired. Please complete it again." });
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      },
      "error-callback": () => {
        setTurnstileToken("");
        if (successfulResetRef.current) return true;
        setStatus({ kind: "error", message: "Verification could not be completed. Please try again." });
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
        return true;
      },
      "timeout-callback": () => {
        setTurnstileToken("");
        if (successfulResetRef.current) return;
        setStatus({ kind: "error", message: "Verification timed out. Please complete it again." });
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [scriptReady, siteKey]);

  function resetTurnstile() {
    setTurnstileToken("");
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (body.trim().length < MARGIN_BODY_MIN_LENGTH) {
      setStatus({ kind: "error", message: `Your note must contain at least ${MARGIN_BODY_MIN_LENGTH} characters.` });
      return;
    }
    if (!turnstileToken) {
      setStatus({ kind: "error", message: "Please complete the verification before sending your note." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const key = submissionKey || crypto.randomUUID();
    setSubmissionKey(key);
    setSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const result = await fetch("/api/margin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "paper",
          targetKey: slug,
          displayName,
          body,
          submissionKey: key,
          turnstileToken,
          website: formData.get("website") ?? "",
        }),
      });
      const payload: unknown = await result.json().catch(() => null);
      const code = payload && typeof payload === "object" && "code" in payload ? String(payload.code) : "";

      if (result.status === 202) {
        setDisplayName("");
        setBody("");
        setSubmissionKey(crypto.randomUUID());
        setStatus({ kind: "success", message: "Thanks. Your note has been sent for review." });
        successfulResetRef.current = true;
        resetTurnstile();
        return;
      }

      const message = code === "rate_limited"
        ? "Too many notes were sent recently. Please try again in a little while."
        : code === "closed"
          ? "The Margin is not accepting new notes on this paper right now."
          : code === "validation"
            ? "Please review your note and try again."
            : code === "verification"
              ? "Please complete the verification and try again."
              : "Your note could not be sent right now. Please try again.";
      setStatus({ kind: "error", message });
      resetTurnstile();
    } catch {
      setStatus({ kind: "error", message: "Your note could not be sent right now. Please try again." });
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="margin-submission" aria-labelledby="margin-submission-heading">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <header className="margin-submission-heading">
        <p className="eyebrow">Leave a note</p>
        <h3 id="margin-submission-heading">Add another line of thought</h3>
        <p>No account is required. Notes are reviewed before publication. If approved, your name or pseudonym and note become public; leave the name blank to appear as Anonymous reader.</p>
      </header>
      <form className="margin-submission-form" onSubmit={submit}>
        <label htmlFor="margin-display-name">Name or pseudonym <span>Optional</span></label>
        <input
          id="margin-display-name"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={MARGIN_NAME_MAX_LENGTH}
          autoComplete="name"
        />

        <label htmlFor="margin-note">Your note</label>
        <textarea
          id="margin-note"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          minLength={MARGIN_BODY_MIN_LENGTH}
          maxLength={MARGIN_BODY_MAX_LENGTH}
          rows={8}
          required
          aria-describedby="margin-note-guidance margin-character-count"
        />
        <p id="margin-note-guidance" className="margin-form-guidance">Plain text only. Reader notes may extend, question, or respond to the paper.</p>
        <p id="margin-character-count" className="margin-character-count" aria-live="polite">
          {body.length} / {MARGIN_BODY_MAX_LENGTH} characters
        </p>

        <div className="margin-honeypot" aria-hidden="true">
          <label htmlFor="margin-website">Website</label>
          <input id="margin-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="margin-turnstile" ref={widgetContainerRef} />
        <button type="submit" disabled={submitting || !turnstileToken || !submissionKey}>
          {submitting ? "Sending…" : "Send for review"}
        </button>
        <p className={`margin-form-status margin-form-status--${status.kind}`} aria-live="polite">
          {status.message}
        </p>
      </form>
    </div>
  );
}
