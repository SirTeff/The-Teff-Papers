const paths = {
  down: "M12 4v15m-6-6 6 6 6-6",
  "down-right": "M5 5l14 14M9 19h10V9",
  left: "M20 12H5m6-6-6 6 6 6",
  right: "M4 12h15m-6-6 6 6-6 6",
  "up-right": "M5 19 19 5M9 5h10v10",
};

export function ArrowIcon({ direction, className }: { direction: keyof typeof paths; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", verticalAlign: "-.125em" }}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
