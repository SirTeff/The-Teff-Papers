import { redirect } from "next/navigation";
import { createAdminAuthorization, StudioAuthorizationError } from "@/lib/security/admin-authorization";
import { loginAction } from "../actions";

const messages: Record<string, string> = {
  missing: "Enter both your email and password.",
  credentials: "The email or password was not accepted.",
  unauthorized: "Access denied.",
  configuration: "Teff Studio authentication is not configured yet.",
};

export default async function StudioLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let authorizationError: StudioAuthorizationError["code"] | undefined;
  try {
    await createAdminAuthorization();
    redirect("/studio");
  } catch (error) {
    if (!(error instanceof StudioAuthorizationError)) throw error;
    authorizationError = error.code;
  }

  const error = (await searchParams).error ?? (authorizationError === "unauthorized" ? "unauthorized" : undefined);
  return (
    <div className="studio-login" aria-labelledby="studio-login-title">
      <p className="eyebrow">Private workspace</p>
      <h1 id="studio-login-title">Sign in to Teff Studio</h1>
      <p>Moderate reader contributions from a protected editorial workspace.</p>
      {error && messages[error] && <p className="studio-alert" role="alert">{messages[error]}</p>}
      <form action={loginAction} className="studio-login-form">
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
