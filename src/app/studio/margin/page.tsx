import Link from "next/link";
import { getAllPapers } from "@/lib/papers";
import { listMarginEntries } from "@/lib/margin/admin-repository";
import { MARGIN_STATUSES } from "@/lib/margin/constants";
import type { MarginStatus } from "@/lib/margin/types";
import { requireStudioAuthorization } from "@/lib/security/require-studio-authorization";
import { ModerationActions } from "@/components/studio/ModerationActions";

function statusFrom(value: string | undefined): MarginStatus {
  return MARGIN_STATUSES.includes(value as MarginStatus) ? value as MarginStatus : "pending";
}

export default async function StudioMarginPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; target?: string; error?: string }> }) {
  const authorization = await requireStudioAuthorization();
  const query = await searchParams;
  const status = statusFrom(query.status);
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const target = query.target?.trim() || null;
  const result = await listMarginEntries(authorization, { status, page, pageSize: 25, targetType: target ? "paper" : null, targetKey: target });
  const papers = new Map(getAllPapers().map((paper) => [paper.slug, paper.title]));
  const pageCount = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  return (
    <div className="studio-page">
      <div className="studio-title-row"><div><p className="eyebrow">Margin</p><h1>Moderation queue</h1><p>{result.totalCount} {status} contribution{result.totalCount === 1 ? "" : "s"}</p></div></div>
      {query.error === "operation" && <p className="studio-alert" role="alert">The moderation request was invalid or could not be completed.</p>}
      <nav className="studio-status-tabs" aria-label="Filter by status">
        {MARGIN_STATUSES.map((item) => <Link key={item} aria-current={item === status ? "page" : undefined} href={`/studio/margin?status=${item}`}>{item}</Link>)}
      </nav>
      <form className="studio-filter" method="get">
        <input type="hidden" name="status" value={status} />
        <label>Paper slug<input name="target" defaultValue={target ?? ""} maxLength={200} placeholder="All papers" /></label>
        <button type="submit">Apply filter</button>
      </form>
      <div className="studio-queue">
        {!result.entries.length && <p className="studio-empty">No contributions match this view.</p>}
        {result.entries.map((entry) => {
          const title = papers.get(entry.targetKey);
          return (
            <article className="studio-entry-card" key={entry.id}>
              <div className="studio-entry-meta"><span>{entry.status}</span><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("en-GB")}</time></div>
              <h2>{entry.displayName || "Anonymous reader"}</h2>
              <p className="studio-target">{title ?? `Paper unavailable (${entry.targetKey})`}</p>
              <p className="studio-entry-body">{entry.body}</p>
              <div className="studio-entry-links">
                <Link href={`/studio/margin/${entry.id}`}>View history</Link>
                {title ? <Link href={`/papers/${entry.targetKey}`} target="_blank">View paper</Link> : <span>Paper link unavailable</span>}
              </div>
              <ModerationActions entry={entry} />
            </article>
          );
        })}
      </div>
      {pageCount > 1 && <nav className="studio-pagination" aria-label="Queue pages">
        {page > 1 && <Link href={`/studio/margin?status=${status}&page=${page - 1}${target ? `&target=${encodeURIComponent(target)}` : ""}`}>Previous</Link>}
        <span>Page {page} of {pageCount}</span>
        {page < pageCount && <Link href={`/studio/margin?status=${status}&page=${page + 1}${target ? `&target=${encodeURIComponent(target)}` : ""}`}>Next</Link>}
      </nav>}
    </div>
  );
}
