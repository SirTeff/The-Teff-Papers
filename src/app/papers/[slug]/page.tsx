import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialScene } from "@/components/foundation/EditorialScene";
import { FrontierRoom } from "@/components/foundation/FrontierRoom";
import { MotionScope, MotionToggle } from "@/components/foundation/MotionScope";
import { PublicMargin } from "@/components/margin/PublicMargin";
import { PaperMeta } from "@/components/papers/PaperMeta";
import { PaperGuide } from "@/components/papers/PaperGuide";
import { ReadingProgress } from "@/components/papers/ReadingProgress";
import { RelatedPapers } from "@/components/papers/RelatedPapers";
import { ResearchJourney } from "@/components/papers/ResearchJourney";
import { getOpeningPanorama } from "@/lib/panoramas";
import { getPaperArtwork } from "@/lib/artwork";
import { getFrontierMotion } from "@/lib/frontier-motion";
import { getPaperGuide } from "@/lib/paper-guides";
import { getAllPapers, getPaperBySlug, renderMarkdown } from "@/lib/papers";
import { getPaperConnections, getResearchJourneys } from "@/lib/research";
import styles from "../../editorial.module.css";

import openingStyles from "./opening.module.css";

export const revalidate = 300;

export function generateStaticParams() { return getAllPapers().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const paper = getPaperBySlug((await params).slug);
  if (!paper) return {};

  const canonicalPath = `/papers/${paper.slug}`;
  const art = getPaperArtwork(paper.slug);
  const social = art?.social ?? art;
  const description = paper.seoDescription ?? paper.excerpt;
  const images = social ? [{ url: social.src, width: social.width, height: social.height, alt: social.alt }] : undefined;
  return {
    title: paper.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: paper.title,
      description,
      type: "article",
      url: canonicalPath,
      publishedTime: `${paper.date}T00:00:00.000Z`,
      authors: [paper.author],
      tags: paper.tags,
      images,
    },
    ...(images && { twitter: { card: "summary_large_image", title: paper.title, description, images } }),
  };
}
export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const papers = getAllPapers();
  const paper = papers.find((item) => item.slug === slug);
  if (!paper) notFound();

  const guide = getPaperGuide(slug);
  const anchored = new Set<string>();
  const content = await renderMarkdown(paper.content, guide, anchored);
  const connections = getPaperConnections(slug, papers);
  const journeys = getResearchJourneys(papers).filter(({ steps }) => steps.some(({ paper }) => paper.slug === slug));
  const art = getPaperArtwork(paper.slug);
  const panorama = getOpeningPanorama(slug);
  const image = panorama ? { ...panorama, sizes: "100vw" } : art && { ...art, sizes: "100vw" };
  const inFrontier = paper.category === "The Frontier";
  const frontierMotion = inFrontier && art ? getFrontierMotion(paper.slug) : undefined;
  const hasLayers = !frontierMotion && Boolean(art?.layers?.background || art?.layers?.foreground);
  const hasMotion = hasLayers || Boolean(frontierMotion);
  const opening = (
    <header
      className={openingStyles.opening}
      data-motion-scene={hasMotion || undefined}
      data-backdrop-tone={panorama ? "panorama" : art?.backdropTone}
      data-collection={paper.category}
      data-room={Boolean(frontierMotion) || undefined}
    >
      {frontierMotion ? (
        <FrontierRoom artwork={art} motion={frontierMotion} />
      ) : (
        <EditorialScene className={openingStyles.scene} image={image} />
      )}
      <div className={openingStyles.light} aria-hidden="true" />
      <div className={openingStyles.frame}>
        <div>
          <Link className={styles.returnLink} href="/papers">← The Papers</Link>
          <div className={openingStyles.copy}>
            {paper.paperType && <p className={styles.kicker}>{paper.paperType}</p>}
            <h1>{paper.title}</h1>
            <p className={styles.paperDeck}>{paper.supportingLine ?? paper.excerpt}</p>
            <div className={styles.byline}>
              <span>By {paper.author}</span>
              <PaperMeta paper={paper} />
            </div>
            {hasMotion && <div className={styles.paperMotionControl}><MotionToggle /></div>}
          </div>
        </div>

      </div>
    </header>
  );

  return (
    <>
      <ReadingProgress targetId="paper-reading-surface" />
      <article>
        {hasMotion ? <MotionScope>{opening}</MotionScope> : opening}
        <div className={styles.frame + " " + styles.readingGrid}>
          {(guide.length > 0 || journeys.length > 0 || paper.tags.length > 0 || art) && (
            <aside className={styles.readingAside} aria-label="Paper context">
              <PaperGuide points={guide} anchored={anchored} />
              {journeys.map((journey) => (
                <a key={journey.id} className={styles.lineLink} href={`#research-${journey.id}`}>Research journey · {journey.title}</a>
              ))}
              {paper.tags.length > 0 && (
                <div>
                  <p className={styles.kicker}>Themes</p>
                  <ul className="tag-list" aria-label="Tags">
                    {paper.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              )}
              {art && <p className={styles.credit}>{art.status === "provisional" ? "Provisional artwork by " : "Artwork by "}{art.credit}</p>}
            </aside>
          )}
          <div id="paper-reading-surface" className={"prose " + styles.readingBody} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </article>
      <div className={styles.frame + " " + styles.readingFooter}>
        <div className={styles.margin}><PublicMargin slug={paper.slug} /></div>
        <RelatedPapers connections={connections} />
        {journeys.map((journey) => <ResearchJourney key={journey.id} journey={journey} current={slug} />)}
      </div>
    </>
  );
}
