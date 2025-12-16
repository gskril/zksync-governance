import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        primary:
          'border-transparent text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-brand-red/10 text-brand-red hover:bg-brand-red/20',
        success:
          'border-transparent text-brand-green bg-brand-green/10 hover:bg-brand-green/20',
        warning:
          'border-transparent text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
