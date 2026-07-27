import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(
        'rounded-xl border border-border bg-surface shadow-sm shadow-black/[0.03] dark:shadow-black/20',
        className,
      )}
      {...props}
    />
  )
})
