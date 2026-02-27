'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Settings,
  ChevronLeft,
  BookOpen,
  Puzzle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/layout/app-header'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Użytkownicy', icon: Users },
  { href: '/admin/courses', label: 'Kursy', icon: BookOpen },
  { href: '/admin/plugins', label: 'Wtyczki', icon: Puzzle },
  { href: '/admin/moderation', label: 'Moderacja', icon: ShieldAlert },
  { href: '/admin/branding', label: 'Branding', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F7F8FA] dark:bg-dark-bg">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Admin sidebar */}
        <aside className="hidden xl:flex w-56 flex-col border-r border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Powrót do aplikacji
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-slate-100 dark:bg-dark-hover text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
