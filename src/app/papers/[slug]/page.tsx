import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaperMeta } from "@/components/papers/PaperMeta";
import { RelatedPapers } from "@/components/papers/RelatedPapers";
import { getAllPapers, getPaperBySlug, renderMarkdown } from "@/lib/papers";

export function generateStaticParams() { return getAllPapers().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const paper = getPaperBySlug((await params).slug);
  if (!paper) return {};

  const canonicalPath = `/papers/${paper.slug}`;
  return {
    title: paper.title,
    description: paper.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: paper.title,
      description: paper.excerpt,
      type: "article",
      url: canonicalPath,
      publishedTime: `${paper.date}T00:00:00.000Z`,
      authors: [paper.author],
      tags: paper.tags,
    },
  };
}
export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) { const paper = getPaperBySlug((await params).slug); if (!paper) notFound(); const content = await renderMarkdown(paper.content); const related = getAllPapers().filter((item) => item.slug !== paper.slug && (item.category === paper.category || item.tags.some((tag) => paper.tags.includes(tag)))).slice(0, 2); return <PageContainer narrow className="paper-page"><Link className="back-link" href="/papers">← The Papers</Link><article><header className="paper-header"><PaperMeta paper={paper} /><h1>{paper.title}</h1><p className="paper-deck">{paper.excerpt}</p><ul className="tag-list" aria-label="Tags">{paper.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></header><div className="prose" dangerouslySetInnerHTML={{ __html: content }} /><footer className="paper-signature"><p>— {paper.author}</p>{paper.version && <p>Version {paper.version}</p>}</footer></article><RelatedPapers papers={related} /></PageContainer>; }
