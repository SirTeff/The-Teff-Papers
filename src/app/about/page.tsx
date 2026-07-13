import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = { title: "About Teff", description: "About Teff and the thinking behind The Teff Papers." };

export default function AboutPage() {
  return <PageContainer narrow className="paper-page"><article><header className="paper-header"><p className="eyebrow">About Teff</p><h1>Meet Teff</h1></header><div className="prose">
    <p>The Teff Papers is where I document the ideas, questions, observations, lessons, and patterns that shape the things I am building.</p>
    <p>I am interested in the space where technology meets human behaviour. Artificial intelligence, personal digital intelligence, automation, systems thinking, blockchain, leadership, faith, and product building all connect for me because they are not just abstract subjects. They affect how people work, make decisions, trust systems, build discipline, create value, and understand the future.</p>
    <p>The Teff Papers is not my attempt to become a content creator. It is my attempt to build a body of work.</p>
    <p>It gives me a place to think in public with structure, to capture ideas before they become finished products, and to preserve the reasoning behind future work before only the final outcome is visible.</p>
    <p>My current work and interests sit around AI evaluation, model behaviour, human judgement, digital intelligence, product thinking, and the future of personal AI. That direction is also connected to Fred+Teff, a personal AI command center I am building as one expression of these ideas.</p>
    <p>But The Teff Papers is bigger than Fred+Teff.</p>
    <p>It is the foundation underneath the thinking.</p>
    <p>Some ideas here may remain reflections. Some may become product principles. Some may become research. Some may become future companies, books, or public conversations.</p>
    <p>The point is to document them early enough to understand them properly.</p>
    <p>That is the work.</p>
    <p>To think clearly, build carefully, and document the journey.</p>
  </div><footer className="paper-signature"><p>— Teff</p></footer></article></PageContainer>;
}
