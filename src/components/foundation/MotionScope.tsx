"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { isMotionPaused, motionIsAllowed, subscribeToMotion, toggleMotion } from "./motion-preference";
import styles from "./foundation.module.css";

const serverMotionPaused = () => false;

export function MotionScope({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const paused = useSyncExternalStore(subscribeToMotion, isMotionPaused, serverMotionPaused);

  useEffect(() => {
    const container = root.current;
    if (!container || !("IntersectionObserver" in window)) return;

    const scenes = container.querySelectorAll("[data-motion-scene]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = new Map<Element, Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.toggleAttribute("data-motion-visible", entry.isIntersecting);
      }
    });
    const revealObserver = new IntersectionObserver((entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        revealObserver.unobserve(target);
        if (!target.animate || !motionIsAllowed(reduced) || target.contains(document.activeElement)) continue;
        const animation = target.animate(
          [{ opacity: .65, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
          { duration: 480, easing: "cubic-bezier(.2,.65,.3,1)" },
        );
        reveals.set(target, animation);
        animation.onfinish = () => { reveals.delete(target); };
      }
    }, { threshold: .01, rootMargin: "0px 0px -6% 0px" });

    function cancelReveals() {
      for (const animation of reveals.values()) animation.cancel();
      reveals.clear();
    }

    function syncVisibility() {
      container?.toggleAttribute("data-page-visible", !document.hidden);
      if (!motionIsAllowed(reduced)) cancelReveals();
    }
    const unsubscribe = subscribeToMotion(syncVisibility);

    scenes.forEach((scene) => observer.observe(scene));
    container.querySelectorAll("[data-motion-reveal]").forEach((target) => revealObserver.observe(target));
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    reduced.addEventListener("change", syncVisibility);
    container.addEventListener("focusin", cancelReveals);
    container.setAttribute("data-motion-ready", "");

    return () => {
      observer.disconnect();
      revealObserver.disconnect();
      cancelReveals();
      unsubscribe();
      document.removeEventListener("visibilitychange", syncVisibility);
      reduced.removeEventListener("change", syncVisibility);
      container.removeEventListener("focusin", cancelReveals);
      scenes.forEach((scene) => scene.removeAttribute("data-motion-visible"));
      container.removeAttribute("data-motion-ready");
      container.removeAttribute("data-page-visible");
    };
  }, []);

  return (
    <div className={styles.scope} ref={root} data-motion-scope data-motion-paused={paused ? "" : undefined}>
      {children}
    </div>
  );
}

export function MotionToggle() {
  const paused = useSyncExternalStore(subscribeToMotion, isMotionPaused, serverMotionPaused);

  const label = paused ? "Resume motion" : "Pause motion";

  return (
    <button className={styles.motionButton} type="button" onClick={toggleMotion} aria-label={label} title={label}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        {paused ? <path d="M7 4.5v15l12-7.5z" /> : <path d="M6 5h4v14H6zm8 0h4v14h-4z" />}
      </svg>
    </button>
  );
}
