import "server-only";
import { features } from "@/lib/config/features";
import { MarginConfigurationError } from "@/lib/database/environment";
import { createSupabaseServerClient } from "@/lib/database/supabase-server";
import type { PublicMarginEntryRow } from "@/lib/database/types";
import type { MarginReadResult, MarginSettings, MarginTargetType, PublicMarginEntry } from "./types";

function mapPublicEntry(entry: PublicMarginEntryRow): PublicMarginEntry {
  return {
    id: entry.id,
    targetType: entry.target_type,
    targetKey: entry.target_key,
    displayName: entry.display_name,
    body: entry.body,
    createdAt: entry.created_at,
    publishedAt: entry.published_at,
    featured: entry.featured,
  };
}

function reportReadFailure(operation: string, targetType: MarginTargetType, targetKey: string, error: unknown) {
  console.error(`[margin] ${operation} failed`, {
    targetType,
    targetKey,
    error: error instanceof Error ? error.message : "Unknown database error",
  });
}

function unavailableResult<T>(data: T, error: unknown): MarginReadResult<T> {
  return {
    state: "unavailable",
    data,
    error: error instanceof MarginConfigurationError ? "configuration" : "database",
  };
}

export async function getApprovedMarginEntries(
  targetType: MarginTargetType,
  targetKey: string,
): Promise<MarginReadResult<PublicMarginEntry[]>> {
  if (!features.marginEnabled) return { state: "disabled", data: [] };

  try {
    const client = createSupabaseServerClient();
    if (!client) return { state: "disabled", data: [] };

    const { data, error } = await client.rpc("get_public_margin_entries", {
      p_target_type: targetType,
      p_target_key: targetKey,
    });
    if (error) throw error;

    return { state: "ready", data: (data ?? []).map(mapPublicEntry) };
  } catch (error) {
    reportReadFailure("approved entry read", targetType, targetKey, error);
    return unavailableResult([], error);
  }
}

export async function getMarginSettings(
  targetType: MarginTargetType,
  targetKey: string,
): Promise<MarginReadResult<MarginSettings>> {
  const fallback = { targetType, targetKey, isOpen: false };
  if (!features.marginEnabled) return { state: "disabled", data: fallback };

  try {
    const client = createSupabaseServerClient();
    if (!client) return { state: "disabled", data: fallback };

    const { data, error } = await client.rpc("get_public_margin_setting", {
      p_target_type: targetType,
      p_target_key: targetKey,
    });
    if (error) throw error;

    return { state: "ready", data: { targetType, targetKey, isOpen: data === true } };
  } catch (error) {
    reportReadFailure("settings read", targetType, targetKey, error);
    return unavailableResult(fallback, error);
  }
}
