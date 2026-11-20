import { ArrowIcon } from "@/components/shared/ArrowIcon";
import Link from "next/link";
import type { ReactNode } from "react";

export function Button({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children} <ArrowIcon direction="right" />
    </Link>
  );
}
