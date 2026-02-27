'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PlatformError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[PlatformError]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
        <Icon icon="solar:danger-triangle-linear" width={28} height={28} className="text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Coś poszło nie tak</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub odśwież stronę.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3 text-xs text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer select-none font-medium">Szczegóły błędu</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-all">{error.stack ?? error.message}</pre>
          </details>
        )}
      </div>
      <Button onClick={reset} variant="default">
        Spróbuj ponownie
      </Button>
    </div>
  )
}
