import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-5",
  sm: "size-6",
  default: "size-7",
  lg: "size-10",
  xl: "size-16",
  hero: "size-40 sm:size-56",
} as const;

/**
 * The seal — a peach drawn as a single-weight engraving inside a double ring,
 * the way a club would stamp its stationery. Inherits `currentColor`, so set
 * the ink with a text colour (`text-primary`, `text-gold`, …).
 */
export function BrandMark({
  className,
  size = "default",
  title = "Drunken Peaches",
}: {
  className?: string;
  size?: keyof typeof SIZES;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={cn("shrink-0", SIZES[size], className)}
    >
      <circle cx="16" cy="16" r="15.25" strokeWidth="1" />
      <circle cx="16" cy="16" r="13.1" strokeWidth="0.55" opacity="0.7" />
      {/* body */}
      <path
        d="M16 12.6c-3.6-.4-6.4 2.2-6.2 5.6.2 3.3 2.7 6 6.2 6s6-2.7 6.2-6c.2-3.4-2.6-6-6.2-5.6z"
        strokeWidth="1.1"
      />
      {/* cleft */}
      <path d="M16.4 13c-1 2.8-1.1 7-.4 10.6" strokeWidth="0.75" opacity="0.75" />
      {/* stem */}
      <path d="M16 12.6v-2.3" strokeWidth="1" />
      {/* leaf */}
      <path
        d="M16.3 10.7c1.1-2.4 3.6-3.1 5.3-2.3-.8 2-3.1 3.1-5.3 2.3z"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * Seal + name. "Drunken" is set in italic — the club's one permitted joke.
 */
export function BrandWordmark({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-foreground",
        size === "sm" && "gap-2.5",
        size === "default" && "gap-3",
        size === "lg" && "gap-3.5",
        className
      )}
    >
      <BrandMark
        size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
        className="text-primary"
      />
      <span
        className={cn(
          "font-heading whitespace-nowrap leading-none tracking-[-0.012em]",
          size === "sm" && "text-[1.05rem]",
          size === "default" && "text-[1.2rem]",
          size === "lg" && "text-[1.5rem]"
        )}
      >
        <em className="font-normal italic">Drunken</em> Peaches
      </span>
    </span>
  );
}
