import type { Paper } from "./papers";

type Relationship = "continuation" | "companion" | "theme" | "context";
type Edge = readonly [from: string, to: string, kind: Relationship, explanation: string];

export const researchConnections: readonly Edge[] = [
  ["the-system-did-exactly-what-it-believed-success-required", "sandbox-cant-hold-us-down", "context", "The earlier evaluation essay supplies one of Sandbox’s cases and shows why the author revised the language of design into a question about interpreted success."],
  ["intelligence-depends-on-knowing-where-you-are", "sandbox-cant-hold-us-down", "continuation", "The earlier paper separates the instruction from the system’s reading of its environment. Sandbox extends that distinction across three evaluations and asks when apparent availability confers authority."],
  ["sandbox-cant-hold-us-down", "the-frontier-asks-to-slow-down-who-holds-the-brakes", "continuation", "The governance paper explicitly returns to the evaluation incidents. It widens the oversight question from individual systems and test boundaries to coordination between institutions."],
  ["sandbox-cant-hold-us-down", "why-approval-comes-before-automation", "theme", "Sandbox distinguishes an available action from an authorized one. The Fred+Teff design essay considers how a person inspects and confirms a consequential action."],
  ["sandbox-cant-hold-us-down", "what-becomes-scarce-when-intelligence-becomes-abundant", "context", "The abundance essay references Sandbox when it considers context and permission. The incident comparison gives that otherwise abstract distinction a practical setting."],
  ["before-the-first-action", "the-frontier-asks-to-slow-down-who-holds-the-brakes", "context", "The governance paper links back to the practice of tracing failure to the first assumption. It asks how evaluations can reveal consequential behavior even when the immediate result looks limited."],
  ["the-frontier-and-the-rest-of-us", "the-frontier-asks-to-slow-down-who-holds-the-brakes", "continuation", "The governance paper explicitly revisits the promise of wider access. It keeps the benefits in view while asking who can impose restraint and maintain oversight."],
  ["the-frontier-and-the-rest-of-us", "the-frontier-may-exist-in-the-interaction", "companion", "The access essay asks what ordinary experience contributes. The opening research proposition widens that question to interactions involving people, AI, tools and evidence."],
  ["the-frontier-may-exist-in-the-interaction", "when-the-machine-notices-first", "continuation", "The first paper asks where useful intelligence appears. The later paper tests the initial human-first picture by considering a case in which a machine identified something worth pursuing."],
  ["when-the-machine-notices-first", "what-decides-what-matters", "continuation", "The earlier paper leaves open who decides what is worth noticing. The next asks who selects which possibilities to investigate and what remains unknown about the ones set aside."],
  ["the-frontier-may-exist-in-the-interaction", "what-decides-what-matters", "continuation", "The selection essay explicitly returns to the original interaction proposition. It locates another part of discovery in the choices and checks made between generation and investigation."],
  ["the-frontier-may-exist-in-the-interaction", "when-the-answer-arrives-before-understanding", "continuation", "The new paper returns to the opening proposition and follows the work of the interaction after a machine has already produced an answer."],
  ["when-the-machine-notices-first", "when-the-answer-arrives-before-understanding", "continuation", "The paper explicitly distinguishes a machine noticing a promising signal from a machine offering a complete argument for researchers to check and interpret."],
  ["what-decides-what-matters", "when-the-answer-arrives-before-understanding", "continuation", "The paper explicitly revisits the selection problem. The choice now includes which completed arguments deserve the time needed to understand them."],
  ["what-becomes-scarce-when-intelligence-becomes-abundant", "what-decides-what-matters", "theme", "The abundance essay describes a selection problem when possibilities multiply. The Frontier paper examines that problem in concrete research decisions."],
  ["the-singularity-may-become-personal-before-it-becomes-strange", "what-becomes-scarce-when-intelligence-becomes-abundant", "continuation", "Part II names its predecessor and takes up the question it left open. As general intelligence becomes more available, what becomes scarce instead?"],
  ["what-becomes-scarce-when-intelligence-becomes-abundant", "now-is-not-the-time-to-prove-intelligence", "theme", "One paper asks what gives abundant intelligence direction. The other asks what more ambitious work people could undertake with that capability and where independent judgement still matters."],
  ["we-resist-the-future-until-it-becomes-familiar", "now-is-not-the-time-to-prove-intelligence", "theme", "Both examine the urge to prove competence by refusing a tool. The calculator example in the earlier essay makes visible the kind of work a change in tools can enable."],
  ["now-is-not-the-time-to-prove-intelligence", "the-frontier-and-the-rest-of-us", "theme", "The first considers interfaces that let more people use advanced intelligence. The second asks what those people bring from their own experience and what wider access might make possible."],
  ["intelligence-depends-on-knowing-where-you-are", "why-approval-comes-before-automation", "context", "The boundary essay explicitly links to the approval principle. It explains why confirmation can resolve a mismatch between a system’s interpretation and the situation it actually faces."],
  ["intelligence-depends-on-knowing-where-you-are", "why-personal-ai-needs-memory", "theme", "The boundary essay explicitly distinguishes a remembered instruction from one that still applies. The memory essay works through that same limit in a personal assistant."],
  ["intelligence-depends-on-knowing-where-you-are", "what-becomes-scarce-when-intelligence-becomes-abundant", "context", "The abundance essay cites the boundary paper when it discusses context. The earlier case illustrates what general capability can miss about the local situation."],
  ["the-singularity-may-become-personal-before-it-becomes-strange", "why-personal-ai-needs-memory", "theme", "Continuity and user control are central to both accounts of personal intelligence. The memory essay develops concrete limits on what a system should retain and how the user can change it."],
  ["why-ai-needs-human-curiosity", "why-personal-ai-needs-memory", "companion", "The memory paper asks what should be retained. The curiosity paper considers recurring questions that a system could surface while leaving the person to decide what they mean."],
  ["why-ai-needs-human-curiosity", "what-becomes-scarce-when-intelligence-becomes-abundant", "theme", "Both value curiosity after answer generation becomes easier. The curiosity essay asks how a personal system might notice recurring interests without deciding what matters on the user's behalf."],
  ["before-the-first-action", "beyond-correctness", "theme", "Both draw from AI evaluation. One traces the error to an initial judgement, while the other explains how judging only the final answer misses the person’s actual intention."],
  ["before-the-first-action", "why-approval-comes-before-automation", "companion", "The two Fred essays locate user control before action. The earlier design discussion explains where approvals belong and the evaluation essay explains how to surface the system’s assumptions."],
  ["beyond-correctness", "why-human-judgement-still-matters-in-ai", "companion", "Both separate a factually correct output from a useful one. The judgement essay follows the standards through training and evaluation to the humans who carry responsibility."],
  ["why-human-judgement-still-matters-in-ai", "when-the-machine-notices-first", "theme", "The evaluation essay asks who sets standards and carries responsibility. The research paper makes that distinction tangible through human judgement and the need for independent evidence."],
  ["we-resist-the-future-until-it-becomes-familiar", "why-human-judgement-still-matters-in-ai", "theme", "The adoption essay urges openness alongside criticism. The judgement essay gives concrete reasons why confident output still calls for scrutiny and human responsibility."],
  ["documentation-is-a-competitive-advantage", "building-before-you-understand-is-expensive", "companion", "Both argue for recording reasoning before implementation. One looks at preserving decisions and their assumptions, while the other explains the cost of discovering hidden assumptions late."],
  ["documentation-is-a-competitive-advantage", "before-the-first-action", "theme", "The documentation essay explains the value of recording a decision and its assumptions. The Fred essay applies that idea when the reason behind a behavior could otherwise be lost."],
  ["building-before-you-understand-is-expensive", "small-systems-decide-big-outcomes", "theme", "The systems essay describes how repeated conditions shape outcomes. The building essay applies the same care to a project’s early defaults and the cost of carrying them too far."],
  ["small-systems-decide-big-outcomes", "the-decisions-that-rarely-stay-small", "theme", "Both explain how unremarkable repetition becomes consequential. The systems essay looks at feedback and conditions, while Sunday Reflections looks at the choices through which a life takes shape."],
  ["the-decisions-that-rarely-stay-small", "the-discipline-that-protects-freedom", "companion", "The first follows small decisions as they accumulate. The second asks how deliberate limits can preserve the ability to choose well later."],
  ["the-discipline-that-protects-freedom", "small-systems-decide-big-outcomes", "theme", "The reflection asks which structures preserve agency. The systems essay gives practical examples of how conditions and repeated actions can make a choice easier to sustain."],
  ["when-the-environment-can-no-longer-support-the-goal", "the-system-did-exactly-what-it-believed-success-required", "context", "The reflection names the incident essay as a prompt for thinking about environments. It shifts the idea into a human question about the conditions a goal requires."],
  ["when-the-environment-can-no-longer-support-the-goal", "small-systems-decide-big-outcomes", "theme", "Both examine how surrounding conditions shape action. One considers changing an environment to make growth possible, while the other considers changing the systems repeated within it."],
];

const relationshipLabels = { companion: "Companion paper", theme: "Shared question", context: "Context", continuation: "Continuation" };

export function getPaperConnections(slug: string, papers: Paper[]) {
  const available = new Map(papers.map((paper) => [paper.slug, paper]));
  return researchConnections.flatMap(([from, to, kind, explanation]) => {
    const target = slug === from ? to : slug === to ? from : undefined;
    const paper = target && available.get(target);
    if (!paper) return [];
    return [{ paper, explanation, label: kind === "continuation" && slug === to ? "Earlier argument" : relationshipLabels[kind] }];
  });
}

type QuestionStatus = "open" | "developed" | "addressed";
type QuestionUpdate = { paper: string; status: QuestionStatus; explanation: string };
type ResearchQuestion = { id: string; text: string; history?: readonly QuestionUpdate[] };

type StepNotes = {
  role: string;
  branch?: boolean;
  question: string;
  development: string;
  followUps?: readonly ResearchQuestion[];
};

const frontierNotes: Readonly<Record<string, StepNotes>> = {
  "the-frontier-and-the-rest-of-us": {
    role: "Prelude · access",
    question: "What happens when frontier capability meets the experience of people outside specialist institutions?",
    development: "The access essay treats ordinary experience as something brought into the inquiry and proposes it as a way to test what the interaction contributes.",
    followUps: [{
      id: "access-and-discovery",
      text: "Which discoveries become possible when the people closest to a problem gain access to the tools?",
    }],
  },
  "the-frontier-may-exist-in-the-interaction": {
    role: "Opening proposition",
    question: "Where does useful intelligence appear when people, machines, tools and experiments work together?",
    development: "The opening proposition expands from human–AI collaboration to include physical reality and the evidence that can change the investigation.",
    followUps: [{
      id: "capability-in-interaction",
      text: "What would distinguish a capability of the interaction from a capability already present in the model?",
    }],
  },
  "the-frontier-asks-to-slow-down-who-holds-the-brakes": {
    role: "Companion · governance",
    branch: true,
    question: "Who can slow a competitive frontier when each participant fears falling behind?",
    development: "The paper takes earlier concerns about evaluation and access into questions of oversight, coordination and legitimate authority.",
    followUps: [{
      id: "authority-to-restrain",
      text: "Who can require restraint, verify it and decide when restrictions should be lifted?",
    }],
  },
  "when-the-machine-notices-first": {
    role: "Noticing",
    question: "What changes when a machine notices a candidate signal before a researcher does?",
    development: "A case of machine-led noticing tests the human-first picture. The paper distinguishes identifying a candidate from knowing what it means.",
    followUps: [{
      id: "which-signals-matter",
      text: "Who decides which signals are worth noticing and what counts as adequate evidence?",
      history: [{
        paper: "what-decides-what-matters",
        status: "developed",
        explanation: "The selection paper explicitly takes up the question of what should be investigated. It examines choices that happen before testing and leaves the outcomes of discarded possibilities open.",
      }],
    }],
  },
  "what-decides-what-matters": {
    role: "Selection",
    question: "How are possibilities selected for further investigation?",
    development: "The selection paper follows decisions across generation, expert interpretation and evidence, including what can be overlooked before testing.",
    followUps: [{
      id: "unexamined-possibilities",
      text: "What might the possibilities left unexamined have produced, and how could a researcher compare those choices?",
    }],
  },
  "when-the-answer-arrives-before-understanding": {
    role: "Understanding",
    question: "What happens when a machine produces an answer before researchers understand why it works?",
    development: "The paper distinguishes checking what an argument establishes from understanding its method and deciding what to investigate next.",
  },
};

const personalNotes: Readonly<Record<string, StepNotes>> = {
  "the-singularity-may-become-personal-before-it-becomes-strange": {
    role: "Part I",
    question: "What might accelerating intelligence feel like in an individual's daily life?",
    development: "The first essay explores continuity and personal context as ways a general capability might begin to feel personal.",
    followUps: [{
      id: "scarcity-after-abundance",
      text: "What becomes scarce once general intelligence is widely available?",
      history: [{
        paper: "what-becomes-scarce-when-intelligence-becomes-abundant",
        status: "addressed",
        explanation: "Part II names the question left open by Part I and examines judgement, trust, context and direction as potential sources of scarcity.",
      }],
    }],
  },
  "what-becomes-scarce-when-intelligence-becomes-abundant": {
    role: "Part II",
    question: "What becomes scarce when answers and possibilities can be generated cheaply?",
    development: "The second essay investigates selection, trust, context and direction as scarce qualities in conditions of abundance.",
    followUps: [{
      id: "cultivating-judgement",
      text: "How can institutions and individuals cultivate the judgement that gives abundant capability a direction?",
    }],
  },
};

const series = [
  {
    id: "frontier",
    title: "The Frontier",
    category: "The Frontier",
    description: "Follow the questions that shaped the inquiry, including its governance branch and the questions it leaves open.",
    notes: frontierNotes,
    include: (paper: Paper) => paper.category === "The Frontier" || paper.slug === "the-frontier-and-the-rest-of-us",
  },
  {
    id: "personal-intelligence",
    title: "Personal intelligence and abundance",
    category: "The Future Is Personal",
    description: "Read the two-part inquiry into personal context and what becomes scarce when intelligence is abundant.",
    notes: personalNotes,
    include: (paper: Paper) => Object.hasOwn(personalNotes, paper.slug),
  },
] as const;

export function getResearchJourneys(papers: Paper[]) {
  const published = papers.filter((paper) => paper.status.toLowerCase() === "published");
  const available = new Map(published.map((paper) => [paper.slug, paper]));
  return series.map(({ include, notes, ...entry }) => {
    const steps = published.filter(include)
      .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
      .map((paper) => ({ paper, notes: Object.hasOwn(notes, paper.slug) ? notes[paper.slug] : undefined }));
    const questions = steps.flatMap(({ paper: origin, notes }) =>
      (notes?.followUps ?? []).map(({ id, text, history = [] }) => {
        const updates = history.flatMap(({ paper: slug, status, explanation }) => {
          const paper = available.get(slug);
          return paper && paper.slug !== origin.slug && paper.date >= origin.date ? [{ paper, status, explanation }] : [];
        }).sort((a, b) => a.paper.date.localeCompare(b.paper.date));
        return { id, text, origin, updates, status: updates.at(-1)?.status ?? "open" };
      }),
    );
    return { ...entry, steps, questions };
  });
}

export type ResearchJourney = ReturnType<typeof getResearchJourneys>[number];
