import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { AdminAuthorization } from "@/lib/security/admin-authorization";
import { getAdminSupabaseConfiguration } from "./environment";
import type { SupabaseDatabase } from "./types";

export function createSupabaseAdminClient(authorization: AdminAuthorization) {
  if (!authorization.actorId.trim()) throw new Error("An authorized administrator identity is required.");

  const configuration = getAdminSupabaseConfiguration();

  return createClient<SupabaseDatabase>(configuration.url, configuration.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
