import type { ReactNode } from "react";

export function PageContainer({
  children,
  narrow = false,
  className = "",
}: {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div className={`container ${narrow ? "container--narrow" : ""} ${className}`}>
      {children}
    </div>
  );
}
