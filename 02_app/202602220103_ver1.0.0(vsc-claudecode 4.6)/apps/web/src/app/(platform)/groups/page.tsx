'use client';

export const dynamic = 'force-dynamic'

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi, type GroupItem, communitiesApi } from '@/lib/api';

const GROUP_GRADIENTS = [
  'from-indigo-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-red-400 to-rose-600',
  'from-lime-400 to-emerald-600',
] as const;

const GROUP_ICONS = ['🚀', '🎨', '💡', '🎓', '🏆', '📱', '🌍', '⚡'] as const;

function CreateGroupDialog({ communityId, onClose }: { communityId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'HIDDEN'>('PUBLIC');

  const createMutation = useMutation({
    mutationFn: () =>
      groupsApi.create({ communityId, name: name.trim(), description: description.trim() || undefined, visibility }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', communityId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border dark:border-dark-border w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Utwórz grupę</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Icon icon="solar:close-circle-linear" width={22} height={22} className="text-slate-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nazwa grupy *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Frontend Masters"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" maxLength={80} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Opis</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Krótki opis grupy..." rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" maxLength={500} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Widoczność</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PUBLIC', 'PRIVATE', 'HIDDEN'] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${visibility === v ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                  {v === 'PUBLIC' ? '🌐 Publiczna' : v === 'PRIVATE' ? '🔒 Prywatna' : '👁 Ukryta'}
                </button>
              ))}
            </div>
          </div>
        </div>
        {createMutation.error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{(createMutation.error as Error).message}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
          <button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}
            className="flex-1 h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {createMutation.isPending ? 'Tworzenie...' : 'Utwórz grupę'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, idx, onJoin }: { group: GroupItem; idx: number; onJoin: () => void }) {
  const queryClient = useQueryClient();
  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(group.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border hover:shadow-lg transition-all group">
      <div className="relative h-32 overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${GROUP_GRADIENTS[idx % 8]}`} />
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">
          {group.visibility === 'PUBLIC' ? '🌐 Publiczna' : group.visibility === 'PRIVATE' ? '🔒 Prywatna' : '👁 Ukryta'}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${GROUP_GRADIENTS[idx % 8]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
            {GROUP_ICONS[idx % 8]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{group.name}</h3>
            {group.memberRole && <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium rounded">{group.memberRole}</span>}
          </div>
        </div>
        {group.description && <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{group.description}</p>}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
          <Icon icon="solar:users-group-rounded-linear" width={16} height={16} className="text-slate-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400"><span className="font-semibold">{group.memberCount}</span> członków</span>
        </div>
        <button onClick={group.isJoined ? () => leaveMutation.mutate() : onJoin} disabled={leaveMutation.isPending}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${group.isJoined ? 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {leaveMutation.isPending ? '...' : group.isJoined ? 'Opuść grupę' : 'Dołącz'}
        </button>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const communitiesQuery = useQuery({
    queryKey: ['communities'],
    queryFn: () => communitiesApi.list(),
    staleTime: 60_000,
  });

  const communityId = communitiesQuery.data?.[0]?.id ?? '';

  const groupsQuery = useQuery({
    queryKey: ['groups', communityId],
    queryFn: () => groupsApi.list(communityId),
    enabled: !!communityId,
    staleTime: 30_000,
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => groupsApi.join(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['groups', communityId] }),
  });

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: 'solar:box-linear' },
    { id: 'joined', label: 'Moje', icon: 'solar:bookmark-linear' },
  ];

  const groups = groupsQuery.data ?? [];
  const filtered = groups.filter((g) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || (selectedCategory === 'joined' && g.isJoined);
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      {showCreate && communityId && (
        <CreateGroupDialog communityId={communityId} onClose={() => setShowCreate(false)} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grupy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Odkrywaj i dołączaj do grup o Twoich zainteresowaniach
          </p>
        </div>

        {/* Search + Create */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="relative">
            <Icon icon="solar:search-linear" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj grup..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
          </div>
          <button onClick={() => setShowCreate(true)} disabled={!communityId}
            className="h-10 px-4 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Icon icon="solar:plus-bold" width={18} height={18} />
            Utwórz grupę
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}>
              <Icon icon={cat.icon} width={16} height={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {groupsQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden animate-pulse">
                <div className="h-32 bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Groups Grid */}
        {!groupsQuery.isLoading && !groupsQuery.isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((group, idx) => (
              <GroupCard key={group.id} group={group} idx={idx} onJoin={() => joinMutation.mutate(group.id)} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!groupsQuery.isLoading && !groupsQuery.isError && filtered.length === 0 && (
          <div className="text-center py-12">
            <Icon icon="solar:inbox-linear" width={48} height={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {!communityId ? 'Dołącz do społeczności' : 'Brak grup'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {!communityId ? 'Zanim zobaczysz grupy, dołącz do społeczności' : search ? 'Brak wyników' : 'Bądź pierwszy — utwórz grupę!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
