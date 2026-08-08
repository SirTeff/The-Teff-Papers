const REQUIRED_PUBLIC_MARGIN_ENVIRONMENT_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const REQUIRED_MARGIN_SUBMISSION_ENVIRONMENT_VARIABLES = [
  "SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "MARGIN_RATE_LIMIT_SECRET",
] as const;

function readBoolean(value: string | undefined, name: string, defaultValue: boolean) {
  if (value === undefined || value === "") return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be either "true" or "false".`);
}

export function getMarginEnvironmentStatus(environment: NodeJS.ProcessEnv) {
  const enabled = readBoolean(environment.MARGIN_ENABLED, "MARGIN_ENABLED", false);
  const submissionsEnabled = readBoolean(
    environment.MARGIN_SUBMISSIONS_ENABLED,
    "MARGIN_SUBMISSIONS_ENABLED",
    false,
  );
  const required = [
    ...(enabled ? REQUIRED_PUBLIC_MARGIN_ENVIRONMENT_VARIABLES : []),
    ...(submissionsEnabled ? REQUIRED_MARGIN_SUBMISSION_ENVIRONMENT_VARIABLES : []),
  ];
  const missing = required.filter((name) => !environment[name]?.trim());

  return { enabled, submissionsEnabled, missing } as const;
}

export function assertMarginEnvironmentReady(environment: NodeJS.ProcessEnv) {
  const status = getMarginEnvironmentStatus(environment);
  if (status.submissionsEnabled && !status.enabled) {
    throw new Error("MARGIN_SUBMISSIONS_ENABLED=true requires MARGIN_ENABLED=true.");
  }
  if (status.missing.length) {
    throw new Error(
      `The enabled Margin features require: ${status.missing.join(", ")}. Keep submissions disabled until their server-side protections are configured.`,
    );
  }
  return status;
}
