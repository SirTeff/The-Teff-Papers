import type { MarginStatus } from "./types";

const VALID_MARGIN_TRANSITIONS: Readonly<Record<MarginStatus, readonly MarginStatus[]>> = {
  pending: ["approved", "rejected", "spam"],
  approved: ["removed"],
  rejected: ["pending"],
  spam: ["pending"],
  removed: ["approved"],
};

export function canTransitionMarginStatus(from: MarginStatus, to: MarginStatus) {
  return VALID_MARGIN_TRANSITIONS[from].includes(to);
}

export function getValidMarginTransitions(status: MarginStatus) {
  return VALID_MARGIN_TRANSITIONS[status];
}
