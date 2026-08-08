import {
  MARGIN_BODY_MAX_LENGTH,
  MARGIN_BODY_MIN_LENGTH,
  MARGIN_NAME_MAX_LENGTH,
  MARGIN_TARGET_KEY_MAX_LENGTH,
  MARGIN_TARGET_TYPES,
} from "./constants";
import { isMarginSubmissionKey } from "./submission-key";
import type { MarginSubmissionInput, MarginTargetType } from "./types";

export type MarginValidationIssue = {
  field: keyof MarginSubmissionInput | "input";
  code: "required" | "invalid" | "too_short" | "too_long";
  message: string;
};

export type MarginValidationResult =
  | { success: true; data: MarginSubmissionInput }
  | { success: false; issues: MarginValidationIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMarginTargetType(value: unknown): value is MarginTargetType {
  return typeof value === "string" && MARGIN_TARGET_TYPES.includes(value as MarginTargetType);
}

export function validateMarginSubmission(value: unknown): MarginValidationResult {
  if (!isRecord(value)) {
    return { success: false, issues: [{ field: "input", code: "invalid", message: "Submission must be an object." }] };
  }

  const issues: MarginValidationIssue[] = [];
  const targetType = value.targetType;
  const targetKey = typeof value.targetKey === "string" ? value.targetKey.trim() : "";
  const displayNameValue = typeof value.displayName === "string" ? value.displayName.trim() : null;
  const displayName = displayNameValue || null;
  const body = typeof value.body === "string" ? value.body.replace(/\r\n?/g, "\n") : "";
  const submissionKey = typeof value.submissionKey === "string" ? value.submissionKey.trim() : "";

  if (!isMarginTargetType(targetType)) {
    issues.push({ field: "targetType", code: "invalid", message: "Unsupported Margin target type." });
  }

  if (!targetKey) {
    issues.push({ field: "targetKey", code: "required", message: "A target key is required." });
  } else if (targetKey.length > MARGIN_TARGET_KEY_MAX_LENGTH) {
    issues.push({ field: "targetKey", code: "too_long", message: `Target keys cannot exceed ${MARGIN_TARGET_KEY_MAX_LENGTH} characters.` });
  } else if (targetType === "paper" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetKey)) {
    issues.push({ field: "targetKey", code: "invalid", message: "Paper target keys must be stable lowercase slugs." });
  }

  if (displayName && displayName.length > MARGIN_NAME_MAX_LENGTH) {
    issues.push({ field: "displayName", code: "too_long", message: `Display names cannot exceed ${MARGIN_NAME_MAX_LENGTH} characters.` });
  } else if (displayName && /[\r\n]/.test(displayName)) {
    issues.push({ field: "displayName", code: "invalid", message: "Display names must use a single line." });
  }

  if (!body.trim()) {
    issues.push({ field: "body", code: "required", message: "A Margin contribution is required." });
  } else if (body.trim().length < MARGIN_BODY_MIN_LENGTH) {
    issues.push({ field: "body", code: "too_short", message: `Contributions must contain at least ${MARGIN_BODY_MIN_LENGTH} characters.` });
  } else if (body.length > MARGIN_BODY_MAX_LENGTH) {
    issues.push({ field: "body", code: "too_long", message: `Contributions cannot exceed ${MARGIN_BODY_MAX_LENGTH} characters.` });
  }

  if (!isMarginSubmissionKey(submissionKey)) {
    issues.push({ field: "submissionKey", code: "invalid", message: "A valid UUID submission key is required." });
  }

  if (issues.length || !isMarginTargetType(targetType)) return { success: false, issues };

  return {
    success: true,
    data: { targetType, targetKey, displayName, body, submissionKey },
  };
}
