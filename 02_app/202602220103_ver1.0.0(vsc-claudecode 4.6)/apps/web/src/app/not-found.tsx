import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <p className="text-7xl font-bold text-slate-200 dark:text-slate-700">404</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Strona nie istnieje</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Nie mogliśmy znaleźć strony, której szukasz. Sprawdź adres URL lub wróć do strony głównej.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/feed"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Przejdź do feedu
        </Link>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          Strona główna
        </Link>
      </div>
    </div>
  )
}
