import type { Paper } from "@/lib/papers";

export function PaperEnding({ paper }: { paper: Paper }) {
  return (
    <footer className="paper-ending">
      <div className="paper-signature">
        <p>— {paper.author}</p>
        {paper.version && <p>Version {paper.version}</p>}
      </div>
    </footer>
  );
}
