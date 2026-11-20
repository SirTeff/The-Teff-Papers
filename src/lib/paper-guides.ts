export type GuidePoint = readonly [id: string, label: string, passage: string];

const guides: Readonly<Record<string, readonly GuidePoint[] | undefined>> = {
  "before-the-first-action": [
    ["first-decision", "Where an evaluation first goes wrong", "one answer determines whether the remaining questions"],
    ["safe-assumptions", "What a personal system can safely infer", "which gaps are safe to infer"],
    ["approval-as-reasoning", "Approval as part of reasoning", "reveal what it believes"],
  ],
  "beyond-correctness": [
    ["intention", "When a correct answer misses the intention", "perfectly while completely missing"],
    ["evaluation", "What an evaluation score rewards", "a judgement on a single answer"],
    ["judgement", "How judgement changes the standard", "Correctness asks whether an answer is right"],
  ],
  "building-before-you-understand-is-expensive": [
    ["familiarity", "How familiarity can imitate clarity", "familiarity can imitate clarity"],
    ["rework", "The cost of discovering assumptions late", "the same weaknesses discovered later"],
    ["writing", "Writing as part of building", "Writing down the purpose of a project"],
  ],
  "documentation-is-a-competitive-advantage": [
    ["early-writing", "What writing before implementation reveals", "Writing earlier changes the role of documentation"],
    ["site-example", "How The Teff Papers began", "The Teff Papers website was approached in that order"],
    ["decisions", "Preserving the reasoning behind decisions", "a collection of reasoning"],
  ],
  "intelligence-depends-on-knowing-where-you-are": [
    ["environment", "Why instructions depend on context", "acting on an instruction"],
    ["interpretation", "Interpretation between instruction and action", "instruction, interpretation, capability"],
    ["approval", "How approval can restore missing context", "is not merely a product preference"],
  ],
  "now-is-not-the-time-to-prove-intelligence": [
    ["ambition", "What abundant intelligence asks of ambition", "ambition has to rise"],
    ["interfaces", "The gap between capability and access", "learn machine code"],
    ["judgement", "Keeping judgement while extending capability", "We should protect our judgement"],
  ],
  "sandbox-cant-hold-us-down": [
    ["three-cases", "The common thread across three evaluations", "the differences are where the real argument begins"],
    ["authority", "Where availability and authority diverge", "being able to do something"],
    ["oversight", "Why contextual judgement still needs safeguards", "This would not remove the need for secure sandboxes"],
  ],
  "small-systems-decide-big-outcomes": [
    ["repetition", "What repeated outcomes reveal", "Systems thinking begins by taking repetition seriously"],
    ["conditions", "Changing the conditions that sustain a habit", "Changing the outcome therefore"],
    ["responsibility", "Where to apply responsibility", "Systems are not excuses"],
  ],
  "the-decisions-that-rarely-stay-small": [
    ["small-decisions", "The decisions that rarely look significant", "Most of what shapes our lives arrives"],
    ["accumulation", "How small choices accumulate", "life rarely changes all at once"],
    ["consistency", "Why consistency is easy to overlook", "consistency almost never feels significant"],
  ],
  "the-discipline-that-protects-freedom": [
    ["agency-over-time", "What it means to keep choosing freely", "remains able to choose well"],
    ["habits", "How habits begin to shape the chooser", "Repeated decisions do more than produce repeated results"],
    ["limits", "When boundaries help and when they harden", "This does not mean every boundary is good"],
  ],
  "the-frontier-and-the-rest-of-us": [
    ["access", "Why access involves more than model capability", "people must rise toward the technology"],
    ["ordinary-insight", "What ordinary experience contributes", "ordinary people are not empty vessels"],
    ["test", "What would count as a useful test?", "he removes the easiest explanation"],
  ],
  "the-frontier-asks-to-slow-down-who-holds-the-brakes": [
    ["benefit-and-risk", "Why access and restraint are both at stake", "resolve that tension by deciding access"],
    ["coordination", "Why coordination becomes difficult", "This is where the problem becomes systemic"],
    ["authority", "Who has authority to act on restraint?", "becomes a question about authority"],
  ],
  "the-frontier-may-exist-in-the-interaction": [
    ["proposition", "Where might the frontier appear?", "the idea I wanted to investigate was simple"],
    ["evidence", "Physical evidence as part of the interaction", "reality itself may belong inside the interaction"],
    ["open", "Why the proposition stays open", "leave the proposition exactly where it began"],
  ],
  "the-singularity-may-become-personal-before-it-becomes-strange": [
    ["daily-life", "What living through the change may feel like", "changes the question from when"],
    ["continuity", "What continuity adds to general intelligence", "continuity and personal context"],
    ["control", "What deeper personal knowledge asks of control", "questions of privacy, ownership, control"],
  ],
  "the-system-did-exactly-what-it-believed-success-required": [
    ["interpretation", "Why the first interpretation was revised", "Then I stopped"],
    ["incentives", "What systems are taught to count as success", "constructs an understanding of success"],
    ["personal-ai", "Why objectives matter in personal AI", "designed to work alongside a single individual"],
  ],
  "we-resist-the-future-until-it-becomes-familiar": [
    ["familiarity", "Why disruption is easier to see than benefit", "The disruption is visible immediately"],
    ["calculators", "What calculators changed about skilled work", "criticism surrounding calculators"],
    ["critical-adoption", "How to remain critical while adopting a tool", "openness to AI cannot mean blind acceptance"],
  ],
  "what-becomes-scarce-when-intelligence-becomes-abundant": [
    ["questions", "What good questions are worth when answers are cheap", "maybe I can tell you the first thing"],
    ["selection", "Why abundance makes selection harder", "abundance creates a selection problem"],
    ["direction", "What gives intelligence a direction", "This is what I mean by direction"],
  ],
  "what-decides-what-matters": [
    ["selection", "Who chooses what deserves investigation?", "This is what I am investigating next"],
    ["evidence", "How expertise changes what a result means", "The specialist understood how the result related"],
    ["unexamined", "What successful discoveries leave unknown", "the researcher who selected three explanations from twenty"],
  ],
  "when-the-environment-can-no-longer-support-the-goal": [
    ["requirements", "Measuring what a goal requires", "That changes the question worth asking"],
    ["risk", "Comparing the risk of change and the risk of staying", "risk deserves more precision"],
    ["inventory", "Taking stock of what the environment can provide", "An honest inventory often reveals"],
  ],
  "when-the-machine-notices-first": [
    ["first-signal", "How a machine can notice before a researcher", "The researchers did not point Claude"],
    ["evidence", "What experiments can establish", "forced through standardised physical experiments"],
    ["open", "Who decides what is worth noticing?", "ART now adds another"],
  ],
  "why-ai-needs-human-curiosity": [
    ["recurrence", "How curiosity reveals itself over time", "People rarely reveal that direction"],
    ["interpretation", "Why a pattern still needs interpretation", "Recognising a pattern is not the same"],
    ["limits", "What a personal system can infer about interests", "interpreting long-term patterns could easily"],
  ],
  "why-approval-comes-before-automation": [
    ["authority", "The step from preparation to action", "The most convenient moment in an automated system"],
    ["inspection", "What approval lets a user inspect", "That inspection matters"],
    ["proportion", "Choosing where confirmation belongs", "approval should be proportionate"],
  ],
  "why-human-judgement-still-matters-in-ai": [
    ["standards", "Where human standards enter the system", "That judgement exists before"],
    ["quality", "What makes an accurate answer useful", "The distinction between a correct answer and a good answer"],
    ["responsibility", "Responsibility when AI sounds convincing", "responsibility cannot be delegated"],
  ],
  "when-the-answer-arrives-before-understanding": [
    ["working-back", "Working back from an answer to understanding", "now they have an answer from which they have to work back towards an understanding"],
    ["formal-check", "What a formal check can and cannot establish", "Lean can check a proof against the statement written in its formal language"],
    ["research-attention", "Which finished arguments are worth investigating?", "the choice may be which finished arguments to examine"],
  ],
  "why-personal-ai-needs-memory": [
    ["history", "Why work depends on continuity", "a series of isolated prompts"],
    ["control", "What users should be able to change", "selective, transparent and editable"],
    ["context", "When remembered instructions still need approval", "remembering a previous instruction does not prove"],
  ],
};

export function getPaperGuide(slug: string): readonly GuidePoint[] {
  return Object.hasOwn(guides, slug) ? guides[slug] ?? [] : [];
}

export function getGuideAnchor(id: string) {
  // The Markdown sanitizer prefixes IDs to protect named DOM properties.
  return `user-content-reading-${id}`;
}
