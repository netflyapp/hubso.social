const ACCESS_TOKEN_KEY = 'hubso_access_token'
const REFRESH_TOKEN_KEY = 'hubso_refresh_token'

/** Ustawia cookie (dla middleware) + localStorage (dla szybkiego odczytu) */
export const tokenStore = {
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return
    // Cookies — dostępne dla Next.js middleware po stronie serwera
    document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`
    document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    // localStorage — szybki dostęp po stronie klienta
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /** Aktualizuje tylko access token (po refresh) */
  setAccessToken(accessToken: string) {
    if (typeof window === 'undefined') return
    document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },

  clear() {
    if (typeof window === 'undefined') return
    // Usuń cookies
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`
    // Usuń localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!tokenStore.getAccessToken()
  },
}
