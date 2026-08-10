import "server-only";
import { Resend } from "resend";
import {
  getMarginNotificationConfiguration,
  MarginNotificationConfigurationError,
} from "@/lib/config/margin-notification-environment";
import { siteConfig } from "@/lib/metadata";
import { buildMarginNotification, type MarginNotificationInput } from "./notification-core";

export type MarginNotificationErrorCategory = "configuration" | "provider" | "unknown";

export class MarginNotificationError extends Error {
  constructor(readonly category: MarginNotificationErrorCategory) {
    super("The Margin administrator notification could not be sent.");
    this.name = "MarginNotificationError";
  }
}

export function getMarginNotificationErrorCategory(error: unknown): MarginNotificationErrorCategory {
  return error instanceof MarginNotificationError ? error.category : "unknown";
}

export async function sendMarginAdminNotification(input: MarginNotificationInput) {
  let configuration: ReturnType<typeof getMarginNotificationConfiguration>;
  try {
    configuration = getMarginNotificationConfiguration();
  } catch (error) {
    if (error instanceof MarginNotificationConfigurationError) {
      throw new MarginNotificationError("configuration");
    }
    throw new MarginNotificationError("unknown");
  }

  const message = buildMarginNotification(input, siteConfig.url);

  try {
    const { error } = await new Resend(configuration.apiKey).emails.send(
      {
        from: configuration.fromEmail,
        to: configuration.notificationEmail,
        subject: message.subject,
        text: message.text,
      },
      { idempotencyKey: `margin-note/${input.entryId}` },
    );
    if (error) throw new MarginNotificationError("provider");
  } catch {
    throw new MarginNotificationError("provider");
  }
}
