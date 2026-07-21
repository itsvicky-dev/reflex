import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { allNavLinks } from '../config/navigation'

type LayoutState = { sidebarCollapsed: boolean; aiPanelOpen: boolean }

const STORAGE_KEY = 'reconciliation.layout-by-route'
const DEFAULT_STATE: LayoutState = { sidebarCollapsed: false, aiPanelOpen: false }

function loadStore(): Record<string, LayoutState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveStore(store: Record<string, LayoutState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore
  }
}

function defaultForRoute(pathname: string): LayoutState {
  const link = allNavLinks.find((item) => item.to === pathname)
  return { ...DEFAULT_STATE, ...link?.layout }
}

type LayoutContextValue = LayoutState & {
  setSidebarCollapsed: (value: boolean) => void
  setAiPanelOpen: (value: boolean) => void
  toggleSidebarCollapsed: () => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [store, setStore] = useState<Record<string, LayoutState>>(loadStore)
  const [state, setState] = useState<LayoutState>(() => store[location.pathname] ?? defaultForRoute(location.pathname))

  useEffect(() => {
    setState(store[location.pathname] ?? defaultForRoute(location.pathname))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  function updateState(patch: Partial<LayoutState>) {
    setState((prev) => {
      const next = { ...prev, ...patch }
      setStore((prevStore) => {
        const nextStore = { ...prevStore, [location.pathname]: next }
        saveStore(nextStore)
        return nextStore
      })
      return next
    })
  }

  const value = useMemo<LayoutContextValue>(
    () => ({
      ...state,
      setSidebarCollapsed: (collapsed) => updateState({ sidebarCollapsed: collapsed }),
      setAiPanelOpen: (open) => updateState({ aiPanelOpen: open }),
      toggleSidebarCollapsed: () => updateState({ sidebarCollapsed: !state.sidebarCollapsed }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, location.pathname],
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within a LayoutProvider')
  return ctx
}
