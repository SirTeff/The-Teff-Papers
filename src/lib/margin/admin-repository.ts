import "server-only";
import { createSupabaseAdminClient } from "@/lib/database/supabase-admin";
import type { MarginEntryRow, MarginStatusDatabase, ModerationActionDatabase } from "@/lib/database/types";
import type { AdminAuthorization } from "@/lib/security/admin-authorization";
import { MARGIN_STATUSES } from "./constants";
import type { AdminMarginEntry, MarginCounts, MarginQueuePage, MarginStatus, MarginTargetType, ModerationEvent } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MarginAdminRepositoryError extends Error {
  constructor(readonly code: "validation" | "not_found" | "conflict" | "configuration" | "database", message: string) {
    super(message);
    this.name = "MarginAdminRepositoryError";
  }
}

function validateId(id: string) {
  if (!UUID_PATTERN.test(id)) throw new MarginAdminRepositoryError("validation", "Invalid Margin entry identifier.");
  return id;
}

function validateReason(reason: string | null) {
  const clean = reason?.trim() || null;
  if (clean && clean.length > 2000) throw new MarginAdminRepositoryError("validation", "Reason cannot exceed 2000 characters.");
  return clean;
}

function mapEntry(row: Omit<MarginEntryRow, "submission_key">): AdminMarginEntry {
  return {
    id: row.id,
    targetType: row.target_type,
    targetKey: row.target_key,
    displayName: row.display_name,
    body: row.body,
    status: row.status,
    featured: row.featured,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
    publishedAt: row.published_at,
    moderatedBy: row.moderated_by,
    moderationNote: row.moderation_note,
  };
}

function databaseError(error: { code?: string; message: string }): MarginAdminRepositoryError {
  if (error.code === "P0002") return new MarginAdminRepositoryError("not_found", "Margin entry not found.");
  if (error.code === "40001") return new MarginAdminRepositoryError("conflict", "The entry changed. Refresh and try again.");
  return new MarginAdminRepositoryError("database", "Teff Studio could not complete the database operation.");
}

function client(authorization: AdminAuthorization) {
  try {
    return createSupabaseAdminClient(authorization);
  } catch {
    throw new MarginAdminRepositoryError("configuration", "Teff Studio database access is not configured.");
  }
}

export async function getMarginCounts(authorization: AdminAuthorization): Promise<MarginCounts> {
  const { data, error } = await client(authorization).rpc("admin_get_margin_counts");
  if (error) throw databaseError(error);
  return Object.fromEntries(MARGIN_STATUSES.map((status) => [status, Number(data?.[status] ?? 0)])) as MarginCounts;
}

export async function listMarginEntries(
  authorization: AdminAuthorization,
  input: { status: MarginStatus; page?: number; pageSize?: number; targetType?: MarginTargetType | null; targetKey?: string | null },
): Promise<MarginQueuePage> {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const pageSize = Math.min(50, Math.max(20, Math.trunc(input.pageSize ?? 25)));
  const targetKey = input.targetKey?.trim() || null;
  if (targetKey && targetKey.length > 200) throw new MarginAdminRepositoryError("validation", "Invalid target filter.");

  const { data, error } = await client(authorization).rpc("admin_list_margin_entries", {
    p_status: input.status,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
    p_target_type: input.targetType ?? null,
    p_target_key: targetKey,
  });
  if (error) throw databaseError(error);
  const rows = data ?? [];
  return {
    entries: rows.map(mapEntry),
    totalCount: Number(rows[0]?.total_count ?? 0),
    page,
    pageSize,
  };
}

export async function getMarginEntry(authorization: AdminAuthorization, id: string) {
  const { data, error } = await client(authorization).rpc("admin_get_margin_entry", { p_entry_id: validateId(id) });
  if (error) throw databaseError(error);
  if (!data?.[0]) throw new MarginAdminRepositoryError("not_found", "Margin entry not found.");
  return mapEntry(data[0]);
}

export async function getMarginHistory(authorization: AdminAuthorization, id: string): Promise<ModerationEvent[]> {
  const { data, error } = await client(authorization).rpc("admin_get_margin_history", { p_entry_id: validateId(id) });
  if (error) throw databaseError(error);
  return (data ?? []).map((row) => ({
    id: row.id,
    entryId: row.entry_id,
    action: row.action as ModerationActionDatabase,
    actor: row.actor,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

async function moderate(
  authorization: AdminAuthorization,
  id: string,
  targetStatus: MarginStatusDatabase,
  reason: string | null,
) {
  const { data, error } = await client(authorization).rpc("admin_moderate_margin_entry", {
    p_entry_id: validateId(id),
    p_target_status: targetStatus,
    p_actor: authorization.actorId,
    p_reason: validateReason(reason),
  });
  if (error) throw databaseError(error);
  if (!data?.[0]) throw new MarginAdminRepositoryError("not_found", "Margin entry not found.");
  return mapEntry(data[0]);
}

async function setFeatured(authorization: AdminAuthorization, id: string, featured: boolean, reason: string | null) {
  const { data, error } = await client(authorization).rpc("admin_set_margin_featured", {
    p_entry_id: validateId(id), p_featured: featured, p_actor: authorization.actorId, p_reason: validateReason(reason),
  });
  if (error) throw databaseError(error);
  if (!data?.[0]) throw new MarginAdminRepositoryError("not_found", "Margin entry not found.");
  return mapEntry(data[0]);
}

export const approveMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "approved", reason);
export const rejectMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "rejected", reason);
export const markMarginEntrySpam = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "spam", reason);
export const removeMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "removed", reason);
export const restoreApprovedMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "approved", reason);
export const returnMarginEntryToPending = (authorization: AdminAuthorization, id: string, reason: string | null) => moderate(authorization, id, "pending", reason);
export const featureMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => setFeatured(authorization, id, true, reason);
export const unfeatureMarginEntry = (authorization: AdminAuthorization, id: string, reason: string | null) => setFeatured(authorization, id, false, reason);
