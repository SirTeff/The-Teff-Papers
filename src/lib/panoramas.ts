import { getPaperArtwork, type ArtworkSource } from "./artwork";

type Panorama = ArtworkSource & { alt: string };

function panorama(name: string, alt: string): Panorama {
  return {
    src: `/artwork/panoramas/${name}.webp`,
    width: 1920,
    height: 640,
    focalPoint: "61% 50%",
    mobile: {
      src: `/artwork/panoramas/${name}-mobile.webp`,
      width: 960,
      height: 540,
      focalPoint: "50% 50%",
    },
    alt,
  };
}

export const frontierPanorama = panorama("frontier", "A shadowed library arcade opens onto a researcher and a luminous counterpart seated beneath a brass celestial globe.");

const openings: Readonly<Record<string, Panorama>> = {
  "when-the-answer-arrives-before-understanding": frontierPanorama,
  "why-approval-comes-before-automation": panorama("approval", "A printer checks a marked proof beside the inked type and the press lever."),
  "what-becomes-scarce-when-intelligence-becomes-abundant": panorama("selection", "A single indigo pear proof is circled in red among many similar impressions."),
  "why-human-judgement-still-matters-in-ai": panorama("judgement", "A conservator compares a strip of painted swatches with the hillside on a canvas."),
  "small-systems-decide-big-outcomes": panorama("small-systems", "A brass mechanism controls a sluice feeding long irrigation channels across a valley."),
  "the-singularity-may-become-personal-before-it-becomes-strange": panorama("singularity", "An ear-hook listening device rests beside an open planner and a cup in early window light."),
};

export function getOpeningPanorama(slug: string) {
  return Object.hasOwn(openings, slug) ? openings[slug] : undefined;
}

const collections: Readonly<Record<string, { slug: string; introduction: string }>> = {
  "The Future Is Personal": { slug: "the-singularity-may-become-personal-before-it-becomes-strange", introduction: "What happens when intelligence begins to understand the person who uses it?" },
  "Inside AI": { slug: "intelligence-depends-on-knowing-where-you-are", introduction: "Look inside the tests, assumptions and boundaries that shape a system’s behaviour." },
  "Systems Thinking": { slug: "small-systems-decide-big-outcomes", introduction: "Trace an outcome back to the conditions that keep producing it." },
  "Sunday Reflections": { slug: "the-discipline-that-protects-freedom", introduction: "On discipline, choice and the habits that give a life its shape." },
  "Notes from Building Fred": { slug: "why-approval-comes-before-automation", introduction: "Decisions from the workshop of a personal AI, from the first assumption to the moment before action." },
  "Artificial Intelligence": { slug: "why-ai-needs-human-curiosity", introduction: "An inquiry into what intelligence can do and what human curiosity brings to it." },
};

export function getCollectionOpening(category: string) {
  if (category === "The Frontier") return { image: frontierPanorama, introduction: "An ongoing inquiry into intelligence, judgement and what can emerge between humans and machines." };
  const entry = collections[category];
  if (!entry) return { image: undefined, introduction: `Papers filed under ${category}.` };
  return { image: getOpeningPanorama(entry.slug) ?? getPaperArtwork(entry.slug), introduction: entry.introduction };
}
