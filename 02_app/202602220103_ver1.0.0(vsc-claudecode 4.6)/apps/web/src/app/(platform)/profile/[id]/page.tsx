'use client';

export const dynamic = 'force-dynamic'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { usersApi, followsApi, postsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import nextDynamic from 'next/dynamic';

const EditProfileModal = nextDynamic(
  () => import('@/components/profile/EditProfileModal'),
  { ssr: false },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarSrc(url: string | null | undefined, name: string) {
  if (url) return url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwnProfile = me?.id === params.id;
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', params.id],
    queryFn: () => usersApi.getById(params.id),
    initialData: isOwnProfile && me ? { ...me, isFollowedByMe: false } : undefined,
    staleTime: 1000 * 30,
  });

  // Follow / unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowedByMe) {
        return followsApi.unfollow(params.id);
      }
      return followsApi.follow(params.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', params.id], (old: typeof profile) =>
        old
          ? {
              ...old,
              isFollowedByMe: data.following,
              followersCount: old.followersCount + (data.following ? 1 : -1),
            }
          : old,
      );
      toast.success(data.following ? 'Obserwujesz tę osobę' : 'Przestałeś obserwować');
    },
    onError: () => toast.error('Coś poszło nie tak'),
  });

  // Fetch user post count for stats
  const { data: postsData } = useQuery({
    queryKey: ['user-posts-count', params.id],
    queryFn: () => postsApi.byUser(params.id, 1, 1),
    staleTime: 1000 * 60,
  });

  if (isLoading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        <Icon icon="solar:spinner-linear" className="text-indigo-500 animate-spin" width={32} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        <p className="text-slate-500 dark:text-slate-400">Nie znaleziono użytkownika.</p>
      </div>
    );
  }

  const displayName = profile.displayName ?? profile.username;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700">
      </div>

      <div className="px-4 lg:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6 relative z-10">
            <img
              src={avatarSrc(profile.avatarUrl, displayName)}
              alt={displayName}
              className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h1>
                {profile.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="text-slate-700 dark:text-slate-300 text-sm max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:ml-auto">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Icon icon="solar:pen-linear" width={16} />
                  Edytuj profil
                </button>
              ) : (
                <>
                  <button
                    onClick={() => me && followMutation.mutate()}
                    disabled={!me || followMutation.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60 ${
                      profile.isFollowedByMe
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {followMutation.isPending ? (
                      <Icon icon="solar:spinner-linear" className="animate-spin" width={16} />
                    ) : profile.isFollowedByMe ? (
                      <>
                        <Icon icon="solar:user-check-rounded-linear" width={16} />
                        Obserwujesz
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:user-plus-rounded-linear" width={16} />
                        Obserwuj
                      </>
                    )}
                  </button>
                  <button aria-label="Wyślij wiadomość" className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Icon icon="solar:chat-round-linear" width={20} />
                  </button>
                </>
              )}
              <button aria-label="Więcej opcji" className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Icon icon="solar:menu-dots-linear" width={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Posty', value: postsData?.total ?? '—' },
              { label: 'Obserwujący', value: profile.followersCount ?? 0 },
              { label: 'Obserwowani', value: profile.followingCount ?? 0 },
              { label: 'Dołączył', value: formatDate(profile.createdAt) },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-transparent dark:border-dark-border text-center">
                <div className="text-base font-bold text-slate-900 dark:text-white truncate">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-slate-700 mb-6">
            {['Posty', 'O osobie', 'Obserwujący', 'Aktywność'].map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === i
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: O osobie */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-transparent dark:border-dark-border">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Icon icon="solar:info-circle-bold" width={18} />
                  Informacje
                </h3>
                <div className="space-y-3 text-sm">
                  {profile.bio ? (
                    <p className="text-slate-600 dark:text-slate-400">{profile.bio}</p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">Brak opisu.</p>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <Icon icon="solar:calendar-linear" width={16} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Dołączył {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-transparent dark:border-dark-border">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Icon icon="solar:star-bold" width={18} />
                  Osiągnięcia
                </h3>
                <div className="space-y-3">
                  {['Pierwsza publikacja', 'Aktywny uczestnik', 'Twórca społeczności'].map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Obserwujący */}
          {activeTab === 2 && (
            <FollowersTab userId={params.id} />
          )}

          {/* Tab: Posty */}
          {activeTab === 0 && (
            <UserPostsTab userId={params.id} />
          )}

          {/* Tab: Aktywność (placeholder) */}
          {activeTab === 3 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon icon="solar:chart-linear" className="text-slate-300 dark:text-slate-600 mb-4" width={48} />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Historia aktywności wkrótce.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}

// ─── User Posts Tab ────────────────────────────────────────────────────────────

function UserPostsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => postsApi.byUser(userId, 1, 50),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icon icon="solar:spinner-linear" className="text-indigo-500 animate-spin" width={28} />
      </div>
    );
  }

  const posts = data?.data ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon icon="solar:posts-carousel-horizontal-linear" className="text-slate-300 dark:text-slate-600 mb-4" width={48} />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Ten użytkownik nie opublikował jeszcze żadnych postów.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post: any) => {
        // Extract plain text snippet from Tiptap content
        const extractText = (node: any): string => {
          if (!node) return '';
          if (typeof node === 'string') return node;
          let t = '';
          if (node.text) t += node.text;
          if (Array.isArray(node.content)) {
            for (const c of node.content) t += extractText(c) + ' ';
          }
          return t.trim();
        };
        const snippet = extractText(post.content);
        const displaySnippet = snippet.length > 200 ? snippet.slice(0, 200) + '…' : snippet;

        return (
          <div
            key={post.id}
            className="bg-white dark:bg-dark-surface rounded-xl border border-transparent dark:border-dark-border p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {post.communitySlug && (
                <a
                  href={`/communities/${post.communitySlug}`}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {post.communityName}
                </a>
              )}
              {post.spaceName && (
                <>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{post.spaceName}</span>
                </>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(post.createdAt).toLocaleDateString('pl-PL')}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{displaySnippet}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Icon icon="solar:chat-round-linear" width={14} />
                {post.commentsCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:heart-linear" width={14} />
                {Object.values(post.reactionsCount ?? {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Followers Tab ─────────────────────────────────────────────────────────────

function FollowersTab({ userId }: { userId: string }) {
  const [view, setView] = useState<'followers' | 'following'>('followers');

  const { data, isLoading } = useQuery({
    queryKey: ['users', userId, view],
    queryFn: () =>
      view === 'followers' ? followsApi.getFollowers(userId) : followsApi.getFollowing(userId),
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['followers', 'following'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === v
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {v === 'followers' ? 'Obserwujący' : 'Obserwowani'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Icon icon="solar:spinner-linear" className="text-indigo-500 animate-spin" width={28} />
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon icon="solar:users-group-rounded-linear" className="text-slate-300 dark:text-slate-600 mb-4" width={48} />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {view === 'followers' ? 'Brak obserwujących.' : 'Nie obserwuje nikogo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((user) => (
            <a
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 p-3 bg-white dark:bg-dark-surface rounded-xl border border-transparent dark:border-dark-border hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
            >
              <img
                src={user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? user.username)}&background=6366f1&color=fff&size=40`}
                alt={user.displayName ?? user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.displayName ?? user.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
              </div>
              {user.isFollowedByMe && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium shrink-0">Obserwujesz</span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
