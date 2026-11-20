"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Brand } from "./Brand";
import { PageContainer } from "./PageContainer";
import styles from "./site-shell.module.css";

const links = [
  ["Home", "/"],
  ["The Papers", "/papers"],
  ["The Frontier", "/categories/the-frontier"],
  ["Manifesto", "/manifesto"],
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  const navigation = links.map(([label, href]) => {
    const isPage = pathname === href;
    const isSection = isPage || (href !== "/" && pathname.startsWith(href + "/"));

    return (
      <Link
        key={href}
        href={href}
        aria-current={isPage ? "page" : undefined}
        data-section-active={isSection || undefined}
        onClick={closeMenu}
      >
        {label}
      </Link>
    );
  });

  return (
    <header className={styles.header}>
      <PageContainer className={styles.headerInner}>
        <Link className={styles.brandLink} href="/" onClick={closeMenu}>
          <Brand />
        </Link>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navigation}
        </nav>
        <details
          className={styles.mobileMenu}
          ref={menu}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !event.currentTarget.open) return;
            event.preventDefault();
            closeMenu();
            summary.current?.focus();
          }}
        >
          <summary className={styles.menuToggle} ref={summary}>
            Menu <span className={styles.chevron} aria-hidden="true" />
          </summary>
          <nav className={styles.mobileNav} aria-label="Main navigation">
            {navigation}
          </nav>
        </details>
      </PageContainer>
    </header>
  );
}
