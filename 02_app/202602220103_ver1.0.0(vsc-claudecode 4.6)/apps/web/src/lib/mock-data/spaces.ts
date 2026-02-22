export interface MockSpace {
  id: string
  name: string
  description: string
  type: "POSTS" | "CHAT" | "EVENTS" | "LINKS" | "FILES"
  visibility: "PUBLIC" | "PRIVATE" | "SECRET"
  memberCount: number
  members: {
    id: string
    name: string
    avatar: string
  }[]
  icon: string
  color: string
  createdAt: string
}

export const mockSpaces: MockSpace[] = [
  {
    id: "space-1",
    name: "📰 Announcements",
    description: "Ważne komunikaty i ogłoszenia dla całej społeczności",
    type: "POSTS",
    visibility: "PUBLIC",
    memberCount: 1243,
    members: [
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
      {
        id: "user-3",
        name: "Maria Lewandowska",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    icon: "solar:bell-linear",
    color: "#F97316",
    createdAt: "2023-11-01T00:00:00Z",
  },
  {
    id: "space-2",
    name: "💬 General Chat",
    description: "Ogólna rozmowa, off-topic, random dyskusje",
    type: "CHAT",
    visibility: "PUBLIC",
    memberCount: 856,
    members: [
      {
        id: "user-1",
        name: "Jan Kowalski",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
      {
        id: "user-4",
        name: "Katarzyna Nowak",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    icon: "solar:chat-line-linear",
    color: "#8B5CF6",
    createdAt: "2023-11-02T00:00:00Z",
  },
  {
    id: "space-3",
    name: "🎓 Learning Resources",
    description: "Linki do treści edukacyjnych, artykułów, kursów i tutoriali",
    type: "LINKS",
    visibility: "PUBLIC",
    memberCount: 542,
    members: [
      {
        id: "user-2",
        name: "Piotr Nowak",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
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
    icon: "solar:book-linear",
    color: "#14B8A6",
    createdAt: "2023-11-03T00:00:00Z",
  },
  {
    id: "space-4",
    name: "🤝 Meetups & Events",
    description: "Planowanie spotkań, eventów, konferencji",
    type: "EVENTS",
    visibility: "PUBLIC",
    memberCount: 423,
    members: [
      {
        id: "user-1",
        name: "Jan Kowalski",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      },
    ],
    icon: "solar:calendar-linear",
    color: "#EC4899",
    createdAt: "2023-11-04T00:00:00Z",
  },
  {
    id: "space-5",
    name: "📁 Project Files",
    description: "Udostępnianie plików, dokumentów i zasobów projektów",
    type: "FILES",
    visibility: "PRIVATE",
    memberCount: 89,
    members: [
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
    icon: "solar:folder-linear",
    color: "#4262F0",
    createdAt: "2023-12-01T00:00:00Z",
  },
]
