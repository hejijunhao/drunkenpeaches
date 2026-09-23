import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * A stamp, not a pill: letter-spaced small caps with a hairline in the tone's
 * colour and no fill. Tones override `variant` colours when set.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-sm border px-1.5 text-[0.625rem] leading-none font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-destructive/35 text-destructive",
        outline: "border-border text-muted-foreground",
        ghost: "border-transparent text-muted-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      tone: {
        none: "",
        success: "border-success/35 bg-transparent text-success",
        warning: "border-warning/40 bg-transparent text-warning",
        danger: "border-danger/35 bg-transparent text-danger",
        neutral: "border-neutral/30 bg-transparent text-neutral",
        info: "border-info/35 bg-transparent text-info",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "none",
    },
  }
)

function Badge({
  className,
  variant = "default",
  tone = "none",
  dot = false,
  render,
  children,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Leading status dot in the current tone. */
    dot?: boolean
  }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, tone }), className),
      },
      props,
      {
        children: (
          <>
            {dot && (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-current"
              />
            )}
            {children}
          </>
        ),
      }
    ),
    render,
    state: {
      slot: "badge",
      variant,
      tone,
    },
  })
}

export { Badge, badgeVariants }
