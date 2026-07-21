import { clsx } from 'clsx'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { bottomUtility, productsNav, quickAccess, topNav, type NavGroup, type NavLink as NavLinkType } from '../../config/navigation'
import { useLayout } from '../../context/LayoutContext'
import { useResizableWidth } from '../../hooks/useResizableWidth'

const SIDEBAR_WIDTH_KEY = 'reconciliation.sidebar-width'
const SIDEBAR_COLLAPSED_WIDTH = 45

function FlatLink({ item, collapsed }: { item: NavLinkType; collapsed: boolean }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm  transition',
          collapsed && 'justify-center px-0 py-1.5',
          isActive ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface-hover',
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
  )
}

function GroupRow({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(group.defaultOpen ?? false)
  const Icon = group.icon

  if (collapsed) {
    return (
      <NavLink
        to={group.children[0].to}
        title={group.label}
        className={({ isActive }) =>
          clsx(
            'flex items-center justify-center rounded-lg px-0 py-1.5 text-sm font-medium transition',
            isActive ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface-hover',
          )
        }
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      </NavLink>
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

export function Sidebar({ onOpenAiPanel, aiPanelOpen }: { onOpenAiPanel: () => void; aiPanelOpen: boolean }) {
  // const [activeQuick, setActiveQuick] = useState('recents')
  const { sidebarCollapsed: collapsed, toggleSidebarCollapsed: toggleCollapsed } = useLayout()
  const { width, dragging, startResize } = useResizableWidth({
    storageKey: SIDEBAR_WIDTH_KEY,
    defaultWidth: 230,
    min: 200,
    max: 420,
  })

  return (
    <aside
      style={
        {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : width,
          '--color-ink': '#565A64',
          '--color-ink-muted': '#565A64',
          '--color-heading': '#565A64',
        } as CSSProperties
      }
      className={clsx(
        'relative flex h-full shrink-0 flex-col overflow-hidden bg-surface',
        !dragging && 'transition-[width] duration-300 ease-in-out',
      )}
    >
      <div className={clsx('flex items-center gap-2', collapsed ? 'justify-center px-2 py-2' : 'px-3 pt-2 pb-3')}>
        {!collapsed && (
          <button type="button" className="flex flex-1 items-center gap-2 rounded-lg text-left hover:bg-surface-hover">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-content">
              R
            </div>
            <span className="truncate text-sm font-semibold text-heading">Tan Jian Hao</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          </button>
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

      <nav className={clsx('scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden pb-3', collapsed ? 'space-y-1' : 'space-y-4')}>
        <div className="space-y-0.5">
          {topNav.map((item) => (
            <FlatLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className={clsx('border-t border-border', collapsed ? 'mx-2' : 'mx-3')} />

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
          {!collapsed && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Products</p>}
          <div className="space-y-0.5">
            {productsNav.map((entry) => {
              if (entry.kind === 'link') return <FlatLink key={entry.to} item={entry} collapsed={collapsed} />
              if (entry.kind === 'group') return <GroupRow key={entry.id} group={entry} collapsed={collapsed} />
              return (
                <button
                  key={entry.id}
                  type="button"
                  title={collapsed ? entry.label : undefined}
                  onClick={onOpenAiPanel}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                    collapsed && 'justify-center px-0 py-1.5',
                    aiPanelOpen ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface-hover',
                  )}
                >
                  <entry.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="truncate">{entry.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <div className={clsx(collapsed ? 'px-2 py-2' : 'p-3')}>
        <div className={clsx('flex flex-wrap items-center gap-1', collapsed ? 'justify-center' : 'justify-between')}>
          {bottomUtility.map((item) =>
            item.to ? (
              <NavLink
                key={item.id}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition',
                    isActive ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                  )
                }
              >
                <item.icon className="h-4 w-4" strokeWidth={2} />
              </NavLink>
            ) : (
              <button
                key={item.id}
                type="button"
                title={item.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <item.icon className="h-4 w-4" strokeWidth={2} />
              </button>
            ),
          )}
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
    </aside>
  )
}
