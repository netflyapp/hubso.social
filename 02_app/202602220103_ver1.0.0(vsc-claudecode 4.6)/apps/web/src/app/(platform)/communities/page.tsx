'use client';

export const dynamic = 'force-dynamic'

import { Icon } from '@iconify/react';
import { useState, useEffect, useTransition } from 'react';
import { communitiesApi, CommunityItem } from '@/lib/api';

// ─── Plan badge colors ────────────────────────────────────────────────────────
const PLAN_COLOR: Record<string, string> = {
  STARTER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  GROWTH: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  SCALE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  ENTERPRISE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Community card ───────────────────────────────────────────────────────────
function CommunityCard({
  community,
  onToggle,
  loading,
}: {
  community: CommunityItem;
  onToggle: (community: CommunityItem) => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Cover + logo */}
      <div className="h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative flex-shrink-0">
        {community.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.logoUrl}
            alt={community.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        {/* Logo avatar */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white dark:bg-dark-surface border-2 border-white dark:border-dark-border shadow flex items-center justify-center overflow-hidden">
          {community.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={community.logoUrl}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {getInitials(community.name)}
            </span>
          )}
        </div>
        {/* Plan badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLOR[community.plan] ?? PLAN_COLOR.STARTER}`}>
          {community.plan}
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 px-4 pb-4 flex flex-col flex-1 gap-1">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
          {community.name}
        </h3>
        {community.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        )}

        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
          <Icon icon="solar:users-group-two-rounded-linear" width={14} height={14} />
          <span>{community.memberCount} członków</span>
        </div>

        {/* Join / Leave button */}
        <button
          onClick={() => onToggle(community)}
          disabled={loading}
          className={`mt-3 w-full h-9 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            community.isJoined
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Icon icon="solar:refresh-circle-linear" width={16} height={16} className="animate-spin" />
          ) : community.isJoined ? (
            <>
              <Icon icon="solar:check-circle-linear" width={16} height={16} />
              Dołączono
            </>
          ) : (
            <>
              <Icon icon="solar:add-circle-linear" width={16} height={16} />
              Dołącz
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Create Community Modal ───────────────────────────────────────────────────
function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (community: CommunityItem) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  // Auto-generate slug from name
  useEffect(() => {
    setSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50),
    );
  }, [name]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !slug.trim()) return;

    startTransition(async () => {
      try {
        const created = await communitiesApi.create({ name, slug, description: description || undefined });
        onCreate(created);
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Błąd tworzenia community';
        setError(msg);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Utwórz społeczność
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-border transition-colors"
          >
            <Icon icon="solar:close-circle-linear" width={20} height={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Nazwa *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Fotografia krajobrazowa"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Slug (URL) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                hubso.social/
              </span>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }
                className="w-full h-10 pl-28 pr-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                required
                pattern="[a-z0-9-]+"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Opis (opcjonalnie)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Krótki opis społeczności..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-dark-border transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={pending || !name || !slug}
              className="flex-1 h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {pending && (
                <Icon icon="solar:refresh-circle-linear" width={16} height={16} className="animate-spin" />
              )}
              Utwórz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden animate-pulse">
      <div className="h-20 bg-slate-200 dark:bg-slate-700" />
      <div className="pt-8 px-4 pb-4 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg mt-3" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'joined' | 'discover';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    communitiesApi
      .list()
      .then(setCommunities)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Błąd ładowania'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(c: CommunityItem) {
    if (loadingIds.has(c.id)) return;
    setLoadingIds((prev) => new Set(prev).add(c.id));
    try {
      if (c.isJoined) {
        await communitiesApi.leave(c.slug);
      } else {
        await communitiesApi.join(c.slug);
      }
      setCommunities((prev) =>
        prev.map((item) =>
          item.id === c.id
            ? {
                ...item,
                isJoined: !item.isJoined,
                memberCount: item.memberCount + (item.isJoined ? -1 : 1),
                memberRole: item.isJoined ? null : 'MEMBER',
              }
            : item,
        ),
      );
    } catch (e) {
      console.error('Toggle membership failed:', e);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(c.id);
        return next;
      });
    }
  }

  function handleCreated(created: CommunityItem) {
    setCommunities((prev) => [{ ...created, memberCount: 1, isJoined: true, memberRole: 'OWNER' }, ...prev]);
  }

  const filtered = communities.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'joined'
          ? c.isJoined
          : !c.isJoined;

    return matchSearch && matchFilter;
  });

  const tabs: { key: FilterKey; label: string; icon: string }[] = [
    { key: 'all', label: 'Wszystkie', icon: 'solar:box-linear' },
    { key: 'joined', label: 'Dołączone', icon: 'solar:check-circle-linear' },
    { key: 'discover', label: 'Odkryj', icon: 'solar:telescope-linear' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Społeczności
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Odkrywaj i dołączaj do społeczności o wspólnych zainteresowaniach
          </p>
        </div>

        {/* Search + Create */}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj społeczności..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="h-10 px-4 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="solar:add-circle-bold" width={18} height={18} />
            Utwórz społeczność
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-500/50'
              }`}
            >
              <Icon icon={tab.icon} width={16} height={16} />
              {tab.label}
              {tab.key === 'joined' && communities.filter((c) => c.isJoined).length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === 'joined' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'}`}>
                  {communities.filter((c) => c.isJoined).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <Icon icon="solar:danger-triangle-linear" width={20} height={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon
              icon="solar:planet-linear"
              width={48}
              height={48}
              className="text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400">
              {search ? 'Brak wyników' : 'Brak społeczności'}
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              {search
                ? 'Spróbuj innych słów kluczowych'
                : 'Bądź pierwszy i utwórz społeczność!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onToggle={handleToggle}
                loading={loadingIds.has(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreated} />
      )}
    </div>
  );
}
