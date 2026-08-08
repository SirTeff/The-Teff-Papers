import Link from "next/link";
import { getPaperBySlug } from "@/lib/papers";
import { getMarginEntry, getMarginHistory } from "@/lib/margin/admin-repository";
import { requireStudioAuthorization } from "@/lib/security/require-studio-authorization";
import { ModerationActions } from "@/components/studio/ModerationActions";

const errorMessages = {
  conflict: "This contribution changed before the action completed. Review its current state and try again.",
  operation: "The moderation action could not be completed.",
} as const;

export default async function StudioMarginEntryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const authorization = await requireStudioAuthorization();
  const { id } = await params;
  const [entry, history] = await Promise.all([getMarginEntry(authorization, id), getMarginHistory(authorization, id)]);
  const paper = getPaperBySlug(entry.targetKey);
  const error = (await searchParams).error as keyof typeof errorMessages | undefined;

  return (
    <div className="studio-page studio-detail">
      <Link href={`/studio/margin?status=${entry.status}`} className="studio-back-link">← Back to {entry.status}</Link>
      <div className="studio-title-row"><div><p className="eyebrow">Margin contribution</p><h1>{entry.displayName || "Anonymous reader"}</h1><p>{paper?.title ?? `Paper unavailable (${entry.targetKey})`}</p></div></div>
      {error && errorMessages[error] && <p className="studio-alert" role="alert">{errorMessages[error]}</p>}
      <section className="studio-detail-card" aria-labelledby="contribution-title">
        <div className="studio-entry-meta"><span>{entry.status}{entry.featured ? " · featured" : ""}</span><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("en-GB")}</time></div>
        <h2 id="contribution-title">Contribution</h2>
        <p className="studio-entry-body">{entry.body}</p>
        {paper ? <Link href={`/papers/${entry.targetKey}`} target="_blank">View paper</Link> : <p>Paper link unavailable.</p>}
        <ModerationActions entry={entry} />
      </section>
      <section className="studio-history" aria-labelledby="history-title">
        <h2 id="history-title">Moderation history</h2>
        {!history.length && <p>No moderation events yet.</p>}
        <ol>{history.map((event) => <li key={event.id}><strong>{event.action.replace("_", " ")}</strong><time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString("en-GB")}</time><span>Actor {event.actor}</span>{event.reason && <p>{event.reason}</p>}</li>)}</ol>
      </section>
    </div>
  );
}
