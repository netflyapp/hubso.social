'use client';

import { Icon } from '@iconify/react';
import { mockMembers } from '@/lib/mock-data';

const medalColors = ['bg-amber-500', 'bg-slate-400', 'bg-orange-500'];

export default function MembersPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Członkowie</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Poznaj ludzi, którzy tworzą tę społeczność</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Icon 
              icon="solar:magnifer-linear" 
              width={16} 
              height={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input 
              type="text" 
              placeholder="Szukaj członków..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
            />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-6 transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon icon="solar:cup-star-bold" width={20} height={20} className="text-amber-500" />
              Ranking aktywności
            </h2>
            <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Zobacz pełny ranking
            </a>
          </div>

          <div className="space-y-3">
            {mockMembers.slice(0, 3).map((member, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-4 p-3 rounded-xl ${
                  idx === 0 
                    ? 'bg-amber-50 dark:bg-amber-500/10'
                    : idx === 1
                    ? 'bg-gray-50 dark:bg-white/5'
                    : 'bg-orange-50 dark:bg-orange-500/10'
                }`}
              >
                <span className={`w-7 h-7 rounded-full ${medalColors[idx]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                  {idx + 1}
                </span>
                <img 
                  src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  className="w-10 h-10 rounded-full shrink-0" 
                  alt="" 
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.posts} postów · {member.comments} komentarzy</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${
                    idx === 0 ? 'text-amber-600 dark:text-amber-400'
                    : idx === 1 ? 'text-slate-600 dark:text-slate-300'
                    : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {member.points} pkt
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Icon icon="solar:fire-bold" width={10} height={10} className="text-orange-500" />
                    {member.streak} dni streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMembers.map((member, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <img 
                  src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  className="w-14 h-14 rounded-full mb-3" 
                  alt="" 
                />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{member.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{member.role || 'Członek'}</p>
                <div className="flex items-center gap-3 mt-4 w-full">
                  <button className="flex-1 h-8 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                    Przeglądaj
                  </button>
                  <button className="flex-1 h-8 bg-gray-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    Wiadomość
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
