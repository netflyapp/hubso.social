"use client"

import { Icon } from "@iconify/react"
import { Button } from "@hubso/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: "solar:home-2-linear", label: "Home", href: "/" },
  { icon: "solar:chart-square-linear", label: "Feed", href: "/feed" },
  { icon: "solar:users-group-rounded-linear", label: "Groups", href: "/groups" },
  { icon: "solar:chat-line-linear", label: "Chat", href: "/messages" },
  { icon: "solar:user-linear", label: "Profile", href: "/profile" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex xl:hidden items-center justify-around h-16 border-t border-slate-200 bg-white dark:border-dark-border dark:bg-dark-surface md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
            title={item.label}
          >
            <Icon icon={item.icon} width={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
