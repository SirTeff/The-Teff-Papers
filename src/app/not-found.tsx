import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/shared/Button";
export default function NotFound() { return <PageContainer narrow className="page-shell"><header className="page-intro"><p className="eyebrow">404</p><h1>This page has not been documented.</h1><p>The page may have moved, or the idea may still be taking shape.</p><Button href="/papers">Return to the archive</Button></header></PageContainer>; }
