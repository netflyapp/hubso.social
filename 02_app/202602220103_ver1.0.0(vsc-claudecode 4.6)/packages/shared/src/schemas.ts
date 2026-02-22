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

// User Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

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
  spaceId: z.string(),
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
