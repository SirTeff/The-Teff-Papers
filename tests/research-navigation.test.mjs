import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getAllPaperCategories, getAllPapers, getPaperCategoryCounts, getPapersByCategory, renderMarkdown } from "../src/lib/papers.ts";
import { getGuideAnchor, getPaperGuide } from "../src/lib/paper-guides.ts";
import { getPaperConnections, getResearchJourneys, researchConnections } from "../src/lib/research.ts";

const papers = getAllPapers();

test("all visible papers have curated guides with stable sanitized targets and unchanged reading prose", async () => {
  for (const paper of papers) {
    const guide = getPaperGuide(paper.slug);
    assert(guide.length >= 3 && guide.length <= 5, paper.slug);
    const anchored = new Set();
    const rendered = await renderMarkdown(paper.content, guide, anchored);
    assert.equal(anchored.size, guide.length, paper.slug);
    for (const [id] of guide) assert(rendered.includes(`id="${getGuideAnchor(id)}" tabindex="-1"`), paper.slug);
    const undecorated = rendered.replace(/ id="user-content-reading-[a-z0-9-]+" tabindex="-1"/g, "");
    assert.equal(undecorated, await renderMarkdown(paper.content), paper.slug);
  }
});

test("ambiguous passages do not emit a dead anchor and Markdown sanitization still applies", async () => {
  const anchored = new Set();
  const rendered = await renderMarkdown("Repeated passage.\n\nRepeated passage.\n\n<script>alert(1)</script>", [
    ["duplicated", "A duplicated phrase", "Repeated passage"],
  ], anchored);
  assert.equal(anchored.size, 0);
  assert.doesNotMatch(rendered, /user-content-reading-dup|<script/);
});

test("curated connections resolve reciprocally across the current catalog", () => {
  const slugs = new Set(papers.map(({ slug }) => slug));
  const pairs = new Set();
  for (const [from, to, , explanation] of researchConnections) {
    assert(slugs.has(from) && slugs.has(to) && from !== to);
    assert(explanation);
    const pair = [from, to].sort().join("|");
    assert(!pairs.has(pair), pair);
    pairs.add(pair);
    assert(getPaperConnections(from, papers).some(({ paper }) => paper.slug === to));
    assert(getPaperConnections(to, papers).some(({ paper }) => paper.slug === from));
  }
  for (const paper of papers) assert(getPaperConnections(paper.slug, papers).length >= 2, paper.slug);
  const sandbox = getPaperConnections("sandbox-cant-hold-us-down", papers);
  assert(sandbox.some(({ paper }) => paper.category === "The Frontier"));
  assert(sandbox.some(({ paper }) => paper.slug === "why-approval-comes-before-automation"));
});

test("Frontier membership includes future published papers and preserves the authored access prelude", () => {
  const future = { ...papers[0], category: "The Frontier", date: "2026-12-01", slug: "new-frontier-paper", status: "published" };
  const draft = { ...future, slug: "not-published-frontier", status: "Draft" };
  const journeys = getResearchJourneys([...papers, future, draft]);
  const frontier = journeys.find(({ id }) => id === "frontier");
  assert.equal(frontier.steps[0].paper.slug, "the-frontier-and-the-rest-of-us");
  assert.equal(frontier.steps.at(-1).paper.slug, future.slug);
  assert.equal(frontier.steps.at(-1).notes, undefined);
  assert(!frontier.steps.some(({ paper }) => paper.slug === draft.slug));
  assert.equal(journeys.find(({ id }) => id === "personal-intelligence").steps.length, 2);
});

test("the approved Answer manuscript is intact and follows the papers it explicitly cites", async () => {
  const slug = "when-the-answer-arrives-before-understanding";
  const source = await readFile(new URL(`../src/content/papers/${slug}.md`, import.meta.url), "utf8");
  const digest = createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex");
  assert.equal(digest, "120cda821b861cf31054c4ad49c85b8367477946614b5d4d1eda1c4ec46e34b4");
  assert.equal(papers.length, 25);
  const frontier = getResearchJourneys(papers).find(({ id }) => id === "frontier");
  assert.equal(frontier.steps.at(-1).paper.slug, slug);
  assert.equal(frontier.steps.at(-1).notes.role, "Understanding");
  assert.deepEqual(getPaperConnections(slug, papers).map(({ paper }) => paper.slug), [
    "the-frontier-may-exist-in-the-interaction",
    "when-the-machine-notices-first",
    "what-decides-what-matters",
  ]);
});

test("Sunday categories share one canonical count without losing legacy papers", () => {
  const counts = getPaperCategoryCounts();
  assert.equal(counts.get("Sunday Reflections"), 3);
  assert(!counts.has("Sunday Reflection"));
  assert(!getAllPaperCategories().includes("Sunday Reflection"));
  assert.deepEqual(getPapersByCategory("Sunday Reflection"), getPapersByCategory("Sunday Reflections"));
  assert.equal([...counts.values()].reduce((sum, count) => sum + count, 0), papers.length);
});

test("research questions retain their origin and require published evidence for each change in status", () => {
  const journeys = getResearchJourneys(papers);
  const allQuestions = journeys.flatMap(({ questions }) => questions);
  assert.equal(allQuestions.length, 7);
  assert.equal(new Set(allQuestions.map(({ id }) => id)).size, allQuestions.length);
  for (const { origin, text, updates } of allQuestions) {
    assert(text.endsWith("?"));
    for (const { paper, explanation } of updates) {
      assert(paper.date >= origin.date && paper.slug !== origin.slug && explanation.length > 0);
    }
  }
  const noticing = allQuestions.find(({ id }) => id === "which-signals-matter");
  assert.equal(noticing.status, "developed");
  assert.equal(noticing.origin.slug, "when-the-machine-notices-first");
  assert.equal(noticing.updates[0].paper.slug, "what-decides-what-matters");
  const scarcity = allQuestions.find(({ id }) => id === "scarcity-after-abundance");
  assert.equal(scarcity.status, "addressed");
  assert.equal(scarcity.updates[0].paper.slug, "what-becomes-scarce-when-intelligence-becomes-abundant");

  const incomplete = papers.map((paper) => paper.slug === noticing.updates[0].paper.slug ? { ...paper, status: "Draft" } : paper);
  const stillOpen = getResearchJourneys(incomplete)[0].questions.find(({ id }) => id === noticing.id);
  assert.equal(stillOpen.status, "open");
  assert.equal(stillOpen.text, noticing.text);
  assert.deepEqual(stillOpen.updates, []);
});
