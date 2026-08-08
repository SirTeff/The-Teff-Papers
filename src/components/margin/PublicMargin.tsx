import { features } from "@/lib/config/features";
import { getCachedApprovedMarginEntries } from "@/lib/margin/public-cache";
import { getMarginSettings } from "@/lib/margin/repository";
import { MarginSubmissionForm } from "./MarginSubmissionForm";

const marginDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export async function PublicMargin({ slug }: { slug: string }) {
  const [result, setting] = await Promise.all([
    getCachedApprovedMarginEntries("paper", slug),
    features.marginSubmissionsEnabled ? getMarginSettings("paper", slug) : Promise.resolve(null),
  ]);
  if (result.state !== "ready") return null;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const showSubmissionForm = Boolean(
    features.marginSubmissionsEnabled
    && setting?.state === "ready"
    && setting.data.isOpen
    && turnstileSiteKey,
  );

  return (
    <section className="public-margin" aria-labelledby="public-margin-heading">
      <header className="public-margin-heading">
        <p className="eyebrow">The Margin</p>
        <h2 id="public-margin-heading">Reader notes</h2>
        <p>Moderated reader contributions that extend, question, or respond to this paper.</p>
      </header>

      {result.data.length === 0 ? (
        <p className="public-margin-empty">No reader notes have been published here yet.</p>
      ) : (
        <div className="public-margin-entries">
          {result.data.map((entry) => {
            const publishedAt = entry.publishedAt ?? entry.createdAt;
            return (
              <article className="public-margin-entry" key={entry.id}>
                <header className="public-margin-entry-header">
                  <h3>{entry.displayName ?? "Anonymous reader"}</h3>
                  <div className="public-margin-entry-meta">
                    {entry.featured && <span className="public-margin-featured">Featured</span>}
                    <time dateTime={publishedAt}>{marginDateFormatter.format(new Date(publishedAt))}</time>
                  </div>
                </header>
                <p className="public-margin-body">{entry.body}</p>
              </article>
            );
          })}
        </div>
      )}
      {showSubmissionForm && turnstileSiteKey && <MarginSubmissionForm slug={slug} siteKey={turnstileSiteKey} />}
    </section>
  );
}
