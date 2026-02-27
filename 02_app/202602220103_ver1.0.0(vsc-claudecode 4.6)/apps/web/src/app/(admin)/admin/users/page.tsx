'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

interface UserItem {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  status: UserStatus
  followersCount: number
  createdAt: string
}

const ROLE_BADGE: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  MODERATOR: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  MEMBER: 'bg-slate-100 text-slate-600 dark:bg-dark-hover dark:text-slate-400',
  GUEST: 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-500',
}

const STATUS_BADGE: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  INACTIVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const debouncedSearch = useDebounce(search, 300)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.users({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      setUsers(res.users as UserItem[])
      setTotal(res.total)
      setPages(res.pages)
    } catch {
      toast.error('Nie udało się załadować listy użytkowników')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await adminApi.updateUser(userId, { role })
      toast.success('Rola użytkownika zaktualizowana')
      load()
    } catch {
      toast.error('Nie udało się zmienić roli')
    }
  }

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      await adminApi.updateUser(userId, { status })
      toast.success('Status użytkownika zaktualizowany')
      load()
    } catch {
      toast.error('Nie udało się zmienić statusu')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Użytkownicy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {total.toLocaleString()} kont ogółem
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po e-mail, nazwie..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Wszystkie role</option>
          {(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST'] as UserRole[]).map(
            (r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ),
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Wszystkie statusy</option>
          {(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as UserStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-dark-hover border-b border-slate-200 dark:border-dark-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Użytkownik
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Rola
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">
                Dołączył
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={4}>
                    <div className="h-4 bg-slate-100 dark:bg-dark-hover rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Brak wyników
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName ?? u.username}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {(u.displayName ?? u.username)[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {u.displayName ?? u.username}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as UserRole)
                      }
                      className="text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      style={{ background: 'transparent' }}
                    >
                      {(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST'] as UserRole[]).map(
                        (r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ),
                      )}
                    </select>
                    <Badge label={u.role} className={ROLE_BADGE[u.role]} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.status}
                      onChange={(e) =>
                        handleStatusChange(u.id, e.target.value as UserStatus)
                      }
                      className="sr-only"
                      id={`status-${u.id}`}
                    >
                      {(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as UserStatus[]).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                    <label htmlFor={`status-${u.id}`} className="cursor-pointer">
                      <Badge label={u.status} className={STATUS_BADGE[u.status]} />
                    </label>
                  </td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500 hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Strona {page} z {pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-dark-border disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg border border-slate-200 dark:border-dark-border disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
