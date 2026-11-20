import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import sharp from "sharp";
import { getPaperArtwork, getPaperCardArtwork, publicationArtwork } from "../src/lib/artwork.ts";
import { getFrontierMotion } from "../src/lib/frontier-motion.ts";
import readingArtwork from "../src/lib/m5r-reading-artwork-register.json" with { type: "json" };
import galleryDescriptions from "../src/lib/m5p-artwork.json" with { type: "json" };
import publicArtworkChecksums from "./fixtures/m5p-public-artwork.json" with { type: "json" };

const root = new URL("../", import.meta.url);

async function checkAsset(variant) {
  assert.match(variant.src, /^\/artwork\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.webp$/);
  const asset = await readFile(new URL("public" + variant.src, root));
  const { width, height, format, hasAlpha } = await sharp(asset).metadata();
  assert.equal(format, "webp");
  assert.deepEqual([width, height], [variant.width, variant.height]);
  return hasAlpha;
}

async function checkRecord(record, paper = false) {
  assert(["provisional", "approved"].includes(record.status));
  assert(record.credit && record.provenance && record.alt);
  await checkAsset(record);
  if (record.mobile) await checkAsset(record.mobile);
  if (record.card) await checkAsset(record.card);
  if (record.card?.mobile) await checkAsset(record.card.mobile);
  if (record.social) {
    assert(record.social.alt);
    await checkAsset(record.social);
  }
  const social = record.social ?? record;
  if (record.social || paper) assert.equal(social.width * 630, social.height * 1200);

  for (const layer of Object.values(record.layers ?? {})) {
    assert.deepEqual([layer.width, layer.height], [record.width, record.height]);
    assert(await checkAsset(layer), layer.src);
    if (layer.mobile) {
      assert(record.mobile, layer.mobile.src);
      assert.deepEqual([layer.mobile.width, layer.mobile.height], [record.mobile.width, record.mobile.height]);
      assert(await checkAsset(layer.mobile), layer.mobile.src);
    }
  }
}

test("published papers have distinct valid artwork and a share-safe aspect ratio", async () => {
  const directory = new URL("src/content/papers/", root);
  const files = (await readdir(directory)).filter((file) => path.extname(file) === ".md");
  const images = new Set();
  for (const file of files) {
    const { data } = matter(await readFile(new URL(file, directory), "utf8"));
    const record = getPaperArtwork(data.slug);
    if (data.status.toLowerCase() === "published") assert(record, data.slug);
    if (!record) continue;
    assert(!images.has(record.src), record.src);
    images.add(record.src);
    await checkRecord(record, true);
  }
});

test("each visible paper has a distinct card asset independent of its reading artwork", async () => {
  const directory = new URL("src/content/papers/", root);
  const cards = new Set();
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".md"))) {
    const { data } = matter(await readFile(new URL(file, directory), "utf8"));
    if (data.status.toLowerCase() === "hidden") continue;
    const card = getPaperCardArtwork(data.slug);
    assert(card, data.slug);
    assert(!cards.has(card.src), card.src);
    cards.add(card.src);
    await checkAsset(card);
    if (card.mobile) await checkAsset(card.mobile);
  }
  assert.equal(cards.size, 25);
  assert.equal(getPaperCardArtwork("why-personal-ai-needs-memory").src, "/artwork/m5-p/why-personal-ai-needs-memory-card.webp");
  assert.equal(getPaperCardArtwork("unknown-paper"), undefined);
});

test("priority replacements use distinct reading, card and social sources", async () => {
  const slugs = ["sandbox-cant-hold-us-down", "the-discipline-that-protects-freedom"];
  for (const slug of slugs) {
    const artwork = getPaperArtwork(slug);
    const card = getPaperCardArtwork(slug);
    const base = `/artwork/priority/${slug}`;
    assert.equal(artwork.src, `${base}.webp`);
    assert.equal(card.src, `${base}-card.webp`);
    assert.equal(artwork.social.src, `${base}-social.webp`);
    assert.equal(artwork.social.alt, artwork.alt);
    assert.deepEqual([artwork.width, artwork.height], [1600, 900]);
    assert.deepEqual([card.width, card.height], [1200, 675]);
    assert.deepEqual([artwork.social.width, artwork.social.height], [1200, 630]);
    await checkRecord(artwork, true);
  }
});

test("missing artwork stays optional and publication variants resolve", async () => {
  assert.equal(getPaperArtwork("unknown-paper"), undefined);
  assert.equal(getPaperArtwork("__proto__"), undefined);
  for (const record of Object.values(publicationArtwork)) await checkRecord(record);
});

test("retained M5-R reading artworks select their verified exports for all three roles", async () => {
  assert.equal(new Set(readingArtwork.map(({ slug }) => slug)).size, 9);
  const retained = readingArtwork.filter(({ slug }) => !Object.hasOwn(galleryDescriptions, slug));
  assert.equal(retained.length, 7);
  for (const entry of retained) {
    const art = getPaperArtwork(entry.slug);
    const card = getPaperCardArtwork(entry.slug);
    assert.equal(art.alt, entry.alt);
    assert.equal(art.credit, entry.credit);
    assert.equal(art.provenance, entry.provenance);
    assert.equal(art.focalPoint, entry.focal_point);
    assert.equal(card.focalPoint, entry.focal_point);
    assert.equal(art.social.alt, entry.alt);
    for (const [role, asset] of Object.entries({ reading: art, card, social: art.social })) {
      const variant = entry.variants[role];
      assert.equal(asset.src, `/artwork/reading-v1/${path.basename(variant.file)}`);
      assert.deepEqual([asset.width, asset.height], [variant.width, variant.height]);
      const bytes = await readFile(new URL("public" + asset.src, root));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), variant.sha256);
    }
  }
});

test("nine gallery prints select their documented reading, archive and social exports", async () => {
  assert.equal(Object.keys(galleryDescriptions).length, 9);
  for (const [slug, alt] of Object.entries(galleryDescriptions)) {
    const art = getPaperArtwork(slug);
    assert.equal(art.alt, alt);
    assert.equal(art.social.alt, alt);
    for (const [role, variant] of Object.entries({ reading: art, card: getPaperCardArtwork(slug), social: art.social })) {
      const base = slug === "the-singularity-may-become-personal-before-it-becomes-strange" && role !== "reading"
        ? "/artwork/panoramas/singularity" : `/artwork/m5-p/${slug}`;
      assert.equal(variant.src, `${base}-${role}.webp`);
      const file = "public" + variant.src;
      const record = publicArtworkChecksums.find((entry) => entry.file === file);
      assert.deepEqual([variant.width, variant.height], [record.width, record.height]);
      assert.equal(createHash("sha256").update(await readFile(new URL(file, root))).digest("hex"), record.sha256);
    }
  }
});

test("existing Frontier papers provide distinct exchanges with bounded gesture regions", async () => {
  const directory = new URL("src/content/papers/", root);
  const exchangeSignatures = new Set();
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".md"))) {
    const { data } = matter(await readFile(new URL(file, directory), "utf8"));
    if (data.category !== "The Frontier") continue;
    const motion = getFrontierMotion(data.slug);
    if (data.slug === "when-the-answer-arrives-before-understanding") {
      assert.equal(motion, undefined, "The new contribution uses the approved static collection panorama");
      assert.equal(getPaperArtwork(data.slug)?.src, "/artwork/panoramas/frontier.webp");
      continue;
    }
    assert(motion?.traces.length, data.slug);
    assert(getPaperArtwork(data.slug), data.slug);
    const signature = JSON.stringify(motion.traces);
    assert(!exchangeSignatures.has(signature), data.slug);
    exchangeSignatures.add(signature);
    for (const { region: [left, top, width, height] } of motion.gestures) {
      assert(left >= 0 && top >= 0 && width > 0 && height > 0 && left + width <= 1 && top + height <= 1, data.slug);
    }
  }
  assert.equal(exchangeSignatures.size, 4);
  assert.equal(getFrontierMotion("__proto__"), undefined);
});

test("governance uses a matched mobile room and a balanced response to the two signals", () => {
  const slug = "the-frontier-asks-to-slow-down-who-holds-the-brakes";
  const artwork = getPaperArtwork(slug);
  assert.equal(artwork.width * artwork.mobile.height, artwork.mobile.width * artwork.height);
  assert.equal(artwork.focalPoint, artwork.mobile.focalPoint);
  const motion = getFrontierMotion(slug);
  assert(motion.globe);
  assert.deepEqual(motion.traces.map(({ light }) => light), ["amber", "blue"]);
  assert.equal(motion.traces[0].at, motion.traces[1].at);
  assert.equal(motion.response.light, "neutral");
  assert(motion.response.at > motion.traces[0].at);
});
