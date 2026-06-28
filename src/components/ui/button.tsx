import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
        rose:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-md",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
        dark:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
        outline:
          "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        ghost:
          "text-slate-600 hover:bg-slate-50",
        toggleOff:
          "bg-white border-2 border-amber-400 text-amber-700 hover:bg-amber-100 shadow-sm",
        toggleOn:
          "bg-amber-500 border-2 border-amber-500 text-white hover:bg-amber-600 shadow-md",
        destructive:
          "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
      },
      size: {
        default: "py-3.5 px-4 rounded-xl text-base gap-2",
        sm: "py-2 px-4 rounded-xl text-xs gap-1.5",
        xs: "px-3.5 py-2 rounded-lg text-sm gap-1.5",
        icon: "p-1.5 rounded-full",
        "icon-sm": "p-1 rounded-full",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
