import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent text-sm font-medium tracking-[0.012em] whitespace-nowrap transition-[color,background-color,border-color,opacity,transform] duration-(--duration-micro) ease-(--ease-out-quint) outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),black_12%)] dark:hover:bg-[color-mix(in_oklch,var(--primary),white_10%)]",
        /* Brass hairline — the Wine Master's button. Never a solid fill. */
        gold: "border-gold/70 bg-transparent text-gold-foreground hover:bg-gold/10 dark:text-gold",
        outline:
          "border-foreground/25 bg-transparent text-foreground hover:border-foreground/55 hover:bg-accent/60 aria-expanded:bg-accent dark:border-foreground/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "text-foreground hover:bg-accent/70 aria-expanded:bg-accent dark:hover:bg-accent/60",
        destructive:
          "border-destructive/35 bg-transparent text-destructive hover:bg-destructive/8 focus-visible:ring-destructive/30 dark:hover:bg-destructive/15",
        link: "h-auto min-h-0 p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 min-h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 md:h-10 md:min-h-10",
        xs: "h-7 min-h-7 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 min-h-9 gap-1.5 px-3 text-[0.8125rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 min-h-12 gap-2 px-6 text-[0.95rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11 min-h-11 md:size-10 md:min-h-10",
        "icon-xs": "size-7 min-h-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 min-h-9",
        "icon-lg": "size-12 min-h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
