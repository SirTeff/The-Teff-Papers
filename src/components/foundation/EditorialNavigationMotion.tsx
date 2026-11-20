"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motionIsAllowed, subscribeToMotion } from "./motion-preference";

export function EditorialNavigationMotion() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const target = document.querySelector<HTMLElement>("main [data-editorial-entry]");
    if (!target?.animate) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motionIsAllowed(reduced)) return;

    const animation = target.animate([{ opacity: .68 }, { opacity: 1 }], {
      duration: 390,
      easing: "cubic-bezier(.2,.65,.3,1)",
    });

    function cancelIfNeeded() {
      if (!motionIsAllowed(reduced)) animation.cancel();
    }
    const unsubscribe = subscribeToMotion(cancelIfNeeded);
    reduced.addEventListener("change", cancelIfNeeded);
    document.addEventListener("visibilitychange", cancelIfNeeded);

    return () => {
      animation.cancel();
      unsubscribe();
      reduced.removeEventListener("change", cancelIfNeeded);
      document.removeEventListener("visibilitychange", cancelIfNeeded);
    };
  }, [pathname]);

  return null;
}
