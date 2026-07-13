"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PageContainer } from "./PageContainer";

const links = [
  ["Home", "/"],
  ["The Papers", "/papers"],
  ["Manifesto", "/manifesto"],
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <PageContainer className="header-inner">
        <Link className="wordmark" href="/" onClick={() => setOpen(false)}>
          The Teff Papers
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
        </button>
        <nav
          id="main-navigation"
          className={`main-nav ${open ? "main-nav--open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => {
            const current = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </PageContainer>
    </header>
  );
}
