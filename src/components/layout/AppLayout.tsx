import { clsx } from 'clsx'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AiPanel } from '../ai/AiPanel'
import { AiTriggerButton } from '../ai/AiTriggerButton'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  return (
    <div className="flex h-screen gap-2 overflow-hidden bg-white p-2">
      <Sidebar onOpenAiPanel={() => setAiPanelOpen(true)} aiPanelOpen={aiPanelOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-app-bg shadow-sm">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-app-bg p-6">
          <Outlet />
        </main>
      </div>

      <div
        className={clsx(
          'h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out',
          aiPanelOpen ? 'w-[420px]' : 'w-0',
        )}
      >
        <div className="h-full w-[420px]">
          <AiPanel onClose={() => setAiPanelOpen(false)} />
        </div>
      </div>

      {!aiPanelOpen && <AiTriggerButton onClick={() => setAiPanelOpen(true)} />}
    </div>
  )
}
