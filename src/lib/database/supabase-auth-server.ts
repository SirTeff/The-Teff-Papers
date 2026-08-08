import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAuthConfiguration } from "./environment";
import type { SupabaseDatabase } from "./types";

export async function createSupabaseAuthServerClient() {
  const configuration = getSupabaseAuthConfiguration();
  const cookieStore = await cookies();

  return createServerClient<SupabaseDatabase>(configuration.url, configuration.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware performs refreshes;
          // Server Actions and Route Handlers can persist their own auth changes.
        }
      },
    },
  });
}
