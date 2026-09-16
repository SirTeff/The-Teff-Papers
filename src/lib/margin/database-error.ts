const MAX_LOG_VALUE_LENGTH = 240;

function sanitizeLogValue(value: unknown) {
  if (typeof value !== "string") return undefined;

  const normalized = value
    .replace(/https?:\/\/[^\s]+/giu, "[redacted-url]")
    .replace(/\s+/gu, " ")
    .trim();

  if (!normalized) return undefined;
  return normalized.slice(0, MAX_LOG_VALUE_LENGTH);
}

export function describeMarginDatabaseError(error: unknown) {
  if (error instanceof Error) {
    return {
      type: error.name || "Error",
      message: sanitizeLogValue(error.message) ?? "Database request failed.",
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      type: sanitizeLogValue(record.name) ?? "DatabaseError",
      code: sanitizeLogValue(record.code),
      message: sanitizeLogValue(record.message) ?? "Database request failed.",
    };
  }

  return { type: "UnknownDatabaseError", message: "Database request failed." };
}
