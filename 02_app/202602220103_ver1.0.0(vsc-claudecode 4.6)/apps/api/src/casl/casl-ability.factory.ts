import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';

/**
 * Subjects — Prisma model names used in CASL rules.
 * 'all' is a special CASL keyword matching any subject.
 */
export type Subjects =
  | 'User'
  | 'Community'
  | 'CommunityMember'
  | 'Post'
  | 'Comment'
  | 'Reaction'
  | 'Space'
  | 'SpaceGroup'
  | 'SpaceMember'
  | 'Group'
  | 'GroupMember'
  | 'Event'
  | 'EventAttendee'
  | 'Message'
  | 'Conversation'
  | 'Notification'
  | 'MediaFile'
  | 'Plugin'
  | 'Webhook'
  | 'AuditLog'
  | 'all';

/**
 * Actions that can be performed on subjects.
 */
export type Actions =
  | 'manage' // CASL wildcard — all actions
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'join'
  | 'leave'
  | 'moderate'
  | 'ban'
  | 'pin'
  | 'invite';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

/**
 * Global user context passed to ability factory.
 */
export interface UserContext {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
}

/**
 * Community membership context for scoped permissions.
 */
export interface CommunityContext {
  communityId: string;
  memberRole: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST' | null;
}

/**
 * Build global (platform-level) abilities based on user role.
 */
export function buildPlatformAbility(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // --- Guest (unauthenticated or GUEST role) ---
  if (!user || user.role === 'GUEST') {
    can('read', 'Community');
    can('read', 'Post');
    can('read', 'User');
    can('read', 'Event');
    can('read', 'Space');
    return build();
  }

  // --- MEMBER (default authenticated user) ---
  can('read', 'Community');
  can('read', 'Post');
  can('read', 'Comment');
  can('read', 'User');
  can('read', 'Event');
  can('read', 'Space');
  can('read', 'SpaceGroup');
  can('read', 'Group');
  can('read', 'Notification');
  can('read', 'Message');
  can('read', 'Conversation');

  can('create', 'Post');
  can('create', 'Comment');
  can('create', 'Reaction');
  can('create', 'Message');
  can('create', 'Event');
  can('create', 'MediaFile');

  // Ownership checks are enforced in services, not CASL conditions
  can('update', 'Post');   // own posts only — verified in PostsService
  can('delete', 'Post');   // own posts only — verified in PostsService
  can('update', 'Comment'); // own comments only — verified in CommentsService
  can('delete', 'Comment'); // own comments only — verified in CommentsService
  can('delete', 'Reaction'); // own reactions only — verified in ReactionsService

  can('update', 'User'); // own profile only — verified in UsersService

  can('join', 'Community');
  can('leave', 'Community');
  can('join', 'Space');
  can('leave', 'Space');
  can('join', 'Group');
  can('leave', 'Group');
  can('join', 'Event');
  can('leave', 'Event');

  can('create', 'Community'); // any member can create a community

  // --- MODERATOR (platform) ---
  if (user.role === 'MODERATOR' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    can('moderate', 'Post');
    can('moderate', 'Comment');
    can('pin', 'Post');
    can('ban', 'User');
    can('read', 'AuditLog');
  }

  // --- ADMIN (platform) ---
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    can('manage', 'Community');
    can('manage', 'User');
    can('manage', 'Plugin');
    can('manage', 'Webhook');
    can('read', 'AuditLog');
    can('create', 'AuditLog');
    can('manage', 'MediaFile');
  }

  // --- SUPER_ADMIN --- full access
  if (user.role === 'SUPER_ADMIN') {
    can('manage', 'all');
  }

  return build();
}

/**
 * Build community-scoped abilities.
 * These layer on top of platform abilities for community-specific resources.
 */
export function buildCommunityAbility(
  user: UserContext,
  ctx: CommunityContext,
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Non-member — read only
  if (!ctx.memberRole) {
    can('read', 'Post');
    can('read', 'Space');
    can('read', 'Event');
    can('join', 'Community');
    return build();
  }

  // --- MEMBER ---
  can('read', 'Post');
  can('read', 'Comment');
  can('read', 'Space');
  can('read', 'SpaceGroup');
  can('read', 'Event');
  can('read', 'Group');

  can('create', 'Post');
  can('create', 'Comment');
  can('create', 'Reaction');
  can('create', 'Event');
  can('join', 'Space');
  can('leave', 'Space');
  can('join', 'Group');
  can('leave', 'Group');
  can('join', 'Event');
  can('leave', 'Event');
  can('leave', 'Community');

  can('update', 'Post');   // own posts — verified in service
  can('delete', 'Post');   // own posts — verified in service
  can('update', 'Comment'); // own comments — verified in service
  can('delete', 'Comment'); // own comments — verified in service

  // --- MODERATOR ---
  if (['MODERATOR', 'ADMIN', 'OWNER'].includes(ctx.memberRole)) {
    can('moderate', 'Post');
    can('moderate', 'Comment');
    can('pin', 'Post');
    can('delete', 'Post'); // can delete any post
    can('delete', 'Comment'); // can delete any comment
    can('ban', 'CommunityMember');
  }

  // --- ADMIN ---
  if (['ADMIN', 'OWNER'].includes(ctx.memberRole)) {
    can('manage', 'Space');
    can('manage', 'SpaceGroup');
    can('manage', 'Group');
    can('manage', 'Event');
    can('invite', 'CommunityMember');
    can('update', 'Community');
    can('manage', 'Plugin');
    can('manage', 'Webhook');
  }

  // --- OWNER ---
  if (ctx.memberRole === 'OWNER') {
    can('manage', 'Community');
    can('manage', 'CommunityMember');
    can('delete', 'Community');
  }

  return build();
}
