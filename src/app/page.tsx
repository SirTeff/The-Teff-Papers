import { PageContainer } from "@/components/layout/PageContainer";
import { PaperCard } from "@/components/papers/PaperCard";
import { Button } from "@/components/shared/Button";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { getAllPapers } from "@/lib/papers";

const themes = [
  "Artificial Intelligence",
  "Personal Digital Intelligence",
  "Automation",
  "Systems Thinking",
  "Blockchain",
  "Faith",
  "Leadership",
  "Human Behaviour",
  "Product Thinking",
  "Future of Work",
];

export default function Home() {
  const papers = getAllPapers();
  return <>
    <section className="hero"><PageContainer><p className="eyebrow">A public archive of clear thinking</p><h1>The permanent home for ideas before they become products.</h1><div className="hero-copy"><p>The Teff Papers is a long-term public journal where I document my thinking across artificial intelligence, personal digital intelligence, automation, systems thinking, blockchain, faith, leadership, technology, and human behaviour.</p><p>This is not a blog built for noise. It is where ideas are captured, refined, and preserved before they become products, companies, research, books, or something bigger.</p><p>It is a body of work.</p></div><Button href="/papers">Begin reading</Button></PageContainer></section>
    <PageContainer>
      <section className="manifesto-preview section-rule"><div><p className="eyebrow">The manifesto</p><h2>The objective is not to become a content creator.<br />The objective is to build a body of work.</h2></div><div><p>The Teff Papers exists because ideas need a place to mature before the world only sees the finished result. Some thoughts begin as small observations, questions, frustrations, or patterns, but when they are documented properly, they can become the foundation for something much bigger.</p><Button href="/manifesto">Read the Manifesto</Button></div></section>
      <section className="manifesto-preview section-rule"><div><p className="eyebrow">What The Teff Papers explores</p><h2>The work lives in the space where these things meet.</h2></div><div><p>The Teff Papers follows the connection between ideas that are often treated as separate.</p><p>Artificial intelligence is not only about models. It is about judgement, trust, memory, creativity, work, and how humans relate to intelligent tools. Blockchain is not only about tokens. It is about coordination, incentives, ownership, infrastructure, and how value moves across systems. Faith is not separate from leadership, discipline, patience, character, or the way a person builds. Systems thinking is not only for business or technology. It applies to habits, families, teams, societies, products, and personal growth.</p></div></section>
      <section className="themes section-rule"><SectionTitle eyebrow="Main themes" title="Continuing lines of thought" /><ol className="theme-list">{themes.map((theme, index) => <li key={theme}><span>{String(index + 1).padStart(2, "0")}</span>{theme}</li>)}</ol></section>
      <section className="relationship section-rule"><p className="eyebrow">Ideas into practice</p><div className="relationship-lines"><p>The Teff Papers <em>explains why.</em></p><p>Fred+Teff <em>demonstrates what.</em></p><p>Fred Studio <em>develops how.</em></p></div><p className="muted">The Papers are the thinking ground. Fred+Teff is one practical expression of that thinking, while Fred Studio is where some of those ideas may become more structured as products, systems, and future intelligent tools.</p><p className="muted">The Teff Papers will always remain bigger than one product because it is the source of the thinking.</p><Button href="/projects">Explore the projects</Button></section>
      <section className="section-block latest-papers"><SectionTitle eyebrow="Latest papers" title="Start with the latest papers and follow the ideas as they develop." /><p className="section-intro">Some pieces are reflections. Some are product notes. Some are systems thinking. Some are early signals of ideas that may later become products, companies, research, books, or something bigger.</p><div className="paper-list">{papers.slice(0, 5).map((paper) => <PaperCard key={paper.slug} paper={paper} />)}</div><Button href="/papers">View the full archive</Button></section>
    </PageContainer>
    <section className="closing"><PageContainer narrow><p className="eyebrow">An open invitation</p><h2>Start with the Manifesto, then follow the papers as the thinking develops.</h2><Button href="/manifesto">Read the Manifesto</Button></PageContainer></section>
  </>;
}
