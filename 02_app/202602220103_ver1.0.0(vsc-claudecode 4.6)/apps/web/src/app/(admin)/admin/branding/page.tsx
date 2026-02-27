'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { communitiesApi, adminApi } from '@/lib/api'
import { Palette, Type, Image, Loader2, Check, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface CommunityOption {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  brandColor: string | null
  brandFont: string | null
  coverUrl: string | null
  description: string | null
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (domyślny)' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Poppins', label: 'Poppins' },
]

const COLOR_PRESETS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#1e293b', // slate
]

export default function BrandingPage() {
  const [communities, setCommunities] = useState<CommunityOption[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Branding form fields
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [brandFont, setBrandFont] = useState('Inter')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [description, setDescription] = useState('')

  // Fetch communities list
  useEffect(() => {
    communitiesApi
      .list()
      .then((list) => {
        setCommunities(list as CommunityOption[])
        if (list.length > 0 && list[0]) {
          setSelectedSlug(list[0].slug)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Load branding for selected community
  useEffect(() => {
    if (!selectedSlug) return
    const c = communities.find((c) => c.slug === selectedSlug)
    if (c) {
      setBrandColor(c.brandColor || '#6366f1')
      setBrandFont(c.brandFont || 'Inter')
      setLogoUrl(c.logoUrl || '')
      setCoverUrl(c.coverUrl || '')
      setDescription(c.description || '')
    }
  }, [selectedSlug, communities])

  const handleSave = async () => {
    if (!selectedSlug) return
    setSaving(true)
    try {
      await adminApi.updateBranding(selectedSlug, {
        brandColor,
        brandFont,
        logoUrl: logoUrl || undefined,
        coverUrl: coverUrl || undefined,
        description: description || undefined,
      })
      // Update local state
      setCommunities((prev) =>
        prev.map((c) =>
          c.slug === selectedSlug
            ? { ...c, brandColor, brandFont, logoUrl, coverUrl, description }
            : c,
        ),
      )
      toast.success('Branding zaktualizowany!')
    } catch (err) {
      toast.error('Nie udało się zapisać zmian')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <Globe className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Brak społeczności
        </h2>
        <p className="text-sm text-slate-400">
          Stwórz społeczność, aby skonfigurować branding.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Branding
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dostosuj wygląd i branding wybranej społeczności
        </p>
      </div>

      {/* Community selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Społeczność
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {communities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preview card */}
      <div
        className="rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden"
        style={{ fontFamily: brandFont }}
      >
        {/* Cover */}
        <div
          className="h-32 relative"
          style={{
            background: coverUrl
              ? `url(${coverUrl}) center/cover`
              : `linear-gradient(135deg, ${brandColor}, ${brandColor}88)`,
          }}
        >
          {/* Logo */}
          <div className="absolute -bottom-6 left-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-14 h-14 rounded-xl border-2 border-white dark:border-dark-surface object-cover shadow-sm"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl border-2 border-white dark:border-dark-surface flex items-center justify-center shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                <span className="text-white font-bold text-lg">
                  {communities.find((c) => c.slug === selectedSlug)?.name[0] ?? 'H'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-10 px-6 pb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {communities.find((c) => c.slug === selectedSlug)?.name ?? 'Społeczność'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description || 'Opis społeczności...'}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="px-4 py-1.5 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: brandColor }}
            >
              Dołącz
            </button>
            <button
              className="px-4 py-1.5 rounded-md text-sm font-medium border"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              Więcej
            </button>
          </div>
        </div>
      </div>

      {/* Branding form */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Brand Color */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Kolor akcentu
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setBrandColor(color)}
                className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: color,
                  borderColor: brandColor === color ? '#fff' : 'transparent',
                  boxShadow: brandColor === color ? `0 0 0 2px ${color}` : 'none',
                }}
              >
                {brandColor === color && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-8 h-8 rounded border border-slate-200 dark:border-dark-border cursor-pointer"
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#6366f1"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Brand Font */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Czcionka
            </label>
          </div>
          <select
            value={brandFont}
            onChange={(e) => setBrandFont(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p
            className="text-sm text-slate-500 dark:text-slate-400"
            style={{ fontFamily: brandFont }}
          >
            Przykładowy tekst w wybranej czcionce:
            <br />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Witaj w Hubso.social!
            </span>
          </p>
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Logo URL
            </label>
          </div>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Cover URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover URL
            </label>
          </div>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Opis społeczności
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Krótki opis Twojej społeczności…"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {saving ? 'Zapisywanie…' : 'Zapisz branding'}
        </button>
      </div>
    </div>
  )
}
