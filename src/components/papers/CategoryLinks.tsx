import Link from "next/link";
import { getAllPaperCategories, getCategorySlug, getPaperCategoryCounts } from "@/lib/papers";
import styles from "@/app/editorial.module.css";

export function CategoryLinks({ current, includeAll = false }: { current?: string; includeAll?: boolean }) {
  const counts = getPaperCategoryCounts();
  return (
    <nav className={styles.categoryLinks} aria-label="Paper categories">
      {includeAll && <Link href="/papers" aria-current={current ? undefined : "page"}>All papers</Link>}
      {getAllPaperCategories().map((category) => (
        <Link
          href={"/categories/" + getCategorySlug(category)}
          key={category}
          aria-current={category === current ? "page" : undefined}
        >
          {category} <span className={styles.categoryCount}>{counts.get(category) ?? 0}</span>
        </Link>
      ))}
    </nav>
  );
}
