"use client";

import { useEffect, useRef } from "react";
import { motionIsAllowed, subscribeToMotion } from "./motion-preference";
import styles from "./scene.module.css";

export function ArtworkPointerLight() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const field = anchor.current?.parentElement;
    const scene = field?.closest<HTMLElement>("[data-motion-scene]");
    if (!field || !scene) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reset = () => {
      field.removeAttribute("data-light-tracked");
      for (const property of ["--pointer-x", "--pointer-y", "--light-x", "--light-y"]) {
        field.style.removeProperty(property);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || !motionIsAllowed(reduced)) return;
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      field.style.setProperty("--pointer-x", `${((x - .5) * 22).toFixed(1)}px`);
      field.style.setProperty("--pointer-y", `${((y - .5) * 16).toFixed(1)}px`);
      field.style.setProperty("--light-x", `${(x * bounds.width).toFixed(1)}px`);
      field.style.setProperty("--light-y", `${(y * bounds.height).toFixed(1)}px`);
      field.setAttribute("data-light-tracked", "");
    };

    const unsubscribe = subscribeToMotion(reset);
    scene.addEventListener("pointermove", onPointer, { passive: true });
    scene.addEventListener("pointerleave", reset);
    fine.addEventListener("change", reset);
    reduced.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);

    return () => {
      reset();
      unsubscribe();
      scene.removeEventListener("pointermove", onPointer);
      scene.removeEventListener("pointerleave", reset);
      fine.removeEventListener("change", reset);
      reduced.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);

  return <span ref={anchor} className={styles.light} aria-hidden="true" />;
}
