export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PLATFORM: {
    HOME: '/feed',
    PROFILE: '/profile',
    GROUPS: '/groups',
    MESSAGES: '/messages',
    MEMBERS: '/members',
    FORUMS: '/forums',
    COURSES: '/courses',
    EVENTS: '/events',
  },
};

export const NOTIFICATION_TYPES = {
  POST_LIKE: 'post_like',
  POST_COMMENT: 'post_comment',
  MENTION: 'mention',
  MESSAGE: 'message',
  EVENT_INVITE: 'event_invite',
  MEMBER_JOIN: 'member_join',
  SPACE_UPDATE: 'space_update',
};

export const SPACE_TYPES = {
  POSTS: 'posts',
  CHAT: 'chat',
  EVENTS: 'events',
  LINKS: 'links',
  FILES: 'files',
};
