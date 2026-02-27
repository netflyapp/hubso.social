import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Community Schemas
export const createCommunitySchema = z.object({
  name: z.string().min(2, 'Community name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

// Post Schemas
export const createPostSchema = z.object({
  spaceId: z.string().optional(), // optional — backend picks default POSTS space when omitted
  content: z.any(), // Tiptap JSON
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'LINK', 'EMBED']).default('TEXT'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// Message Schemas
export const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO']).default('TEXT'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Komentarz nie może być pusty').max(2000),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// Reaction Schemas
export const reactionTypes = ['LIKE', 'LOVE', 'WOW', 'FIRE', 'SAD', 'ANGRY'] as const;
export type ReactionType = (typeof reactionTypes)[number];

export const toggleReactionSchema = z.object({
  targetType: z.enum(['Post', 'Comment']),
  targetId: z.string().min(1),
  type: z.enum(reactionTypes),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

// Profile Schemas
export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Wymagane').max(50, 'Maks. 50 znaków').optional(),
  bio: z.string().max(500, 'Maks. 500 znaków').optional(),
  username: z
    .string()
    .min(3, 'Min. 3 znaki')
    .max(30, 'Maks. 30 znaków')
    .regex(/^[a-z0-9_]+$/, 'Tylko małe litery, cyfry i podkreślnik')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
