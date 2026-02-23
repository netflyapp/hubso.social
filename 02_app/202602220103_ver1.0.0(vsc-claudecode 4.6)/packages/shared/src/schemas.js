"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = exports.createPostSchema = exports.createCommunitySchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
    terms: zod_1.z.boolean().refine((v) => v === true, 'You must accept the terms'),
})
    .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
// User Schemas
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().max(500).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
// Community Schemas
exports.createCommunitySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Community name must be at least 2 characters'),
    slug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    description: zod_1.z.string().max(500).optional(),
    logoUrl: zod_1.z.string().url().optional(),
});
// Post Schemas
exports.createPostSchema = zod_1.z.object({
    spaceId: zod_1.z.string().optional(),
    content: zod_1.z.any(), // Tiptap JSON
    type: zod_1.z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'LINK', 'EMBED']).default('TEXT'),
});
// Message Schemas
exports.sendMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string(),
    content: zod_1.z.string().min(1, 'Message cannot be empty'),
    type: zod_1.z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO']).default('TEXT'),
});

// Comment Schemas
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Komentarz nie moze byc pusty').max(2000),
    parentId: zod_1.z.string().optional(),
});
// Reaction Schemas
exports.reactionTypes = ['LIKE', 'LOVE', 'WOW', 'FIRE', 'SAD', 'ANGRY'];
exports.toggleReactionSchema = zod_1.z.object({
    targetType: zod_1.z.enum(['Post', 'Comment']),
    targetId: zod_1.z.string().min(1),
    type: zod_1.z.enum(exports.reactionTypes),
});
//# sourceMappingURL=schemas.js.map// Profile Schemas
exports.updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1).max(50).optional(),
    bio: zod_1.z.string().max(500).optional(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
});
