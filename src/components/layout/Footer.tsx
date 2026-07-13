import Link from "next/link";
import { PageContainer } from "./PageContainer";

export function Footer() {
  return (
    <footer className="site-footer">
      <PageContainer className="footer-grid">
        <div>
          <p className="wordmark">The Teff Papers</p>
          <p className="footer-note">Clear thinking, documented over time.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/papers">The Papers</Link>
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className="footer-copyright">© {new Date().getFullYear()} Teff</p>
      </PageContainer>
    </footer>
  );
}
