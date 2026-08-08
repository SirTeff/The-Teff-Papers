import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfiguration } from "./environment";
import type { SupabaseDatabase } from "./types";

export function createSupabaseServerClient() {
  const configuration = getPublicSupabaseConfiguration();
  if (!configuration) return null;

  return createClient<SupabaseDatabase>(configuration.url, configuration.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
