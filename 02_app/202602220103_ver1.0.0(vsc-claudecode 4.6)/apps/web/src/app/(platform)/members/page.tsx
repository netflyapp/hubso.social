'use client';

export const dynamic = 'force-dynamic'

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { usersApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';

const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=128&name=';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['members', page, debouncedSearch],
    queryFn: () => usersApi.list({ page, limit: 18, search: debouncedSearch || undefined }),
  });

  const members = data?.users ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Członkowie</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {total > 0 ? `${total} członków w społeczności` : 'Poznaj ludzi, którzy tworzą tę społeczność'}
            </p>
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
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Szukaj członków..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 mb-3" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-12 text-center">
            <Icon icon="solar:danger-triangle-linear" width={40} height={40} className="mx-auto mb-3 text-red-400" />
            <p className="font-medium text-slate-700 dark:text-slate-300">Nie udało się załadować członków</p>
            <p className="text-sm text-slate-400 mt-1">Sprawdź połączenie i spróbuj ponownie</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && members.length === 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-12 text-center">
            <Icon icon="solar:users-group-rounded-linear" width={40} height={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {debouncedSearch ? 'Brak wyników wyszukiwania' : 'Brak członków'}
            </p>
          </div>
        )}

        {/* Members Grid */}
        {!isLoading && !isError && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const name = member.displayName ?? member.username;
              const avatar = member.avatarUrl ?? `${PLACEHOLDER_AVATAR}${encodeURIComponent(name)}`;
              return (
                <div 
                  key={member.id}
                  className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors hover:shadow-lg"
                >
                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={avatar} 
                      className="w-14 h-14 rounded-full mb-3 object-cover" 
                      alt={name} 
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{member.role === 'ADMIN' ? 'Admin' : member.role === 'MODERATOR' ? 'Moderator' : 'Członek'}</p>
                    {member.bio && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{member.bio}</p>
                    )}
                    <div className="flex items-center gap-3 mt-4 w-full">
                      <Link
                        href={`/profile/${member.id}`}
                        className="flex-1 h-8 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center"
                      >
                        Profil
                      </Link>
                      <Link
                        href={`/messages?to=${member.id}`}
                        className="flex-1 h-8 bg-gray-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                      >
                        Wiadomość
                      </Link>
                    </div>
                  </div>
                </div>
              );
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
                <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-lg border border-slate-200 dark:border-dark-border disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
              >
                <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
