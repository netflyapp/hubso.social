"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@hubso/ui"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: "solar:home-2-linear", label: "Home", href: "/" },
  { icon: "solar:chart-square-linear", label: "Timeline", href: "/feed" },
  { icon: "solar:users-group-rounded-linear", label: "Groups", href: "/groups" },
  { icon: "solar:chat-line-linear", label: "Messages", href: "/messages" },
  { icon: "solar:user-linear", label: "Profile", href: "/profile" },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 text-slate-600 dark:text-slate-400"
          title="Menu"
        >
          <Icon icon="solar:menu-dots-linear" width={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px]">
        <nav className="space-y-2 mt-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon icon={item.icon} width={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
