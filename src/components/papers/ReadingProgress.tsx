"use client";

import { useEffect, useState } from "react";

export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = target.getBoundingClientRect();
        const readingLine = Math.min(96, window.innerHeight * .15);
        const readableDistance = Math.max(bounds.height - window.innerHeight + readingLine, 1);
        const nextProgress = Math.min(
          100,
          Math.max(0, ((readingLine - bounds.top) / readableDistance) * 100),
        );
        const roundedProgress = Math.round(nextProgress);

        setProgress((current) => current === roundedProgress ? current : roundedProgress);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    const observer = new ResizeObserver(updateProgress);
    observer.observe(target);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      observer.disconnect();
    };
  }, [targetId]);

  return (
    <div
      className="reading-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={`${progress}% read`}
    >
      <span
        className="reading-progress-bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
