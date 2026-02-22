import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface UIState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  mobileBottomNavOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setMobileBottomNavOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    // State
    sidebarOpen: true,
    mobileSidebarOpen: false,
    mobileBottomNavOpen: true,

    // Actions
    toggleSidebar: () =>
      set((state) => ({
        sidebarOpen: !state.sidebarOpen,
      })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    setMobileBottomNavOpen: (open) => set({ mobileBottomNavOpen: open }),
  }))
)
