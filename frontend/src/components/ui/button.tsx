import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva("shadcn-button", {
  variants: { variant: { default: "", ghost: "shadcn-button-ghost", outline: "shadcn-button-outline" } },
  defaultVariants: { variant: "default" },
});
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={twMerge(clsx(buttonVariants({ variant }), className))} {...props} />;
}
