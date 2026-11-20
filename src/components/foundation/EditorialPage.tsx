import type { ReactNode } from "react";
import styles from "./editorial-page.module.css";

export function EditorialPage({ title, eyebrow, lead, wide = false, children }: {
  title: string;
  eyebrow?: string;
  lead?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const frame = wide ? `${styles.frame} ${styles.wide}` : styles.frame;
  return (
    <div>
      <header className={styles.opening}>
        <div className={frame} data-editorial-entry>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
      </header>
      <div className={`${frame} ${styles.content}`}>{children}</div>
    </div>
  );
}
