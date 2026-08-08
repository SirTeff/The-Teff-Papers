import "server-only";
import { features } from "@/lib/config/features";

export class MarginConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarginConfigurationError";
  }
}

function requireEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new MarginConfigurationError(`${name} is required.`);
  return value;
}

export function getSupabaseAuthConfiguration() {
  return {
    url: requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getPublicSupabaseConfiguration() {
  if (!features.marginEnabled) return null;

  return {
    url: requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getAdminSupabaseConfiguration() {
  return {
    url: requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    secretKey: requireEnvironmentValue("SUPABASE_SECRET_KEY"),
  };
}
