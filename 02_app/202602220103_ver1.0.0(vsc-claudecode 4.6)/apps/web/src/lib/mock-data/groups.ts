export interface MockGroup {
  id: string
  name: string
  description: string
  members: number
  avatar: string
  visibility: "PUBLIC" | "PRIVATE"
  category: string
  trending: boolean
}

export const mockGroups: MockGroup[] = [
  {
    id: "group-1",
    name: "Web Development",
    description: "Dyskusja o najnowszych technikach web dev",
    members: 1240,
    avatar: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=150&h=150&fit=crop&auto=format&q=80",
    visibility: "PUBLIC",
    category: "Technology",
    trending: true,
  },
  {
    id: "group-2",
    name: "Design Lovers",
    description: "Dla tych którzy kochają dobre designu",
    members: 856,
    avatar: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=150&h=150&fit=crop&auto=format&q=80",
    visibility: "PUBLIC",
    category: "Design",
    trending: true,
  },
  {
    id: "group-3",
    name: "Entrepreneurship",
    description: "Startup stories i business insights",
    members: 2103,
    avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&h=150&fit=crop&auto=format&q=80",
    visibility: "PUBLIC",
    category: "Business",
    trending: false,
  },
  {
    id: "group-4",
    name: "Learning Together",
    description: "Wspólna nauka i development",
    members: 1520,
    avatar: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&h=150&fit=crop&auto=format&q=80",
    visibility: "PUBLIC",
    category: "Education",
    trending: false,
  },
]
