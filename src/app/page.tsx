import Link from "next/link";
import { EditorialArtwork } from "@/components/foundation/EditorialArtwork";
import { EditorialCard } from "@/components/foundation/EditorialCard";
import { LibraryHero } from "@/components/foundation/LibraryHero";
import { MotionScope, MotionToggle } from "@/components/foundation/MotionScope";
import { CategoryLinks } from "@/components/papers/CategoryLinks";
import { publicationArtwork } from "@/lib/artwork";
import { getAllPapers } from "@/lib/papers";
import styles from "./editorial.module.css";

export default function Home() {
  const papers = getAllPapers();
  const [featured, ...rest] = papers;
  const recent = rest.slice(0, 3);

  return (
    <MotionScope>
        <section className={styles.homeHero} data-motion-scene aria-labelledby="home-title">
          <LibraryHero />
          <div className={styles.libraryScrim} aria-hidden="true" />
          <div className={styles.frame}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>The Teff Papers</p>
              <h1 id="home-title">Ideas deserve<br />a home.</h1>
              <p className={styles.heroSupport}>This is mine.</p>
              <p className={styles.heroDescription}>The permanent home for ideas before they become products.</p>
              <div className={styles.actions}>
                <a className={styles.primaryLink} href="#latest-papers">Begin Reading <span aria-hidden="true">↘</span></a>
                <Link className={styles.lineLink} href="/papers" prefetch={false}>Explore the papers <span aria-hidden="true">↗</span></Link>
                <MotionToggle />
              </div>
            </div>
          </div>
        </section>

      <section id="latest-papers" className={styles.section} aria-labelledby="feature-title">
        <div className={styles.frame} data-motion-reveal>
          <div className={styles.sectionTop}>
            <h2 id="feature-title">Featured paper</h2>
            <Link className={styles.lineLink} href="/papers">View the full archive <span aria-hidden="true">↗</span></Link>
          </div>
          {featured && <EditorialCard paper={featured} featured artworkEnd sizes="(max-width: 48rem) 92vw, 720px" artwork={{ fetchPriority: "low" }} />}
          {recent.length > 0 && (
            <div className={styles.recent}>
              <h2>Recent papers</h2>
              <div className={styles.gallery}>{recent.map((paper) => <EditorialCard key={paper.slug} paper={paper} artwork={{ fetchPriority: "low" }} />)}</div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.discovery} aria-labelledby="discovery-title">
        <div className={styles.frame + " " + styles.discoveryGrid} data-motion-reveal>
          <div>
            <p className={styles.kicker}>A public archive of clear thinking</p>
            <h2 id="discovery-title">Continuing lines of thought</h2>
            <p>The Teff Papers is a long-term public journal where I document my thinking across artificial intelligence, personal digital intelligence, automation, systems thinking, blockchain, faith, leadership, technology, and human behaviour.</p>
            <div className={styles.actions}>
              <Link className={styles.lineLink} href="/about">About The Teff Papers <span aria-hidden="true">↗</span></Link>
              <Link className={styles.lineLink} href="/projects">Explore the projects <span aria-hidden="true">↗</span></Link>
            </div>
            <details className={styles.discoveryNotes}>
              <summary>The work lives in the space where these things meet.</summary>
              <p>This is not a blog built for noise. It is where ideas are captured, refined, and preserved before they become products, companies, research, books, or something bigger.</p>
              <p>It is a body of work.</p>
              <p>The Teff Papers follows the connection between ideas that are often treated as separate.</p>
              <p>Artificial intelligence is not only about models. It is about judgement, trust, memory, creativity, work, and how humans relate to intelligent tools. Blockchain is not only about tokens. It is about coordination, incentives, ownership, infrastructure, and how value moves across systems. Faith is not separate from leadership, discipline, patience, character, or the way a person builds. Systems thinking is not only for business or technology. It applies to habits, families, teams, societies, products, and personal growth.</p>
              <p>Product Thinking · Future of Work</p>
              <p>The Teff Papers <em>explains why.</em><br />Fred+Teff <em>demonstrates what.</em><br />Fred Studio <em>develops how.</em></p>
              <p>The Papers are the thinking ground. Fred+Teff is one practical expression of that thinking, while Fred Studio is where some of those ideas may become more structured as products, systems, and future intelligent tools.</p>
              <p>The Teff Papers will always remain bigger than one product because it is the source of the thinking.</p>
            </details>
          </div>
          <CategoryLinks />
        </div>
      </section>

      <section className={styles.frontierBand} aria-labelledby="frontier-title">
        <EditorialArtwork className={styles.backdrop} image={{ ...publicationArtwork.frontier, sizes: "100vw" }} />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.frame} data-motion-reveal>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>A research series</p>
            <h2 id="frontier-title">The Frontier</h2>
            <p>Follow the inquiry into intelligence, judgement, and what emerges in the interaction between humans and machines.</p>
            <Link className={styles.lineLink} href="/categories/the-frontier">Explore The Frontier <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="manifesto-title">
        <div className={styles.frame + " " + styles.manifestoFeature} data-motion-reveal>
          <EditorialArtwork image={{ ...publicationArtwork.manifesto, sizes: "(max-width: 48rem) 92vw, 510px" }} />
          <div>
            <p className={styles.kicker}>The manifesto</p>
            <h2 id="manifesto-title">The objective is to build a body of work.</h2>
            <p>The objective is not to become a content creator.</p>
            <p>The Teff Papers exists because ideas need a place to mature before the world only sees the finished result. Some thoughts begin as small observations, questions, frustrations, or patterns, but when they are documented properly, they can become the foundation for something much bigger.</p>
            <Link className={styles.lineLink} href="/manifesto">Read the Manifesto <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
      <section className={styles.discovery} aria-labelledby="invitation-title">
        <div className={styles.frame + " " + styles.discoveryGrid}>
          <div>
            <p className={styles.kicker}>An open invitation</p>
            <h2 id="invitation-title">Start with the Manifesto, then follow the papers as the thinking develops.</h2>
            <Link className={styles.lineLink} href="/manifesto">Read the Manifesto <span aria-hidden="true">↗</span></Link>
          </div>
          <div>
            <p>Start with the latest papers and follow the ideas as they develop.</p>
            <p>Some pieces are reflections. Some are product notes. Some are systems thinking. Some are early signals of ideas that may later become products, companies, research, books, or something bigger.</p>
            <a className={styles.lineLink} href="#latest-papers">Latest papers <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </MotionScope>
  );
}
