"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Icon } from "@iconify/react"
import { Bell, Search, Settings, LogOut } from "lucide-react"
import { Button } from "@hubso/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@hubso/ui"
import Link from "next/link"

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  if (!mounted) setMounted(true)

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
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80" />
                  <AvatarFallback>JK</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile/me" className="cursor-pointer">
                  <span className="mr-2">👤</span>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    // TODO: Implement logout
                    console.log("Logging out...")
                  }}
                  className="w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
