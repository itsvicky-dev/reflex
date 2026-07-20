import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '../features/theme/themeSlice'
import { THEME_STORAGE_KEY } from '../features/theme/theme'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
})

store.subscribe(() => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(store.getState().theme))
  } catch {
    // localStorage unavailable (private mode, etc.) — theme just won't persist
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
