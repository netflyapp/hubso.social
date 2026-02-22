export interface MockMember {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
  rank: number;
  points: number;
  level: number;
  badges: string[];
  streak: number;
  joinedAt: Date;
  bio?: string;
}

export const mockMembers: MockMember[] = [
  {
    id: 'member-1',
    name: 'Adam Kowalski',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    title: 'Community Pioneer',
    role: 'ADMIN',
    rank: 1,
    points: 45320,
    level: 28,
    badges: ['FOUNDER', 'AMBASSADOR', 'MENTOR'],
    streak: 127,
    joinedAt: new Date('2024-01-01'),
    bio: 'Passion for community building',
  },
  {
    id: 'member-2',
    name: 'Magdalena Nowak',
    avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    title: 'Expert Contributor',
    role: 'MODERATOR',
    rank: 2,
    points: 38950,
    level: 24,
    badges: ['ACTIVE', 'HELPER', 'TRUSTED'],
    streak: 94,
    joinedAt: new Date('2024-02-15'),
    bio: 'Digital marketing & growth',
  },
  {
    id: 'member-3',
    name: 'Jakub Zieliński',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    title: 'Top Contributor',
    role: 'MEMBER',
    rank: 3,
    points: 34120,
    level: 21,
    badges: ['ACTIVE', 'CREATOR', 'ENGAGED'],
    streak: 78,
    joinedAt: new Date('2024-03-20'),
  },
  {
    id: 'member-4',
    name: 'Ewa Lewandowska',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 4,
    points: 28540,
    level: 18,
    badges: ['ACTIVE', 'NEWCOMER'],
    streak: 42,
    joinedAt: new Date('2024-06-10'),
  },
  {
    id: 'member-5',
    name: 'Paweł Malinowski',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2c56726b2b10?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 5,
    points: 24680,
    level: 16,
    badges: ['LEARNER'],
    streak: 28,
    joinedAt: new Date('2024-07-15'),
  },
  {
    id: 'member-6',
    name: 'Katarzyna Pawlak',
    avatar: 'https://images.unsplash.com/photo-1524504388324-c576a41b7878?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 6,
    points: 21950,
    level: 14,
    badges: [],
    streak: 15,
    joinedAt: new Date('2024-08-01'),
  },
  {
    id: 'member-7',
    name: 'Tomasz Górski',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 7,
    points: 19320,
    level: 12,
    badges: [],
    streak: 8,
    joinedAt: new Date('2024-09-05'),
  },
  {
    id: 'member-8',
    name: 'Alicja Rogowska',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 8,
    points: 17640,
    level: 11,
    badges: [],
    streak: 5,
    joinedAt: new Date('2024-10-12'),
  },
  {
    id: 'member-9',
    name: 'Marcin Nowakowski',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 9,
    points: 15980,
    level: 10,
    badges: [],
    streak: 2,
    joinedAt: new Date('2024-11-20'),
  },
  {
    id: 'member-10',
    name: 'Joanna Szymańska',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    role: 'MEMBER',
    rank: 10,
    points: 14210,
    level: 9,
    badges: [],
    streak: 0,
    joinedAt: new Date('2024-12-01'),
  },
];

export function getMemberById(id: string): MockMember | undefined {
  return mockMembers.find(m => m.id === id);
}

export function getTopMembers(limit: number = 5): MockMember[] {
  return mockMembers.slice(0, limit);
}

export function getMembersByRole(role: MockMember['role']): MockMember[] {
  return mockMembers.filter(m => m.role === role);
}
