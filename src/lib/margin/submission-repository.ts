import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseConfiguration, MarginConfigurationError } from "@/lib/database/environment";
import type { SupabaseDatabase } from "@/lib/database/types";
import type { MarginStatus, MarginSubmissionInput, MarginTargetType } from "./types";

export type SubmissionConfirmation = {
  status: MarginStatus;
  duplicate: boolean;
  createdAt: string;
};

export type SubmissionRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export class MarginSubmissionRepositoryError extends Error {
  constructor(readonly code: "closed" | "conflict" | "configuration" | "database") {
    super("The Margin submission operation could not be completed.");
    this.name = "MarginSubmissionRepositoryError";
  }
}

function createSubmissionClient() {
  try {
    const configuration = getAdminSupabaseConfiguration();
    return createClient<SupabaseDatabase>(configuration.url, configuration.secretKey, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    });
  } catch (error) {
    if (error instanceof MarginConfigurationError) {
      throw new MarginSubmissionRepositoryError("configuration");
    }
    throw error;
  }
}

function repositoryError(error: { message: string }) {
  if (error.message === "MARGIN_SUBMISSIONS_CLOSED") return new MarginSubmissionRepositoryError("closed");
  if (error.message === "SUBMISSION_KEY_CONFLICT") return new MarginSubmissionRepositoryError("conflict");
  return new MarginSubmissionRepositoryError("database");
}

export async function consumeSubmissionRateLimit(input: {
  identifierHash: string;
  targetType: MarginTargetType;
  targetKey: string;
  windowSeconds: number;
  requestLimit: number;
}): Promise<SubmissionRateLimitResult> {
  const { data, error } = await createSubmissionClient().rpc("consume_margin_submission_rate_limit", {
    p_identifier_hash: input.identifierHash,
    p_target_type: input.targetType,
    p_target_key: input.targetKey,
    p_window_seconds: input.windowSeconds,
    p_request_limit: input.requestLimit,
  });
  if (error) throw repositoryError(error);
  const decision = data?.[0];
  if (!decision) throw new MarginSubmissionRepositoryError("database");

  return {
    allowed: decision.allowed,
    remaining: decision.remaining,
    retryAfterSeconds: decision.retry_after_seconds,
  };
}

export async function submitMarginEntry(input: MarginSubmissionInput): Promise<SubmissionConfirmation> {
  const { data, error } = await createSubmissionClient().rpc("submit_margin_entry", {
    p_target_type: input.targetType,
    p_target_key: input.targetKey,
    p_display_name: input.displayName,
    p_body: input.body,
    p_submission_key: input.submissionKey,
  });
  if (error) throw repositoryError(error);
  const confirmation = data?.[0];
  if (!confirmation || (!confirmation.duplicate && confirmation.status !== "pending")) {
    throw new MarginSubmissionRepositoryError("database");
  }

  return {
    status: confirmation.status,
    duplicate: confirmation.duplicate,
    createdAt: confirmation.created_at,
  };
}
