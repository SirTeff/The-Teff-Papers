const REQUIRED_MARGIN_ENVIRONMENT_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

function readBoolean(value: string | undefined, name: string, defaultValue: boolean) {
  if (value === undefined || value === "") return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be either "true" or "false".`);
}

export function getMarginEnvironmentStatus(environment: NodeJS.ProcessEnv) {
  const enabled = readBoolean(environment.MARGIN_ENABLED, "MARGIN_ENABLED", false);
  const missing = enabled
    ? REQUIRED_MARGIN_ENVIRONMENT_VARIABLES.filter((name) => !environment[name]?.trim())
    : [];

  return { enabled, missing } as const;
}

export function assertMarginEnvironmentReady(environment: NodeJS.ProcessEnv) {
  const status = getMarginEnvironmentStatus(environment);
  if (status.missing.length) {
    throw new Error(
      `MARGIN_ENABLED=true requires: ${status.missing.join(", ")}. Keep the feature disabled until Supabase is configured.`,
    );
  }
  return status;
}
