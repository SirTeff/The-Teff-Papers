import "server-only";
import { redirect } from "next/navigation";
import { createAdminAuthorization, StudioAuthorizationError } from "./admin-authorization";

export async function requireStudioAuthorization() {
  try {
    return await createAdminAuthorization();
  } catch (error) {
    if (error instanceof StudioAuthorizationError) {
      redirect(error.code === "configuration" ? "/studio/login?error=configuration" : "/studio/login");
    }
    throw error;
  }
}
