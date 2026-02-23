import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { authApi, usersApi, ApiError, type MeResponse } from "@/lib/api"
import { tokenStore } from "@/lib/auth"

interface AuthState {
  user: MeResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: MeResponse | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) =>
      set({ user, isAuthenticated: user !== null }),

    setLoading: (isLoading) => set({ isLoading }),

    login: async (email, password) => {
      set({ isLoading: true, error: null })
      try {
        const result = await authApi.login({ email, password })
        tokenStore.setTokens(result.accessToken, result.refreshToken)
        set({
          accessToken: result.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        // Pobierz profil użytkownika w tle po zalogowaniu
        usersApi.me().then((user) => set({ user })).catch(() => {/* cicho ignoruj */})
      } catch (err) {
        const msg = err instanceof ApiError
          ? (err.status === 401 ? 'Nieprawidłowy email lub hasło.' : err.message)
          : 'Błąd połączenia z serwerem.'
        set({ isLoading: false, error: msg })
        throw err
      }
    },

    register: async (email, password, displayName) => {
      set({ isLoading: true, error: null })
      try {
        await authApi.register({ email, password, displayName })
        // Auto-login after register
        await get().login(email, password)
      } catch (err) {
        const msg = err instanceof ApiError
          ? (err.status === 409 ? 'Ten email jest już zajęty.' : err.message)
          : 'Błąd połączenia z serwerem.'
        set({ isLoading: false, error: msg })
        throw err
      }
    },

    logout: () => {
      tokenStore.clear()
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      })
    },

    /** Hydratuje stan z localStorage przy starcie aplikacji i pobiera profil */
    hydrate: async () => {
      const token = tokenStore.getAccessToken()
      if (token) {
        set({ accessToken: token, isAuthenticated: true })
        // Pobierz aktualny profil z API
        try {
          const user = await usersApi.me()
          set({ user })
        } catch {
          // Token może być nieważny — wyczyść
          tokenStore.clear()
          set({ accessToken: null, isAuthenticated: false, user: null })
        }
      }
    },
  }))
)
