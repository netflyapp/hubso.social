'use client';

import { Icon } from '@iconify/react';
import { mockPosts } from '@/lib/mock-data/posts';
import { mockUsers } from '@/lib/mock-data/users';

export default function FeedPage() {
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

        {/* Post Composer */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-4 transition-colors">
          <div className="flex items-start gap-3">
            <img
              src={mockUsers[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'}
              alt=""
              className="w-10 h-10 rounded-full shrink-0"
            />
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5 text-sm text-slate-400 cursor-text hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                O czym myślisz, {mockUsers[0]?.name?.split(' ')[0] || 'Przyjacielu'}?
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Icon icon="solar:gallery-linear" width={16} height={16} className="text-emerald-500" />
                  Zdjęcie
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Icon icon="solar:videocamera-linear" width={16} height={16} className="text-blue-500" />
                  Video
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Icon icon="solar:link-round-linear" width={16} height={16} className="text-orange-500" />
                  Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stories / Feed Indicators */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mockUsers.slice(0, 10).map((user, i) => (
            <div
              key={user.id}
              className="flex-shrink-0 relative group cursor-pointer"
            >
              <div className={`w-16 h-24 rounded-lg bg-gradient-to-b ${['from-indigo-500 to-purple-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'][i % 3]} overflow-hidden shadow-lg`}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold truncate group-hover:line-clamp-2">
                {user.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Posts Feed */}
        {mockPosts.map((post, idx) => (
          <div key={post.id} className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-4 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <a href={`/profile/${post.authorId}`} className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                      {post.authorName}
                    </a>
                  </div>
                  <span className="text-[11px] text-slate-500">{new Date(post.createdAt).toLocaleDateString('pl')}</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon icon="solar:menu-dots-linear" width={18} height={18} />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {post.content}
            </p>

            {/* Image / Video */}
            {post.image && (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video">
                <img src={post.image} alt="" className="w-full h-full object-cover" />
                {post.type === 'VIDEO' && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Icon icon="solar:play-bold" width={28} height={28} className="text-slate-800 ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
                      5:32
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 pb-3 border-b border-gray-200 dark:border-slate-700/50">
              <button className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {post.likes} polubień
              </button>
              <button className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {post.comments} komentarze
              </button>
              <button className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Udostępniono
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <button className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:like-linear" width={18} height={18} />
                Polub
              </button>
              <button className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:chat-round-dots-linear" width={18} height={18} />
                Komentuj
              </button>
              <button className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:share-linear" width={18} height={18} />
                Udostępnij
              </button>
              <button className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:bookmark-linear" width={18} height={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Load More */}
        <div className="text-center py-6">
          <button className="px-6 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
            Załaduj więcej
          </button>
        </div>
      </div>
    </div>
  );
}
