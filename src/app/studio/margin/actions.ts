"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  approveMarginEntry,
  featureMarginEntry,
  markMarginEntrySpam,
  rejectMarginEntry,
  removeMarginEntry,
  restoreApprovedMarginEntry,
  returnMarginEntryToPending,
  unfeatureMarginEntry,
  type MarginAdminRepositoryError,
} from "@/lib/margin/admin-repository";
import { MARGIN_PUBLIC_CACHE_TAG } from "@/lib/margin/cache";
import { createAdminAuthorization } from "@/lib/security/admin-authorization";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function inputs(formData: FormData) {
  const id = formData.get("id");
  const reason = formData.get("reason");
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) throw new Error("Invalid moderation request.");
  if (typeof reason === "string" && reason.length > 2000) throw new Error("Invalid moderation reason.");
  return { id, reason: typeof reason === "string" ? reason : null };
}

function refreshStudio(id: string) {
  revalidatePath("/studio");
  revalidatePath("/studio/margin");
  revalidatePath(`/studio/margin/${id}`);
  revalidateTag(MARGIN_PUBLIC_CACHE_TAG);
}

async function execute(
  formData: FormData,
  operation: (authorization: Awaited<ReturnType<typeof createAdminAuthorization>>, id: string, reason: string | null) => Promise<unknown>,
) {
  const authorization = await createAdminAuthorization();
  let id = "";
  try {
    const input = inputs(formData);
    id = input.id;
    await operation(authorization, id, input.reason);
    refreshStudio(id);
  } catch (error) {
    const code = (error as MarginAdminRepositoryError).code;
    redirect(id
      ? `/studio/margin/${encodeURIComponent(id)}?error=${code === "conflict" ? "conflict" : "operation"}`
      : "/studio/margin?error=operation");
  }
}

export async function approveAction(formData: FormData) { await execute(formData, approveMarginEntry); }
export async function rejectAction(formData: FormData) { await execute(formData, rejectMarginEntry); }
export async function markSpamAction(formData: FormData) { await execute(formData, markMarginEntrySpam); }
export async function removeAction(formData: FormData) { await execute(formData, removeMarginEntry); }
export async function restoreApprovedAction(formData: FormData) { await execute(formData, restoreApprovedMarginEntry); }
export async function returnToPendingAction(formData: FormData) { await execute(formData, returnMarginEntryToPending); }
export async function featureAction(formData: FormData) { await execute(formData, featureMarginEntry); }
export async function unfeatureAction(formData: FormData) { await execute(formData, unfeatureMarginEntry); }
