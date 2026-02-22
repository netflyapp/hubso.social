export interface MockUser {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  role?: "ADMIN" | "MODERATOR" | "MEMBER"
  points?: number
  level?: number
  joinedAt?: string
  verified?: boolean
}

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    name: "Jan Kowalski",
    email: "jan@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    bio: "Community builder & ecosystem designer",
    role: "ADMIN",
    points: 5420,
    level: 12,
    joinedAt: "2023-01-15",
  },
  {
    id: "user-2",
    name: "Piotr Nowak",
    email: "piotr@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    bio: "Content creator & educator",
    role: "MODERATOR",
    points: 3820,
    level: 9,
    joinedAt: "2023-03-20",
  },
  {
    id: "user-3",
    name: "Maria Lewandowska",
    email: "maria@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    bio: "Designer & UX enthusiast",
    role: "MEMBER",
    points: 2150,
    level: 6,
    joinedAt: "2023-06-10",
  },
  {
    id: "user-4",
    name: "Katarzyna Nowak",
    email: "katarzyna@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    bio: "Developer & open source lover",
    role: "MEMBER",
    points: 1890,
    level: 5,
    joinedAt: "2023-08-05",
  },
  {
    id: "user-5",
    name: "Tomasz Wiśniewski",
    email: "tomasz@example.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    bio: "Marketing strategist",
    role: "MEMBER",
    points: 1540,
    level: 4,
    joinedAt: "2023-09-12",
  },
]
