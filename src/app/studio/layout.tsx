import type { Metadata } from "next";
import Link from "next/link";
import "./studio.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teff Studio",
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="studio-shell">
      <header className="studio-header">
        <Link href="/studio" className="studio-wordmark">Teff Studio</Link>
        <nav aria-label="Studio navigation"><Link href="/studio/margin">Margin queue</Link></nav>
      </header>
      {children}
    </div>
  );
}
