import type { MARGIN_STATUSES, MARGIN_TARGET_TYPES, MODERATION_ACTIONS } from "./constants";

export type MarginTargetType = (typeof MARGIN_TARGET_TYPES)[number];
export type MarginStatus = (typeof MARGIN_STATUSES)[number];
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export type MarginEntry = {
  id: string;
  targetType: MarginTargetType;
  targetKey: string;
  displayName: string | null;
  body: string;
  status: MarginStatus;
  featured: boolean;
  createdAt: string;
  moderatedAt: string | null;
  publishedAt: string | null;
  moderatedBy: string | null;
  moderationNote: string | null;
  submissionKey: string;
};

export type PublicMarginEntry = Pick<
  MarginEntry,
  "id" | "targetType" | "targetKey" | "displayName" | "body" | "createdAt" | "publishedAt" | "featured"
>;

export type MarginSettings = {
  targetType: MarginTargetType;
  targetKey: string;
  isOpen: boolean;
};

export type ModerationEvent = {
  id: string;
  entryId: string;
  action: ModerationAction;
  actor: string;
  reason: string | null;
  createdAt: string;
};

export type MarginCounts = Record<MarginStatus, number>;

export type AdminMarginEntry = Omit<MarginEntry, "submissionKey">;

export type MarginQueuePage = {
  entries: AdminMarginEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type MarginReadResult<T> =
  | { state: "disabled"; data: T }
  | { state: "ready"; data: T }
  | { state: "unavailable"; data: T; error: "configuration" | "database" };

export type MarginSubmissionInput = {
  targetType: MarginTargetType;
  targetKey: string;
  displayName: string | null;
  body: string;
  submissionKey: string;
};
