'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { Users, FileText, Flag, Globe } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stats {
  totalUsers: number
  activeUsers: number
  newUsersThisWeek: number
  totalCommunities: number
  newCommunitiesThisMonth: number
  totalPosts: number
  newPostsThisWeek: number
  flaggedPosts: number
  postsActivity: { date: string; posts: number }[]
  userGrowth: { date: string; users: number }[]
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 bg-white dark:bg-dark-surface ${
        accent
          ? 'border-red-200 dark:border-red-900'
          : 'border-slate-200 dark:border-dark-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
          )}
        </div>
        <div
          className={`p-2 rounded-lg ${
            accent
              ? 'bg-red-50 dark:bg-red-950 text-red-500'
              : 'bg-slate-100 dark:bg-dark-hover text-slate-500 dark:text-slate-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-dark-hover rounded-lg" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-dark-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Panel administracyjny
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Przegląd aktywności platformy
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Użytkownicy"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsersThisWeek} ten tydzień`}
          icon={Users}
        />
        <StatCard
          label="Posty"
          value={stats.totalPosts.toLocaleString()}
          sub={`+${stats.newPostsThisWeek} ten tydzień`}
          icon={FileText}
        />
        <StatCard
          label="Społeczności"
          value={stats.totalCommunities}
          sub={`+${stats.newCommunitiesThisMonth} ten miesiąc`}
          icon={Globe}
        />
        <StatCard
          label="Posty flagowane"
          value={stats.flaggedPosts}
          sub="wymaga moderacji"
          icon={Flag}
          accent={stats.flaggedPosts > 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Posts activity (7d bar chart) */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Aktywność postów (7 dni)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.postsActivity} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="posts" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User growth (30d line chart) */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Wzrost użytkowników (30 dni)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
