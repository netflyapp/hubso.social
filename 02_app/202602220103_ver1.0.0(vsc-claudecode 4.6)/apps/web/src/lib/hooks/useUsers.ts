import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mockUsers } from "@/lib/mock-data/users"

// ===== Queries =====

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const res = await fetch(`/api/users/${userId}`)
      // return res.json()
      return mockUsers.find((u) => u.id === userId) || mockUsers[0]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      // TODO: Replace with actual API call - fetch from /api/auth/me on login
      return mockUsers[0] // Current user for demo
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUsers(limit = 20) {
  return useQuery({
    queryKey: ["users", { limit }],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockUsers.slice(0, limit)
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ===== Mutations =====

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // TODO: Replace with actual API call
      // const res = await fetch(`/api/users/${data.id}`, {
      //   method: "PATCH",
      //   body: JSON.stringify(data),
      // })
      // return res.json()
      return { ...mockUsers[0], ...data }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.setQueryData(["users", data.id], data)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      // TODO: Replace with actual API call
      // const formData = new FormData()
      // formData.append("file", file)
      // const res = await fetch("/api/users/me/avatar", {
      //   method: "POST",
      //   body: formData,
      // })
      // return res.json()
      const reader = new FileReader()
      const url = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
      return { avatarUrl: url }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] })
    },
  })
}
