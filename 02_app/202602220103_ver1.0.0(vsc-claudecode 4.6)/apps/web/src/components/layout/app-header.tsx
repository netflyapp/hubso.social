"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Bell, Search, Settings, LogOut, User } from "lucide-react"
import { Button } from "@hubso/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@hubso/ui"
import Link from "next/link"
import { useAuthStore } from "@/stores/useAuthStore"

/** Zwraca inicjały z displayName lub username */
function getInitials(displayName: string | null, username: string): string {
  const name = displayName ?? username
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // Prevent hydration mismatch
  if (!mounted) setMounted(true)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    { icon: "solar:home-2-linear", label: "Home", href: "/" },
    { icon: "solar:bell-linear", label: "Notifications", href: "/notifications" },
    { icon: "solar:chat-line-linear", label: "Messages", href: "/messages" },
    { icon: "solar:users-group-rounded-linear", label: "Members", href: "/members" },
    { icon: "solar:bookmark-linear", label: "Saved", href: "/saved" },
    { icon: "solar:calendar-linear", label: "Events", href: "/events" },
    { icon: "solar:document-linear", label: "Courses", href: "/courses" },
    { icon: "solar:shop-linear", label: "Shop", href: "/shop" },
    { icon: "solar:video-linear", label: "Videos", href: "/videos" },
    { icon: "solar:settings-linear", label: "Settings", href: "/settings" },
  ]

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <Icon icon="solar:rocket-2-linear" width={24} />
          <span className="hidden sm:inline">Hubso</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-2 text-slate-600 hover:text-indigo-600 text-slate-400 dark:hover:text-indigo-400 transition-colors"
              title={item.label}
            >
              <Icon icon={item.icon} width={20} />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-border">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </Button>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <Icon
                icon={theme === "dark" ? "solar:sun-linear" : "solar:moon-linear"}
                width={20}
              />
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" title={user?.displayName ?? user?.username ?? 'User'}>
                <Avatar className="h-8 w-8">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.displayName ?? user.username} />
                  )}
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold">
                    {user
                      ? getInitials(user.displayName, user.username)
                      : <User className="w-4 h-4" />
                    }
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {/* User info */}
              {user && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user.displayName ?? user.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/profile/me" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
