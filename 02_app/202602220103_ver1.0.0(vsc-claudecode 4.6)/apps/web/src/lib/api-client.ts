import { API_BASE_URL } from "@hubso/shared"

const API_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL

class APIClient {
  private baseUrl: string
  private getAuthToken = () => {
    // TODO: Get from auth store
    return null
  }

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: Record<string, any>
      params?: Record<string, any>
    }
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl)

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    const token = this.getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }) {
    return this.request<T>("GET", endpoint, options)
  }

  async post<T>(endpoint: string, body?: Record<string, any>) {
    return this.request<T>("POST", endpoint, { body })
  }

  async put<T>(endpoint: string, body?: Record<string, any>) {
    return this.request<T>("PUT", endpoint, { body })
  }

  async delete<T>(endpoint: string) {
    return this.request<T>("DELETE", endpoint)
  }
}

export const apiClient = new APIClient(API_URL)
