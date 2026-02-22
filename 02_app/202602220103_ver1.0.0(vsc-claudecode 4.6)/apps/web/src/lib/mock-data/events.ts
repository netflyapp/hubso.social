export interface MockEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  locationType: "VIRTUAL" | "IN_PERSON" | "HYBRID"
  attendees: number
  maxAttendees?: number
  coverImage: string
  host: {
    id: string
    name: string
    avatar: string
  }
  status: "UPCOMING" | "ONGOING" | "PAST"
  category: string
  tags: string[]
  price?: number
  isFree: boolean
  isAttending: boolean
}

export const mockEvents: MockEvent[] = [
  {
    id: "event-1",
    title: "Next.js 15 Deep Dive Workshop",
    description:
      "Zaawansowany warsztat poświęcony nowym featurom Next.js 15. Omówimy App Router, Server Components, streaming i optymalizacje performance.",
    date: "2024-02-20",
    time: "18:00",
    endTime: "21:00",
    location: "Online (Zoom)",
    locationType: "VIRTUAL",
    attendees: 127,
    maxAttendees: 200,
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    host: {
      id: "user-2",
      name: "Piotr Nowak",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    status: "UPCOMING",
    category: "Web Development",
    tags: ["Next.js", "React", "TypeScript", "Web Development"],
    isFree: true,
    isAttending: false,
  },
  {
    id: "event-2",
    title: "UX Design Meetup: Mobile-First Design",
    description:
      "Spotkanie dla designerów gdzie omówimy najlepsze praktyki projektowania mobile-first, accessibility oraz design systemy.",
    date: "2024-02-22",
    time: "19:00",
    endTime: "20:30",
    location: "Warszawa, Hala Koszyki",
    locationType: "IN_PERSON",
    attendees: 45,
    maxAttendees: 100,
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    host: {
      id: "user-3",
      name: "Maria Lewandowska",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    status: "UPCOMING",
    category: "Design",
    tags: ["UX/UI", "Mobile", "Design Systems", "Accessibility"],
    isFree: false,
    price: 49,
    isAttending: true,
  },
  {
    id: "event-3",
    title: "Startup Pitch Night #12",
    description:
      "Wieczór gdzie 5 startupów zaprezentuje swoje projekty venture capitalistom i inwestorom."
      ,
    date: "2024-02-25",
    time: "17:30",
    endTime: "22:00",
    location: "Kraków, Manggha Museum",
    locationType: "HYBRID",
    attendees: 320,
    maxAttendees: 500,
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    host: {
      id: "user-1",
      name: "Jan Kowalski",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    status: "UPCOMING",
    category: "Entrepreneurship",
    tags: ["Startups", "Business", "Networking", "Pitching"],
    isFree: false,
    price: 99,
    isAttending: false,
  },
  {
    id: "event-4",
    title: "React Performance Workshop",
    description:
      "Praktyczne warsztaty na temat optymalizacji React aplikacji. Renderowanie, memoization, Code Splitting i wiele więcej.",
    date: "2024-01-30",
    time: "18:00",
    endTime: "21:00",
    location: "Online (Zoom)",
    locationType: "VIRTUAL",
    attendees: 89,
    maxAttendees: 150,
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    host: {
      id: "user-2",
      name: "Piotr Nowak",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    status: "PAST",
    category: "Web Development",
    tags: ["React", "Performance", "JavaScript"],
    isFree: true,
    isAttending: true,
  },
]
