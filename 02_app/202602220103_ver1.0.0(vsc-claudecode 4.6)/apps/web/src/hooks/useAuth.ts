import { useQuery, useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CurrentUser } from "@hubso/shared"

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<CurrentUser>("/auth/me"),
  })
}

// Get user by ID
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => apiClient.get<CurrentUser>(`/users/${userId}`),
    enabled: !!userId,
  })
}

// Login mutation
export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post("/auth/login", data),
  })
}

// Register mutation
export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      apiClient.post("/auth/register", data),
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiClient.post("/auth/reset-password", data),
  })
}
