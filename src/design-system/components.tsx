import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DecorMotifArt } from "./decor/Illustrations";
import { useTheme } from "@/theme/ThemeProvider";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "gilded";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "type-button inline-flex items-center justify-center gap-2 rounded-full uppercase " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-[var(--ds-dur-fast)] " +
  "ease-[var(--ease-paper)] focus-ring-elegant disabled:pointer-events-none disabled:opacity-50 " +
  "hover:-translate-y-0.5 active:translate-y-0";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-elev-2 hover:shadow-elev-3",
  secondary: "bg-secondary text-secondary-foreground shadow-elev-1 hover:shadow-elev-2",
  ghost: "text-foreground/80 hover:text-primary",
  gilded: "border-gilded bg-transparent text-foreground hover:bg-accent/15",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.75rem]",
  md: "h-11 px-6",
  lg: "h-14 px-9 text-[0.9375rem]",
};

export function ThemedButton({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */
/* Public-page equivalents of the shadcn primitives in `components/ui` —
 * those stay generic because admin routes depend on their current look;
 * every guest-facing form should reach for these instead. */

const FIELD_BASE =
  "flex w-full rounded-card border-paper bg-transparent type-body text-foreground shadow-elev-1 " +
  "transition-[border-color,box-shadow] duration-[var(--ds-dur-fast)] ease-[var(--ease-soft)] " +
  "placeholder:text-muted-foreground focus-ring-elegant disabled:cursor-not-allowed disabled:opacity-50";

export const ThemedInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(FIELD_BASE, "h-11 px-4 py-2", className)} {...props} />
  ),
);
ThemedInput.displayName = "ThemedInput";

export const ThemedTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(FIELD_BASE, "min-h-28 px-4 py-3", className)} {...props} />
  ),
);
ThemedTextarea.displayName = "ThemedTextarea";

export const ThemedCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer grid h-5 w-5 shrink-0 place-content-center rounded-[0.3rem] border-paper shadow-elev-1 " +
        "transition-colors duration-[var(--ds-dur-fast)] focus-ring-elegant disabled:cursor-not-allowed disabled:opacity-50 " +
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
ThemedCheckbox.displayName = "ThemedCheckbox";

/** The `ourjourney.com/<slug>` prefix affordance shared by login + create. */
export function SlugInput({
  value,
  onChange,
  id,
  placeholder,
  tone = "default",
  status,
  className,
  inputClassName,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  /** Border tone reflecting availability state. */
  tone?: "default" | "success" | "error";
  /** Optional trailing status icon (e.g. spinner/check/x), announced via aria-live. */
  status?: ReactNode;
  className?: string;
  inputClassName?: string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "id" | "placeholder" | "className">) {
  const toneBorder =
    tone === "success" ? "border border-primary/60" : tone === "error" ? "border border-destructive/60" : "border-paper";
  return (
    <div
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-card shadow-elev-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[color-mix(in_oklab,var(--ring)_70%,transparent)]",
        toneBorder,
        className,
      )}
    >
      <span className="flex items-center border-r border-border bg-muted/60 px-3 type-caption whitespace-nowrap text-muted-foreground">
        ourjourney.com/
      </span>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full min-w-0 bg-transparent px-3 py-2 type-body text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName,
        )}
        {...props}
      />
      {status && (
        <span className="flex items-center px-3 text-muted-foreground" aria-live="polite">
          {status}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces / cards                                                    */
/* ------------------------------------------------------------------ */

type CardVariant = "paper" | "veil" | "framed" | "plain";

const CARD_VARIANTS: Record<CardVariant, string> = {
  paper: "surface-paper",
  veil: "surface-veil",
  framed: "surface-paper border-gilded",
  plain: "rounded-card border-paper bg-transparent",
};

export function ThemedCard({
  variant = "paper",
  interactive = false,
  ornament,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  interactive?: boolean;
  /** Adds a painted corner ornament inside the card. */
  ornament?: boolean;
}) {
  const theme = useTheme();
  return (
    <div
      className={cn(
        "relative overflow-hidden p-stack",
        CARD_VARIANTS[variant],
        interactive && "hover-lift",
        className,
      )}
      {...props}
    >
      {ornament && (
        <DecorMotifArt
          motif={theme.decor.corners[0] ?? "rose"}
          size="sm"
          intensity={0.3}
          placement="corner-top-right"
          className="absolute -top-6 -right-6"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Card for a feature / capability with an icon slot. */
export function FeatureCard({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ThemedCard interactive className={cn("flex flex-col gap-3", className)}>
      {icon && (
        <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
          {icon}
        </span>
      )}
      <h3 className="type-card-title">{title}</h3>
      {children && <div className="type-body text-muted-foreground">{children}</div>}
    </ThemedCard>
  );
}

/** Compact label/value card for practical information. */
export function InfoCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <ThemedCard variant="veil" className={cn("text-center", className)}>
      <p className="type-label">{label}</p>
      <p className="type-card-title mt-2">{value}</p>
      {hint && <p className="type-caption mt-1">{hint}</p>}
    </ThemedCard>
  );
}

/** Timeline entry card — used by the schedule/day-plan experience. */
export function TimelineCard({
  time,
  title,
  icon,
  active = false,
  children,
  className,
}: {
  time: ReactNode;
  title: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ThemedCard
      variant={active ? "framed" : "paper"}
      interactive
      className={cn("flex gap-4", active && "shadow-elev-3", className)}
    >
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="type-label whitespace-nowrap">{time}</span>
        {icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
            {icon}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="type-card-title">{title}</h3>
        {children && <div className="type-body mt-1 text-muted-foreground">{children}</div>}
      </div>
    </ThemedCard>
  );
}

/** Media card for gallery/photo grids. */
export function MediaCard({
  src,
  alt,
  caption,
  badge,
  overlay,
  onClick,
  className,
  ratio = "square",
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** Status chip pinned to the top-left of the image (e.g. a pending/hidden Badge). */
  badge?: ReactNode;
  /** Actions (e.g. delete) pinned top-right — always visible on touch, hover-revealed on pointer-fine devices. */
  overlay?: ReactNode;
  /** When provided, the whole image becomes a lightbox/zoom trigger. */
  onClick?: () => void;
  className?: string;
  ratio?: "square" | "portrait" | "landscape";
}) {
  const ratios = { square: "aspect-square", portrait: "aspect-[3/4]", landscape: "aspect-[4/3]" } as const;
  const revealClass =
    "opacity-100 can-hover:opacity-0 can-hover:group-hover:opacity-100 transition-opacity duration-[var(--ds-dur-fast)]";
  return (
    <figure className={cn("group relative overflow-hidden rounded-card border-paper shadow-elev-2", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "w-full object-cover transition-transform duration-[var(--ds-dur-slow)] ease-[var(--ease-paper)] group-hover:scale-[1.04]",
          ratios[ratio],
        )}
      />
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          aria-label="View full photo"
          className="absolute inset-0 cursor-zoom-in focus-ring-elegant"
        />
      )}
      {badge && <div className="pointer-events-none absolute top-2 left-2">{badge}</div>}
      {overlay && <div className={cn("absolute top-2 right-2", revealClass)}>{overlay}</div>}
      {caption && (
        <figcaption
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/60 to-transparent p-3 type-caption text-background",
            revealClass,
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Gift / wishlist card. */
export function WishCard({
  title,
  price,
  image,
  imageAlt = "",
  children,
  action,
  className,
  style,
}: {
  title: ReactNode;
  price?: ReactNode;
  image?: string;
  /** Alt text for the gift photo — often the identifying content, worth setting. */
  imageAlt?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ThemedCard interactive className={cn("flex flex-col gap-3 p-0", className)} style={style}>
      {image && (
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="h-40 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-stack">
        <h3 className="type-card-title">{title}</h3>
        {price && <p className="type-label">{price}</p>}
        {children && <div className="type-body text-muted-foreground">{children}</div>}
        {action && <div className="mt-auto pt-2">{action}</div>}
      </div>
    </ThemedCard>
  );
}

/** Paper-styled container for forms (RSVP, login, create). */
export function FormPanel({
  title,
  description,
  children,
  footer,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <ThemedCard variant="framed" className={cn("mx-auto w-full max-w-prose p-block", className)} ornament>
      {(title || description) && (
        <header className="mb-stack text-center">
          {title && <h2 className="type-section-title">{title}</h2>}
          {description && <p className="type-body mt-2 text-muted-foreground">{description}</p>}
        </header>
      )}
      <div className="space-y-gutter">{children}</div>
      {footer && <footer className="mt-stack type-caption text-center">{footer}</footer>}
    </ThemedCard>
  );
}

/* ------------------------------------------------------------------ */
/* Typography blocks                                                   */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  eyebrow,
  title,
  script,
  description,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  script?: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-prose text-center items-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <p className="type-label">{eyebrow}</p>}
      {script && <p className="type-script-sm">{script}</p>}
      <h2 className="type-section-title">{title}</h2>
      {description && <p className="type-body-lg text-muted-foreground">{description}</p>}
    </header>
  );
}

/** Decorative divider built from the theme's divider motif. */
export function Divider({
  motif,
  className,
  label,
}: {
  motif?: Parameters<typeof DecorMotifArt>[0]["motif"];
  className?: string;
  label?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <div className={cn("flex items-center justify-center gap-4 py-block", className)} role="presentation">
      <span className="h-px flex-1 max-w-40 bg-linear-to-r from-transparent to-primary/35" />
      {label ? (
        <span className="type-label">{label}</span>
      ) : (
        <DecorMotifArt motif={motif ?? theme.decor.divider} size="xs" intensity={0.9} className="w-16 h-8" />
      )}
      <span className="h-px flex-1 max-w-40 bg-linear-to-l from-transparent to-primary/35" />
    </div>
  );
}

export function Badge({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "gold" | "leaf" | "neutral";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary/12 text-primary-strong",
    gold: "bg-accent/22 text-accent-foreground",
    leaf: "bg-sage/35 text-foreground",
    neutral: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 type-label !tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Tag({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-paper px-2.5 py-0.5 type-caption",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Frames an illustration or photograph as if mounted on paper. */
export function IllustrationFrame({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: ReactNode;
}) {
  return (
    <figure className={cn("relative", className)}>
      <div className="overflow-hidden rounded-frame border-paper bg-card p-2 shadow-elev-3">
        <div className="overflow-hidden rounded-card">{children}</div>
      </div>
      {caption && <figcaption className="type-caption mt-3 text-center">{caption}</figcaption>}
    </figure>
  );
}

/** Wraps arbitrary content in painted corner ornaments. */
export function DecorativeWrapper({
  children,
  className,
  intensity = 0.4,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const theme = useTheme();
  const [a, b] = theme.decor.corners;
  return (
    <div className={cn("relative", className)}>
      <DecorMotifArt
        motif={a ?? "rose"}
        size="md"
        intensity={intensity}
        placement="corner-top-left"
        className="absolute -top-10 -left-10 -z-10"
      />
      <DecorMotifArt
        motif={b ?? "leaf"}
        size="md"
        intensity={intensity}
        placement="corner-bottom-right"
        className="absolute -bottom-10 -right-10 -z-10"
      />
      {children}
    </div>
  );
}

/**
 * The "nothing here yet" moment — converges gallery/playlist/guestbook/
 * story/timeline/wishlist/location's previously-inconsistent empty states.
 */
export function EmptyState({
  motif = "leaf",
  title,
  description,
  action,
  className,
}: {
  motif?: Parameters<typeof DecorMotifArt>[0]["motif"];
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-block text-center", className)}>
      <DecorMotifArt motif={motif} size="sm" intensity={0.55} className="opacity-90" />
      <h3 className="type-card-title">{title}</h3>
      {description && <p className="type-body max-w-prose text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * Themed replacement for native `confirm()` — a paper surface with
 * `ThemedButton` actions, used for every destructive guest action.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] animate-ds-fade" />
        <AlertDialogPrimitive.Content className="surface-paper animate-ds-scale fixed top-1/2 left-1/2 z-50 w-[min(26rem,90vw)] -translate-x-1/2 -translate-y-1/2 p-block shadow-elev-4">
          <AlertDialogPrimitive.Title className="type-card-title">{title}</AlertDialogPrimitive.Title>
          {description && (
            <AlertDialogPrimitive.Description className="type-body mt-2 text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
          )}
          <div className="mt-stack flex justify-end gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <ThemedButton variant="ghost" size="sm">
                {cancelLabel}
              </ThemedButton>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <ThemedButton
                variant="primary"
                size="sm"
                onClick={onConfirm}
                className={destructive ? "bg-destructive text-destructive-foreground" : undefined}
              >
                {confirmLabel}
              </ThemedButton>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

export function Hero({
  script,
  title,
  subtitle,
  extra,
  actions,
  media,
  align = "center",
  compact = false,
  className,
}: {
  script?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra content between the subtitle and actions — a countdown, a date badge. */
  extra?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  align?: "center" | "split";
  /** Compact spacing for pages where the hero sits immediately above another focal element (e.g. the envelope). */
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col",
        compact ? "gap-4" : "gap-stack",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      {script && <p className="type-script animate-ds-fade">{script}</p>}
      <h1 className="type-hero animate-ds-reveal">{title}</h1>
      {subtitle && (
        <p
          className={cn("type-body-lg text-muted-foreground animate-ds-reveal", align === "center" && "max-w-prose")}
          style={{ animationDelay: "120ms" }}
        >
          {subtitle}
        </p>
      )}
      {extra && (
        <div className="animate-ds-reveal" style={{ animationDelay: "170ms" }}>
          {extra}
        </div>
      )}
      {actions && (
        <div
          className={cn("flex flex-wrap gap-3 animate-ds-reveal", align === "center" && "justify-center")}
          style={{ animationDelay: "220ms" }}
        >
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <header className={cn(compact ? "py-block" : "py-hero", className)}>
      {align === "split" ? (
        <div className="grid items-center gap-block lg:grid-cols-2">
          {content}
          {media && <div className="animate-ds-paper">{media}</div>}
        </div>
      ) : (
        <>
          {content}
          {media && <div className="mt-block animate-ds-paper">{media}</div>}
        </>
      )}
    </header>
  );
}

