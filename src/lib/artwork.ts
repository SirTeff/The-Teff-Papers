import m5pDescriptions from "./m5p-artwork.json" with { type: "json" };
import m5Artwork from "./m5-artwork-register.json" with { type: "json" };
import m5rReadingArtwork from "./m5r-reading-artwork-register.json" with { type: "json" };

export type ArtworkSource = {
  src: `/artwork/${string}`;
  width: number;
  height: number;
  focalPoint: string;
  mobile?: Omit<ArtworkSource, "mobile"> & { preoptimized?: boolean };
};

export type ArtworkLayers = {
  background?: ArtworkSource;
  foreground?: ArtworkSource;
};

export type ArtworkRecord = ArtworkSource & {
  alt: string;
  layers?: ArtworkLayers;
  card?: ArtworkSource;
  social?: { src: ArtworkSource["src"]; width: number; height: number; alt: string };
  credit: string;
  provenance: string;
  status: "provisional" | "approved";
  backdropTone?: "bright";
};

function original(slug: string, alt: string, focalPoint = "65% 50%", mobile = false): ArtworkRecord {
  return {
    src: `/artwork/${slug}.webp`,
    width: 1600,
    height: 840,
    alt,
    focalPoint,
    mobile: mobile ? {
      src: `/artwork/${slug}-mobile.webp`,
      width: 756,
      height: 900,
      focalPoint: "50% 52%",
    } : undefined,
    credit: "The Teff Papers",
    provenance: "Original local procedural illustration. No external source asset.",
    status: "provisional",
  };
}

function frontierRoom(slug: string, alt: string): ArtworkRecord {
  return {
    src: `/artwork/frontier/${slug}.webp`,
    width: 1440,
    height: 810,
    focalPoint: "50% 50%",
    social: { src: `/artwork/frontier/${slug}-social.webp`, width: 1200, height: 630, alt },
    alt,
    credit: "The Teff Papers",
    provenance: "Standalone composition from the owner-supplied Frontier M3-R creative handoff, 18 November 2026.",
    status: "approved",
  };
}

function priorityArtwork(slug: string, alt: string, focalPoint: string): ArtworkRecord {
  const base = `/artwork/priority/${slug}` as const;
  return {
    src: `${base}.webp`,
    width: 1600,
    height: 900,
    focalPoint,
    card: { src: `${base}-card.webp`, width: 1200, height: 675, focalPoint },
    social: { src: `${base}-social.webp`, width: 1200, height: 630, alt },
    alt,
    credit: "The Teff Papers",
    provenance: "Original AI-generated artwork supplied in the M5-R priority handoff on 19 November 2026. Native 1672 × 941 source retained.",
    status: "provisional",
  };
}

const governanceSlug = "the-frontier-asks-to-slow-down-who-holds-the-brakes";
const supplied = new Map(m5Artwork.map((entry) => [entry.slug, entry]));
const brightOpenings = new Set([
  "beyond-correctness",
  "small-systems-decide-big-outcomes",
  "the-decisions-that-rarely-stay-small",
  "the-system-did-exactly-what-it-believed-success-required",
  "when-the-environment-can-no-longer-support-the-goal",
]);

function readingArtwork(entry: (typeof m5rReadingArtwork)[number]): ArtworkRecord {
  function variant(role: keyof typeof entry.variants): ArtworkSource {
    const { file, width, height } = entry.variants[role];
    return { src: `/artwork/reading-v1/${file.slice("artwork/".length)}`, width, height, focalPoint: entry.focal_point };
  }

  return {
    ...variant("reading"),
    card: variant("card"),
    social: { ...variant("social"), alt: entry.alt },
    alt: entry.alt,
    credit: entry.credit,
    provenance: entry.provenance,
    status: "provisional",
    backdropTone: brightOpenings.has(entry.slug) ? "bright" : undefined,
  };
}

function suppliedCard(entry: (typeof m5Artwork)[number]): ArtworkSource {
  return { src: `/artwork/${entry.file}`, width: entry.width, height: entry.height, focalPoint: entry.focal_point };
}

function suppliedReadingArtwork(slug: string): ArtworkRecord {
  const entry = supplied.get(slug);
  if (!entry) throw new Error(`Missing supplied artwork for ${slug}`);
  return {
    ...suppliedCard(entry),
    alt: entry.alt,
    social: { src: `/artwork/cards/${slug}-social.webp`, width: 1200, height: 630, alt: entry.alt },
    credit: entry.credit,
    provenance: entry.provenance,
    status: "provisional",
  };
}

const governance = supplied.get(governanceSlug);
if (!governance) throw new Error("Missing supplied Frontier governance artwork");

function galleryPrint(slug: string, alt: string): ArtworkRecord {
  const base = `/artwork/m5-p/${slug}` as const;
  const previewBase = slug === "the-singularity-may-become-personal-before-it-becomes-strange" ? "/artwork/panoramas/singularity" : base;
  const focalPoint = "50% 50%";
  return {
    src: `${base}-reading.webp`, width: 1600, height: 900, focalPoint, alt,
    card: { src: `${previewBase}-card.webp`, width: 1200, height: 675, focalPoint },
    social: { src: `${previewBase}-social.webp`, width: 1200, height: 630, alt },
    credit: "The Teff Papers",
    provenance: "Original AI-generated editorial illustration commissioned for M5-P. Native master retained in milestone evidence.",
    status: "provisional",
    backdropTone: "bright",
  };
}

const paperArtwork: Readonly<Record<string, ArtworkRecord | undefined>> = {
  ...Object.fromEntries(m5rReadingArtwork.map((entry) => [entry.slug, readingArtwork(entry)])),
  ...Object.fromEntries(Object.entries(m5pDescriptions).map(([slug, alt]) => [slug, galleryPrint(slug, alt)])),
  "the-frontier-may-exist-in-the-interaction": frontierRoom("the-frontier-may-exist-in-the-interaction", "A researcher and a luminous figure face each other across a research table under a suspended globe in an amber-lit library."),
  "when-the-machine-notices-first": frontierRoom("when-the-machine-notices-first", "A luminous figure points to a signal in a glass chamber as a researcher looks on beside a small globe."),
  "what-decides-what-matters": frontierRoom("what-decides-what-matters", "A researcher and a luminous figure reach toward a shared globe encircled by blue and amber paths."),
  "when-the-answer-arrives-before-understanding": {
    src: "/artwork/panoramas/frontier.webp",
    width: 1920,
    height: 640,
    focalPoint: "61% 50%",
    mobile: { src: "/artwork/panoramas/frontier-mobile.webp", width: 960, height: 540, focalPoint: "50% 50%" },
    card: { src: "/artwork/frontier/answer-before-understanding-card.webp", width: 1120, height: 630, focalPoint: "50% 50%" },
    social: { src: "/artwork/frontier/answer-before-understanding-social.webp", width: 1200, height: 630, alt: "A researcher and luminous figure sit across a table beneath a brass celestial globe." },
    alt: "A shadowed library arcade opens onto a researcher and a luminous counterpart seated beneath a brass celestial globe.",
    credit: "The Teff Papers",
    provenance: "Existing approved Frontier collection illustration, with archive and social crops derived from its desktop panorama.",
    status: "approved",
  },
  "the-discipline-that-protects-freedom": priorityArtwork("the-discipline-that-protects-freedom", "A lone walker follows a stone-walled mountain path overlooking a vast valley at sunrise.", "65% 53%"),
  [governanceSlug]: {
    ...frontierRoom(governanceSlug, governance.alt),
    mobile: { src: `/artwork/frontier/${governanceSlug}-mobile-reading.webp`, preoptimized: true, width: 768, height: 432, focalPoint: "50% 50%" },
    credit: governance.credit,
    provenance: governance.provenance,
    status: "provisional",
  },
  "building-before-you-understand-is-expensive": suppliedReadingArtwork("building-before-you-understand-is-expensive"),
  "why-ai-needs-human-curiosity": suppliedReadingArtwork("why-ai-needs-human-curiosity"),
  "sandbox-cant-hold-us-down": priorityArtwork("sandbox-cant-hold-us-down", "A blue neural network inside an intact glass containment cube meets an amber signal at its boundary.", "48% 48%"),
};

export function getPaperArtwork(slug: string) {
  return Object.hasOwn(paperArtwork, slug) ? paperArtwork[slug] : undefined;
}

export function getPaperCardArtwork(slug: string): ArtworkSource | undefined {
  const record = getPaperArtwork(slug);
  if (record?.card) return record.card;
  const entry = supplied.get(slug);
  if (entry && slug !== governanceSlug) return suppliedCard(entry);
  if (!record) return;
  const { src, width, height, focalPoint } = record;
  return { src, width, height, focalPoint };
}

export const publicationArtwork = {
  home: {
    src: "/artwork/homepage-library.webp",
    width: 1672,
    height: 941,
    focalPoint: "50% 50%",
    mobile: { src: "/artwork/m5-p/library-mobile.webp", width: 756, height: 835, focalPoint: "50% 50%", preoptimized: true },
    alt: "Open stone doors reveal an amber-lit library, bookshelves, a spiral stair and a globe beneath a blue skylight.",
    credit: "The Teff Papers",
    provenance: "Created in ChatGPT for The Teff Papers and supplied and approved by the owner on 18 November 2026.",
    status: "approved",
  } satisfies ArtworkRecord,
  frontier: {
    ...frontierRoom("the-frontier-may-exist-in-the-interaction", "A researcher and a luminous figure face one another in a library research wing."),
    focalPoint: "65% 51%",
  },
  manifesto: original("manifesto", "Warm light catches the layered edges of an open book.", "53% 66%"),
};
