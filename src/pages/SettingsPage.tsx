import { Check, Moon, Sun } from 'lucide-react'
import { clsx } from 'clsx'
import type { CSSProperties } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Card } from '../components/ui/Card'
import { ACCENTS, type AccentKey } from '../features/theme/theme'
import { setAccent, setMode } from '../features/theme/themeSlice'

export function SettingsPage() {
  const dispatch = useAppDispatch()
  const { mode, accent } = useAppSelector((state) => state.theme)

  return (
    <section className="space-y-4">
      <Card className="p-5">
        <h3 className="text-base font-semibold text-heading">Appearance</h3>
        <p className="text-sm text-ink-muted">
          Choose a mode and accent color. This applies instantly across the whole workspace.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Mode</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => dispatch(setMode('light'))}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                  mode === 'light' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-ink-muted hover:bg-surface-hover',
                )}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => dispatch(setMode('dark'))}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                  mode === 'dark' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-ink-muted hover:bg-surface-hover',
                )}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Accent color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.entries(ACCENTS) as [AccentKey, (typeof ACCENTS)[AccentKey]][]).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  title={value.label}
                  onClick={() => dispatch(setAccent(key))}
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition"
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
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-ink-muted">Data Sync</p>
          <p className="mt-2 font-medium text-heading">Daily batch sync is scheduled for 02:00 UTC.</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-muted">Automation Rules</p>
          <p className="mt-2 font-medium text-heading">Auto-match runs after every bank feed import.</p>
        </Card>
      </div>
    </section>
  )
}
