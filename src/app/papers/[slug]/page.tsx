import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PublicMargin } from "@/components/margin/PublicMargin";
import { PaperMeta } from "@/components/papers/PaperMeta";
import { ReadingProgress } from "@/components/papers/ReadingProgress";
import { RelatedPapers } from "@/components/papers/RelatedPapers";
import { getAllPapers, getPaperBySlug, getRelatedPapers, renderMarkdown } from "@/lib/papers";

export function generateStaticParams() { return getAllPapers().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const paper = getPaperBySlug((await params).slug);
  if (!paper) return {};

  const canonicalPath = `/papers/${paper.slug}`;
  return {
    title: paper.title,
    description: paper.seoDescription ?? paper.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: paper.title,
      description: paper.seoDescription ?? paper.excerpt,
      type: "article",
      url: canonicalPath,
      publishedTime: `${paper.date}T00:00:00.000Z`,
      authors: [paper.author],
      tags: paper.tags,
    },
  };
}
export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const paper = getPaperBySlug((await params).slug);
  if (!paper) notFound();

  const content = await renderMarkdown(paper.content);
  const related = getRelatedPapers(paper);

  return (
    <>
      <ReadingProgress targetId="paper-reading-surface" />
      <PageContainer narrow className="paper-page">
        <Link className="back-link" href="/papers">← The Papers</Link>
        <article id="paper-reading-surface">
          <header className="paper-header">
            <PaperMeta paper={paper} />
            <h1>{paper.title}</h1>
            <p className={paper.supportingLine ? "paper-deck paper-supporting-line" : "paper-deck"}>
              {paper.supportingLine ?? paper.excerpt}
            </p>
            <ul className="tag-list" aria-label="Tags">
              {paper.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
        <PublicMargin slug={paper.slug} />
        <RelatedPapers papers={related} />
      </PageContainer>
    </>
  );
}
