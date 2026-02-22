'use client';

import { Icon } from '@iconify/react';
import { mockForumCategories } from '@/lib/mock-data';

const categoryGradients = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-fuchsia-600',
];

const icons = [
  'solar:chat-round-dots-bold',
  'solar:chat-line-bold',
  'solar:help-bold',
  'solar:lightbulb-bold',
  'solar:bell-bold',
];

export default function ForumsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dyskusje</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rozmawiaj, pytaj i dziel się wiedzą ze społecznością</p>
          </div>
          <button className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            <Icon icon="solar:add-circle-linear" width={18} height={18} />
            Nowy temat
          </button>
        </div>

        {mockForumCategories.map((category, catIdx) => (
          <div 
            key={catIdx}
            className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card overflow-hidden border border-transparent dark:border-dark-border transition-colors"
          >
            <div className={`p-5 bg-gradient-to-r ${categoryGradients[catIdx % 5]}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon icon={icons[catIdx % 5]} width={20} height={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{category.name}</h2>
                  <p className="text-xs text-white/70">{category.description}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {category.threads?.slice(0, 3).map((thread, thIdx) => (
                <a 
                  key={thIdx}
                  href="#" 
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <img 
                    src={`https://images.unsplash.com/photo-${1438761681033 + thIdx}?w=50&h=50&fit=crop`} 
                    className="w-9 h-9 rounded-full shrink-0" 
                    alt="" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {thread.title}
                      </h3>
                      {thIdx === 0 && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded shrink-0">
                          📌 Przypięty
                        </span>
                      )}
                      {thIdx === 1 && (
                        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 text-[9px] font-bold rounded shrink-0">
                          🔥 Hot
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{thread.author} · {thread.timeAgo}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:chat-round-dots-linear" width={14} height={14} />
                      {thread.replies}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:eye-linear" width={14} height={14} />
                      {thread.views}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
