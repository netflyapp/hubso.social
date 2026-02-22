import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'message' | 'comment' | 'reaction' | 'mention' | 'system'
  title: string
  message: string
  avatar?: string
  read: boolean
  timestamp: Date
  actionUrl?: string
}

interface NotificationStore {
  unreadCount: number
  notifications: Notification[]
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setUnreadCount: (count: number) => void
}

export const useNotificationStore = create<NotificationStore>()(
  subscribeWithSelector((set) => ({
    unreadCount: 0,
    notifications: [],

    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          },
          ...state.notifications,
        ].slice(0, 50), // Keep only last 50
        unreadCount: state.unreadCount + 1,
      })),

    markAsRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),

    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
    setUnreadCount: (count) => set({ unreadCount: count }),
  }))
)
