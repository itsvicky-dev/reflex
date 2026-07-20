export const ACCENTS = {
  indigo: { label: 'Indigo', value: '#4f46e5' },
  violet: { label: 'Violet', value: '#7c3aed' },
  emerald: { label: 'Emerald', value: '#059669' },
  rose: { label: 'Rose', value: '#e11d48' },
  amber: { label: 'Amber', value: '#d97706' },
  sky: { label: 'Sky', value: '#0284c7' },
} as const

export type AccentKey = keyof typeof ACCENTS
export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'reconciliation.theme'
