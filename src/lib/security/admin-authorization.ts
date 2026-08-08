import "server-only";
import { getStudioAdminEmails, normalizeAdminEmail, StudioConfigurationError } from "@/lib/config/studio-environment";
import { createSupabaseAuthServerClient } from "@/lib/database/supabase-auth-server";

const adminAuthorizationBrand: unique symbol = Symbol("AdminAuthorization");

export type AdminAuthorization = {
  readonly actorId: string;
  readonly email: string;
  readonly [adminAuthorizationBrand]: true;
};

export type StudioAuthorizationErrorCode = "unauthenticated" | "unauthorized" | "configuration";

export class StudioAuthorizationError extends Error {
  constructor(readonly code: StudioAuthorizationErrorCode, message: string) {
    super(message);
    this.name = "StudioAuthorizationError";
  }
}

/** The sole constructor for the privileged capability used by Teff Studio. */
export async function createAdminAuthorization(): Promise<AdminAuthorization> {
  try {
    const supabase = await createSupabaseAuthServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new StudioAuthorizationError("unauthenticated", "Authentication is required.");

    const email = data.user.email ? normalizeAdminEmail(data.user.email) : "";
    if (!email || !getStudioAdminEmails().has(email)) {
      throw new StudioAuthorizationError("unauthorized", "This account is not authorized for Teff Studio.");
    }

    return { actorId: data.user.id, email, [adminAuthorizationBrand]: true };
  } catch (error) {
    if (error instanceof StudioAuthorizationError) throw error;
    if (error instanceof StudioConfigurationError || error instanceof Error) {
      throw new StudioAuthorizationError("configuration", "Teff Studio authentication is not configured.");
    }
    throw error;
  }
}
