import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaperCard } from "@/components/papers/PaperCard";
import { getAllPaperCategories, getCategoryBySlug, getCategorySlug, getPapersByCategory } from "@/lib/papers";

export function generateStaticParams() {
  return getAllPaperCategories().map((category) => ({ category: getCategorySlug(category) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const category = getCategoryBySlug((await params).category);
  if (!category) return {};

  const canonicalPath = `/categories/${getCategorySlug(category)}`;
  return {
    title: `${category} Papers`,
    description: `Papers filed under ${category} in The Teff Papers archive.`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${category} Papers`,
      description: `Papers filed under ${category} in The Teff Papers archive.`,
      url: canonicalPath,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategoryBySlug((await params).category);
  if (!category) notFound();

  const papers = getPapersByCategory(category);
  return (
    <PageContainer className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">Category</p>
        <h1>{category}</h1>
        <p>Papers filed under {category}.</p>
      </header>
      <div className="paper-list">
        {papers.map((paper) => <PaperCard key={paper.slug} paper={paper} />)}
      </div>
    </PageContainer>
  );
}
