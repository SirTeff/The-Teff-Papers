import "server-only";
import { unstable_cache } from "next/cache";
import { features } from "@/lib/config/features";
import { getApprovedMarginEntries } from "./repository";
import { MARGIN_PUBLIC_CACHE_TAG } from "./cache";
import type { MarginReadResult, MarginTargetType, PublicMarginEntry } from "./types";

class PublicMarginReadUnavailableError extends Error {
  constructor(readonly reason: "configuration" | "database") {
    super("Public Margin read is unavailable.");
    this.name = "PublicMarginReadUnavailableError";
  }
}

const readCachedApprovedMarginEntries = unstable_cache(
  async (targetType: MarginTargetType, targetKey: string) => {
    const result = await getApprovedMarginEntries(targetType, targetKey);

    if (result.state !== "ready") {
      throw new PublicMarginReadUnavailableError(
        result.state === "unavailable" ? result.error : "configuration",
      );
    }

    return result.data;
  },
  ["approved-margin-entries"],
  { tags: [MARGIN_PUBLIC_CACHE_TAG] },
);

export async function getCachedApprovedMarginEntries(
  targetType: MarginTargetType,
  targetKey: string,
): Promise<MarginReadResult<PublicMarginEntry[]>> {
  if (!features.marginEnabled) return { state: "disabled", data: [] };

  try {
    return { state: "ready", data: await readCachedApprovedMarginEntries(targetType, targetKey) };
  } catch (error) {
    if (!(error instanceof PublicMarginReadUnavailableError)) {
      console.error("[margin] cached approved entry read failed", { targetType, targetKey });
    }

    return {
      state: "unavailable",
      data: [],
      error: error instanceof PublicMarginReadUnavailableError ? error.reason : "database",
    };
  }
}
