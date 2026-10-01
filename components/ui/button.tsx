import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:outline-primary",
        secondary:
          "bg-secondary-strong text-white shadow-sm hover:bg-secondary-strong-hover focus-visible:outline-secondary-strong",
        whatsapp:
          "bg-secondary-strong text-white shadow-sm hover:bg-secondary-strong-hover focus-visible:outline-secondary-strong",
        outline:
          "border border-line bg-white text-ink hover:border-primary/40 hover:bg-primary-tint hover:text-primary",
        "outline-primary":
          "border border-primary/30 bg-white text-primary hover:border-primary hover:bg-primary-tint",
        ghost: "text-ink hover:bg-slate-100",
        white: "bg-white text-primary shadow-sm hover:bg-primary-tint",
        "outline-white":
          "border border-white/60 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/15",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
