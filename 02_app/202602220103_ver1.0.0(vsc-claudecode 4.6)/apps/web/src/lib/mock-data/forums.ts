export interface MockForumCategory {
  id: string
  name: string
  description: string
  slug: string
  threadCount: number
  replyCount: number
  icon: string
  color: string
}

export interface MockForumThread {
  id: string
  categoryId: string
  title: string
  author: {
    id: string
    name: string
    avatar: string
  }
  pinned: boolean
  views: number
  replies: number
  lastReplyAt: string
  tags: string[]
  solved: boolean
}

export interface MockForumReply {
  id: string
  threadId: string
  author: {
    id: string
    name: string
    avatar: string
    role: "MODERATOR" | "MEMBER"
  }
  content: string
  createdAt: string
  likes: number
  isSolution: boolean
}

export const mockForumCategories: MockForumCategory[] = [
  {
    id: "cat-1",
    name: "Web Development",
    description: "Dyskusje o technologiach web: React, Next.js, TypeScript, etc.",
    slug: "web-development",
    threadCount: 342,
    replyCount: 1245,
    icon: "solar:code-2-linear",
    color: "#4262F0",
  },
  {
    id: "cat-2",
    name: "Design & UX",
    description: "UI/UX design, accessibility, design systems i best practices",
    slug: "design-ux",
    threadCount: 156,
    replyCount: 520,
    icon: "solar:palette-linear",
    color: "#EC4899",
  },
  {
    id: "cat-3",
    name: "Backend & APIs",
    description: "API design, databases, authentication, serverless architecture",
    slug: "backend-apis",
    threadCount: 289,
    replyCount: 1089,
    icon: "solar:database-linear",
    color: "#14B8A6",
  },
  {
    id: "cat-4",
    name: "Mobile Development",
    description: "React Native, Expo, iOS, Android, cross-platform development",
    slug: "mobile",
    threadCount: 201,
    replyCount: 745,
    icon: "solar:smartphone-linear",
    color: "#8B5CF6",
  },
  {
    id: "cat-5",
    name: "DevOps & Infrastructure",
    description: "Docker, Kubernetes, CI/CD, cloud platforms, deployment",
    slug: "devops",
    threadCount: 127,
    replyCount: 412,
    icon: "solar:server-linear",
    color: "#F97316",
  },
]

export const mockForumThreads: MockForumThread[] = [
  {
    id: "thread-1",
    categoryId: "cat-1",
    title: "Best practices for Next.js 15 App Router in large-scale applications?",
    author: {
      id: "user-4",
      name: "Katarzyna Nowak",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    pinned: true,
    views: 1256,
    replies: 32,
    lastReplyAt: "2024-01-15T14:30:00Z",
    tags: ["next-js", "app-router", "typescript"],
    solved: true,
  },
  {
    id: "thread-2",
    categoryId: "cat-1",
    title: "Server Components vs Client Components - when to use each?",
    author: {
      id: "user-2",
      name: "Piotr Nowak",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    pinned: true,
    views: 2341,
    replies: 67,
    lastReplyAt: "2024-01-14T10:15:00Z",
    tags: ["react", "server-components", "performance"],
    solved: true,
  },
  {
    id: "thread-3",
    categoryId: "cat-3",
    title: "PostgreSQL performance tuning for high-traffic APIs",
    author: {
      id: "user-1",
      name: "Jan Kowalski",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    pinned: false,
    views: 876,
    replies: 24,
    lastReplyAt: "2024-01-13T16:45:00Z",
    tags: ["postgresql", "performance", "databases"],
    solved: true,
  },
  {
    id: "thread-4",
    categoryId: "cat-2",
    title: "Accessibility checklist for modern web applications",
    author: {
      id: "user-3",
      name: "Maria Lewandowska",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    pinned: false,
    views: 645,
    replies: 18,
    lastReplyAt: "2024-01-15T09:20:00Z",
    tags: ["accessibility", "wcag", "a11y"],
    solved: false,
  },
  {
    id: "thread-5",
    categoryId: "cat-4",
    title: "React Native performance optimization - FlatList vs VirtualizedList",
    author: {
      id: "user-5",
      name: "Tomasz Wiśniewski",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    pinned: false,
    views: 523,
    replies: 15,
    lastReplyAt: "2024-01-12T13:00:00Z",
    tags: ["react-native", "performance", "optimization"],
    solved: true,
  },
]

export const mockForumReplies: MockForumReply[] = [
  {
    id: "reply-1",
    threadId: "thread-1",
    author: {
      id: "user-2",
      name: "Piotr Nowak",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      role: "MODERATOR",
    },
    content:
      "Świetne pytanie! Dla dużych aplikacji polecam:\n\n1. Używaj route groups do organizacji kodu\n2. Leverage Server Components dla data fetching\n3. Minify CSS/JS agresywnie\n4. Implement proper error boundaries\n\nMogę pokazać przykład jeśli potrzebujesz!",
    createdAt: "2024-01-15T10:30:00Z",
    likes: 142,
    isSolution: true,
  },
  {
    id: "reply-2",
    threadId: "thread-1",
    author: {
      id: "user-3",
      name: "Maria Lewandowska",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      role: "MEMBER",
    },
    content:
      "Dodaję do tego - pamiętaj o proper dynamic segment caching. Bez tego możesz mieć problemy z performance na PII data.",
    createdAt: "2024-01-15T12:45:00Z",
    likes: 87,
    isSolution: false,
  },
]
