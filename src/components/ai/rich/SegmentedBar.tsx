import { useState } from 'react'
import type { ChartSpec } from '../../../ai/types'
import { ChartTooltip } from './ChartTooltip'
import { MUTED_MARK, formatValue, seriesColor, textWidth } from './chartUtils'

const MAX_COLORED = 4

/**
 * One whole split into parts (part-to-whole), as a tall segmented bar. Parts beyond the fourth fold into "Other",
 * because the palette only has four validated categorical hues and we never invent more.
 */
export function SegmentedBar({ spec, width }: { spec: ChartSpec; width: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const series = spec.series[0]

  const parts = spec.labels.map((label, i) => ({ label, value: Math.max(0, series.values[i]) })).filter((p) => p.value > 0)
  const folded =
    parts.length > MAX_COLORED + 1
      ? [...parts.slice(0, MAX_COLORED), { label: 'Other', value: parts.slice(MAX_COLORED).reduce((a, p) => a + p.value, 0) }]
      : parts
  const total = folded.reduce((a, p) => a + p.value, 0) || 1

  const barH = 28
  const gap = 2
  const usable = width - gap * (folded.length - 1)
  let cursor = 0
  const blocks = folded.map((part, i) => {
    const w = (part.value / total) * usable
    const x = cursor
    cursor += w + gap
    return { ...part, x, w, color: i < MAX_COLORED ? seriesColor(i) : MUTED_MARK, share: (part.value / total) * 100 }
  })

  return (
    <div className="relative">
      <svg width={width} height={barH} role="img" aria-label={`${spec.title}. ${folded.map((p) => `${p.label} ${formatValue(p.value, spec)}`).join(', ')}`} onMouseLeave={() => setHover(null)}>
        {blocks.map((block, i) => {
          const label = `${Math.round(block.share)}%`
          const fits = block.w >= textWidth(label, 11) + 16
          return (
            <g
              key={block.label}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
              opacity={hover !== null && hover !== i ? 0.6 : 1}
            >
              <rect x={block.x} y={0} width={Math.max(1, block.w)} height={barH} rx={4} fill={block.color} />
              {fits && (
                <text x={block.x + 8} y={barH / 2 + 4} fontSize={11} fontWeight={600} fill={i < 2 ? '#ffffff' : '#111827'}>
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {blocks.map((block) => (
          <li key={block.label} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="h-2 w-2 rounded-[3px]" style={{ backgroundColor: block.color }} />
            {block.label}
          </li>
        ))}
      </ul>

      {hover !== null && (
        <ChartTooltip
          x={blocks[hover].x + blocks[hover].w / 2}
          y={barH + 4}
          containerWidth={width}
          title={blocks[hover].label}
          rows={[
            { color: blocks[hover].color, name: 'Amount', value: formatValue(blocks[hover].value, spec) },
            { color: blocks[hover].color, name: 'Share', value: `${blocks[hover].share.toFixed(1)}%`, emphasis: true },
          ]}
        />
      )}
    </div>
  )
}
