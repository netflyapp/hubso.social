export interface MockPost {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  content: string
  type: "TEXT" | "IMAGE" | "VIDEO" | "LINK"
  image?: string
  createdAt: string
  likes: number
  comments: number
  shares: number
  liked: boolean
}

export const mockPosts: MockPost[] = [
  {
    id: "post-1",
    authorId: "user-1",
    authorName: "Jan Kowalski",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content:
      "Właśnie wydaliśmy v2.0 naszej platformy! 🎉 Nowa architektura, lepsze performance i więcej features. Dzięki waszemu feedbackowi możliśmy to się stało.",
    type: "TEXT",
    createdAt: "2024-01-15T10:30:00Z",
    likes: 245,
    comments: 32,
    shares: 18,
    liked: false,
  },
  {
    id: "post-2",
    authorId: "user-2",
    authorName: "Piotr Nowak",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content: "Nowy kurs: 'Advanced TypeScript Patterns' jest już dostępny! 📚",
    type: "IMAGE",
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    createdAt: "2024-01-14T14:15:00Z",
    likes: 189,
    comments: 24,
    shares: 12,
    liked: true,
  },
  {
    id: "post-3",
    authorId: "user-3",
    authorName: "Maria Lewandowska",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    content:
      "Jakieś pytania na temat UX design? Zachęcam do diskusji w naszym forum! 💡",
    type: "TEXT",
    createdAt: "2024-01-13T09:45:00Z",
    likes: 156,
    comments: 42,
    shares: 8,
    liked: false,
  },
]
