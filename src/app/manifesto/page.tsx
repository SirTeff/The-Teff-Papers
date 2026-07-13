import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
export const metadata: Metadata = { title: "Manifesto", description: "The public declaration behind The Teff Papers." };
const paragraphs = [
  "Not every idea arrives fully formed. Some begin as questions. Some begin as observations. Some begin as frustrations with the way things currently work. Some come from conversations, mistakes, patterns, faith, work, technology, or just watching how people and systems behave over time.",
  "At first, these thoughts may not look like much. But when they are written down, returned to, challenged, and connected to other ideas, they begin to take shape. That is where the real work starts.",
  "The Teff Papers exists to give that process a permanent home.",
  "This is not a blog created for noise. It is not a newsletter built around trends. It is not a LinkedIn content series designed only for reach. It is a long-term public journal for thinking clearly, documenting ideas properly, and building a body of work that can still matter years from now.",
  "The objective is not to become a content creator.", "The objective is to build a body of work.", "There is a difference.",
  "Content often asks, “Will this get attention now?”", "A body of work asks, “Will this still be worth reading later?”",
  "That difference matters because The Teff Papers is not being built for short-term performance. It is being built as an archive of thought. A place where ideas can grow in public before they become systems, products, companies, research, books, or something else entirely.",
  "Every paper should reveal how I think, not just what I know.",
  "That means the writing does not need to pretend to have every answer. It does not need to force certainty where there is still exploration. It does not need to sound more complicated than the idea actually is. What matters is clarity. The kind of clarity that helps a reader understand a concept, see a connection, ask a better question, or think differently about something they may have overlooked.",
  "The Teff Papers will explore artificial intelligence, personal digital intelligence, automation, blockchain, systems thinking, entrepreneurship, leadership, faith, technology, human behaviour, and the future of work. But these subjects are not separate worlds. They connect.",
  "Artificial intelligence is not just about models. It is about judgement, trust, decision-making, memory, work, creativity, and how humans relate to intelligent tools.",
  "Blockchain is not just about tokens. It is about coordination, incentives, ownership, infrastructure, and how value moves across systems.",
  "Faith is not separate from leadership, discipline, patience, character, or the way a person builds.",
  "Systems thinking is not only for technology or business. It applies to habits, families, teams, societies, products, and personal growth.",
  "The Teff Papers exists in the space where these things meet.", "It is where ideas are noticed early, written down, refined, and allowed to develop with structure.",
  "That is also why this project is connected to Fred+Teff.",
  "Fred+Teff is one expression of the thinking behind The Teff Papers. The Papers explain why. Fred+Teff demonstrates what. One documents the philosophy. The other turns some of that philosophy into something practical.",
  "But The Teff Papers should never become a marketing page for Fred+Teff. It should remain bigger than one product. It should remain the source of the thinking, the record of the questions, and the foundation from which future products can grow.",
  "Before anything is built, it should first be understood.", "Before an idea becomes a product, it should pass through thought.", "Before it becomes public, it should have a reason.", "That is why the founding principle is simple:",
  "Document first. Build second. Publish with structure from day one.", "Documentation is not delay. It is discipline.",
  "It protects the original reason behind the work. It keeps the project from drifting into noise. It gives future decisions something to return to. It makes the thinking visible enough to improve, challenge, and preserve.",
  "The Teff Papers is built on the belief that ideas deserve that kind of care.",
  "The writing should feel like a continuous train of thought. One idea should lead naturally into the next. No forced drama. No empty motivation. No unnecessary performance. No writing that sounds impressive but says very little.",
  "The standard is simple.", "Never write to impress.", "Always write to clarify.",
  "Some papers will be reflections. Some will become frameworks. Some will document lessons from building. Some will explore technology. Some will connect faith, leadership, and human behaviour. Some may later become the foundation for products, companies, books, research, or public conversations.",
  "But they all begin the same way.", "With a thought that was noticed early enough to be preserved.", "The Teff Papers is the permanent archive of those thoughts.",
  "We are not building a personal brand for visibility alone.", "We are building a body of work that can carry meaning over time."
];
export default function ManifestoPage() { return <PageContainer narrow className="paper-page"><article><header className="paper-header"><p className="eyebrow">Manifesto · Version 1.1</p><h1>The Teff Papers</h1><p className="paper-deck">Ideas should be documented before they become products.</p></header><div className="prose manifesto">{paragraphs.map((text, index) => index === 29 ? <blockquote key={text}><p>{text}</p></blockquote> : <p key={`${index}-${text}`}>{text}</p>)}</div><footer className="paper-signature"><p>— Teff</p></footer></article></PageContainer>; }
