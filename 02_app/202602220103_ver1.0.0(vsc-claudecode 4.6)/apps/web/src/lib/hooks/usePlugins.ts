'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  pluginsApi,
  type PluginItem,
  type InstalledPluginItem,
  type PaginatedPluginsResponse,
  type MarketplaceStats,
} from '@/lib/api'

// ==================== Query Keys ====================

export const pluginKeys = {
  all: ['plugins'] as const,
  marketplace: (params?: Record<string, unknown>) =>
    [...pluginKeys.all, 'marketplace', params ?? {}] as const,
  plugin: (pluginId: string) =>
    [...pluginKeys.all, 'detail', pluginId] as const,
  stats: () =>
    [...pluginKeys.all, 'stats'] as const,
  installed: (communitySlug: string) =>
    [...pluginKeys.all, 'installed', communitySlug] as const,
  installedPlugin: (communitySlug: string, pluginId: string) =>
    [...pluginKeys.all, 'installed', communitySlug, pluginId] as const,
  settings: (communitySlug: string, pluginId: string) =>
    [...pluginKeys.all, 'settings', communitySlug, pluginId] as const,
  hooks: (communitySlug: string, pluginId: string) =>
    [...pluginKeys.all, 'hooks', communitySlug, pluginId] as const,
}

// ==================== Marketplace Hooks ====================

export function useMarketplacePlugins(params?: {
  search?: string
  category?: string
  pricing?: string
  official?: boolean
  featured?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}) {
  return useQuery<PaginatedPluginsResponse>({
    queryKey: pluginKeys.marketplace(params as Record<string, unknown>),
    queryFn: () => pluginsApi.listPlugins(params),
  })
}

export function usePlugin(pluginId: string) {
  return useQuery<PluginItem>({
    queryKey: pluginKeys.plugin(pluginId),
    queryFn: () => pluginsApi.getPlugin(pluginId),
    enabled: !!pluginId,
  })
}

export function useMarketplaceStats() {
  return useQuery<MarketplaceStats>({
    queryKey: pluginKeys.stats(),
    queryFn: () => pluginsApi.getMarketplaceStats(),
  })
}

// ==================== Installed Plugins Hooks ====================

export function useInstalledPlugins(communitySlug: string) {
  return useQuery<InstalledPluginItem[]>({
    queryKey: pluginKeys.installed(communitySlug),
    queryFn: () => pluginsApi.getInstalledPlugins(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useInstalledPlugin(communitySlug: string, pluginId: string) {
  return useQuery<InstalledPluginItem>({
    queryKey: pluginKeys.installedPlugin(communitySlug, pluginId),
    queryFn: () => pluginsApi.getInstalledPlugin(communitySlug, pluginId),
    enabled: !!communitySlug && !!pluginId,
  })
}

// ==================== Mutation Hooks ====================

export function useInstallPlugin(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pluginId: string) =>
      pluginsApi.installPlugin(communitySlug, pluginId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.installed(communitySlug) })
      qc.invalidateQueries({ queryKey: pluginKeys.marketplace() })
      toast.success('Wtyczka zainstalowana')
    },
    onError: () => toast.error('Nie udało się zainstalować wtyczki'),
  })
}

export function useUninstallPlugin(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pluginId: string) =>
      pluginsApi.uninstallPlugin(communitySlug, pluginId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.installed(communitySlug) })
      qc.invalidateQueries({ queryKey: pluginKeys.marketplace() })
      toast.success('Wtyczka odinstalowana')
    },
    onError: () => toast.error('Nie udało się odinstalować wtyczki'),
  })
}

export function useTogglePluginStatus(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pluginId, status }: { pluginId: string; status: string }) =>
      pluginsApi.togglePluginStatus(communitySlug, pluginId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.installed(communitySlug) })
      toast.success('Status wtyczki zmieniony')
    },
    onError: () => toast.error('Nie udało się zmienić statusu wtyczki'),
  })
}

export function useUpdatePluginConfig(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pluginId, config }: { pluginId: string; config: Record<string, unknown> }) =>
      pluginsApi.updatePluginConfig(communitySlug, pluginId, config),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: pluginKeys.installedPlugin(communitySlug, vars.pluginId) })
      toast.success('Konfiguracja zapisana')
    },
    onError: () => toast.error('Nie udało się zapisać konfiguracji'),
  })
}

// ==================== Settings Hooks ====================

export function usePluginSettings(communitySlug: string, pluginId: string) {
  return useQuery<Record<string, unknown>>({
    queryKey: pluginKeys.settings(communitySlug, pluginId),
    queryFn: () => pluginsApi.getPluginSettings(communitySlug, pluginId),
    enabled: !!communitySlug && !!pluginId,
  })
}

export function useSetPluginSetting(communitySlug: string, pluginId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      pluginsApi.setPluginSetting(communitySlug, pluginId, key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.settings(communitySlug, pluginId) })
      toast.success('Ustawienie zapisane')
    },
    onError: () => toast.error('Nie udało się zapisać ustawienia'),
  })
}

export function useDeletePluginSetting(communitySlug: string, pluginId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (key: string) =>
      pluginsApi.deletePluginSetting(communitySlug, pluginId, key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.settings(communitySlug, pluginId) })
      toast.success('Ustawienie usunięte')
    },
    onError: () => toast.error('Nie udało się usunąć ustawienia'),
  })
}

// ==================== Admin Hooks ====================

export function useSeedOfficialPlugins() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => pluginsApi.seedOfficialPlugins(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.all })
      toast.success('Oficjalne wtyczki zainicjowane')
    },
    onError: () => toast.error('Nie udało się zainicjować wtyczek'),
  })
}

export function useRegisterPlugin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PluginItem>) => pluginsApi.registerPlugin(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.marketplace() })
      toast.success('Wtyczka zarejestrowana')
    },
    onError: () => toast.error('Nie udało się zarejestrować wtyczki'),
  })
}

export function useDeletePlugin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pluginId: string) => pluginsApi.deletePlugin(pluginId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pluginKeys.marketplace() })
      toast.success('Wtyczka usunięta')
    },
    onError: () => toast.error('Nie udało się usunąć wtyczki'),
  })
}
