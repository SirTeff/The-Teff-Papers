import type { FrontierMotion } from "@/lib/frontier-motion";

export const roomWidth = 1000;
export const roomHeight = 562.5;
export const exchangeSeconds = 4.8;
const tau = 2 * Math.PI;
const lights = { blue: "131,212,255", amber: "255,171,79", neutral: "245,241,223" };
type Point = FrontierMotion["focus"];
type Region = FrontierMotion["gestures"][number]["region"];

function smooth(value: number) {
  const n = Math.max(0, Math.min(1, value));
  return n * n * (3 - 2 * n);
}

type Patch = {
  region: Region;
  surface: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  original: Uint8ClampedArray;
  output: ImageData;
};

function createPatch(image: HTMLCanvasElement, region: Region): Patch | undefined {
  const [x, y, w, h] = region;
  const surface = document.createElement("canvas");
  surface.width = Math.max(2, Math.round(w * 760));
  surface.height = Math.max(2, Math.round(h * 427.5));
  const context = surface.getContext("2d", { willReadFrequently: true });
  if (!context) return;
  context.drawImage(image, x * image.width, y * image.height, w * image.width,
    h * image.height, 0, 0, surface.width, surface.height);
  return {
    region, surface, context,
    original: context.getImageData(0, 0, surface.width, surface.height).data,
    output: context.createImageData(surface.width, surface.height),
  };
}

function blit(context: CanvasRenderingContext2D, patch: Patch) {
  const [x, y, w, h] = patch.region;
  context.drawImage(patch.surface, x * roomWidth, y * roomHeight, w * roomWidth, h * roomHeight);
}

function sample(patch: Patch, x: number, y: number, offset: number, alpha: number) {
  const { width, height } = patch.surface;
  const u = Math.max(0, Math.min(width - 1.001, x));
  const v = Math.max(0, Math.min(height - 1.001, y));
  const column = Math.floor(u);
  const row = Math.floor(v);
  const left = (row * width + column) * 4;
  const right = left + width * 4;
  const dx = u - column;
  const dy = v - row;
  for (let color = 0; color < 3; color++) {
    const upper = patch.original[left + color] * (1 - dx) + patch.original[left + 4 + color] * dx;
    const lower = patch.original[right + color] * (1 - dx) + patch.original[right + 4 + color] * dx;
    patch.output.data[offset + color] = upper * (1 - dy) + lower * dy;
  }
  patch.output.data[offset + 3] = alpha * 255;
}

function drawGesture(context: CanvasRenderingContext2D, patch: Patch, gesture: FrontierMotion["gestures"][number], time: number) {
  const t = time - gesture.at;
  const progress = smooth(t / 1.12) * (1 - smooth((t - 1.58) / 1.18));
  if (progress <= .001) return;
  const { width, height } = patch.surface;
  const dx = gesture.travel[0] / patch.region[2] * width * progress;
  const dy = gesture.travel[1] / patch.region[3] * height * progress;
  for (let y = 0; y < height; y++) {
    const vertical = Math.sin(Math.PI * y / (height - 1));
    for (let x = 0; x < width; x++) {
      const weight = Math.sin(Math.PI * x / (width - 1)) * vertical;
      const offset = (y * width + x) * 4;
      if (weight < .04) patch.output.data[offset + 3] = 0;
      else sample(patch, x - dx * weight, y - dy * weight, offset, smooth(weight * 4));
    }
  }
  patch.context.putImageData(patch.output, 0, 0);
  blit(context, patch);
}

function updateGlobe(patch: Patch, globe: NonNullable<FrontierMotion["globe"]>, time: number) {
  const { width, height } = patch.surface;
  const phase = time * tau / globe.period;
  const angle = Math.sin(phase) * .38;
  for (let y = 0; y < height; y++) {
    const latitude = y / (height - 1) * 2 - 1;
    const halfWidth = Math.sqrt(Math.max(0, 1 - latitude * latitude));
    for (let x = 0; x < width; x++) {
      const longitude = x / (width - 1) * 2 - 1;
      const distance = Math.hypot(latitude, longitude);
      const ring = Math.abs(latitude * globe.radius[1] - globe.ring[0] - globe.ring[1] * longitude * globe.radius[0]);
      const offset = (y * width + x) * 4;
      if (distance >= .95 || ring < .011 || !halfWidth) {
        patch.output.data[offset + 3] = 0;
        continue;
      }
      const mapped = Math.asin(Math.max(-1, Math.min(1, longitude / halfWidth))) - angle;
      let u = Math.sin(Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mapped))) * halfWidth;
      const sampledRing = Math.abs(latitude * globe.radius[1] - globe.ring[0] - globe.ring[1] * u * globe.radius[0]);
      if (sampledRing < .013) u = longitude;
      const alpha = smooth((.95 - distance) * 8) * smooth((ring - .011) * 185) * Math.min(.78, Math.abs(angle) * 4);
      sample(patch, (u + 1) * .5 * (width - 1), y, offset, alpha);
    }
  }
  patch.context.putImageData(patch.output, 0, 0);
}

function glow(ctx: CanvasRenderingContext2D, point: Point, radius: number, rgb: string, alpha: number) {
  const x = point[0] * roomWidth;
  const y = point[1] * roomHeight;
  const falloff = ctx.createRadialGradient(x, y, 0, x, y, radius);
  falloff.addColorStop(0, `rgba(${rgb},${alpha})`);
  falloff.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = falloff;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function tracePoint(trace: FrontierMotion["traces"][number], fraction: number): Point {
  const start = (1 - fraction) ** 2;
  const bend = 2 * fraction * (1 - fraction);
  const end = fraction ** 2;
  return [
    start * trace.from[0] + bend * trace.bend[0] + end * trace.to[0],
    start * trace.from[1] + bend * trace.bend[1] + end * trace.to[1],
  ];
}

function drawTrace(ctx: CanvasRenderingContext2D, trace: FrontierMotion["traces"][number], elapsed: number) {
  const time = elapsed - trace.at;
  if (time <= 0 || time > 1.67) return;
  const p = smooth(time / 1.2);
  const head = tracePoint(trace, p);
  const rgb = lights[trace.light];
  const pulse = smooth(time / .18) * (1 - smooth((time - 1.11) / .55));
  for (let i = 0; i < 6; i++) {
    const tail = tracePoint(trace, Math.max(0, p - i * .042));
    const next = tracePoint(trace, Math.max(0, p - (i + 1) * .042));
    ctx.strokeStyle = `rgba(${rgb},${pulse * (1 - i / 6) * .83})`;
    ctx.lineWidth = 2.3 - i * .27;
    ctx.beginPath();
    ctx.moveTo(tail[0] * roomWidth, tail[1] * roomHeight);
    ctx.lineTo(next[0] * roomWidth, next[1] * roomHeight);
    ctx.stroke();
  }
  glow(ctx, head, 15, rgb, .71 * pulse);
}

export function prepareFrontierEffects(image: HTMLImageElement, motion: FrontierMotion) {
  // The image's natural dimensions can be density-corrected by srcset. Sample a known raster.
  const source = document.createElement("canvas");
  source.width = roomWidth;
  source.height = Math.round(roomHeight);
  source.getContext("2d")?.drawImage(image, 0, 0, source.width, source.height);
  const gestures = motion.gestures.map((gesture) => createPatch(source, gesture.region));
  const globe = motion.globe;
  const globePatch = globe && createPatch(source, [
    globe.center[0] - globe.radius[0], globe.center[1] - globe.radius[1], globe.radius[0] * 2, globe.radius[1] * 2,
  ]);
  let lastGlobeFrame = -1;

  return (ctx: CanvasRenderingContext2D, ambient: number, exchange: number) => {
    ctx.clearRect(0, 0, roomWidth, roomHeight);
    if (globe && globePatch) {
      const frame = Math.floor(ambient * 12);
      if (frame !== lastGlobeFrame) {
        updateGlobe(globePatch, globe, ambient);
        lastGlobeFrame = frame;
      }
      blit(ctx, globePatch);
      for (let i = 0; i < 13; i++) {
        const longitude = ambient * tau / globe.period + i * 2.4;
        const latitude = Math.sin(i * 1.6) * .82;
        const depth = Math.cos(longitude);
        if (depth <= 0) continue;
        const point: Point = [
          globe.center[0] + Math.sin(longitude) * Math.sqrt(1 - latitude ** 2) * globe.radius[0] * .9,
          globe.center[1] + latitude * globe.radius[1],
        ];
        glow(ctx, point, 4.2, i % 2 ? lights.amber : lights.blue, depth * .57);
      }
    }
    if (motion.lamp) glow(ctx, motion.lamp, 41, lights.amber, .10 + Math.sin(ambient * .74) * .071);
    for (let i = 0; i < 6; i++) {
      const phase = ambient * .55 + i * 2.4;
      const point: Point = [motion.focus[0] + Math.sin(phase) * (.017 + i * .009), motion.focus[1] + Math.cos(phase * 1.19) * .02];
      glow(ctx, point, 3.6, i % 2 ? lights.amber : lights.blue, .44 + Math.sin(phase * .8) * .28);
    }
    if (exchange >= exchangeSeconds) return;
    gestures.forEach((patch, index) => {
      if (patch) drawGesture(ctx, patch, motion.gestures[index], exchange);
    });
    motion.traces.forEach((trace) => drawTrace(ctx, trace, exchange));
    const responseTime = exchange - (motion.response?.at ?? 1.23);
    const response = smooth(responseTime / .65) * (1 - smooth((responseTime - 1.33) / 1.42));
    glow(ctx, motion.focus, 53, lights[motion.response?.light ?? "amber"], response * .51);
  };
}
