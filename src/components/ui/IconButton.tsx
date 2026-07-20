import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function IconButton({ active, className, ...props }: IconButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition',
        active
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-border text-ink-muted hover:bg-surface-hover hover:text-ink',
        className,
      )}
      {...props}
    />
  )
}
