"use client"

import { useState, useMemo } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@hubso/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSpaceGroups } from "@/lib/hooks/useSpaces"

const SPACE_TYPE_ICON: Record<string, string> = {
  POSTS: "solar:document-text-linear",
  CHAT: "solar:chat-round-line-linear",
  EVENTS: "solar:calendar-linear",
  LINKS: "solar:link-linear",
  FILES: "solar:folder-linear",
}

const sidebarItems = [
  {
    title: "Osobisty",
    items: [
      { icon: "solar:user-circle-linear", label: "Profil", href: "/profile" },
      { icon: "solar:chart-square-linear", label: "Oś czasu", href: "/feed" },
      { icon: "solar:chat-line-linear", label: "Skrzynka", href: "/messages", badge: 3 },
    ],
  },
  {
    title: "Wspólnota",
    items: [
      { icon: "solar:planet-linear", label: "Społeczności", href: "/communities" },
      { icon: "solar:users-group-rounded-linear", label: "Grupy", href: "/groups" },
      { icon: "solar:people-nearby-linear", label: "Połączenia", href: "/members" },
      { icon: "solar:chat-round-dots-linear", label: "Dyskusje", href: "/forums" },
      { icon: "solar:document-text-linear", label: "Kursy", href: "/courses" },
      { icon: "solar:calendar-linear", label: "Wydarzenia", href: "/events" },
      { icon: "solar:cup-star-linear", label: "Ranking", href: "/leaderboard" },
    ],
  },
  {
    title: "Multimedia",
    items: [
      { icon: "solar:gallery-linear", label: "Zdjęcia", href: "/photos" },
      { icon: "solar:file-text-linear", label: "Dokumenty", href: "/documents" },
    ],
  },
  {
    title: "Sklep",
    items: [
      { icon: "solar:shop-linear", label: "Sklep", href: "/shop" },
    ],
  },
]

function parseCommunitySlug(pathname: string | null): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/communities\/([^/]+)/)
  return match ? match[1] ?? null : null
}

function CommunitySpacesNav({ slug }: { slug: string }) {
  const { data: spaceGroupsData, isLoading } = useSpaceGroups(slug)
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (id: string) =>
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (isLoading) {
    return (
      <div className="space-y-2 px-3">
        {[1, 2].map(i => (
          <div key={i} className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  const groups = spaceGroupsData?.groups ?? []
  const ungrouped = spaceGroupsData?.ungroupedSpaces ?? []

  if (groups.length === 0 && ungrouped.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between px-3 mb-2">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Przestrzenie
        </h3>
        <Link
          href={`/communities/${slug}`}
          className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          Wszystkie
        </Link>
      </div>

      <nav className="space-y-1">
        {groups.map(group => (
          <div key={group.id}>
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-1.5 px-3 py-1 w-full text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={10}
                className={`transition-transform ${collapsedGroups.has(group.id) ? "-rotate-90" : ""}`}
              />
              {group.name}
            </button>
            {!collapsedGroups.has(group.id) && (
              <div className="space-y-0.5 mt-0.5">
                {group.spaces.map(space => {
                  const isActive = pathname === `/spaces/${space.id}`
                  return (
                    <Link
                      key={space.id}
                      href={`/spaces/${space.id}`}
                      className={`flex items-center gap-2 px-3 py-2 ml-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon icon={SPACE_TYPE_ICON[space.type] || "solar:document-text-linear"} width={15} className="shrink-0" />
                      <span className="truncate flex-1">{space.name}</span>
                      {space.memberCount > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{space.memberCount}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {ungrouped.map(space => {
          const isActive = pathname === `/spaces/${space.id}`
          return (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon icon={SPACE_TYPE_ICON[space.type] || "solar:document-text-linear"} width={15} className="shrink-0" />
              <span className="truncate flex-1">{space.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const communitySlug = parseCommunitySlug(pathname)

  return (
    <aside className="hidden xl:flex w-[260px] flex-col border-r border-slate-200 bg-white dark:border-dark-border dark:bg-dark-surface h-full overflow-y-auto shrink-0">
      <div className="flex-1 py-4 px-3 space-y-6">
        {/* Community Spaces navigation (contextual) */}
        {communitySlug && <CommunitySpacesNav slug={communitySlug} />}

        {sidebarItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
              {section.title}
            </h3>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon icon={item.icon} width={18} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom: Ustawienia */}
      <div className="border-t border-slate-100 dark:border-dark-border px-3 py-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/settings"
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
          }`}
        >
          <Icon icon="solar:settings-linear" width={18} className="shrink-0" />
          <span>Ustawienia konta</span>
        </Link>
      </div>
    </aside>
  )
}
