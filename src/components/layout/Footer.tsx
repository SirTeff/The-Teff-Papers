import Link from "next/link";
import { Brand } from "./Brand";
import { PageContainer } from "./PageContainer";
import styles from "./site-shell.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <PageContainer className={styles.footerInner}>
        <div>
          <Link className={styles.brandLink} href="/"><Brand /></Link>
          <p className={styles.footerNote}>Clear thinking, documented over time.</p>
        </div>
        <nav className={styles.footerNav} aria-label="Footer navigation">
          <Link href="/papers">The Papers</Link>
          <Link href="/categories/the-frontier">The Frontier</Link>
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className={styles.copyright}>© {new Date().getFullYear()} Teff</p>
      </PageContainer>
    </footer>
  );
}
