import { ArrowUp, LayoutGrid, Mic, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USER_FIRST_NAME = 'Praburaju'

export function HomePage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!message.trim()) return
    setMessage('')
    navigate('/reflex-ai')
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pt-6">
      <h1 className="text-2xl font-semibold text-heading">Hey {USER_FIRST_NAME}, what do you want to know?</h1>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface transition focus-within:border-accent">
        <form onSubmit={handleSubmit} className="p-3">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Analyze, build, or type / for commands"
            className="w-full bg-transparent px-1 py-1 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <div className="mt-1.5 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Add attachment"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <Plus className="h-4 w-4" />
            </button>
            {message.trim() ? (
              <button
                type="submit"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-content transition"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Voice input"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 border-t border-border bg-[#f8f9fb] px-4 py-2.5 text-left transition hover:bg-surface-hover"
        >
          <span className="flex items-center gap-1.5 text-xs text-ink">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
            Create custom agents to automate your workflows
          </span>
          <span className="shrink-0 text-xs font-medium text-accent">Try now</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/reflex-ai')}
        className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left transition hover:border-accent/40 hover:bg-surface-hover"
      >
        <span className="text-sm font-medium text-heading">What changed most in the past week?</span>
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <LayoutGrid className="h-3.5 w-3.5 text-pink-500" />
          Skill Bridge Enrollment Funnel
        </span>
      </button>

      <p className="text-sm text-ink-muted">
        Or take a moment to explore{' '}
        <button type="button" className="underline underline-offset-2 transition hover:text-ink">
          Why am I seeing this?
        </button>
      </p>

      <button
        type="button"
        onClick={() => navigate('/reflex-ai')}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left opacity-60 transition hover:opacity-100"
      >
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400 text-[10px] font-semibold text-white">
            PS
          </span>
          {USER_FIRST_NAME} S is chatting about
        </div>
        <p className="text-sm font-medium text-heading">&ldquo;Website visitors July 21&rdquo;</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <LayoutGrid className="h-3 w-3 text-pink-500" />
            Home&nbsp;&nbsp;|&nbsp;&nbsp;via Agent Chat
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-ink">View chat</span>
        </div>
      </button>
    </div>
  )
}
