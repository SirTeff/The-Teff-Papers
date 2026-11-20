import Link from "next/link";
import styles from "./foundation.module.css";

export function ResearchPath({
  steps,
  currentHref,
}: {
  steps: readonly { href: string; title: string }[];
  currentHref?: string;
}) {
  return (
    <ol className={styles.path} aria-label="Research contributions">
      {steps.map(({ href, title }, index) => (
        <li className={styles.pathStep} key={href}>
          {index < steps.length - 1 && (
            <span className={styles.connection} aria-hidden="true"><span data-ambient /></span>
          )}
          <Link
            className={styles.pathLink}
            href={href}
            aria-current={href === currentHref ? "step" : undefined}
            prefetch={false}
          >
            <span className={styles.node} aria-hidden="true" />
            <span className={styles.stepLabel}>{index + 1}. {title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
