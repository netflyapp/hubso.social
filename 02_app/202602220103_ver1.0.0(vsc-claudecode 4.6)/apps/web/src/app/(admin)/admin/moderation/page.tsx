'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { CheckCircle, XCircle, Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface FlaggedPost {
  id: string
  content: Record<string, unknown>
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  space?: { id: string; name: string } | null
  community?: { id: string; name: string; slug: string } | null
}

function extractTextFromTiptap(content: Record<string, unknown>): string {
  if (!content?.content) return ''
  const nodes = content.content as Record<string, unknown>[]
  return nodes
    .flatMap((n) => {
      if (n.type === 'paragraph' && n.content) {
        return (n.content as Record<string, unknown>[])
          .filter((c) => c.type === 'text')
          .map((c) => c.text as string)
      }
      return []
    })
    .join(' ')
    .slice(0, 300)
}

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<FlaggedPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.moderation({ page, limit: 15 })
      setPosts(res.posts)
      setTotal(res.total)
      setPages(res.pages)
    } catch {
      toast.error('Nie udało się załadować postów do moderacji')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleAction = async (
    postId: string,
    action: 'approve' | 'reject' | 'unflag',
  ) => {
    setActionLoading(postId)
    try {
      if (action === 'approve') {
        await adminApi.approvePost(postId)
        toast.success('Post zatwierdzony')
      } else if (action === 'reject') {
        await adminApi.rejectPost(postId)
        toast.success('Post odrzucony i usunięty')
      } else {
        await adminApi.unflagPost(postId)
        toast.success('Flaga usunięta')
      }
      load()
    } catch {
      toast.error('Wystąpił błąd')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Moderacja</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {total} post{total !== 1 ? 'y' : ''} oczekuje na weryfikację
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 animate-pulse"
            >
              <div className="h-4 w-1/3 bg-slate-100 dark:bg-dark-hover rounded mb-3" />
              <div className="h-3 w-2/3 bg-slate-100 dark:bg-dark-hover rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Brak postów do moderacji
          </p>
          <p className="text-sm text-slate-400 mt-1">Wszystko wygląda czysto!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const text = extractTextFromTiptap(post.content)
            const isLoading = actionLoading === post.id
            return (
              <div
                key={post.id}
                className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-dark-surface p-5 space-y-3"
              >
                {/* Author row */}
                <div className="flex items-center gap-3">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {(post.author.displayName ?? post.author.username)[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {post.author.displayName ?? post.author.username}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(post.createdAt).toLocaleString('pl-PL')}
                      {post.space && ` · ${post.space.name}`}
                      {post.community && ` · ${post.community.name}`}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-medium">
                      <Flag className="w-3 h-3" />
                      Oflagowany
                    </span>
                  </div>
                </div>

                {/* Content preview */}
                {text && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-hover rounded-lg p-3 line-clamp-4">
                    {text}
                    {text.length >= 300 && '…'}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAction(post.id, 'approve')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Zatwierdź
                  </button>
                  <button
                    onClick={() => handleAction(post.id, 'reject')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Odrzuć i usuń
                  </button>
                  <button
                    onClick={() => handleAction(post.id, 'unflag')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors disabled:opacity-50 ml-auto"
                  >
                    Usuń flagę
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
