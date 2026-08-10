import type { MarginStatus } from "./types";

export const MARGIN_NOTIFICATION_SUBJECT = "New Margin note awaiting review";
export const MARGIN_NOTIFICATION_PREVIEW_LENGTH = 300;

export type MarginNotificationInput = {
  entryId: string;
  paperTitle: string;
  displayName: string | null;
  body: string;
  createdAt: string;
};

export function shouldScheduleMarginNotification(confirmation: {
  duplicate: boolean;
  status: MarginStatus;
}) {
  return confirmation.duplicate === false && confirmation.status === "pending";
}

export function createMarginNotificationPreview(body: string) {
  const normalized = body.replace(/\s+/gu, " ").trim();
  if (normalized.length <= MARGIN_NOTIFICATION_PREVIEW_LENGTH) return normalized;
  return `${normalized.slice(0, MARGIN_NOTIFICATION_PREVIEW_LENGTH - 1).trimEnd()}…`;
}

export function buildMarginNotification(input: MarginNotificationInput, siteUrl: string) {
  const reader = input.displayName?.trim() || "Anonymous reader";
  const preview = createMarginNotificationPreview(input.body);
  const submitted = new Date(input.createdAt).toISOString();
  const reviewUrl = new URL(`/studio/margin/${encodeURIComponent(input.entryId)}`, siteUrl).toString();
  const text = [
    MARGIN_NOTIFICATION_SUBJECT,
    "",
    "Paper:",
    input.paperTitle,
    "",
    "Reader:",
    reader,
    "",
    "Note:",
    preview,
    "",
    "Submitted:",
    submitted,
    "",
    "Status:",
    "Pending",
    "",
    "Review in Teff Studio:",
    reviewUrl,
  ].join("\n");

  return { subject: MARGIN_NOTIFICATION_SUBJECT, text, preview, reviewUrl } as const;
}

export async function runMarginNotificationSafely(
  task: () => Promise<void>,
  onFailure: (error: unknown) => void,
) {
  try {
    await task();
    return true;
  } catch (error) {
    onFailure(error);
    return false;
  }
}
