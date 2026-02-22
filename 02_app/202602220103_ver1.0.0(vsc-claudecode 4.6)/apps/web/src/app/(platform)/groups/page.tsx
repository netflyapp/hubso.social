'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { mockGroups } from '@/lib/mock-data/groups';

export default function GroupsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  function toggleJoin(groupId: string) {
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: 'solar:box-linear' },
    { id: 'trending', label: 'Popularne', icon: 'solar:fire-linear' },
    { id: 'new', label: 'Nowe', icon: 'solar:bolt-linear' },
    { id: 'joined', label: 'Moje', icon: 'solar:bookmark-linear' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Grupy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Odkrywaj i dołączaj do grup o Twoich zainteresowaniach
          </p>
        </div>

        {/* Search + Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="relative">
            <Icon
              icon="solar:search-linear"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Szukaj grup..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button className="h-10 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Icon icon="solar:plus-bold" width={18} height={18} />
            Utwórz grupę
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-500/50'
              }`}
            >
              <Icon icon={cat.icon} width={16} height={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockGroups.map((group, idx) => (
            <div
              key={group.id}
              className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border hover:shadow-lg dark:hover:shadow-lg transition-all group"
            >
              {/* Cover */}
              <div className="relative h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                <div className={`w-full h-full bg-gradient-to-br ${['from-indigo-400 to-purple-600', 'from-rose-400 to-pink-600', 'from-amber-400 to-orange-600', 'from-emerald-400 to-teal-600', 'from-sky-400 to-blue-600', 'from-violet-400 to-purple-600', 'from-red-400 to-rose-600', 'from-lime-400 to-emerald-600'][idx % 8]}`}></div>
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-colors">
                  <Icon icon="solar:bookmark-linear" width={18} height={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {['🚀', '🎨', '💡', '🎓', '🏆', '📱', '🌍', '⚡'][idx % 8]} 
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-[10px] font-medium rounded">
                        {group.category}
                      </span>
                      {group.trending && (
                        <Icon icon="solar:fire-bold" width={14} height={14} className="text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {group.description}
                </p>

                {/* Members */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex -space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-white dark:border-slate-800 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">{group.members}</span> członków
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleJoin(group.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      joinedGroups.has(group.id)
                        ? 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {joinedGroups.has(group.id) ? 'Opuść grupę' : 'Dołącz'}
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                    <Icon icon="solar:share-linear" width={16} height={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Fallback */}
        {mockGroups.length === 0 && (
          <div className="text-center py-12">
            <Icon
              icon="solar:inbox-linear"
              width={48}
              height={48}
              className="mx-auto text-slate-400 mb-4"
            />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Brak grup
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Wróć później lub utwórz nową grupę
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
