"use server";

import { redirect } from "next/navigation";
import { createSupabaseAuthServerClient } from "@/lib/database/supabase-auth-server";
import { createAdminAuthorization, StudioAuthorizationError } from "@/lib/security/admin-authorization";

function value(formData: FormData, name: string, maximum: number, trim = true) {
  const input = formData.get(name);
  if (typeof input !== "string") return "";
  return (trim ? input.trim() : input).slice(0, maximum);
}

export async function loginAction(formData: FormData) {
  const email = value(formData, "email", 320).toLowerCase();
  const password = value(formData, "password", 1024, false);
  if (!email || !password) redirect("/studio/login?error=missing");

  try {
    const supabase = await createSupabaseAuthServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect("/studio/login?error=credentials");

    await createAdminAuthorization();
  } catch (error) {
    if (error instanceof StudioAuthorizationError && error.code === "unauthorized") {
      try {
        const supabase = await createSupabaseAuthServerClient();
        await supabase.auth.signOut({ scope: "local" });
      } catch {}
      redirect("/studio/login?error=unauthorized");
    }
    if (error instanceof StudioAuthorizationError && error.code === "configuration") {
      redirect("/studio/login?error=configuration");
    }
    throw error;
  }

  redirect("/studio");
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseAuthServerClient();
    await supabase.auth.signOut({ scope: "local" });
  } finally {
    redirect("/studio/login");
  }
}
