import { clsx } from 'clsx'
import { Check, ChevronDown, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ACCENTS, type AccentKey } from '../../features/theme/theme'
import { setAccent, setMode } from '../../features/theme/themeSlice'

export function ThemeSwitcher() {
  const dispatch = useAppDispatch()
  const { mode, accent } = useAppSelector((state) => state.theme)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover"
      >
        <span className="h-3.5 w-3.5 rounded-full bg-accent" />
        {mode === 'dark' ? <Moon className="h-4 w-4 text-ink-muted" /> : <Sun className="h-4 w-4 text-ink-muted" />}
        <ChevronDown className={clsx('h-3.5 w-3.5 text-ink-muted transition-transform', open && 'rotate-180')} />
      </button>

      <div
        className={clsx(
          'absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/10 transition duration-200 ease-out dark:shadow-black/40',
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Appearance</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => dispatch(setMode('light'))}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
              mode === 'light' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-ink-muted hover:bg-surface-hover',
            )}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            type="button"
            onClick={() => dispatch(setMode('dark'))}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
              mode === 'dark' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-ink-muted hover:bg-surface-hover',
            )}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Accent color</p>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {(Object.entries(ACCENTS) as [AccentKey, (typeof ACCENTS)[AccentKey]][]).map(([key, value]) => (
            <button
              key={key}
              type="button"
              title={value.label}
              onClick={() => dispatch(setAccent(key))}
              className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition"
              style={
                {
                  backgroundColor: value.value,
                  '--tw-ring-color': accent === key ? value.value : 'transparent',
                } as CSSProperties
              }
            >
              {accent === key && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
