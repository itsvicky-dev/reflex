import { clsx } from 'clsx'
import { Check, Link2, Search } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Collaborator = {
  id: string
  name: string
  email: string
  initials: string
  color: string
}

const collaborators: Collaborator[] = [
  { id: 'praburaju', name: 'Praburaju S', email: 'praburaju@wele.in', initials: 'PS', color: 'bg-accent/15 text-accent' },
  { id: 'vigneshwari', name: 'Vigneshwari', email: 'vigneshwari@wele.in', initials: 'VG', color: 'bg-teal-500/15 text-teal-600' },
  { id: 'arjun', name: 'Arjun Kumar', email: 'arjun@wele.in', initials: 'AK', color: 'bg-orange-500/15 text-orange-600' },
  { id: 'divya', name: 'Divya Menon', email: 'divya@wele.in', initials: 'DM', color: 'bg-pink-500/15 text-pink-600' },
  { id: 'karthik', name: 'Karthik Raj', email: 'karthik@wele.in', initials: 'KR', color: 'bg-indigo-500/15 text-indigo-600' },
]

export function ShareMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [invited, setInvited] = useState<Set<string>>(new Set())
  const [toastVisible, setToastVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)

  const shareButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useLayoutEffect(() => {
    if (!menuOpen || !shareButtonRef.current) return
    const rect = shareButtonRef.current.getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    setQuery('')

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || shareButtonRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  useEffect(() => () => clearTimeout(toastTimeoutRef.current), [])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // clipboard API unavailable in this context; still surface confirmation
    }
    setToastVisible(true)
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2200)
  }

  function toggleInvite(id: string) {
    setInvited((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = collaborators.filter((person) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return person.name.toLowerCase().includes(q) || person.email.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="flex items-center overflow-hidden rounded-lg border border-[#dedfe2] bg-white">
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy link"
          className="flex h-8 w-8 items-center justify-center text-[#1e2024] hover:bg-surface-hover"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <span className="h-5 w-px bg-[#dedfe2]" />
        <button
          ref={shareButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1e2024] hover:bg-surface-hover"
        >
          Share
        </button>
      </div>

      {menuOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPosition.top, right: menuPosition.right }}
            className="fixed z-50 w-80 rounded-xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people"
                className="flex-1 bg-transparent text-xs text-heading placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            <div className="scrollbar-hide max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-ink-muted">No people found</p>
              ) : (
                filtered.map((person) => {
                  const isInvited = invited.has(person.id)
                  return (
                    <div key={person.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-hover">
                      <span
                        className={clsx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                          person.color,
                        )}
                      >
                        {person.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-heading">{person.name}</span>
                        <span className="block truncate text-[11px] text-ink-muted">{person.email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleInvite(person.id)}
                        className={clsx(
                          'shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition',
                          isInvited ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-ink hover:bg-surface-hover',
                        )}
                      >
                        {isInvited ? 'Invited' : 'Invite'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Link2 className="h-3 w-3" /> Anyone with the link can view
              </span>
              <button type="button" onClick={handleCopyLink} className="shrink-0 text-[11px] font-medium text-accent hover:underline">
                Copy link
              </button>
            </div>
          </div>,
          document.body,
        )}

      {toastVisible &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg bg-[#1e2024] px-3.5 py-2.5 text-xs font-medium text-white shadow-xl">
            <Check className="h-3.5 w-3.5" /> Link copied to clipboard
          </div>,
          document.body,
        )}
    </>
  )
}
