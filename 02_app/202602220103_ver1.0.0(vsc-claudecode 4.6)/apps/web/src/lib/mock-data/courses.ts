export interface MockCourse {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
    avatar: string
  }
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  price: number
  isFree: boolean
  image: string
  rating: number
  reviewCount: number
  studentCount: number
  duration: string
  lessons: number
  progress?: number
  enrolled: boolean
  tags: string[]
}

export const mockCourses: MockCourse[] = [
  {
    id: "course-1",
    title: "Complete Next.js 15 Masterclass",
    description:
      "Kompletny kurs obejmujący wszystko czego musisz wiedzieć o Next.js 15, App Router, Server Components, API Routes i deployment.",
    instructor: {
      id: "user-2",
      name: "Piotr Nowak",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Web Development",
    level: "INTERMEDIATE",
    price: 199,
    isFree: false,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    rating: 4.8,
    reviewCount: 342,
    studentCount: 4521,
    duration: "24h 30m",
    lessons: 95,
    progress: 45,
    enrolled: true,
    tags: ["next-js", "react", "typescript"],
  },
  {
    id: "course-2",
    title: "React Performance Optimization",
    description:
      "Naucz się optymalizować React aplikacje. Renderowanie, memoization, code splitting, lazy loading i wiele więcej.",
    instructor: {
      id: "user-1",
      name: "Jan Kowalski",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Web Development",
    level: "ADVANCED",
    price: 149,
    isFree: false,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    rating: 4.9,
    reviewCount: 287,
    studentCount: 3201,
    duration: "18h 15m",
    lessons: 72,
    progress: 0,
    enrolled: false,
    tags: ["react", "performance", "optimization"],
  },
  {
    id: "course-3",
    title: "Full-Stack Development with TypeScript",
    description:
      "Zbuduj pełną aplikację fullstack używając TypeScript, React, Node.js, Express i PostgreSQL.",
    instructor: {
      id: "user-3",
      name: "Maria Lewandowska",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Web Development",
    level: "INTERMEDIATE",
    price: 249,
    isFree: false,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    rating: 4.7,
    reviewCount: 198,
    studentCount: 2156,
    duration: "32h 45m",
    lessons: 128,
    progress: 0,
    enrolled: false,
    tags: ["typescript", "nodejs", "react", "fullstack"],
  },
  {
    id: "course-4",
    title: "UI/UX Design Fundamentals",
    description:
      "Poznaj podstawy design thinking, wireframing, prototyping i najlepsze praktyki UI/UX design.",
    instructor: {
      id: "user-3",
      name: "Maria Lewandowska",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Design",
    level: "BEGINNER",
    price: 0,
    isFree: true,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    rating: 4.6,
    reviewCount: 521,
    studentCount: 8641,
    duration: "12h 20m",
    lessons: 48,
    progress: 0,
    enrolled: false,
    tags: ["ui-ux", "design", "fundamentals"],
  },
  {
    id: "course-5",
    title: "Web Security Best Practices",
    description:
      "Naucz się chronić swoje aplikacje. XSS, CSRF, SQL Injection, Authentication, Authorization i więcej.",
    instructor: {
      id: "user-1",
      name: "Jan Kowalski",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Security",
    level: "ADVANCED",
    price: 129,
    isFree: false,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    rating: 4.9,
    reviewCount: 165,
    studentCount: 1842,
    duration: "16h 00m",
    lessons: 64,
    progress: 0,
    enrolled: false,
    tags: ["security", "web", "owasp"],
  },
  {
    id: "course-6",
    title: "React Native from Zero to Hero",
    description:
      "Natywna mobilna aplikacja dla iOS i Android przy użyciu React Native i Expo.",
    instructor: {
      id: "user-4",
      name: "Katarzyna Nowak",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    },
    category: "Mobile Development",
    level: "INTERMEDIATE",
    price: 179,
    isFree: false,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    rating: 4.7,
    reviewCount: 224,
    studentCount: 2987,
    duration: "28h 30m",
    lessons: 112,
    progress: 0,
    enrolled: false,
    tags: ["react-native", "mobile", "ios", "android"],
  },
]
