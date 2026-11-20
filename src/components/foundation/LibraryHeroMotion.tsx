"use client";

import { useEffect, useRef } from "react";
import { motionIsAllowed, subscribeToMotion } from "./motion-preference";
import styles from "./library-hero.module.css";

const tau = 2 * Math.PI;
const frameInterval = 1000 / 30;
const globe = { x: 1317, y: 487, size: 80, centerX: 39.5, centerY: 39.8, radius: 36.6 };
const trails = [
  { points: [-42, 19, 123, 213, 318, 309, 551, 360], duration: 8.6, phase: .25 },
  { points: [-48, 129, 132, 265, 322, 325, 554, 367], duration: 10.9, phase: .59 },
  { points: [395, 744, -197, 694, 200, 529, 555, 423], duration: 9.4, phase: .38 },
  { points: [93, 638, 116, 577, 307, 503, 540, 435], duration: 7.5, phase: .71 },
];
const lamps = [
  [469, 664, 64, 6.8, 1.1], [864, 356, 60, 8.5, 3.6], [1644, 341, 62, 9.7, .6],
  [1118, 510, 43, 7.3, 2], [1280, 389, 72, 10.6, 4.4], [1478, 285, 54, 7.9, 2.8],
  [1279, 657, 41, 11.1, 1.3], [1440, 655, 34, 6.1, 2.3],
];

type GlobeTexture = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  source: ImageData;
  patch: ImageData;
};

function glow(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const falloff = context.createRadialGradient(x, y, 0, x, y, radius);
  falloff.addColorStop(0, color);
  falloff.addColorStop(1, "transparent");
  context.fillStyle = falloff;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function pointOnTrail(points: number[], t: number) {
  const s = 1 - t;
  const a = s * s * s;
  const b = 3 * s * s * t;
  const c = 3 * s * t * t;
  const d = t * t * t;
  return {
    x: a * points[0] + b * points[2] + c * points[4] + d * points[6],
    y: a * points[1] + b * points[3] + c * points[5] + d * points[7],
  };
}

function drawTrails(context: CanvasRenderingContext2D, time: number) {
  for (const { points, duration, phase } of trails) {
    for (let index = 0; index < 2; index++) {
      const progress = (time / duration + phase + index * .5) % 1;
      const tail = pointOnTrail(points, Math.max(0, progress - .025));
      const head = pointOnTrail(points, progress);
      context.globalAlpha = Math.min(progress * 9, (1 - progress) * 11, 1) * (index === 1 ? .56 : .92);
      const streak = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
      streak.addColorStop(0, "transparent");
      streak.addColorStop(1, "#ffd089");
      context.strokeStyle = streak;
      context.lineWidth = index === 1 ? 1 : 1.65;
      context.beginPath();
      context.moveTo(tail.x, tail.y);
      context.lineTo(head.x, head.y);
      context.stroke();
      glow(context, head.x, head.y, index === 1 ? 5 : 9, "rgba(255,167,63,.74)");
      context.fillStyle = "#ffedd1";
      context.beginPath();
      context.arc(head.x, head.y, index === 1 ? 1 : 1.45, 0, tau);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}

function drawLibraryLights(context: CanvasRenderingContext2D, time: number, cropStart: number) {
  for (const [x, y, radius, period, phase] of lamps) {
    if (x + radius < cropStart) continue;
    const intensity = Math.sin((time + phase) * tau / period) * .72 + Math.sin(time * .83 + phase * 2) * .28;
    const highlight = intensity >= 0;
    context.globalAlpha = Math.abs(intensity) * (highlight ? .72 : .45);
    glow(context, x, y, radius, highlight ? "rgba(255,174,79,.58)" : "rgba(29,13,9,.49)");
  }
  context.globalAlpha = 1;
}

function drawMist(context: CanvasRenderingContext2D, time: number) {
  context.save();
  context.translate(170 + Math.sin(time * tau / 24) * 82, 698 + Math.cos(time * tau / 24) * 47);
  context.rotate(-.19);
  context.scale(2.6, .62);
  glow(context, 0, 0, 132, "rgba(80,149,188,.22)");
  context.restore();
}

function ringX(y: number) {
  return 39.8 - (y - 39) * .11;
}

function drawGlobe(context: CanvasRenderingContext2D, texture: GlobeTexture, time: number) {
  const { size, radius, centerX, centerY } = globe;
  const { source, patch } = texture;
  const angle = Math.sin(time * tau / 48) * .49;
  const strength = Math.min(Math.abs(angle) * 6, .88);

  for (let y = 0; y < size; y++) {
    const vertical = (y - centerY) / radius;
    const halfWidth = radius * Math.sqrt(Math.max(0, 1 - vertical * vertical));
    for (let x = 0; x < size; x++) {
      const destinationOffset = (y * size + x) * 4;
      const horizontal = (x - centerX) / radius;
      const distance = Math.hypot(horizontal, vertical);
      const ringClearance = Math.min(Math.abs(x - ringX(y)) - 3, Math.abs(y - 40) - 4);
      const support = y > 62 && Math.abs(x - 39) < 16;
      if (distance >= .97 || ringClearance <= 0 || support || !halfWidth) {
        patch.data[destinationOffset + 3] = 0;
        continue;
      }

      const longitude = Math.asin(Math.max(-1, Math.min(1, (x - centerX) / halfWidth)));
      let sampleX = centerX + Math.sin(Math.max(-Math.PI / 2, Math.min(Math.PI / 2, longitude - angle))) * halfWidth;
      const axle = ringX(y);
      if (Math.abs(sampleX - axle) < 3.8) sampleX = axle + (sampleX < axle ? -3.8 : 3.8);
      const sourceOffset = (y * size + Math.round(sampleX)) * 4;
      const edge = Math.min((.97 - distance) * 9, ringClearance / 3, 1);
      patch.data[destinationOffset] = source.data[sourceOffset];
      patch.data[destinationOffset + 1] = source.data[sourceOffset + 1];
      patch.data[destinationOffset + 2] = source.data[sourceOffset + 2];
      patch.data[destinationOffset + 3] = edge * strength * 255;
    }
  }
  texture.context.putImageData(patch, 0, 0);
  context.drawImage(texture.canvas, globe.x, globe.y);
}

export function LibraryHeroMotion() {
  const effects = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = effects.current;
    const plate = surface?.parentElement;
    const hero = plate?.closest("[data-motion-scene]");
    const artwork = plate?.querySelector("img");
    const context = surface?.getContext("2d");
    if (!surface || !plate || !hero || !artwork || !context || !("IntersectionObserver" in window)) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 42rem)");
    const globeCanvas = document.createElement("canvas");
    globeCanvas.width = globeCanvas.height = globe.size;
    const globeContext = globeCanvas.getContext("2d", { willReadFrequently: true });
    let texture: GlobeTexture | undefined;
    let textureImage: HTMLImageElement | undefined;
    let frame = 0;
    let lastDraw = 0;
    let elapsed = 0;
    let visible = false;
    let cropStart = 0;
    let cropWidth = 1672;

    const resize = () => {
      const { width, height } = plate.getBoundingClientRect();
      if (!width || !height) return;
      cropStart = mobile.matches ? 820 : 0;
      cropWidth = mobile.matches ? 852 : 1672;
      const ratio = Math.min(devicePixelRatio || 1, 1.35, 1200 / width, 720 / height);
      surface.width = Math.max(1, Math.round(width * ratio));
      surface.height = Math.max(1, Math.round(height * ratio));
      const scale = surface.width / cropWidth;
      context.setTransform(scale, 0, 0, surface.height / 941, -cropStart * scale, 0);
    };

    const paint = (now: number) => {
      if (!lastDraw || now - lastDraw >= frameInterval - 1) {
        if (lastDraw) elapsed += Math.min(now - lastDraw, 66) / 1000;
        lastDraw = now;
        context.clearRect(cropStart, 0, cropWidth, 941);
        if (!mobile.matches) {
          drawMist(context, elapsed);
          drawTrails(context, elapsed);
        }
        drawLibraryLights(context, elapsed, cropStart);
        if (texture) drawGlobe(context, texture, elapsed);
      }
      frame = requestAnimationFrame(paint);
    };

    const prepareGlobe = () => {
      if (!globeContext || textureImage) return;
      const image = new Image();
      textureImage = image;
      image.fetchPriority = "low";
      image.onload = () => {
        globeContext.drawImage(image, 0, 0);
        texture = {
          canvas: globeCanvas,
          context: globeContext,
          source: globeContext.getImageData(0, 0, globe.size, globe.size),
          patch: globeContext.createImageData(globe.size, globe.size),
        };
        surface.setAttribute("data-globe-ready", "");
      };
      image.src = "/artwork/homepage-library-globe.webp";
    };

    const sync = () => {
      const running = visible && artwork.complete && artwork.naturalWidth > 0 && motionIsAllowed(reduced);
      if (running && !frame) {
        prepareGlobe();
        resize();
        frame = requestAnimationFrame(paint);
        surface.setAttribute("data-library-running", "");
      } else if (!running && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        lastDraw = 0;
        surface.removeAttribute("data-library-running");
      }
    };

    const sceneObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : undefined;
    const unsubscribe = subscribeToMotion(sync);
    sceneObserver.observe(hero);
    resizeObserver?.observe(plate);
    artwork.addEventListener("load", sync);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(frame);
      if (textureImage) textureImage.onload = null;
      sceneObserver.disconnect();
      resizeObserver?.disconnect();
      unsubscribe();
      artwork.removeEventListener("load", sync);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas className={styles.effects} data-library-effects ref={effects} aria-hidden="true" />;
}
