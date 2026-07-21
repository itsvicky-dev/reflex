import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'white'
type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-accent text-accent-content hover:brightness-110 shadow-sm shadow-accent/20',
  outline: 'border border-border text-ink hover:bg-surface-hover',
  ghost: 'text-ink hover:bg-surface-hover',
  white: 'bg-white text-[#1e2024] border border-[#dedfe2] hover:bg-transparent',
}

export function Button({ variant = 'solid', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
