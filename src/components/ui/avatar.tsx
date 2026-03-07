import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const avatarVariants = cva(
  'flex items-center justify-center rounded-lg shrink-0',
  {
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
    variants: {
      size: {
        xs: 'w-6 h-6 p-1',
        sm: 'w-8 h-8 p-2',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-3',
        xl: 'w-16 h-16 p-4',
      },
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        accent: 'bg-accent text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
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
