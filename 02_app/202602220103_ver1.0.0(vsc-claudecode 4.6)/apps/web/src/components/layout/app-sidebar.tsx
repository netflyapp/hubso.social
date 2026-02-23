"use client"

import { Icon } from "@iconify/react"
import { Button } from "@hubso/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden xl:flex w-[260px] flex-col border-r border-slate-200 bg-white dark:border-dark-border dark:bg-dark-surface h-full overflow-y-auto shrink-0">
      <div className="flex-1 py-4 px-3 space-y-6">
        {sidebarItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
              {section.title}
            </h3>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
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
