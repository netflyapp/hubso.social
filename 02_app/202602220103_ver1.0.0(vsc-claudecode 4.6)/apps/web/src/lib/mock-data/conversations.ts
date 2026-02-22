export interface MockConversation {
  id: string
  name?: string
  participants: {
    id: string
    name: string
    avatar: string
  }[]
  lastMessage: {
    id: string
    authorId: string
    content: string
    timestamp: string
  }
  unreadCount: number
  type: "DIRECT" | "GROUP"
  isOnline?: boolean
}

export interface MockMessage {
  id: string
  conversationId: string
  authorId: string
  authorName: string
  authorAvatar: string
  content: string
  type: "TEXT" | "IMAGE" | "FILE"
  image?: string
  timestamp: string
  edited?: string
  reactions: { emoji: string; count: number }[]
}

export const mockConversations: MockConversation[] = [
  {
    id: "conv-1",
    participants: [
      {
        id: "user-1",
        name: "Jan Kowalski",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-2",
        name: "Piotr Nowak",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    lastMessage: {
      id: "msg-1",
      authorId: "user-2",
      content: "Ok, przyślę ci access do repo jutro rano 👍",
      timestamp: "2024-01-15T14:30:00Z",
    },
    unreadCount: 0,
    type: "DIRECT",
    isOnline: true,
  },
  {
    id: "conv-2",
    name: "Web Dev Team",
    participants: [
      {
        id: "user-1",
        name: "Jan Kowalski",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-3",
        name: "Maria Lewandowska",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-4",
        name: "Katarzyna Nowak",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    lastMessage: {
      id: "msg-2",
      authorId: "user-3",
      content: "Zapewne będziemy musieli refaktorować routing w Next.js",
      timestamp: "2024-01-15T13:45:00Z",
    },
    unreadCount: 3,
    type: "GROUP",
  },
  {
    id: "conv-3",
    name: "Design Critique 🎨",
    participants: [
      {
        id: "user-1",
        name: "Jan Kowalski",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-3",
        name: "Maria Lewandowska",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-5",
        name: "Tomasz Wiśniewski",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    lastMessage: {
      id: "msg-3",
      authorId: "user-5",
      content: "Ja się zgadzam, spacing na mobile można polepszić",
      timestamp: "2024-01-14T16:20:00Z",
    },
    unreadCount: 1,
    type: "GROUP",
  },
]

export const mockMessages: MockMessage[] = [
  {
    id: "msg-001",
    conversationId: "conv-1",
    authorId: "user-1",
    authorName: "Jan Kowalski",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content: "Ey, jak tam z tym feature request od klientów?",
    type: "TEXT",
    timestamp: "2024-01-15T10:15:00Z",
    reactions: [{ emoji: "👍", count: 1 }],
  },
  {
    id: "msg-002",
    conversationId: "conv-1",
    authorId: "user-2",
    authorName: "Piotr Nowak",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content: "Właśnie skończyłem spike. Wypadło ok, wymagałoby ~3 dni pracy",
    type: "TEXT",
    timestamp: "2024-01-15T10:45:00Z",
    reactions: [],
  },
  {
    id: "msg-003",
    conversationId: "conv-1",
    authorId: "user-1",
    authorName: "Jan Kowalski",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content: "Świetnie! Mogłbyś wysłać mi results?",
    type: "TEXT",
    timestamp: "2024-01-15T11:10:00Z",
    reactions: [],
  },
  {
    id: "msg-004",
    conversationId: "conv-1",
    authorId: "user-2",
    authorName: "Piotr Nowak",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content: "Ok, przyślę ci access do repo jutro rano 👍",
    type: "TEXT",
    timestamp: "2024-01-15T14:30:00Z",
    reactions: [{ emoji: "👍", count: 2 }],
  },
]
