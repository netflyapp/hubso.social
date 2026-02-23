import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/reset-password']
const AUTH_PREFIX = '/login'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('hubso_access_token')?.value

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Jeśli użytkownik zalogowany próbuje wejść na /login lub /register → redirect do /
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jeśli użytkownik niezalogowany próbuje wejść na chronioną stronę → redirect do /login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL(AUTH_PREFIX, request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Pasuje do wszystkich tras oprócz:
     * - Pliki statyczne Next.js (_next/static, _next/image, favicon.ico)
     * - Pliki publiczne (public/)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
