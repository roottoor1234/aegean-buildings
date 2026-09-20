type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  /** stack = centered column (default). inline = icon only (buttons). */
  layout?: "stack" | "inline";
};

const SIZE = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-10 w-10",
} as const;

export function Spinner({
  className = "",
  size = "md",
  label,
  layout = "stack",
}: Props) {
  const stacked = layout === "stack";

  return (
    <span
      role="status"
      aria-label={label || "Loading"}
      aria-live="polite"
      className={
        stacked
          ? `inline-flex flex-col items-center justify-center gap-2 ${className}`
          : `inline-flex shrink-0 items-center justify-center ${className}`
      }
    >
      <svg
        className={`animate-spin text-current ${SIZE[size]}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
      {stacked && label ? (
        <span className="text-center text-sm font-medium">{label}</span>
      ) : null}
    </span>
  );
}

/** Full-viewport centered loader */
export function PageLoader({ label = "Φόρτωση…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-[1px]">
      <Spinner size="lg" label={label} className="text-navy" />
    </div>
  );
}
