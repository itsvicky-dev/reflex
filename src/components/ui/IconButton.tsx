import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function IconButton({ active, className, ...props }: IconButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex h-8 w-8 items-center justify-center rounded-xl border transition text-black ',
        active
          ? 'border-accent/30 bg-white'
          : 'border-border hover:bg-surface-hover hover:text-ink bg-white',
        className,
      )}
      {...props}
    />
  )
}
