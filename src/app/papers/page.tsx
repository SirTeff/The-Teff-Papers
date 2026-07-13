import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaperCard } from "@/components/papers/PaperCard";
import { getAllPapers } from "@/lib/papers";

export const metadata: Metadata = { title: "The Papers", description: "The complete archive of ideas, reflections, and working papers." };
export default function PapersPage() { const papers = getAllPapers(); return <PageContainer className="page-shell"><header className="page-intro"><p className="eyebrow">The archive</p><h1>The Papers</h1><p>A growing record of ideas noticed early enough to be preserved.</p></header><div className="paper-list">{papers.map((paper) => <PaperCard key={paper.slug} paper={paper} />)}</div></PageContainer>; }
