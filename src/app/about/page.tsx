import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = { title: "About Teff", description: "About Teff and the thinking behind The Teff Papers." };

export default function AboutPage() {
  return <PageContainer narrow className="paper-page about-page"><article><header className="paper-header"><p className="eyebrow">About Teff</p><h1>Meet Teff</h1></header><div className="prose about-prose">
    <section className="about-section" aria-label="Meet Teff introduction">
      <p>I’m Teff — a thinker, builder, and digital intelligence enthusiast exploring how artificial intelligence, automation, systems, and human judgement can work together to create more useful technology.</p>
      <p>My work sits at the intersection of AI evaluation, product thinking, personal digital intelligence, and the everyday questions that come from working closely with intelligent systems. Over time, I’ve worked across different AI training and evaluation projects, reviewing model behaviour, comparing outputs, studying instruction-following, analysing visual quality, and observing how much human judgement still matters in building better AI.</p>
      <p>Those experiences have shaped the way I think about technology.</p>
      <p>I’m not only interested in what AI can produce. I’m interested in how it should assist, when it should act, what it should remember, what it should ignore, and how it can become more personal without becoming intrusive.</p>
      <p>That line of thinking is also part of what led to Fred+Teff — a personal digital intelligence project built around the idea that AI should not just answer questions, but understand context, support better decisions, and help people organise their work, ideas, and digital life with more clarity.</p>
    </section>
    <section className="about-section" aria-labelledby="about-the-teff-papers">
      <h2 id="about-the-teff-papers">About The Teff Papers</h2>
      <p>The Teff Papers is where I document the thinking behind that wider journey.</p>
      <p>It is not simply a blog or a portfolio. It is a growing body of work built from real projects, difficult questions, unfinished ideas, lessons from AI evaluation, product experiments, systems thinking, and reflections on how technology fits into human life.</p>
      <p>Some papers will be technical. Some will be philosophical. Some will come from projects I am building. Others will come from ordinary observations that reveal something worth paying attention to.</p>
      <p>The goal is simple:</p>
      <p className="about-goal">To think clearly, document honestly, and build with purpose.</p>
    </section>
    <section className="about-section" aria-labelledby="what-i-write-about">
      <h2 id="what-i-write-about">What I Write About</h2>
      <ul className="about-topics">
        <li>Artificial intelligence</li>
        <li>Personal digital intelligence</li>
        <li>Automation</li>
        <li>Systems thinking</li>
        <li>Product building</li>
        <li>Human judgement</li>
        <li>AI evaluation</li>
        <li>Technology and society</li>
        <li>Blockchain and digital infrastructure</li>
        <li>Leadership</li>
        <li>Faith and purpose</li>
        <li>Human behaviour</li>
      </ul>
    </section>
  </div><footer className="paper-signature"><p>— Teff</p></footer></article></PageContainer>;
}
