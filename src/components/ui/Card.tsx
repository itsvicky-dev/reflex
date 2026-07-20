import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface shadow-sm shadow-black/[0.03] dark:shadow-black/20',
        className,
      )}
      {...props}
    />
  )
}
