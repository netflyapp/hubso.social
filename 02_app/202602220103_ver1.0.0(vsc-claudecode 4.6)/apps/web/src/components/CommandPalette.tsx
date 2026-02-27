'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Globe, ArrowRight } from 'lucide-react'
import { searchApi } from '@/lib/api'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface UserResult {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

interface CommunityResult {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

type Item =
  | { kind: 'user'; data: UserResult }
  | { kind: 'community'; data: CommunityResult }
  | { kind: 'search'; query: string }

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserResult[]>([])
  const [communities, setCommunities] = useState<CommunityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const debouncedQuery = useDebounce(query, 200)

  // Cmd+K open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setUsers([])
      setCommunities([])
      setSelected(0)
    }
  }, [open])

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setUsers([])
      setCommunities([])
      return
    }
    setLoading(true)
    searchApi
      .suggestions(debouncedQuery)
      .then((res) => {
        setUsers(res.users ?? [])
        setCommunities(res.communities ?? [])
        setSelected(0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const items: Item[] = [
    ...users.map((u) => ({ kind: 'user' as const, data: u })),
    ...communities.map((c) => ({ kind: 'community' as const, data: c })),
    ...(query.length >= 2
      ? [{ kind: 'search' as const, query }]
      : []),
  ]

  const navigate = useCallback(
    (item: Item) => {
      setOpen(false)
      if (item.kind === 'user') {
        router.push(`/profile/${(item.data as UserResult).username}`)
      } else if (item.kind === 'community') {
        router.push(`/communities/${(item.data as CommunityResult).slug}`)
      } else {
        router.push(`/search?q=${encodeURIComponent(item.query)}&type=all`)
      }
    },
    [router],
  )

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter' && items[selected]) {
      navigate(items[selected])
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Szukaj"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-dark-border">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Szukaj użytkowników, społeczności…"
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin shrink-0" />
          )}
          <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-dark-hover text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {items.length > 0 && (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {items.map((item, i) => {
              const isActive = i === selected
              if (item.kind === 'user') {
                const u = item.data as UserResult
                return (
                  <li key={`u-${u.id}`}>
                    <button
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setSelected(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50'
                          : 'hover:bg-slate-50 dark:hover:bg-dark-hover',
                      )}
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {(u.displayName ?? u.username)[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {u.displayName ?? u.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                      </div>
                      <Users className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  </li>
                )
              }

              if (item.kind === 'community') {
                const c = item.data as CommunityResult
                return (
                  <li key={`c-${c.id}`}>
                    <button
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setSelected(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50'
                          : 'hover:bg-slate-50 dark:hover:bg-dark-hover',
                      )}
                    >
                      {c.logoUrl ? (
                        <img
                          src={c.logoUrl}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-hover flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-400">Społeczność</p>
                      </div>
                      <Globe className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  </li>
                )
              }

              // Search shortcut
              return (
                <li key="search-all">
                  <button
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50'
                        : 'hover:bg-slate-50 dark:hover:bg-dark-hover',
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-hover flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                      Szukaj „<span className="text-slate-900 dark:text-white font-medium">{item.query}</span>"
                    </p>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {query.length >= 2 && !loading && items.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Brak wyników dla „{query}"
          </p>
        )}

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-dark-border flex gap-4 text-xs text-slate-400">
          <span>↑↓ nawigaj</span>
          <span>↵ wybierz</span>
          <span>ESC zamknij</span>
        </div>
      </div>
    </>
  )
}
