'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import {
  Puzzle,
  Search,
  Download,
  Star,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
  RefreshCw,
  Package,
  Sparkles,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useMarketplacePlugins,
  useMarketplaceStats,
  useInstalledPlugins,
  useInstallPlugin,
  useUninstallPlugin,
  useTogglePluginStatus,
  useSeedOfficialPlugins,
} from '@/lib/hooks/usePlugins'
import { toast } from 'sonner'
import type { PluginItem, InstalledPluginItem } from '@/lib/api'

// ==================== Helpers ====================

const CATEGORY_LABELS: Record<string, string> = {
  LMS: 'Edukacja',
  E_COMMERCE: 'Sklep',
  CRM: 'CRM',
  BOOKING: 'Rezerwacje',
  SOCIAL: 'Social',
  ANALYTICS: 'Analityka',
  AI: 'AI',
  INTEGRATIONS: 'Integracje',
  GAMIFICATION: 'Grywalizacja',
  HEALTH: 'Zdrowie',
  CONTENT: 'Treści',
  COMMUNICATION: 'Komunikacja',
  OTHER: 'Inne',
}

const PRICING_LABELS: Record<string, string> = {
  FREE: 'Darmowy',
  PAID: 'Płatny',
  FREEMIUM: 'Freemium',
}

const PRICING_COLORS: Record<string, string> = {
  FREE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FREEMIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  ERROR: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  INSTALLING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  UPDATING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

// ==================== Plugin Card (Marketplace) ====================

function PluginCard({
  plugin,
  installed,
  onInstall,
  isInstalling,
}: {
  plugin: PluginItem
  installed: boolean
  onInstall: () => void
  isInstalling: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-hover flex items-center justify-center shrink-0">
          {plugin.icon ? (
            <span className="text-lg">{plugin.icon.includes(':') ? '🔌' : plugin.icon}</span>
          ) : (
            <Puzzle className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {plugin.name}
            </h3>
            {plugin.official && (
              <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            v{plugin.version} · {plugin.authorName}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
        {plugin.description || 'Brak opisu'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', PRICING_COLORS[plugin.pricing] || PRICING_COLORS.FREE)}>
          {PRICING_LABELS[plugin.pricing] || plugin.pricing}
          {plugin.pricing === 'PAID' && plugin.price ? ` · $${plugin.price}` : ''}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-dark-hover dark:text-slate-400">
          {CATEGORY_LABELS[plugin.category] || plugin.category}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" /> {plugin.downloads}
          </span>
          {plugin.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {plugin.rating.toFixed(1)}
            </span>
          )}
        </div>
        {installed ? (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Zainstalowany
          </span>
        ) : (
          <button
            onClick={onInstall}
            disabled={isInstalling}
            className="px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {isInstalling ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Zainstaluj'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ==================== Installed Plugin Row ====================

function InstalledPluginRow({
  installed,
  onToggle,
  onUninstall,
  isToggling,
  isUninstalling,
}: {
  installed: InstalledPluginItem
  onToggle: (status: string) => void
  onUninstall: () => void
  isToggling: boolean
  isUninstalling: boolean
}) {
  const isActive = installed.status === 'ACTIVE'

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-hover flex items-center justify-center shrink-0">
        {installed.plugin?.icon ? (
          <span className="text-lg">🔌</span>
        ) : (
          <Puzzle className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {installed.plugin?.name || installed.pluginId}
          </h3>
          {installed.plugin?.official && (
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          )}
          <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', STATUS_COLORS[installed.status] || STATUS_COLORS.INACTIVE)}>
            {installed.status}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          v{installed.version} · Zainstalowano {new Date(installed.createdAt).toLocaleDateString('pl-PL')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(isActive ? 'INACTIVE' : 'ACTIVE')}
          disabled={isToggling}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isActive
              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover',
          )}
          title={isActive ? 'Dezaktywuj' : 'Aktywuj'}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isActive ? (
            <ToggleRight className="w-5 h-5" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onUninstall}
          disabled={isUninstalling}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Odinstaluj"
        >
          {isUninstalling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

// ==================== Main Page ====================

type Tab = 'marketplace' | 'installed'

export default function AdminPluginsPage() {
  const [tab, setTab] = useState<Tab>('marketplace')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [pricingFilter, setPricingFilter] = useState('')

  // We need a communitySlug for installed plugins — use first community or a default
  // In real usage this would come from context. Using a simple approach:
  const communitySlug = 'default'

  // Queries
  const marketplaceQuery = useMarketplacePlugins({
    search: search || undefined,
    category: categoryFilter || undefined,
    pricing: pricingFilter || undefined,
    limit: 50,
  })
  const statsQuery = useMarketplaceStats()
  const installedQuery = useInstalledPlugins(communitySlug)

  // Mutations
  const installMutation = useInstallPlugin(communitySlug)
  const uninstallMutation = useUninstallPlugin(communitySlug)
  const toggleMutation = useTogglePluginStatus(communitySlug)
  const seedMutation = useSeedOfficialPlugins()

  // Installed plugin IDs for quick lookup
  const installedIds = new Set(
    (installedQuery.data ?? []).map((ip) => ip.pluginId),
  )

  const handleInstall = (pluginId: string) => {
    installMutation.mutate(pluginId, {
      onSuccess: () => toast.success('Wtyczka zainstalowana'),
      onError: () => toast.error('Nie udało się zainstalować wtyczki'),
    })
  }

  const handleUninstall = (pluginId: string) => {
    uninstallMutation.mutate(pluginId, {
      onSuccess: () => toast.success('Wtyczka odinstalowana'),
      onError: () => toast.error('Nie udało się odinstalować wtyczki'),
    })
  }

  const handleToggle = (pluginId: string, status: string) => {
    toggleMutation.mutate(
      { pluginId, status },
      {
        onSuccess: () => toast.success(status === 'ACTIVE' ? 'Wtyczka aktywowana' : 'Wtyczka dezaktywowana'),
        onError: () => toast.error('Nie udało się zmienić statusu'),
      },
    )
  }

  const handleSeed = () => {
    seedMutation.mutate(undefined, {
      onSuccess: (data) => toast.success(`Załadowano ${data.seeded} oficjalnych wtyczek`),
      onError: () => toast.error('Nie udało się załadować wtyczek'),
    })
  }

  const plugins = marketplaceQuery.data?.data ?? []
  const total = marketplaceQuery.data?.total ?? 0
  const stats = statsQuery.data
  const installed = installedQuery.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Puzzle className="w-6 h-6" />
            Wtyczki
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rozszerzaj funkcjonalność platformy za pomocą oficjalnych i społecznościowych wtyczek.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seedMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {seedMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Załaduj oficjalne
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Wszystkie</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Oficjalne</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.official}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Darmowe</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.free}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Zainstalowane</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{installed.length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-dark-hover rounded-lg w-fit mb-6">
        <button
          onClick={() => setTab('marketplace')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            tab === 'marketplace'
              ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400',
          )}
        >
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Marketplace ({total})
          </span>
        </button>
        <button
          onClick={() => setTab('installed')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            tab === 'installed'
              ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400',
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Zainstalowane ({installed.length})
          </span>
        </button>
      </div>

      {/* ==================== Marketplace Tab ==================== */}
      {tab === 'marketplace' && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj wtyczek..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none"
            >
              <option value="">Wszystkie kategorie</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none"
            >
              <option value="">Wszystkie ceny</option>
              {Object.entries(PRICING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Plugin Grid */}
          {marketplaceQuery.isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : plugins.length === 0 ? (
            <div className="text-center py-20">
              <Puzzle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {search || categoryFilter || pricingFilter
                  ? 'Nie znaleziono wtyczek spełniających kryteria.'
                  : 'Brak wtyczek w marketplace. Kliknij "Załaduj oficjalne" aby dodać.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plugins.map((plugin) => (
                <PluginCard
                  key={plugin.pluginId}
                  plugin={plugin}
                  installed={installedIds.has(plugin.pluginId)}
                  onInstall={() => handleInstall(plugin.pluginId)}
                  isInstalling={
                    installMutation.isPending &&
                    installMutation.variables === plugin.pluginId
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== Installed Tab ==================== */}
      {tab === 'installed' && (
        <>
          {installedQuery.isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : installed.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Brak zainstalowanych wtyczek. Przejdź do Marketplace aby dodać.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {installed.map((ip) => (
                <InstalledPluginRow
                  key={ip.id}
                  installed={ip}
                  onToggle={(status) => handleToggle(ip.pluginId, status)}
                  onUninstall={() => handleUninstall(ip.pluginId)}
                  isToggling={
                    toggleMutation.isPending &&
                    (toggleMutation.variables as { pluginId: string })?.pluginId === ip.pluginId
                  }
                  isUninstalling={
                    uninstallMutation.isPending &&
                    uninstallMutation.variables === ip.pluginId
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
