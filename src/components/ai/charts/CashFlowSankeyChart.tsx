import { useState } from 'react'
import type { CashFlowVisLink, CashFlowVisNode } from '../../../data/mockFinPilot'

const WIDTH = 880
const HEIGHT = 320
const PAD_Y = 12
const NODE_W = 5
const NODE_GAP = 22
const PLOT_H = HEIGHT - PAD_Y * 2
const LEFT_X = 2
const RIGHT_X = WIDTH - 2 - NODE_W

type Column = 'source' | 'target'

function layoutColumn(nodes: CashFlowVisNode[]) {
  const total = nodes.reduce((sum, n) => sum + n.valueCr, 0)
  const scale = (PLOT_H - NODE_GAP * (nodes.length - 1)) / total
  const positions = new Map<string, { y0: number; y1: number; scale: number }>()
  let y = PAD_Y
  for (const node of nodes) {
    const h = node.valueCr * scale
    positions.set(node.id, { y0: y, y1: y + h, scale })
    y += h + NODE_GAP
  }
  return positions
}

function ribbonPath(x0: number, y0Top: number, y0Bottom: number, x1: number, y1Top: number, y1Bottom: number) {
  const xMid = (x0 + x1) / 2
  return `M${x0},${y0Top} C${xMid},${y0Top} ${xMid},${y1Top} ${x1},${y1Top} L${x1},${y1Bottom} C${xMid},${y1Bottom} ${xMid},${y0Bottom} ${x0},${y0Bottom} Z`
}

export function CashFlowSankeyChart({
  color,
  sources,
  destinations,
  links,
}: {
  color: string
  sources: CashFlowVisNode[]
  destinations: CashFlowVisNode[]
  links: CashFlowVisLink[]
}) {
  const [hoverKey, setHoverKey] = useState<string | null>(null)

  const sourcePos = layoutColumn(sources)
  const targetPos = layoutColumn(destinations)

  const sourceOffset = new Map<string, number>()
  const targetOffset = new Map<string, number>()

  const ribbons = links.map((link) => {
    const key = `${link.source}->${link.target}`
    const srcPos = sourcePos.get(link.source)!
    const tgtPos = targetPos.get(link.target)!

    const srcOffset = sourceOffset.get(link.source) ?? 0
    const tgtOffset = targetOffset.get(link.target) ?? 0

    const srcH = link.valueCr * srcPos.scale
    const tgtH = link.valueCr * tgtPos.scale

    sourceOffset.set(link.source, srcOffset + srcH)
    targetOffset.set(link.target, tgtOffset + tgtH)

    const y0Top = srcPos.y0 + srcOffset
    const y1Top = tgtPos.y0 + tgtOffset

    return {
      key,
      link,
      path: ribbonPath(LEFT_X + NODE_W, y0Top, y0Top + srcH, RIGHT_X, y1Top, y1Top + tgtH),
    }
  })

  const nodeLabel = (node: CashFlowVisNode, column: Column, pos: { y0: number; y1: number }) => {
    const cy = (pos.y0 + pos.y1) / 2
    const x = column === 'source' ? LEFT_X + NODE_W + 8 : RIGHT_X - 8
    const anchor = column === 'source' ? 'start' : 'end'
    return (
      <g key={node.id}>
        <text x={x} y={cy - 4} textAnchor={anchor} fontSize={11} fontWeight={600} fill="var(--color-heading)">
          {node.label}
        </text>
        <text x={x} y={cy + 11} textAnchor={anchor} fontSize={10} fill="var(--color-ink-muted)">
          {node.displayValue}
        </text>
      </g>
    )
  }

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" onMouseLeave={() => setHoverKey(null)}>
      {ribbons.map(({ key, link, path }) => {
        const opacity =
          hoverKey === null ? link.opacity : hoverKey === key ? Math.min(link.opacity * 1.25, 0.65) : link.opacity * 0.45
        return (
          <path
            key={key}
            d={path}
            fill={color}
            fillOpacity={opacity}
            className="transition-[fill-opacity]"
            onMouseEnter={() => setHoverKey(key)}
          >
            <title>
              {`${sources.find((s) => s.id === link.source)?.label} → ${destinations.find((d) => d.id === link.target)?.label}: ₹${link.valueCr.toFixed(2)} Cr`}
            </title>
          </path>
        )
      })}

      {sources.map((node) => {
        const pos = sourcePos.get(node.id)!
        return (
          <rect
            key={node.id}
            x={LEFT_X}
            y={pos.y0}
            width={NODE_W}
            height={pos.y1 - pos.y0}
            rx={2}
            fill="var(--color-chart-baseline)"
          />
        )
      })}

      {destinations.map((node) => {
        const pos = targetPos.get(node.id)!
        return (
          <rect
            key={node.id}
            x={RIGHT_X}
            y={pos.y0}
            width={NODE_W}
            height={pos.y1 - pos.y0}
            rx={2}
            fill={color}
            fillOpacity={node.opacity ?? 0.18}
          />
        )
      })}

      {sources.map((node) => nodeLabel(node, 'source', sourcePos.get(node.id)!))}
      {destinations.map((node) => nodeLabel(node, 'target', targetPos.get(node.id)!))}
    </svg>
  )
}
