'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { searchApi } from '@/lib/api'
import { Search, Users, Globe, FileText } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

type Tab = 'all' | 'users' | 'communities' | 'posts'

interface UserResult {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

interface CommunityResult {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
  _count: { members: number }
}

interface PostResult {
  id: string
  searchableText: string | null
  type: string
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  space: {
    id: string
    name: string
    community: { id: string; slug: string; name: string }
  } | null
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams?.get('q') ?? ''
  const initialTab = (searchParams?.get('type') as Tab) ?? 'all'

  const [query, setQuery] = useState(initialQ)
  const [tab, setTab] = useState<Tab>(initialTab)
  const [users, setUsers] = useState<UserResult[]>([])
  const [communities, setCommunities] = useState<CommunityResult[]>([])
  const [posts, setPosts] = useState<PostResult[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setUsers([])
      setCommunities([])
      setPosts([])
      return
    }

    setLoading(true)
    searchApi
      .search(debouncedQuery, tab)
      .then((res) => {
        setUsers(res.users ?? [])
        setCommunities(res.communities ?? [])
        setPosts(res.posts ?? [])
      })
      .catch(() => {
        toast.error('Błąd wyszukiwania. Spróbuj ponownie.')
      })
      .finally(() => setLoading(false))

    // Update URL without full navigation
    const params = new URLSearchParams({ q: debouncedQuery, type: tab })
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [debouncedQuery, tab, router])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Wszystko' },
    { id: 'users', label: 'Użytkownicy' },
    { id: 'communities', label: 'Społeczności' },
    { id: 'posts', label: 'Posty' },
  ]

  const showUsers = tab === 'all' || tab === 'users'
  const showCommunities = tab === 'all' || tab === 'communities'
  const showPosts = tab === 'all' || tab === 'posts'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Szukaj użytkowników, społeczności, postów…"
          className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-dark-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-hover shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-slate-100 dark:bg-dark-hover rounded" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-dark-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !debouncedQuery || debouncedQuery.length < 2 ? (
        <p className="text-center text-sm text-slate-400 py-12">
          Wpisz minimum 2 znaki, aby wyszukać
        </p>
      ) : users.length === 0 && communities.length === 0 && posts.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-12">
          Brak wyników dla „{debouncedQuery}"
        </p>
      ) : (
        <div className="space-y-6">
          {/* Users */}
          {showUsers && users.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Użytkownicy
                </h2>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {(u.displayName ?? u.username)[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {u.displayName ?? u.username}
                      </p>
                      <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {showPosts && posts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Posty
                </h2>
              </div>
              <div className="space-y-2">
                {posts.map((p) => {
                  const href = p.space
                    ? `/communities/${p.space.community.slug}`
                    : '#'
                  const snippet = p.searchableText
                    ? p.searchableText.length > 120
                      ? p.searchableText.slice(0, 120) + '…'
                      : p.searchableText
                    : ''
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                    >
                      {p.author.avatarUrl ? (
                        <img
                          src={p.author.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {(p.author.displayName ?? p.author.username)[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {p.author.displayName ?? p.author.username}
                          </span>
                          {p.space && (
                            <span className="text-xs text-slate-400 truncate">
                              w {p.space.name} · {p.space.community.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {snippet}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(p.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Communities */}
          {showCommunities && communities.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Społeczności
                </h2>
              </div>
              <div className="space-y-2">
                {communities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/communities/${c.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    {c.logoUrl ? (
                      <img
                        src={c.logoUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-hover flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {c.name}
                      </p>
                      {c.description && (
                        <p className="text-xs text-slate-400 truncate">{c.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {c._count.members} czł.
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-12 bg-slate-100 dark:bg-dark-hover rounded-xl animate-pulse" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
