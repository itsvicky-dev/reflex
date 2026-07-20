import { Sparkles } from 'lucide-react'

export function AiTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open AI assistant"
      className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-content shadow-lg shadow-accent/30 transition hover:scale-105"
    >
      <Sparkles className="h-6 w-6" />
    </button>
  )
}
