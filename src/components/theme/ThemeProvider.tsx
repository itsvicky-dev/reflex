import { useEffect, type ReactNode } from 'react'
import { useAppSelector } from '../../app/hooks'
import { ACCENTS } from '../../features/theme/theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode)
  const accent = useAppSelector((state) => state.theme.accent)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    root.style.setProperty('color-scheme', mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', ACCENTS[accent].value)
  }, [accent])

  return children
}
