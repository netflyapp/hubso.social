import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    terms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}>, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
}, {
    name?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export declare const createCommunitySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    description?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
    logoUrl?: string | undefined;
}>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export declare const createPostSchema: z.ZodObject<{
    spaceId: z.ZodString;
    content: z.ZodAny;
    type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "VIDEO", "POLL", "LINK", "EMBED"]>>;
}, "strip", z.ZodTypeAny, {
    type: "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "LINK" | "EMBED";
    spaceId: string;
    content?: any;
}, {
    spaceId: string;
    type?: "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "LINK" | "EMBED" | undefined;
    content?: any;
}>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export declare const sendMessageSchema: z.ZodObject<{
    conversationId: z.ZodString;
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "VOICE", "VIDEO"]>>;
}, "strip", z.ZodTypeAny, {
    type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "VOICE";
    conversationId: string;
    content: string;
}, {
    conversationId: string;
    content: string;
    type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "VOICE" | undefined;
}>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
//# sourceMappingURL=schemas.d.ts.map