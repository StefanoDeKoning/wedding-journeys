import type { CSSProperties, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
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
  "transition-[transform,box-shadow,background-color,color,border-color] duration-200 " +
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
  title: string;
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
  className,
  ratio = "square",
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
  ratio?: "square" | "portrait" | "landscape";
}) {
  const ratios = { square: "aspect-square", portrait: "aspect-[3/4]", landscape: "aspect-[4/3]" } as const;
  return (
    <figure className={cn("group relative overflow-hidden rounded-card border-paper shadow-elev-2", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "w-full object-cover transition-transform duration-700 ease-[var(--ease-paper)] group-hover:scale-[1.04]",
          ratios[ratio],
        )}
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/55 to-transparent p-3 type-caption text-background">
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
  children,
  action,
  className,
  style,
}: {
  title: ReactNode;
  price?: ReactNode;
  image?: string;
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
          alt=""
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
    primary: "bg-primary/12 text-primary",
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

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

export function Hero({
  script,
  title,
  subtitle,
  actions,
  media,
  align = "center",
  className,
}: {
  script?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  align?: "center" | "split";
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-stack",
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
    <header className={cn("relative py-hero", className)}>
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
