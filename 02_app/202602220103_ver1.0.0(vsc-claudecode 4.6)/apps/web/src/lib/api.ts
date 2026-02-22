const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({ message: 'No response body' }))

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? res.statusText, data)
  }

  return data as T
}

// Auth endpoints
export const authApi = {
  register: (payload: { email: string; password: string; username?: string; displayName?: string }) =>
    request<{ id: string; email: string; message: string }>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
}

// Users endpoints
export const usersApi = {
  me: (token: string) =>
    request<{ id: string; email: string; displayName: string }>('/users/me', { token }),
}
