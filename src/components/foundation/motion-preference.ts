const key = "teff-motion-paused";
const listeners = new Set<() => void>();
let localOverride: boolean | undefined;

export function isMotionPaused() {
  if (localOverride !== undefined) return localOverride;
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function toggleMotion() {
  localOverride = !isMotionPaused();
  try {
    window.sessionStorage.setItem(key, String(localOverride));
  } catch {
    // The in-memory preference still applies when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToMotion(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function motionIsAllowed(reduced: MediaQueryList) {
  return !document.hidden && !reduced.matches && !isMotionPaused();
}
