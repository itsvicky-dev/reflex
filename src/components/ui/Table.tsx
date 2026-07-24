import { clsx } from 'clsx'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'

export type TableColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
  headerClassName?: string
  cellClassName?: string
}

type TableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  className?: string
  /** Adds a checkbox column with a select-all / indeterminate header checkbox. */
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  /** Adds an expand/collapse chevron to `expandColumnKey` (defaults to the first column). */
  expandable?: boolean
  expandColumnKey?: string
  renderExpanded?: (row: T) => ReactNode
  /** Controls expanded rows externally, e.g. for an "expand all" action. Uncontrolled by default. */
  expandedKeys?: Set<string>
  onExpandedKeysChange?: (keys: Set<string>) => void
  /** Column to visually emphasize (solid accent fill), e.g. the currently active view. */
  highlightColumnKey?: string
}

export function Table<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No data available.',
  className,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  expandable = false,
  expandColumnKey,
  renderExpanded,
  highlightColumnKey,
  expandedKeys: controlledExpandedKeys,
  onExpandedKeysChange,
}: TableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set())
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(new Set())
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  const selected = selectedKeys ?? internalSelected
  const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys
  const allKeys = data.map(rowKey)
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selected.has(key))
  const someSelected = allKeys.some((key) => selected.has(key))
  const anchorKey = expandColumnKey ?? columns[0]?.key
  const colSpan = columns.length + (selectable ? 1 : 0)

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected
    }
  }, [someSelected, allSelected])

  function updateSelection(next: Set<string>) {
    onSelectionChange?.(next)
    if (!selectedKeys) setInternalSelected(next)
  }

  function toggleAll() {
    updateSelection(allSelected ? new Set() : new Set(allKeys))
  }

  function toggleRow(key: string) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    updateSelection(next)
  }

  function toggleExpanded(key: string) {
    const next = new Set(expandedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onExpandedKeysChange?.(next)
    if (!controlledExpandedKeys) setInternalExpandedKeys(next)
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-10 whitespace-nowrap px-4 py-2.5">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                  className="h-4 w-4 rounded border-border accent-[var(--color-accent)]"
                />
              </th>
            )}
            {columns.map((column) => {
              const highlighted = column.key === highlightColumnKey
              return (
                <th
                  key={column.key}
                  className={clsx(
                    'whitespace-nowrap px-4 py-2.5 text-[13px] font-medium text-ink-muted',
                    column.align === 'right' && 'text-right',
                    highlighted && 'bg-accent text-accent-content font-semibold',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = rowKey(row)
            const isExpanded = expandedKeys.has(key)
            return (
              <Fragment key={key}>
                <tr className={clsx('border-b border-border transition last:border-0 hover:bg-surface-hover/60', selected.has(key) && 'bg-accent/5')}>
                  {selectable && (
                    <td className="w-10 whitespace-nowrap px-4 py-2 align-middle">
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        onChange={() => toggleRow(key)}
                        aria-label="Select row"
                        className="h-4 w-4 rounded border-border accent-[var(--color-accent)]"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const highlighted = column.key === highlightColumnKey
                    const isAnchor = expandable && column.key === anchorKey
                    return (
                      <td
                        key={column.key}
                        className={clsx(
                          'px-4 py-2 align-middle',
                          column.align === 'right' && 'text-right',
                          highlighted && 'bg-accent font-semibold text-accent-content',
                          column.cellClassName,
                        )}
                      >
                        {isAnchor ? (
                          <div className="flex items-center gap-2">
                            {renderExpanded && (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(key)}
                                aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                                aria-expanded={isExpanded}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-muted transition hover:bg-surface-hover hover:text-ink"
                              >
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                            )}
                            <div className="min-w-0 flex-1">{column.render(row)}</div>
                          </div>
                        ) : (
                          column.render(row)
                        )}
                      </td>
                    )
                  })}
                </tr>
                {expandable && isExpanded && renderExpanded && (
                  <tr className="border-b border-border bg-surface-hover/40 last:border-0">
                    <td colSpan={colSpan} className="px-4 py-3">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="py-10 text-center text-sm text-ink-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
