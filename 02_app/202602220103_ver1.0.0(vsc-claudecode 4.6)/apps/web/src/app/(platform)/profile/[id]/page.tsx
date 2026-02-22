'use client';

import { Icon } from '@iconify/react';
import { mockUsers } from '@/lib/mock-data/users';
import { mockPosts } from '@/lib/mock-data/posts';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const user = mockUsers[0] || { name: 'User', avatar: '', bio: '' };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700">
        <img src="https://images.unsplash.com/photo-1461749280684-ddefd3083d60?w=1200&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="px-4 lg:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6 relative z-10">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'}
              alt={user.name}
              className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                @{user.name.toLowerCase().replace(/\s+/g, '_')}
              </p>
              <p className="text-slate-700 dark:text-slate-300">{user.bio}</p>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                Obserwuj
              </button>
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Icon icon="solar:chat-round-linear" width={20} height={20} />
              </button>
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Icon icon="solar:menu-dots-linear" width={20} height={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Posty', value: '42' },
              { label: 'Obserwujący', value: '2.3K' },
              { label: 'Obserwowani', value: '156' },
              { label: 'Punkty', value: '12.5K' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-transparent dark:border-dark-border text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-slate-700 mb-6">
            {['Posty', 'Zdjęcia', 'O osobie', 'Aktywność'].map((tab, i) => (
              <button
                key={i}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  i === 0
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {mockPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="group cursor-pointer rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square relative">
                {post.image && (
                  <>
                    <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      {post.type === 'VIDEO' && (
                        <Icon icon="solar:play-bold" width={40} height={40} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* About Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-transparent dark:border-dark-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" width={18} height={18} />
                Informacje
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:map-point-linear" width={16} height={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Kraków, Polska</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="solar:calendar-linear" width={16} height={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Dołączył w marcu 2024</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="solar:link-linear" width={16} height={16} className="text-slate-400" />
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    mojastrona.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-transparent dark:border-dark-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon icon="solar:star-bold" width={18} height={18} />
                Osiągnięcia
              </h3>
              <div className="space-y-3">
                {['Первопроходец', 'Ambasador', 'Mentor', 'Czytnik'].map((badge, i) => (
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
        </div>
      </div>
    </div>
  );
}
