export const MARGIN_BODY_MIN_LENGTH = 20;
export const MARGIN_BODY_MAX_LENGTH = 1_200;
export const MARGIN_NAME_MAX_LENGTH = 80;
export const MARGIN_TARGET_KEY_MAX_LENGTH = 200;

export const MARGIN_TARGET_TYPES = ["paper"] as const;
export const MARGIN_STATUSES = ["pending", "approved", "rejected", "spam", "removed"] as const;
export const MODERATION_ACTIONS = [
  "approved",
  "rejected",
  "marked_spam",
  "removed",
  "restored_pending",
  "restored_approved",
  "featured",
  "unfeatured",
] as const;
