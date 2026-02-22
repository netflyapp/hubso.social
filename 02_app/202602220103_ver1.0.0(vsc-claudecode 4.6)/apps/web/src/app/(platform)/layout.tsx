import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F7F8FA] dark:bg-dark-bg transition-colors duration-300">
      {/* Header — zawsze na górze */}
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop (xl+) */}
        <AppSidebar />

        {/* Główna treść */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobilna nawigacja */}
      <MobileSidebar />
      <MobileBottomNav />
    </div>
  )
}
