import { clsx } from 'clsx'
import { Outlet, useLocation } from 'react-router-dom'
import { useLayout } from '../../context/LayoutContext'
import { useResizableWidth } from '../../hooks/useResizableWidth'
import { AiPanel } from '../ai/AiPanel'
import { AiTriggerButton } from '../ai/AiTriggerButton'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const { aiPanelOpen, setAiPanelOpen } = useLayout()
  const { pathname } = useLocation()
  const isReflexAiPage = pathname.startsWith('/reflex-ai')
  const { width: aiPanelWidth, dragging, startResize } = useResizableWidth({
    storageKey: 'reconciliation.ai-panel-width',
    defaultWidth: 420,
    min: 320,
    max: 640,
    direction: -1,
  })

  return (
    <div className="flex h-screen gap-2 overflow-hidden bg-white px-[6px] py-2">
      <Sidebar onOpenAiPanel={() => setAiPanelOpen(true)} aiPanelOpen={aiPanelOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[13px] border border-border bg-[#f4f5f6]">
        <Topbar />
        <main className={clsx('flex-1 overflow-hidden bg-app-bg', isReflexAiPage ? '' : 'overflow-y-auto p-6')}>
          <Outlet />
        </main>
      </div>

      {!isReflexAiPage && (
        <div
          style={{ width: aiPanelOpen ? aiPanelWidth : 0 }}
          className={clsx(
            'relative h-full shrink-0 overflow-hidden',
            !dragging && 'transition-[width] duration-300 ease-in-out',
          )}
        >
          <div className="h-full" style={{ width: aiPanelWidth }}>
            <AiPanel onClose={() => setAiPanelOpen(false)} />
          </div>

          {aiPanelOpen && (
            <div
              onPointerDown={startResize}
              role="separator"
              aria-orientation="vertical"
              className={clsx(
                'absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none transition-colors',
                dragging ? 'bg-accent/50' : 'hover:bg-accent/40',
              )}
            />
          )}
        </div>
      )}

      {!isReflexAiPage && !aiPanelOpen && <AiTriggerButton onClick={() => setAiPanelOpen(true)} />}
    </div>
  )
}
