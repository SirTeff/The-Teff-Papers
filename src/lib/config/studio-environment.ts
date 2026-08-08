import "server-only";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StudioConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudioConfigurationError";
  }
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStudioAdminEmails() {
  const emails = (process.env.TEFF_STUDIO_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeAdminEmail)
    .filter(Boolean);

  if (!emails.length) {
    throw new StudioConfigurationError("TEFF_STUDIO_ADMIN_EMAILS must contain at least one administrator email.");
  }

  const invalid = emails.find((email) => !EMAIL_PATTERN.test(email));
  if (invalid) throw new StudioConfigurationError("TEFF_STUDIO_ADMIN_EMAILS contains an invalid email address.");

  return new Set(emails);
}
