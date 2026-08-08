import Link from "next/link";
import { getMarginCounts } from "@/lib/margin/admin-repository";
import { requireStudioAuthorization } from "@/lib/security/require-studio-authorization";
import { logoutAction } from "./actions";

const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected", spam: "Spam", removed: "Removed" } as const;

export default async function StudioDashboardPage() {
  const authorization = await requireStudioAuthorization();
  const counts = await getMarginCounts(authorization);

  return (
    <div className="studio-page">
      <div className="studio-title-row">
        <div><p className="eyebrow">Editorial operations</p><h1>Margin moderation</h1><p>Signed in as {authorization.email}</p></div>
        <form action={logoutAction}><button className="studio-secondary-button" type="submit">Sign out</button></form>
      </div>
      <section aria-labelledby="queue-summary-title">
        <h2 id="queue-summary-title">Queue summary</h2>
        <div className="studio-count-grid">
          {Object.entries(labels).map(([status, label]) => (
            <Link key={status} href={`/studio/margin?status=${status}`} className="studio-count-card">
              <span>{label}</span><strong>{counts[status as keyof typeof counts]}</strong>
            </Link>
          ))}
        </div>
      </section>
      <Link className="studio-primary-link" href="/studio/margin?status=pending">Open pending queue <span aria-hidden="true">→</span></Link>
    </div>
  );
}
