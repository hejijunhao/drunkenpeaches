import { cn } from "@/lib/utils";

/**
 * Quiet monogram — a framed serif "P" for Peaches. Replaces the peach emoji
 * across marketing, auth, and the club chrome.
 */
export function BrandMark({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-primary/50 bg-primary text-primary-foreground",
        size === "sm" && "size-6",
        size === "default" && "size-7",
        size === "lg" && "size-9",
        className
      )}
    >
      <span
        className={cn(
          "font-heading leading-none font-medium",
          size === "sm" && "text-[0.85rem]",
          size === "default" && "text-[1rem]",
          size === "lg" && "text-[1.2rem]"
        )}
      >
        P
      </span>
    </span>
  );
}

export function BrandWordmark({
  className,
  name = "Drunken Peaches",
  size = "default",
}: {
  className?: string;
  name?: string;
  size?: "sm" | "default";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={size === "sm" ? "sm" : "default"} />
      <span
        className={cn(
          "font-heading tracking-tight text-foreground",
          size === "sm" ? "text-base" : "text-lg"
        )}
      >
        {name}
      </span>
    </span>
  );
}
