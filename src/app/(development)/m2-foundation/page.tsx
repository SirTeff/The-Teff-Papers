import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCard } from "@/components/foundation/EditorialCard";
import { MotionScope, MotionToggle } from "@/components/foundation/MotionScope";
import { ResearchPath } from "@/components/foundation/ResearchPath";
import { getAllPapers, renderMarkdown } from "@/lib/papers";
import foundation from "@/components/foundation/foundation.module.css";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "M2 Design Foundations",
  robots: { index: false, follow: false },
};

const coreSlugs = [
  "the-frontier-may-exist-in-the-interaction",
  "when-the-machine-notices-first",
  "what-decides-what-matters",
];

// The accepted core sequence is only a demonstration fixture here. M4 owns the series data model.
export default async function FoundationDemo() {
  if (process.env.NODE_ENV !== "development") notFound();

  const papers = new Map(getAllPapers().map((paper) => [paper.slug, paper]));
  const core = coreSlugs.map((slug) => papers.get(slug));
  const [introduction, machine, matters] = core;

  if (!introduction || !machine || !matters) notFound();

  const readingSample = await renderMarkdown(introduction.content.trim().split(/\r?\n\s*\r?\n/)[0]);

  return (
    <MotionScope>
      <section className={styles.hero} aria-labelledby="foundation-title" data-motion-scene>
        <div className={styles.sky} aria-hidden="true">
          <div className={styles.lightSweep} data-ambient />
          <svg viewBox="0 0 820 540" className={styles.orbit} fill="none" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="foundation-orbit">
                <stop stopColor="#19323f" />
                <stop offset=".86" stopColor="#0c151a" />
                <stop offset="1" stopColor="#101c23" />
              </radialGradient>
              <linearGradient id="foundation-lines" x1="40" y1="450" x2="740" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8eafc5" stopOpacity=".08" />
                <stop offset=".5" stopColor="#8eafc5" stopOpacity=".85" />
                <stop offset="1" stopColor="#c3ad73" stopOpacity=".12" />
              </linearGradient>
            </defs>
            <circle cx="543" cy="247" r="154" fill="url(#foundation-orbit)" stroke="#8eafc5" strokeOpacity=".55" />
            <circle cx="543" cy="247" r="201" stroke="#8eafc5" strokeOpacity=".23" strokeDasharray="2 7" />
            <circle cx="543" cy="247" r="221" stroke="#8eafc5" strokeOpacity=".12" />
            <g transform="rotate(-24 543 247)" stroke="url(#foundation-lines)">
              <ellipse cx="543" cy="247" rx="299" ry="80" />
              <ellipse cx="543" cy="247" rx="337" ry="112" />
              <ellipse cx="543" cy="247" rx="369" ry="135" strokeDasharray="1 5" />
              <ellipse cx="543" cy="247" rx="410" ry="168" opacity=".35" />
            </g>
            {Array.from({ length: 12 }, (_, index) => (
              <path
                key={index}
                d="M5 476C207 499 276 377 422 358S640 370 830 221"
                transform={"translate(0 " + (index * 9 - 43) + ")"}
                stroke="url(#foundation-lines)"
                strokeDasharray={index % 2 ? "1 5" : undefined}
                opacity={.74 - index * .035}
              />
            ))}
            <circle cx="428" cy="358" r="5" fill="#c3ad73" />
            <circle cx="428" cy="358" r="12" stroke="#c3ad73" strokeOpacity=".65" />
            <circle cx="663" cy="138" r="3" fill="#f2efe6" />
          </svg>
        </div>
        <div className={styles.frame}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>The Teff Papers V2</p>
            <h1 id="foundation-title">Editorial<br />foundations</h1>
            <p className={styles.lead}>Atmosphere for discovery. A steady page for reading.</p>
            <div className={styles.actions}>
              <a className={foundation.control} href="#editorial-cards">View components <span aria-hidden="true">↓</span></a>
              <MotionToggle />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.frame}>
        <section className={styles.section} id="editorial-cards" aria-labelledby="card-heading">
          <h2 id="card-heading">Editorial cards</h2>
          <div className={styles.cards}>
            <div className={styles.feature}>
              <EditorialCard paper={matters} artwork={{ tone: "mixed", wide: true }} featured />
            </div>
            <EditorialCard paper={introduction} artwork={{ tone: "cool" }} />
            <EditorialCard paper={machine} artwork={{ tone: "warm" }} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="research-heading" data-motion-scene>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>The Frontier</p>
              <h2 id="research-heading">Research connections</h2>
            </div>
            <MotionToggle />
          </div>
          <div className={styles.researchPanel}>
            <ResearchPath steps={[introduction, machine, matters].map(({ slug, title }) => ({
              href: "/papers/" + slug,
              title,
            }))} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="reading-heading">
          <p className={styles.kicker}>Reading typography</p>
          <h2 id="reading-heading">{introduction.title}</h2>
          <div className={styles.reading}>
            <div dangerouslySetInnerHTML={{ __html: readingSample }} />
            <a href={"/papers/" + introduction.slug}>Read the full paper <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </div>
    </MotionScope>
  );
}
