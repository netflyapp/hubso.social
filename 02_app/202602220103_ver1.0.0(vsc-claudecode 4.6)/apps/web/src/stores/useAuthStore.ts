import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { CurrentUser, AuthToken } from "@hubso/shared"

interface AuthState {
  user: CurrentUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: CurrentUser | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set) => ({
    // State
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,

    // Actions
    setUser: (user) =>
      set({
        user,
        isAuthenticated: user !== null,
      }),

    setTokens: (accessToken, refreshToken) =>
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

    setLoading: (isLoading) => set({ isLoading }),

    logout: () =>
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
  }))
)
