import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { ACCENTS, THEME_STORAGE_KEY, type AccentKey, type ThemeMode } from './theme'

interface ThemeState {
  mode: ThemeMode
  accent: AccentKey
}

const defaultState: ThemeState = {
  mode: 'light',
  accent: 'indigo',
}

function loadInitialState(): ThemeState {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return defaultState

    const parsed = JSON.parse(raw) as Partial<ThemeState>
    const mode: ThemeMode = parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : defaultState.mode
    const accent: AccentKey = parsed.accent && parsed.accent in ACCENTS ? parsed.accent : defaultState.accent

    return { mode, accent }
  } catch {
    return defaultState
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: loadInitialState(),
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
    },
    setAccent: (state, action: PayloadAction<AccentKey>) => {
      state.accent = action.payload
    },
  },
})

export const { setMode, toggleMode, setAccent } = themeSlice.actions
export default themeSlice.reducer
