'use client';

export const dynamic = 'force-dynamic'

import { Icon } from '@iconify/react';
import { useFeed } from '@/lib/hooks/usePosts';
import { useAuthStore } from '@/stores/useAuthStore';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';

export default function FeedPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(20);

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Oś czasu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Śledź aktywność osób, które obserwujesz
          </p>
        </div>

        {/* Post Composer — only for logged-in users */}
        {isAuthenticated && <PostComposer />}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-6 text-center">
            <Icon icon="solar:danger-triangle-linear" width={32} height={32} className="mx-auto text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error instanceof Error ? error.message : 'Nie udało się wczytać postów'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-8 text-center">
            <Icon icon="solar:document-text-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
              Brak postów
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {isAuthenticated
                ? 'Dołącz do społeczności i obserwuj użytkowników, aby zobaczyć ich posty.'
                : 'Zaloguj się, aby zobaczyć posty ze swoich społeczności.'}
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Load More */}
        {hasNextPage && (
          <div className="text-center py-6">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isFetchingNextPage ? (
                <>
                  <Icon icon="solar:refresh-linear" width={16} height={16} className="animate-spin" />
                  Ładowanie…
                </>
              ) : (
                'Załaduj więcej'
              )}
            </button>
          </div>
        )}

        {/* End of feed indicator */}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">
            Widzisz już wszystkie posty
          </p>
        )}
      </div>
    </div>
  );
}
