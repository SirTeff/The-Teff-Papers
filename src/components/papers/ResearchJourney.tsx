import Link from "next/link";
import { formatDate, getCategorySlug } from "@/lib/papers";
import type { ResearchJourney as Journey } from "@/lib/research";
import styles from "@/app/research.module.css";

const statusLabel = { open: "Open", developed: "Developed further", addressed: "Addressed in a later paper" };

function QuestionList({ title, prefix, questions }: { title: string; prefix: string; questions: Journey["questions"] }) {
  if (!questions.length) return null;
  return (
    <details className={styles.openQuestions}>
      <summary>{title}</summary>
      <ul className={styles.questionList}>
        {questions.map(({ id, text, origin, status, updates }) => (
          <li key={id} id={`${prefix}-question-${id}`}>
            <p className={styles.questionStatus}>{statusLabel[status]}</p>
            <p>{text}</p>
            <Link href={`/papers/${origin.slug}`}>{origin.title}</Link>
            {updates.length > 0 && (
              <ol className={styles.questionHistory}>
                {updates.map(({ paper, status, explanation }) => (
                  <li key={paper.slug}>
                    <p className={styles.questionStatus}>{statusLabel[status]} · {formatDate(paper.date)}</p>
                    <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                    <p>{explanation}</p>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ResearchJourney({ journey, current }: { journey: Journey; current?: string }) {
  if (!journey.steps.length) return null;
  const position = journey.steps.findIndex(({ paper }) => paper.slug === current);
  const previous = position > 0 ? journey.steps[position - 1].paper : undefined;
  const next = position >= 0 ? journey.steps[position + 1]?.paper : undefined;
  const id = `research-${journey.id}`;

  return (
    <section className={styles.journey} id={id} aria-labelledby={`${id}-heading`}>
      <header className={styles.journeyHeader}>
        <p className={styles.eyebrow}>{journey.title}</p>
        <h2 id={`${id}-heading`}>Research journey</h2>
        <p>{journey.description}</p>
        {current && <Link href={`/categories/${getCategorySlug(journey.category)}#${id}`}>See the series in the archive</Link>}
      </header>
      <ol className={styles.steps} role="list">
        {journey.steps.map(({ paper, notes }) => {
          const active = paper.slug === current;
          return (
            <li key={paper.slug} className={styles.step} data-current={active || undefined} data-branch={notes?.branch || undefined}>
              <div className={styles.stepMeta}>
                <span>{notes?.role ?? "Series paper"}</span>
                <time dateTime={paper.date}>{formatDate(paper.date)}</time>
              </div>
              <h3><Link href={`/papers/${paper.slug}`} aria-current={active ? "page" : undefined}>{paper.title}</Link></h3>
              {notes ? (
                <details open={active || undefined}>
                  <summary>{notes.question}</summary>
                  <p>{notes.development}</p>
                </details>
              ) : <p>{paper.excerpt}</p>}
            </li>
          );
        })}
      </ol>
      <QuestionList title="Open questions across this series" prefix={id} questions={journey.questions.filter(({ status }) => status !== "addressed")} />
      <QuestionList title="Addressed questions" prefix={id} questions={journey.questions.filter(({ status }) => status === "addressed")} />
      {(previous || next) && (
        <nav className={styles.sequence} aria-label={`${journey.title} publication order`}>
          {previous && <Link href={`/papers/${previous.slug}`}><span>Previous publication</span>{previous.title}</Link>}
          {next && <Link href={`/papers/${next.slug}`}><span>Next publication</span>{next.title}</Link>}
        </nav>
      )}
    </section>
  );
}
