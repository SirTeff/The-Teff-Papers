import type { AdminMarginEntry } from "@/lib/margin/types";
import {
  approveAction,
  featureAction,
  markSpamAction,
  rejectAction,
  removeAction,
  restoreApprovedAction,
  returnToPendingAction,
  unfeatureAction,
} from "@/app/studio/margin/actions";

const submitLabels = {
  approve: "Approve",
  reject: "Reject",
  spam: "Mark spam",
  remove: "Remove",
  restore: "Restore approved",
  pending: "Return to pending",
  feature: "Feature",
  unfeature: "Unfeature",
} as const;

function ActionForm({ entry, action, label }: { entry: AdminMarginEntry; action: (data: FormData) => Promise<void>; label: keyof typeof submitLabels }) {
  return (
    <form action={action} className="studio-action-form">
      <input type="hidden" name="id" value={entry.id} />
      <label>
        <span className="sr-only">Optional moderation reason for {submitLabels[label]}</span>
        <input name="reason" maxLength={2000} placeholder="Optional reason" />
      </label>
      <button type="submit">{submitLabels[label]}</button>
    </form>
  );
}

export function ModerationActions({ entry }: { entry: AdminMarginEntry }) {
  return (
    <div className="studio-actions" aria-label="Moderation actions">
      {entry.status === "pending" && <>
        <ActionForm entry={entry} action={approveAction} label="approve" />
        <ActionForm entry={entry} action={rejectAction} label="reject" />
        <ActionForm entry={entry} action={markSpamAction} label="spam" />
      </>}
      {entry.status === "approved" && <>
        <ActionForm entry={entry} action={removeAction} label="remove" />
        <ActionForm entry={entry} action={entry.featured ? unfeatureAction : featureAction} label={entry.featured ? "unfeature" : "feature"} />
      </>}
      {entry.status === "removed" && <ActionForm entry={entry} action={restoreApprovedAction} label="restore" />}
      {(entry.status === "rejected" || entry.status === "spam") && <ActionForm entry={entry} action={returnToPendingAction} label="pending" />}
    </div>
  );
}
