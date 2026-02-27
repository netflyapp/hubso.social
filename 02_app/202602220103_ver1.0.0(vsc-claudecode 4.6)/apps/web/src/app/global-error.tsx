'use client'

import { useEffect } from 'react'
import { Icon } from '@iconify/react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="pl">
      <body className="bg-white dark:bg-slate-950">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <Icon icon="solar:danger-triangle-linear" width={32} height={32} className="text-red-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Coś poszło nie tak
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub wróć do strony głównej.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Strona główna
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              <summary className="cursor-pointer font-medium">Szczegóły błędu (dev)</summary>
              <pre className="mt-2 overflow-auto rounded-md bg-slate-100 dark:bg-slate-800 p-4">{error.stack}</pre>
            </details>
          )}
        </div>
      </body>
    </html>
  )
}
