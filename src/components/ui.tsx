import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link, type LinkProps } from "react-router";
import { CircleAlert, CircleCheck, LoaderCircle, X } from "lucide-react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ─── Buttons ────────────────────────────────────────────────────────────────

type Variant = "primary" | "sea" | "secondary" | "ghost" | "danger" | "onSea";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-sea text-white shadow-[0_1px_2px_rgb(16_52_82/0.25)] hover:bg-sea-2 active:bg-sea-deep",
  sea: "bg-sea-deep text-white hover:bg-sea active:bg-sea-deep",
  secondary:
    "border border-line-strong bg-card text-sea shadow-[0_1px_1px_rgb(16_52_82/0.04)] hover:border-sea/35 hover:bg-white active:bg-paper",
  ghost: "text-sea hover:bg-sea/[0.06] active:bg-sea/10",
  danger: "border border-danger/30 bg-card text-danger hover:bg-danger-bg active:bg-danger/15",
  onSea: "border border-white/25 bg-white/[0.08] text-white hover:bg-white/15 active:bg-white/20",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-[0.8125rem]",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-5 text-base",
};

const buttonBase =
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonBase, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={cx(buttonBase, VARIANT[variant], SIZE[size], className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  variant = "ghost",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: Variant }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(buttonBase, VARIANT[variant], "size-9 rounded-lg", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Form controls ──────────────────────────────────────────────────────────

const control =
  "w-full rounded-lg border border-line-strong bg-white px-3 text-[0.9375rem] text-ink shadow-[0_1px_1px_rgb(16_52_82/0.04)_inset] outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 hover:border-sea/30 focus:border-sea-2 focus:shadow-[0_0_0_3px_rgb(21_107_168/0.14)] disabled:bg-paper disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgb(161_48_42/0.14)]";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
  className?: string;
  lang?: string;
};

export function Field({ label, hint, error, children, className, lang }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const describedBy = error || hint ? hintId : undefined;
  return (
    <div className={cx("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-[0.8125rem] font-semibold text-ink/80">
        {label}
        {lang ? (
          <span className="rounded bg-paper-2 px-1.5 py-px text-[0.6875rem] font-bold tracking-wide text-muted">{lang}</span>
        ) : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={hintId} className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] font-medium text-danger">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx(control, "h-10", className)} {...rest} />;
});

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(control, "min-h-24 resize-y py-2 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        control,
        "select-chevron h-10 appearance-none pr-9",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-45",
          checked ? "border-ok bg-ok" : "border-line-strong bg-paper-2",
        )}
      >
        <span
          className={cx(
            "inline-block size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgb(16_52_82/0.25)] transition-transform duration-200 ease-[var(--ease-out-expo)]",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
      <label htmlFor={id} className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description ? <span className="block text-[0.8125rem] text-muted">{description}</span> : null}
      </label>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = "md",
  tone = "light",
}: {
  value: T;
  options: { value: T; label: ReactNode; count?: number }[];
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
  tone?: "light" | "sea";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        "inline-flex max-w-full overflow-x-auto rounded-lg p-0.5",
        tone === "light" ? "border border-line-strong bg-paper-2/70" : "border border-white/15 bg-white/[0.06]",
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-semibold transition-colors duration-150",
              size === "sm" ? "h-7 px-2.5 text-[0.8125rem]" : "h-9 px-3.5 text-sm",
              tone === "light"
                ? active
                  ? "bg-card text-sea shadow-[0_1px_2px_rgb(16_52_82/0.15)]"
                  : "text-muted hover:text-sea"
                : active
                  ? "bg-white text-sea-deep shadow-[0_1px_2px_rgb(16_52_82/0.25)]"
                  : "text-white/75 hover:text-white",
            )}
          >
            {o.label}
            {o.count !== undefined ? (
              <span className={cx("nums text-[0.75rem]", active ? "opacity-70" : "opacity-60")}>{o.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Status ─────────────────────────────────────────────────────────────────

export function Badge({ tone = "neutral", children, className }: { tone?: "neutral" | "ok" | "warn" | "danger" | "sea" | "stone"; children: ReactNode; className?: string }) {
  const tones = {
    neutral: "bg-paper-2 text-muted",
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    danger: "bg-danger-bg text-danger",
    sea: "bg-sea/[0.08] text-sea",
    stone: "bg-stone/20 text-stone-ink",
  };
  return (
    <span className={cx("inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2 text-[0.75rem] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusDot({ published }: { published: boolean }) {
  return (
    <Badge tone={published ? "ok" : "neutral"}>
      <span className={cx("size-1.5 rounded-full", published ? "bg-ok" : "bg-muted/60")} aria-hidden />
      {published ? "Δημοσιευμένο" : "Πρόχειρο"}
    </Badge>
  );
}

export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cx("inline-flex items-center gap-2 text-sm font-medium text-muted", className)}>
      <LoaderCircle className="size-4 animate-spin text-sea" aria-hidden />
      {label ? <span>{label}</span> : <span className="sr-only">Φόρτωση…</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden />;
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? <div className="mb-4 grid size-12 place-items-center rounded-full bg-paper-2 text-sea">{icon}</div> : null}
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {children ? <div className="mt-1.5 max-w-sm text-[0.9375rem] text-muted">{children}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/25 bg-danger-bg px-4 py-3 text-sm text-danger">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 font-medium">{message}</span>
      {onRetry ? (
        <Button size="sm" variant="danger" onClick={onRetry}>
          Δοκιμή ξανά
        </Button>
      ) : null}
    </div>
  );
}

/** Two-step destructive action, inline: no modal needed. */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Επιβεβαίωση διαγραφής",
  disabled,
  size = "md",
}: {
  onConfirm: () => void | Promise<void>;
  children: ReactNode;
  confirmLabel?: string;
  disabled?: boolean;
  size?: Size;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (!armed) {
    return (
      <Button
        variant="danger"
        size={size}
        disabled={disabled}
        onClick={() => {
          setArmed(true);
          timer.current = window.setTimeout(() => setArmed(false), 5000);
        }}
      >
        {children}
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size={size}
        loading={busy}
        className="bg-danger text-white hover:bg-[#8c2822]"
        variant="sea"
        onClick={async () => {
          setBusy(true);
          try {
            await onConfirm();
          } finally {
            setBusy(false);
            setArmed(false);
          }
        }}
      >
        {confirmLabel}
      </Button>
      <Button size={size} variant="ghost" onClick={() => setArmed(false)}>
        Άκυρο
      </Button>
    </span>
  );
}

// ─── Toasts ─────────────────────────────────────────────────────────────────

type Toast = { id: number; tone: "ok" | "err"; message: string };
const ToastCtx = createContext<(tone: Toast["tone"], message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, tone, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "err" ? 6000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "err" ? "alert" : "status"}
            className="animate-rise pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl bg-sea-deep px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-lift)]"
          >
            {t.tone === "ok" ? (
              <CircleCheck className="mt-px size-4 shrink-0 text-stone-soft" aria-hidden />
            ) : (
              <CircleAlert className="mt-px size-4 shrink-0 text-[#ff9b8f]" aria-hidden />
            )}
            <span className="min-w-0 flex-1">{t.message}</span>
            <button
              type="button"
              aria-label="Κλείσιμο"
              className="-mr-1 rounded p-0.5 text-white/60 hover:text-white"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
