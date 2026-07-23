import { clsx } from 'clsx'
import { Check, ChevronDown, PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import {
  bottomUtility,
  productsNav,
  quickAccess,
  topNav,
  type IconComponent,
  type NavGroup,
  type NavLink as NavLinkType,
} from '../../config/navigation'
import { useLayout } from '../../context/LayoutContext'
import { useResizableWidth } from '../../hooks/useResizableWidth'
import Logo from '../../assets/images/logo.svg'
import { SearchDialog } from './SearchDialog'

const SIDEBAR_WIDTH_KEY = 'reconciliation.sidebar-width'
const SIDEBAR_COLLAPSED_WIDTH = 45

function IconTooltip({ rect, label }: { rect: DOMRect; label: string }) {
  return createPortal(
    <div
      style={{ position: 'fixed', left: rect.right + 8, top: rect.top + rect.height / 2, transform: 'translateY(-50%)' }}
      className="pointer-events-none z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-lg"
    >
      {label}
    </div>,
    document.body,
  )
}

function FlatLink({ item, collapsed }: { item: NavLinkType; collapsed: boolean }) {
  const Icon = item.icon
  const [rect, setRect] = useState<DOMRect | null>(null)

  return (
    <>
      <NavLink
        to={item.to}
        aria-label={collapsed ? item.label : undefined}
        onMouseEnter={
          collapsed ? (event: ReactMouseEvent<HTMLElement>) => setRect(event.currentTarget.getBoundingClientRect()) : undefined
        }
        onMouseLeave={collapsed ? () => setRect(null) : undefined}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition',
            collapsed && 'justify-center px-0 py-1.5',
            isActive ? 'bg-gray-100 font-medium text-ink' : 'text-ink hover:bg-surface-hover',
          )
        }
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
            {item.badge}
          </span>
        )}
      </NavLink>
      {collapsed && rect && <IconTooltip rect={rect} label={item.label} />}
    </>
  )
}

function SearchTrigger({ item, collapsed, onClick }: { item: NavLinkType; collapsed: boolean; onClick: () => void }) {
  const Icon = item.icon
  const [rect, setRect] = useState<DOMRect | null>(null)

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={collapsed ? item.label : undefined}
        onMouseEnter={
          collapsed ? (event: ReactMouseEvent<HTMLElement>) => setRect(event.currentTarget.getBoundingClientRect()) : undefined
        }
        onMouseLeave={collapsed ? () => setRect(null) : undefined}
        className={clsx(
          'flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-ink transition hover:bg-surface-hover',
          collapsed && 'justify-center px-0 py-1.5',
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
      {collapsed && rect && <IconTooltip rect={rect} label={item.label} />}
    </>
  )
}

function GroupRow({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(group.defaultOpen ?? false)
  const Icon = group.icon
  const [flyoutRect, setFlyoutRect] = useState<DOMRect | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const showFlyout = (target: HTMLElement) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setFlyoutRect(target.getBoundingClientRect())
  }
  const scheduleHideFlyout = () => {
    closeTimeoutRef.current = setTimeout(() => setFlyoutRect(null), 150)
  }
  const cancelHideFlyout = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }

  if (collapsed) {
    return (
      <>
        <NavLink
          to={group.children[0].to}
          aria-label={group.label}
          onMouseEnter={(event: ReactMouseEvent<HTMLElement>) => showFlyout(event.currentTarget)}
          onMouseLeave={scheduleHideFlyout}
          className={({ isActive }) =>
            clsx(
              'flex items-center justify-center rounded-lg px-0 py-1.5 text-sm font-medium transition',
              isActive ? 'bg-gray-100 text-ink' : 'text-ink hover:bg-surface-hover',
            )
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        </NavLink>

        {flyoutRect &&
          createPortal(
            <div
              style={{ position: 'fixed', left: flyoutRect.right + 8, top: flyoutRect.top }}
              onMouseEnter={cancelHideFlyout}
              onMouseLeave={scheduleHideFlyout}
              className="z-50 w-52 rounded-lg border border-border bg-surface py-1.5 shadow-lg"
            >
              <p className="truncate px-3 pb-1 text-xs font-semibold text-ink-muted">{group.label}</p>
              <div className="space-y-0.5 px-1 pb-1">
                {group.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-md px-2 py-1.5 text-sm transition',
                        isActive ? 'bg-gray-100 font-medium text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </div>,
            document.body,
          )}
      </>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink transition hover:bg-surface-hover"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={clsx('h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-200 ease-in-out', !open && '-rotate-90')}
        />
      </button>

      <div className="grid transition-[grid-template-rows] duration-200 ease-in-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="ml-[26px] mt-0.5 space-y-0.5 pl-1">
            {group.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-lg px-3 py-1.5 text-sm transition',
                    isActive ? 'bg-gray-100 font-medium text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  label: string
  icon: IconComponent
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={collapsed ? label : undefined}
        onMouseEnter={
          collapsed ? (event: ReactMouseEvent<HTMLElement>) => setRect(event.currentTarget.getBoundingClientRect()) : undefined
        }
        onMouseLeave={collapsed ? () => setRect(null) : undefined}
        className={clsx(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
          collapsed && 'justify-center px-0 py-1.5',
          active ? 'bg-gray-100 font-medium text-ink' : 'text-ink hover:bg-surface-hover',
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
      {collapsed && rect && <IconTooltip rect={rect} label={label} />}
    </>
  )
}

function UtilityIcon({ item }: { item: (typeof bottomUtility)[number] }) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const handleEnter = (event: ReactMouseEvent<HTMLElement>) => setRect(event.currentTarget.getBoundingClientRect())
  const handleLeave = () => setRect(null)

  return (
    <>
      {item.to ? (
        <NavLink
          to={item.to}
          aria-label={item.label}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={({ isActive }) =>
            clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg transition',
              isActive ? 'bg-gray-100 text-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )
          }
        >
          <item.icon className="h-4 w-4" strokeWidth={2} />
        </NavLink>
      ) : (
        <button
          type="button"
          aria-label={item.label}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
        >
          <item.icon className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
      {rect && <IconTooltip rect={rect} label={item.label} />}
    </>
  )
}

const ORGANIZATIONS = ['Tan Jian Hao']

function OrgSwitcher() {
  const [open, setOpen] = useState(false)
  const [activeOrg, setActiveOrg] = useState(ORGANIZATIONS[0])
  const [rect, setRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={(event) => {
          setRect(event.currentTarget.getBoundingClientRect())
          setOpen((prev) => !prev)
        }}
        className="flex w-full items-center gap-2 rounded-lg text-left hover:bg-surface-hover px-2"
      >
        <span className="truncate text-sm font-semibold text-heading">{activeOrg}</span>
        <ChevronDown className={clsx('h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            style={{ position: 'fixed', left: rect.left, top: rect.bottom + 4 }}
            className="z-50 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            <div className="space-y-0.5 px-1">
              {ORGANIZATIONS.map((org) => (
                <button
                  key={org}
                  type="button"
                  onClick={() => {
                    setActiveOrg(org)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink transition hover:bg-surface-hover"
                >
                  <span className="flex-1 truncate text-left">{org}</span>
                  {org === activeOrg && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
                </button>
              ))}
            </div>

            <div className="mt-1 border-t border-border pt-1 px-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span>Add organization</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export function Sidebar({ onOpenAiPanel, aiPanelOpen }: { onOpenAiPanel: () => void; aiPanelOpen: boolean }) {
  // const [activeQuick, setActiveQuick] = useState('recents')
  const { sidebarCollapsed: collapsed, toggleSidebarCollapsed: toggleCollapsed } = useLayout()
  const { width, dragging, startResize } = useResizableWidth({
    storageKey: SIDEBAR_WIDTH_KEY,
    defaultWidth: 230,
    min: 200,
    max: 420,
  })
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <aside
      style={
        {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : width,
          '--color-ink': '#1d1f24',
          '--color-ink-muted': '#565A64',
          '--color-heading': '#565A64',
        } as CSSProperties
      }
      className={clsx(
        'relative flex h-full shrink-0 flex-col overflow-hidden bg-surface',
        !dragging && 'transition-[width] duration-300 ease-nnin-out',
      )}
    >
      <div className={clsx('flex items-center gap-2', collapsed ? 'justify-center px-2 py-2' : 'px-3 pt-2 pb-3')}>
        {!collapsed && (
          <>
            <img src={Logo} className='w-5' />
            <OrgSwitcher />
          </>
        )}
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" strokeWidth={2} /> : <PanelLeftClose className="h-4 w-4" strokeWidth={2} />}
        </button>
      </div>

      {collapsed && <div className="border-t border-border mx-2" />}

      <nav className={clsx('scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden pb-3', collapsed ? 'space-y-2' : 'space-y-4')}>
        <div className={clsx(collapsed ? 'space-y-1.5' : 'space-y-1 mb-1')}>
          {topNav.map((item) =>
            item.to === '/search' ? (
              <SearchTrigger key={item.to} item={item} collapsed={collapsed} onClick={() => setSearchOpen(true)} />
            ) : (
              <FlatLink key={item.to} item={item} collapsed={collapsed} />
            ),
          )}
        </div>

        {/* <div className={clsx('border-t border-border', collapsed ? 'mx-2' : 'mx-3 mt-3 mb-1')} /> */}

        {/* <div className={clsx('flex items-center gap-1.5', collapsed ? 'flex-wrap justify-center py-1' : 'py-2')}>
          {quickAccess.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setActiveQuick(item.id)}
              className={clsx(
                'flex h-8 items-center justify-center rounded-lg border transition',
                collapsed ? 'w-8' : 'w-full',
                activeQuick === item.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-ink-muted hover:bg-surface-hover hover:text-ink',
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
            </button>
          ))}
        </div> */}
        

        <div>
          {/* {!collapsed && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Products</p>} */}
          <div className={clsx(collapsed ? 'space-y-1.5' : 'space-y-1 mb-0')}>
            {productsNav.flatMap((entry) => {
              let node: ReactElement
              if (entry.kind === 'link') {
                node = <FlatLink key={entry.to} item={entry} collapsed={collapsed} />
              } else if (entry.kind === 'group') {
                node = <GroupRow key={entry.id} group={entry} collapsed={collapsed} />
              } else {
                node = (
                  <ActionButton
                    key={entry.id}
                    label={entry.label}
                    icon={entry.icon}
                    active={aiPanelOpen}
                    collapsed={collapsed}
                    onClick={onOpenAiPanel}
                  />
                )
              }

              if (entry.kind === 'group' && entry.id === 'experiment') {
                return [
                  node,
                  <div key="experiment-divider" className={clsx('border-t border-border mt-2 mb-2', collapsed ? 'mx-2' : 'mx-3')} />,
                ]
              }

              return [node]
            })}
          </div>
        </div>
      </nav>

      {collapsed && <div className="border-t border-border mx-2" />}

      <div className={clsx(collapsed ? 'px-2 py-2' : 'p-3')}>
        <div className={clsx('flex flex-wrap items-center gap-1', collapsed ? 'justify-center' : 'justify-between')}>
          {bottomUtility.map((item) => (
            <UtilityIcon key={item.id} item={item} />
          ))}
        </div>

        {!collapsed && (
          <div className="group mt-3 rounded-lg border border-border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                <div className="h-full rounded-full bg-accent" style={{ width: '48%' }} />
              </div>
              <span className='flex whitespace-nowrap text-[10px] text-ink-muted'>4k / 10k</span>
            </div>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-hover:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <button
                  type="button"
                  className="mt-2 w-full rounded-md border border-ink-muted text-gray-500 py-1.5 text-xs hover:text-accent transition hover:bg-accent/15"
                >
                  Manage usage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
          className={clsx(
            'absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none transition-colors',
            dragging ? 'bg-accent/50' : 'hover:bg-accent/40',
          )}
        />
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </aside>
  )
}
