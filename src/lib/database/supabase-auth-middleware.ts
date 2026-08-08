import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAuthConfiguration } from "./environment";
import type { SupabaseDatabase } from "./types";

export async function refreshStudioSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const configuration = getSupabaseAuthConfiguration();
    const supabase = createServerClient<SupabaseDatabase>(configuration.url, configuration.publishableKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values, headers) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    // Studio pages provide a controlled configuration/authentication response.
    // The public site must remain available when Studio is not configured.
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
