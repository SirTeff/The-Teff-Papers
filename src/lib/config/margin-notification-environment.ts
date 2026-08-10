import "server-only";

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export class MarginNotificationConfigurationError extends Error {
  constructor() {
    super("Margin administrator email notifications are not configured.");
    this.name = "MarginNotificationConfigurationError";
  }
}

function requiredValue(environment: NodeJS.ProcessEnv, name: string) {
  const value = environment[name]?.trim();
  if (!value || /[\r\n]/.test(value)) throw new MarginNotificationConfigurationError();
  return value;
}

function isValidSender(value: string) {
  if (EMAIL_PATTERN.test(value)) return true;
  const namedSender = /^[^<>]+<([^<>]+)>$/.exec(value);
  return Boolean(namedSender && EMAIL_PATTERN.test(namedSender[1].trim()));
}

export function getMarginNotificationConfiguration(environment: NodeJS.ProcessEnv = process.env) {
  const apiKey = requiredValue(environment, "RESEND_API_KEY");
  const notificationEmail = requiredValue(environment, "MARGIN_NOTIFICATION_EMAIL");
  const fromEmail = requiredValue(environment, "MARGIN_NOTIFICATION_FROM_EMAIL");

  if (!EMAIL_PATTERN.test(notificationEmail) || !isValidSender(fromEmail)) {
    throw new MarginNotificationConfigurationError();
  }

  return { apiKey, notificationEmail, fromEmail } as const;
}
