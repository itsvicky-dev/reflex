import { ArrowLeft, ArrowRight, SearchX, ServerCrash } from 'lucide-react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import Logo from '../assets/images/logo.svg'
import { Button } from '../components/ui/Button'

type ErrorContent = {
  code: string
  title: string
  description: string
  icon: typeof SearchX
}

function resolveError(error: unknown): ErrorContent {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        code: '404',
        title: 'This page didn’t reconcile',
        description: 'The route you’re looking for doesn’t exist or may have moved.',
        icon: SearchX,
      }
    }
    return {
      code: String(error.status),
      title: error.statusText || 'Something went wrong',
      description: error.data?.message ?? 'The server returned an unexpected response.',
      icon: ServerCrash,
    }
  }

  if (error instanceof Error) {
    return {
      code: '500',
      title: 'Something went wrong',
      description: error.message || 'This page ran into an unexpected error while loading.',
      icon: ServerCrash,
    }
  }

  return {
    code: '500',
    title: 'Something went wrong',
    description: 'This page ran into an unexpected error while loading.',
    icon: ServerCrash,
  }
}

const NOT_FOUND: ErrorContent = {
  code: '404',
  title: 'This page didn’t reconcile',
  description: 'The route you’re looking for doesn’t exist or may have moved.',
  icon: SearchX,
}

export function ErrorPage({ error: errorProp, notFound }: { error?: unknown; notFound?: boolean }) {
  const routeError = useRouteError()
  const navigate = useNavigate()
  const { code, title, description, icon: Icon } = notFound ? NOT_FOUND : resolveError(errorProp ?? routeError)

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-app-bg px-6">
      <div className="flex items-center gap-2 pb-3">
        <img src={Logo} className="w-5" alt="" />
        <span className="text-sm font-semibold text-heading">Reconciliation</span>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-6 w-6" />
        </div>

        <span className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Error {code}</span>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-heading">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</p>

        <div className="mt-9 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back
          </Button>
          <Button size="sm" onClick={() => navigate('/overview')}>
            Back to Overview
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-7 text-xs font-medium text-ink-muted underline decoration-border underline-offset-4 transition hover:text-ink"
        >
          Try reloading the page
        </button>
      </div>
    </div>
  )
}
