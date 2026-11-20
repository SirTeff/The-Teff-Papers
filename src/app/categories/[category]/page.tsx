import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialArtwork } from "@/components/foundation/EditorialArtwork";
import { ArchiveGallery } from "@/components/papers/ArchiveGallery";
import { CategoryLinks } from "@/components/papers/CategoryLinks";
import { ResearchJourney } from "@/components/papers/ResearchJourney";
import { getAllPaperCategories, getAllPapers, getCategoryBySlug, getCategorySlug } from "@/lib/papers";
import { getCollectionOpening } from "@/lib/panoramas";
import { getResearchJourneys } from "@/lib/research";
import styles from "../../editorial.module.css";

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

  const allPapers = getAllPapers();
  const papers = allPapers.filter((paper) => paper.category === category);
  const journeys = getResearchJourneys(allPapers).filter((journey) => journey.category === category && journey.steps.length);
  const { image: wingArtwork, introduction } = getCollectionOpening(category);
  const heading = (
    <>
      <p className={styles.kicker}>{journeys.length ? "Research wing" : "Collection"}</p>
      <h1>{category}</h1>
      <p>{introduction}</p>
      {journeys.length > 0 && (
        <nav className={styles.archiveJumps} aria-label="Category navigation">
          {journeys.map((journey) => <a key={journey.id} href={`#research-${journey.id}`}>Follow the research journey</a>)}
          <a href="#category-papers">Browse {papers.length} {papers.length === 1 ? "paper" : "papers"}</a>
        </nav>
      )}
    </>
  );
  return (
    <div className={styles.collection} data-collection={category}>
      <header className={wingArtwork ? styles.wingOpening : styles.archiveHeader}>
        {wingArtwork && <EditorialArtwork className={styles.wingBackdrop} image={{ ...wingArtwork, sizes: "100vw" }} eager />}
        <div className={styles.frame}><div className={styles.wingCopy}>{heading}</div></div>
      </header>
      <div className={styles.frame}>
        <div className={styles.collectionNav}><CategoryLinks current={category} includeAll /></div>
        <details className={styles.collectionMenu}>
          <summary>Browse collections</summary>
          <CategoryLinks current={category} includeAll />
        </details>
        {journeys.map((journey) => <ResearchJourney key={journey.id} journey={journey} />)}
        <section id="category-papers" aria-label={`${category} papers`}><ArchiveGallery papers={papers} /></section>
      </div>
    </div>
  );
}
