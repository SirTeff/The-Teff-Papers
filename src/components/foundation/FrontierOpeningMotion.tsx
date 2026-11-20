"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { FrontierMotion } from "@/lib/frontier-motion";
import { exchangeSeconds, prepareFrontierEffects, roomHeight, roomWidth } from "./frontier-effects";
import { isMotionPaused, motionIsAllowed, subscribeToMotion } from "./motion-preference";
import styles from "./frontier-room.module.css";

const serverPaused = () => false;

export function FrontierOpeningMotion({ motion }: { motion: FrontierMotion }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const paused = useSyncExternalStore(subscribeToMotion, isMotionPaused, serverPaused);

  useEffect(() => {
    const surface = canvas.current;
    const control = replay.current;
    const scene = surface?.parentElement;
    const image = scene?.querySelector("img");
    const context = surface?.getContext("2d");
    if (!surface || !control || !scene || !image || !context || !("IntersectionObserver" in window)) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    let lastFrame = 0;
    let ambient = 0;
    let exchange = 0;
    let interval = 32;
    let draw: ReturnType<typeof prepareFrontierEffects> | undefined;
    let source = "";

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = scene;
      if (!width || !height) return;
      interval = width < 520 ? 41 : 32;
      const ratio = Math.min(devicePixelRatio || 1, 1.25, 1120 / width, 630 / height);
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
      context.setTransform(surface.width / roomWidth, 0, 0, surface.height / roomHeight, 0, 0);
      if (draw && frame) draw(context, ambient, exchange);
    };

    const paint = (now: number) => {
      if (!lastFrame || now - lastFrame >= interval) {
        const elapsed = lastFrame ? Math.min(80, now - lastFrame) / 1000 : 0;
        ambient += elapsed;
        if (exchange < exchangeSeconds) {
          exchange = Math.min(exchangeSeconds, exchange + elapsed);
          if (exchange === exchangeSeconds) surface.setAttribute("data-exchange", "ambient");
        }
        lastFrame = now;
        draw?.(context, ambient, exchange);
      }
      frame = requestAnimationFrame(paint);
    };

    const sync = () => {
      const running = visible && motionIsAllowed(reduced) && image.complete && image.naturalWidth > 0;
      if (running && source !== image.currentSrc) {
        draw = prepareFrontierEffects(image, motion);
        source = image.currentSrc;
        control.setAttribute("data-replay-ready", "");
      }
      if (running && !frame) {
        resize();
        surface.setAttribute("data-frontier-running", "");
        surface.setAttribute("data-exchange", exchange < exchangeSeconds ? "opening" : "ambient");
        frame = requestAnimationFrame(paint);
      } else if (!running && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        surface.removeAttribute("data-frontier-running");
      }
    };

    const replayOpening = () => {
      if (!motionIsAllowed(reduced)) return;
      exchange = 0;
      surface.setAttribute("data-exchange", "opening");
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= .15;
      sync();
    }, { threshold: .15 });
    const sizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : undefined;
    const unsubscribe = subscribeToMotion(sync);
    observer.observe(scene);
    sizeObserver?.observe(scene);
    image.addEventListener("load", sync);
    control.addEventListener("click", replayOpening);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver?.disconnect();
      unsubscribe();
      image.removeEventListener("load", sync);
      control.removeEventListener("click", replayOpening);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [motion]);

  return (
    <>
      <canvas ref={canvas} className={styles.effects} data-frontier-effects aria-hidden="true" />
      <button ref={replay} className={styles.replay} type="button" disabled={paused} aria-label="Replay opening exchange" title="Replay opening exchange">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 10a8 8 0 1 1 1.8 7M4 4v6h6" />
        </svg>
      </button>
    </>
  );
}
