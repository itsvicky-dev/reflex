type TrendPoint = {
  label: string
  matched: number
  unmatched: number
}

export function TrendBars({ data }: { data: TrendPoint[] }) {
  const max = Math.max(...data.map((point) => point.matched + point.unmatched))

  return (
    <div className="flex h-48 gap-3">
      {data.map((point) => {
        const total = point.matched + point.unmatched
        const matchedHeight = (point.matched / max) * 100
        const unmatchedHeight = (point.unmatched / max) * 100

        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="flex min-h-0 w-full flex-1 flex-col justify-end gap-0.5"
              title={`${point.label}: ${total} items`}
            >
              <div className="w-full rounded-t-md bg-rose-500/70" style={{ height: `${unmatchedHeight}%` }} />
              <div className="w-full rounded-b-md bg-accent" style={{ height: `${matchedHeight}%` }} />
            </div>
            <span className="text-xs text-ink-muted">{point.label}</span>
          </div>
        )
      })}
    </div>
  )
}
