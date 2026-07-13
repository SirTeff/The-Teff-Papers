import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = { title: "Projects", description: "Fred+Teff and Fred Studio: practical expressions of the thinking behind The Teff Papers." };

export default function ProjectsPage() {
  return <PageContainer className="page-shell"><header className="page-intro"><p className="eyebrow">Ideas into practice</p><h1>Projects</h1><p>The Teff Papers explains why. Fred+Teff demonstrates what. Fred Studio develops how.</p></header><div className="project-grid project-grid--content">
    <article className="project-card"><div className="project-topline"><span>Early build / personal AI assistant project</span><span>Personal Digital Intelligence</span></div><h2>Fred+Teff</h2><p className="project-lead">Fred+Teff is a personal AI command center built around one idea: a useful personal AI should not only respond to prompts. It should understand context, help organise thinking, prepare useful output, and support action without taking control away from the user.</p><div className="project-copy">
      <p>Fred+Teff is one practical expression of the thinking behind The Teff Papers.</p>
      <p>The project began from a simple question: what should a personal AI actually feel like if it was built around a real person&apos;s life, work, ideas, learning, and future plans?</p>
      <p>Not a generic assistant. Not just a chatbot. Not a tool that waits for perfect instructions every time. Something closer to a personal digital intelligence that can help capture ideas, organise tasks, prepare drafts, support applications, think through projects, remember useful context, and eventually connect to tools that can carry out approved actions.</p>
      <p>The important word is approved.</p>
      <p>Fred+Teff is not being imagined as an AI that simply acts on its own. The direction is different. The user should remain in control. Fred should help understand, prepare, suggest, organise, and execute only when the user approves what matters.</p>
      <p>That principle will shape the product.</p>
      <p>Memory matters, but memory must be controlled. Automation matters, but automation must be trusted. Personalisation matters, but personalisation must not become hidden manipulation.</p>
      <p>Fred+Teff is still early, but the philosophy is already clear.</p>
      <p>The Teff Papers explains why this kind of personal intelligence matters. Fred+Teff demonstrates what it could become. Fred Studio will develop how some of these ideas can be structured, refined, and eventually expanded.</p>
      <h3>Safe public themes</h3><ul><li>Personal digital intelligence</li><li>AI memory</li><li>User approval</li><li>Personal automation</li><li>Context-aware assistance</li><li>Human-AI collaboration</li><li>Product trust</li><li>Building personal tools</li><li>Lessons from early development</li></ul>
    </div><p className="project-note">Private implementation details remain protected.</p></article>
    <article className="project-card"><div className="project-topline"><span>Concept / product philosophy and documentation stage</span><span>AI Product Development</span></div><h2>Fred Studio</h2><p className="project-lead">Fred Studio is the wider product direction behind Fred+Teff. It is where the ideas around personal digital intelligence, AI memory, custom assistants, automation, trust, and user-controlled intelligence can become more structured over time.</p><div className="project-copy">
      <p>Fred Studio is the wider thinking space behind Fred+Teff.</p>
      <p>If Fred+Teff is the personal version, Fred Studio is where the larger product direction can grow.</p>
      <p>The idea is that AI assistants should not remain generic forever. People use AI differently. They think differently, work differently, remember differently, plan differently, and need support in different ways.</p>
      <p>So the future of AI will not only be about more powerful models. It will also be about more personal systems. Systems that understand context, adapt to the user, help without becoming intrusive, and can be shaped around a person, a workflow, a project, a business, or a life.</p>
      <p>Fred Studio is the place where those ideas can be explored properly.</p>
      <p>It connects product thinking, personal digital intelligence, memory, automation, behaviour, trust, interface design, and the practical question of how intelligent tools should work in real life.</p>
      <p>At this stage, Fred Studio is not being presented as a finished company or product. It is being documented as a direction.</p>
      <p>The Teff Papers will preserve the thinking behind it. Fred+Teff will test some of the ideas personally. Fred Studio may later turn those ideas into broader products, systems, and tools.</p>
      <p>The work begins with documentation.</p><p>Then it becomes design.</p><p>Then it becomes build.</p>
    </div><p className="project-note">Fred Studio grows from the same foundation: Document first. Build second. Publish with structure from day one.</p></article>
  </div></PageContainer>;
}
