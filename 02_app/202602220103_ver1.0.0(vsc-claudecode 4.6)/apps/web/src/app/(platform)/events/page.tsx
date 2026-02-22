'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { mockEvents } from '@/lib/mock-data';

const MONTHS_PL = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
function getDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return { month: MONTHS_PL[d.getMonth()] ?? '---', day: d.getDate() };
}
function getEventType(e: { locationType: string; category: string }) {
  if (e.locationType === 'VIRTUAL') return 'Online';
  if (e.locationType === 'IN_PERSON') return 'Stacjonarne';
  return 'Hybrydowe';
}

const eventGradients = [
  'from-red-500 to-rose-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-indigo-500 to-violet-600',
  'from-purple-500 to-fuchsia-600',
  'from-sky-500 to-blue-600',
];

const eventStatusColors = [
  { bg: 'bg-red-100', text: 'text-red-700', dark: 'dark:text-red-300', darkBg: 'dark:bg-red-500/20' },
  { bg: 'bg-rose-100', text: 'text-rose-700', dark: 'dark:text-rose-300', darkBg: 'dark:bg-rose-500/20' },
  { bg: 'bg-teal-100', text: 'text-teal-700', dark: 'dark:text-teal-300', darkBg: 'dark:bg-teal-500/20' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', dark: 'dark:text-indigo-300', darkBg: 'dark:bg-indigo-500/20' },
  { bg: 'bg-purple-100', text: 'text-purple-700', dark: 'dark:text-purple-300', darkBg: 'dark:bg-purple-500/20' },
  { bg: 'bg-sky-100', text: 'text-sky-700', dark: 'dark:text-sky-300', darkBg: 'dark:bg-sky-500/20' },
];

const eventButtonColors = [
  'bg-red-600 hover:bg-red-700',
  'bg-rose-600 hover:bg-rose-700',
  'bg-teal-600 hover:bg-teal-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-sky-600 hover:bg-sky-700',
];

export default function EventsPage() {
  // Initialize from mock data (events where isAttending === true → their index)
  const [attendingSet, setAttendingSet] = useState<Set<number>>(
    () => new Set(mockEvents.map((e, i) => (e.isAttending ? i : -1)).filter((i) => i >= 0))
  );

  function toggleRSVP(idx: number) {
    setAttendingSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Events List */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">wydarzenia</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Spotkania, webinary i wyzwania społeczności</p>
              </div>
              <button className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Utwórz wydarzenie
              </button>
            </div>

            {mockEvents.map((event, idx) => {
              const sc = eventStatusColors[idx % 6]!;
              const bg = eventGradients[idx % 6]!;
              const btnColor = eventButtonColors[idx % 6]!;
              return (
              <div 
                key={idx}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border overflow-hidden transition-colors hover:shadow-lg"
              >
                <div className="flex">
                  <div className={`w-20 sm:w-24 bg-gradient-to-b ${bg} flex flex-col items-center justify-center text-white shrink-0 py-4`}>
                    <span className="text-xs font-semibold uppercase">{getDateParts(event.date).month}</span>
                    <span className="text-3xl font-extrabold leading-none mt-1">{getDateParts(event.date).day}</span>
                    <span className="text-[10px] mt-1 opacity-80">{event.time}</span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 ${sc.bg} ${sc.darkBg} ${sc.text} ${sc.dark} text-[10px] font-bold rounded-full flex items-center gap-1`}>
                        {idx === 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                        <span>{getEventType(event)}</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <img 
                            key={i}
                            src={`https://images.unsplash.com/photo-${1494790108377 + i}?w=30&h=30&fit=crop`} 
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-surface" 
                            alt="" 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{event.attendees} uczestników</span>
                      <button
                        onClick={() => toggleRSVP(idx)}
                        className={`ml-auto h-7 px-3 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                          attendingSet.has(idx)
                            ? 'bg-slate-500 hover:bg-slate-600'
                            : btnColor
                        }`}
                      >
                        <Icon icon={attendingSet.has(idx) ? 'solar:close-circle-linear' : 'solar:play-bold'} width={12} height={12} />
                        {attendingSet.has(idx) ? 'Wypisz się' : 'Dołącz'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Host Card */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Organizator</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Icon icon="solar:users-group-rounded-bold" width={24} height={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Nazwa Społeczności</div>
                  <div className="text-xs text-slate-400">Zespół organizacyjny</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Organizujemy regularne spotkania, webinary i wyzwania, żeby nasza społeczność stale rosła i się rozwijała.
              </p>
            </div>

            {/* Mini Calendar */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Kalendarz</h3>
              <div className="space-y-3">
                {mockEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${['bg-red-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-purple-500', 'bg-sky-500'][idx % 6]}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{event.title}</div>
                      <div className="text-[10px] text-slate-400">{getDateParts(event.date).month} {getDateParts(event.date).day} · {event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:info-circle-bold" width={16} height={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Strefy czasowe</span>
              </div>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                Wszystkie godziny podane w czasie polskim (CET/CEST). Nagrania dostępne po wydarzeniu w sekcji Dokumenty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
