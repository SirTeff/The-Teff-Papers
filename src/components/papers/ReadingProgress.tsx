"use client";

import { useEffect, useState } from "react";

export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!target) return;

        const targetTop = window.scrollY + target.getBoundingClientRect().top;
        const readableDistance = Math.max(target.offsetHeight - window.innerHeight, 1);
        const nextProgress = Math.min(
          100,
          Math.max(0, ((window.scrollY - targetTop) / readableDistance) * 100),
        );
        const roundedProgress = Math.round(nextProgress);

        setProgress((current) => current === roundedProgress ? current : roundedProgress);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
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
