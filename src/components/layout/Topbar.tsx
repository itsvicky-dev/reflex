import { HelpCircle, Share2, SlidersHorizontal } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { allNavLinks } from '../../config/navigation'
import { ThemeSwitcher } from '../theme/ThemeSwitcher'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'

export function Topbar() {
  const { pathname } = useLocation()
  const current = allNavLinks.find((item) => pathname.startsWith(item.to))
  const title = current?.label ?? 'Overview'

  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-1 ">
      <h1 className="text-[24px] font-semibold text-heading">{title}</h1>

      <div className="flex items-center gap-3">
        {/* <ThemeSwitcher /> */}
        <IconButton aria-label="Help">
          <HelpCircle className="h-4 w-4" />
        </IconButton>
        <Button variant="outline" size="sm">
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
        {/* <Button size="sm">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Customize
        </Button> */}
      </div>
    </header>
  )
}
