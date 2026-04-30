import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";

import { cn } from "~/lib/utils";

const avatarVariants = cva(
  "flex shrink-0 items-center justify-center rounded-lg",
  {
    defaultVariants: {
      size: "md",
      variant: "default",
    },
    variants: {
      size: {
        xs: "h-6 w-6 p-1",
        sm: "h-8 w-8 p-2",
        md: "h-10 w-10 p-2",
        lg: "h-12 w-12 p-3",
        xl: "h-16 w-16 p-4",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "text-destructive-foreground bg-destructive",
        accent: "bg-accent text-accent-foreground",
        muted: "bg-muted text-muted-foreground",
        warning:
          "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      },
    },
  }
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  children: ReactNode;
  className?: string;
}

export function Avatar({ children, size, variant, className }: AvatarProps) {
  return (
    <div className={cn(avatarVariants({ size, variant }), className)}>
      {children}
    </div>
  );
}
